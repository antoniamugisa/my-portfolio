import { C, CaseHeading, CodeBlock, Figure, P, StatCompare, StepLanes } from '@/components/case-study/CaseStudyText';
import { CsvBugFigure, DayCompareFigure, LoadTimelineFigure } from './bikeShareFigures';

type BikeShareCaseStudyProps = {
  /** Opens the live demo at a Toronto wall time like "2024-07-01T22:00". */
  onOpenMoment?: (isoLocal: string) => void;
};

export default function BikeShareCaseStudy({ onOpenMoment }: BikeShareCaseStudyProps) {
  return (
    <>
      <CaseHeading id="replaying-the-city" level={2}>
        Replaying a City's Rides
      </CaseHeading>
      <P>
        The map replays more than 15 million rides from 2017 to 2025. Pick an hour and every ride in it animates from dock
        to dock, cyan for members and orange for casual riders. You can jump to any moment, find a real ride that left a
        station and follow it, or just watch a weekday rush hour fill the downtown grid.
      </P>
      <P>
        Two decisions shaped everything else: the browser does all the querying, and every ride is drawn along a real
        route rather than a straight line.
      </P>

      <CaseHeading id="no-backend" level={3}>
        No Backend, on Purpose
      </CaseHeading>
      <P>
        A portfolio project should keep working without me paying for or babysitting a server. So the trip data lives as
        one compressed Parquet file per month in object storage, about half a gigabyte in all, and the browser queries it
        with DuckDB-WASM, a full analytical database compiled to WebAssembly. Each playback hour is a single SQL query, and
        the next hour is fetched while the current one plays, so playback never stalls.
      </P>
      <Figure
        title="From City spreadsheets to a ride on screen"
        caption="Everything before the browser runs once per data refresh. The highlighted step is the one a visitor waits on."
      >
        <StepLanes
          lanes={[
            {
              label: 'Offline pipeline',
              steps: [
                { title: 'Download ridership CSVs', detail: 'City of Toronto open data, 2014–2026' },
                { title: 'Match stations', detail: 'Names → coordinates from the live GBFS feed' },
                { title: 'Route every station pair', detail: 'Self-hosted GraphHopper on OpenStreetMap' },
                { title: 'Write monthly Parquet', detail: 'Trips + route polylines → Cloudflare R2' },
              ],
            },
            {
              label: 'In your browser',
              steps: [
                { title: 'Query one hour with SQL', detail: 'DuckDB-WASM reads Parquet over HTTP', active: true },
                { title: 'Animate on the GPU', detail: "deck.gl's TripsLayer on a Mapbox basemap" },
              ],
            },
          ]}
        />
      </Figure>

      <CaseHeading id="routing" level={3}>
        Routing 370,000 Station Pairs
      </CaseHeading>
      <P>
        The data only says which station a ride left from and which it ended at. To draw it on streets, I ran my own
        GraphHopper routing server on an OpenStreetMap extract of Ontario, with a bike profile that caps speed at 15 km/h
        and avoids highways, and asked it for a route between every pair of stations that appears in the data: about
        370,000 of them. Routes are cached in SQLite, so the multi-hour run can stop and pick up where it left off.
      </P>
      <P>
        Matching stations was its own small project. Station names in the trips drift over a decade, with
        <C>&amp;</C> in one year and <C>/</C> in the next, stray punctuation and changing spacing, so each name is
        normalised and matched against today's live station feed, and stations within 60 m of each other are merged
        into one.
      </P>

      <CaseHeading id="a-bug-in-the-data" level={2}>
        Finding a Bug in the City's Data
      </CaseHeading>
      <P>
        While building "follow a ride", I noticed something odd: every ride I picked from 2025 started and ended at the
        same station. A few round trips are normal, people ride along the waterfront and dock where they started, but
        not every single one.
      </P>
      <P>
        I checked the Parquet files first, then the pipeline, then the City's original CSVs. The pipeline was faithfully
        copying what it was given: in the files for January to October 2025, the <C>End_Station_Name</C> column repeats
        the start station's name on every row, about 7 million of them. The <C>End_Station_Id</C> column next to it is
        correct.
      </P>
      <Figure
        title="The same row, two answers"
        caption="Real rows from the City's July 2025 file. The ID says where the ride ended; the name says it went nowhere. Toggle to see the fix."
      >
        <CsvBugFigure />
      </Figure>

      <CaseHeading id="trusting-the-ids" level={3}>
        Trusting the IDs Instead
      </CaseHeading>
      <P>
        The fix was to stop reading end names at all for these files. Every station appears as a start somewhere in the
        same file, with its correct name, so I build that lookup per file and resolve each end station from its ID. If an
        ID never starts a ride, the file's own end name is used, unless it is just the start name repeated, in which case
        the ride is dropped rather than drawn wrong. That affects about 0.2% of rides.
      </P>
      <CodeBlock label="build-parquet.ts (simplified)">
        {`
-- The name each station ID goes by as a start station, per file
WITH start_names AS (
  SELECT filename, start_station_id AS id, mode(start_station_name) AS name
  FROM trips
  GROUP BY filename, start_station_id
)
SELECT trips.start_station_name AS start_name,
       start_names.name         AS end_name   -- not trips.end_station_name
FROM trips
LEFT JOIN start_names
  ON start_names.filename = trips.filename
 AND start_names.id = trips.end_station_id
`}
      </CodeBlock>
      <P>
        Fixing the names uncovered about 90,000 station pairs nobody had ridden between before, as far as the data knew,
        so they needed routes too. One more GraphHopper run later, the 2025 maps finally looked like a city again.
      </P>
      <Figure title="Round trips in the 2025 data" caption="Share of rides that start and end at the same station, before and after the fix. 2024 sits at 3–4%.">
        <StatCompare items={[{ label: 'Round trips', before: '100%', after: '2–3%', note: 'about 7 million rides corrected' }]} />
      </Figure>

      <CaseHeading id="first-frame" level={2}>
        Making the First Frame Fast
      </CaseHeading>
      <P>
        The first version opened on midnight in January, the emptiest frame the data has, and took 17.5 seconds to show a
        single ride. Before changing anything, I measured where the time went: 3.7 seconds for the site's own JavaScript,
        4 seconds to download and start DuckDB-WASM, then almost 10 seconds of Parquet queries, with three other queries
        competing for the same connection.
      </P>

      <CaseHeading id="shipping-the-first-hour" level={3}>
        Shipping the First Hour
      </CaseHeading>
      <P>
        The fix was to take the database off the critical path. The demo now opens on a July weekday at 5pm, when nearly
        4,000 rides cross the city in a single hour, and that hour ships as a small static file, under half a megabyte
        compressed. The map draws it straight away and only then starts DuckDB in the background for search and every
        other hour. I also stopped the extra queries from racing the first one.
      </P>
      <Figure
        title="Loading the demo, before and after"
        caption="Measured on the live site, from page load. The demo's own part went from about 14 seconds to 2; most of what remains is the site's JavaScript."
      >
        <LoadTimelineFigure />
      </Figure>

      <CaseHeading id="what-the-rides-show" level={2}>
        What the Rides Show
      </CaseHeading>
      <P>
        Once you can replay any day, holidays stand out. On a normal Monday the city has two rush hours, at 8am and 5pm.
        On Canada Day 2024 the morning peak disappears entirely, ridership holds at about 2,000 rides an hour from early
        afternoon into the evening, and it stays well above a normal night until midnight. Between 9 and 11pm the
        most popular place to end a ride was Northern Dancer Blvd at Lake Shore, a short walk from the fireworks at
        Ashbridge's Bay.
      </P>
      <Figure
        title="Canada Day against an ordinary Monday"
        caption="Rides started per hour, July 2024. Pick an hour, then open it in the demo to watch it."
      >
        <DayCompareFigure onOpenMoment={onOpenMoment} />
      </Figure>

      <CaseHeading id="smaller-puzzles" level={2}>
        Smaller Puzzles
      </CaseHeading>

      <CaseHeading id="float32" level={3}>
        Time on a 32-bit GPU
      </CaseHeading>
      <P>
        deck.gl animates rides on the GPU, which works in 32-bit floats. A timestamp in milliseconds since 1970 is around
        1.7 trillion, and at that size a 32-bit float can only step in increments of about two minutes, so rides would
        jump instead of glide. Every ride's timestamps are stored relative to the start of the hour being played instead,
        which keeps them under 3.6 million and precise to well under a millisecond.
      </P>

      <CaseHeading id="csv-formats" level={3}>
        A Decade of CSV Formats
      </CaseHeading>
      <P>
        The City's export format changed almost every year. 2014 and 2015 are monthly origin–destination matrices rather
        than rides. Early 2017 writes dates day-first (<C>13/04/2017</C>), late 2017 uses two-digit years, rider types are
        labelled three different ways, and the bike model moves between columns. The pipeline detects each era and
        normalises it, and rejects impossible dates instead of letting <C>Feb 31</C> roll into March.
      </P>

      <CaseHeading id="looking-back" level={2}>
        Looking Back
      </CaseHeading>
      <P>
        Two lessons stuck. Measure before optimising: the slow part wasn't drawing 4,000 rides on the GPU, it was
        everything that had to arrive over the network first. And don't trust data that looks clean: 7 million perfectly formatted rows were
        wrong in a way no type check would catch, and the only reason I noticed was that a feature made the data visible.
      </P>
      <P>
        Next, I'd like to compare two dates side by side, add station details on hover, and match renamed stations so
        older years keep more of their rides. Today, 2017–2023 keep only a third to just over half, because stations that
        no longer exist can't be placed on the map.
      </P>
    </>
  );
}
