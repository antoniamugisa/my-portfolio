import { C, CaseHeading, CodeBlock, Figure, P, StatCallout, StepLanes } from '@/components/case-study/CaseStudyText';
import { CsvBugFigure, DayCompareFigure, Float32Figure, LoadTimelineFigure, RouteFigure } from './bikeShareFigures';
import { EXAMPLE_RIDE } from './bikeShareExampleRide';

type BikeShareCaseStudyProps = {
  /** Opens the live demo at a Toronto wall time like "2024-07-01T22:00", optionally following a ride. */
  onOpenMoment?: (isoLocal: string, rideId?: string) => void;
};

export default function BikeShareCaseStudy({ onOpenMoment }: BikeShareCaseStudyProps) {
  return (
    <>
      <CaseHeading id="what-i-built" level={2}>
        What I Built
      </CaseHeading>
      <P>
        A map that replays more than 23 million Bike Share Toronto rides, from 2017 to early 2026. Pick an hour and every ride
        in it moves across the city from dock to dock, cyan for members and orange for casual riders. You can jump to any
        moment, find a real ride that left a station and follow it, or just sit back and watch a weekday rush hour fill
        up downtown.
      </P>
      <P>Two decisions shaped everything else.</P>
      <P>
        The browser does all the work, with no server behind it. And every ride follows real streets instead of a
        straight line between two stations.
      </P>

      <CaseHeading id="no-server" level={3}>
        No Server, Just the Browser
      </CaseHeading>
      <P>
        I didn't want a backend I'd have to pay for and keep alive just so people could look at bikes. So the ride data
        lives as one compressed Parquet file per month, about three quarters of a gigabyte in total, and the browser queries it
        directly with DuckDB-WASM, a full analytical database that runs inside the page. Every hour you watch is one SQL
        query, and the next hour loads while the current one plays, so it never stops to think.
      </P>
      <Figure
        title="From City spreadsheets to rides on screen"
        caption="The offline steps run once, whenever new data comes out. The highlighted step is the one you actually wait for."
      >
        <StepLanes
          lanes={[
            {
              label: 'Offline pipeline',
              steps: [
                { title: 'Download ridership CSVs', detail: 'City of Toronto open data, 2017–2026' },
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

      <CaseHeading id="real-streets" level={3}>
        Drawing Rides on Real Streets
      </CaseHeading>
      <P>
        The data only tells you which station a ride started at and which one it ended at. That's it. No GPS, no path.
      </P>
      <P>
        A straight line between the two would cut through buildings and right across the Don Valley, so I ran my own
        routing server (GraphHopper, on an OpenStreetMap extract of Ontario) with a bike profile that caps speed at 15 km/h
        and stays off highways. Then I asked it for a route between every pair of stations that shows up in the data.
        That's about 370,000 routes, cached in SQLite so the hours-long run could stop and pick up where it left off.
      </P>
      <Figure
        title="One ride, routed versus straight"
        caption="A real ride from a July evening rush hour. As the crow flies it's 3.4 km; by bike, winding through the ravines and across the Don Valley, it's 5.3 km."
      >
        <RouteFigure onFollowRide={onOpenMoment ? () => onOpenMoment(EXAMPLE_RIDE.startedAtLocal, EXAMPLE_RIDE.id) : undefined} />
      </Figure>
      <P>
        Matching stations was its own little project. Station names drift over a decade, with <C>&amp;</C> one year
        and <C>/</C> the next, random punctuation and extra spaces, so every name gets cleaned up and matched against
        today's live station feed. Stations within 60 m of each other are merged into one.
      </P>

      <CaseHeading id="the-bug" level={2}>
        The Bug in the City's Data
      </CaseHeading>
      <P>
        While I was building "follow a ride", I noticed something weird. Every ride I picked from 2025 started and
        ended at the same station.
      </P>
      <P>
        A few round trips are normal (people ride the waterfront and dock where they started), but every single one?
      </P>
      <P>
        I checked my Parquet files first, then my pipeline, then the City's original CSVs. My pipeline was doing exactly
        what it was told. In the files for January to October 2025, the <C>End_Station_Name</C> column just repeats
        the start station's name on every row. About 7 million of them. The <C>End_Station_Id</C> right next to it is
        correct.
      </P>
      <Figure
        title="The same row, two answers"
        caption="Real rows from the City's July 2025 file. The ID says where the ride ended; the name says it went nowhere. Toggle to see the fix."
      >
        <CsvBugFigure />
      </Figure>

      <CaseHeading id="the-fix" level={3}>
        The Fix
      </CaseHeading>
      <P>
        I stopped reading end names for these files altogether. Every station shows up as a start somewhere in the same
        file, with its correct name, so I build that lookup per file and get each end station from its ID instead. If an
        ID never starts a ride, the file's own end name is used, unless it's just the start name repeated, in which case
        I'd rather drop the ride than draw it wrong. That's about 0.2% of rides.
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
        Fixing the names also meant about 90,000 station pairs that the data had never connected before suddenly needed
        routes. One more long routing run later, 2025 finally looked like a city again.
      </P>
      <StatCallout label="Round trips in the 2025 data" before="100%" after="2–3%" note="About 7 million rides fixed. 2024 sits at 3–4%." />

      <CaseHeading id="loading-faster" level={2}>
        Making It Load Faster
      </CaseHeading>
      <P>
        The first version opened on midnight in January (the emptiest frame in the whole dataset, great first impression)
        and took 17.5 seconds to show a single ride.
      </P>
      <P>
        Before changing anything, I measured where the time actually went: 3.7 seconds for my site's own JavaScript,
        about 4 seconds to download and start DuckDB-WASM, then almost 10 seconds of Parquet queries, with three other
        queries fighting the first one for the same connection.
      </P>

      <CaseHeading id="first-hour" level={3}>
        Shipping the First Hour
      </CaseHeading>
      <P>
        The fix was to get the database out of the way. The demo now opens on a July weekday at 5pm, the busiest rush hour of 2025,
        when nearly 4,900 rides start in a single hour, and that hour ships as a static file, under a megabyte
        compressed. The map draws it straight away and only then starts DuckDB in the background for everything else. I
        also stopped the extra queries from racing the first one.
      </P>
      <Figure
        title="Loading the demo, before and after"
        caption="Measured on the live site, from page load. The demo's own part went from about 14 seconds to 2; most of what's left is the site's JavaScript."
      >
        <LoadTimelineFigure />
      </Figure>

      <CaseHeading id="what-the-rides-show" level={2}>
        What the Rides Show
      </CaseHeading>
      <P>Once you can replay any day, holidays really stand out.</P>
      <P>
        On a normal Monday the city has two rush hours, 8am and 5pm. On Canada Day 2024 the morning rush just disappears.
        Ridership sits at around 2,000 rides an hour from early afternoon into the evening, and stays way above a normal
        night until midnight. Between 9 and 11pm, the most popular place to end a ride was Northern Dancer Blvd at Lake
        Shore, a short walk from the fireworks at Ashbridge's Bay.
      </P>
      <P>Toronto loves its fireworks.</P>
      <Figure
        title="Canada Day against an ordinary Monday"
        caption="Rides started per hour, July 2024. Pick an hour, then open it in the demo to watch it."
      >
        <DayCompareFigure onOpenMoment={onOpenMoment} />
      </Figure>

      <CaseHeading id="smaller-stuff" level={2}>
        The Smaller Stuff
      </CaseHeading>

      <CaseHeading id="float32" level={3}>
        Time on a 32-bit GPU
      </CaseHeading>
      <P>
        deck.gl animates the rides on the GPU, which works in 32-bit floats. A timestamp in milliseconds since 1970 is
        around 1.7 trillion, and a 32-bit float that big can only move in steps of about two minutes. So instead of
        gliding, rides would freeze and then jump.
      </P>
      <Figure
        title="A ride's clock, stored two ways"
        caption="Computed with the same 32-bit rounding the GPU uses. Storing time since the hour started keeps every position."
      >
        <Float32Figure />
      </Figure>
      <P>
        The fix is small: every ride's timestamps are stored relative to the start of the hour being played, which keeps
        them under 3.6 million and precise to well under a millisecond.
      </P>

      <CaseHeading id="csv-formats" level={3}>
        A Decade of CSV Formats
      </CaseHeading>
      <P>
        The City's export format changed almost every year. 2014 and 2015 aren't even rides, they're monthly
        origin–destination tables. Early 2017 writes dates day-first (<C>13/04/2017</C>), late 2017 uses two-digit
        years, rider types are labelled three different ways, and the bike model keeps moving between columns. The
        pipeline detects each era and cleans it up, and rejects impossible dates instead of letting <C>Feb 31</C>{' '}
        quietly roll into March.
      </P>

      <CaseHeading id="looking-back" level={2}>
        Looking Back
      </CaseHeading>
      <P>Two lessons really stuck with me.</P>
      <P>
        Measure before you optimise. The slow part was never drawing 5,000 rides on the GPU, it was everything that had
        to come over the network first.
      </P>
      <P>
        And don't trust data just because it looks clean. Seven million perfectly formatted rows were wrong in a way no
        type check would ever catch, and the only reason I noticed was that a feature made the data visible.
      </P>
      <P>
        Next, I'd love to compare two dates side by side, add station details on hover, and match renamed stations so
        older years keep more of their rides. Right now 2017–2023 only keep a third to just over half, because stations
        that don't exist anymore can't be placed on the map.
      </P>
    </>
  );
}
