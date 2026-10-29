import { C, CaseHeading, CodeBlock, Figure, P, StepLanes } from '@/components/case-study/CaseStudyText';

export default function AnidojoCaseStudy() {
  return (
    <>
      <CaseHeading id="what-i-built" level={2}>
        What I Built
      </CaseHeading>
      <P>
        AniDojo is a place to keep track of the anime you watch and actually say something about it. You can search
        anything on MyAnimeList, add shows to your lists, rate them out of five, and write reviews other people can vote
        and comment on. There's a dashboard with trending and upcoming shows, and a discover page that recommends what to
        watch next.
      </P>
      <P>
        I wanted something between a tracker and Letterboxd, but for anime. Tracking sites are mostly spreadsheets, and
        reviews end up buried in forums.
      </P>
      <Figure title="A walk through AniDojo" caption="The dashboard, search, a show's page, and writing a review." bare>
        <video className="w-full bg-black" src="/videos/anidojo-demo.mp4" controls playsInline preload="metadata" />
      </Figure>

      <CaseHeading id="the-stack" level={2}>
        The Stack
      </CaseHeading>
      <P>
        It's Next.js with the App Router, React 19 and Tailwind. Anime data comes from the Jikan API, a free wrapper
        around MyAnimeList, so I never had to build or host a catalogue. Everything that belongs to a user (profiles,
        lists, reviews, votes, comments) lives in Supabase, with auth handled there too.
      </P>
      <Figure
        title="Two sources of data"
        caption="Shows come from MyAnimeList through Jikan. What you do with them lives in Supabase. The highlighted step is the one that kept breaking."
      >
        <StepLanes
          lanes={[
            {
              label: 'Anime data',
              steps: [
                { title: 'Jikan API', detail: 'Search, top, seasonal, details' },
                { title: 'Rate limiter + cache', detail: 'One queue for every request', active: true },
              ],
            },
            {
              label: 'Your data',
              steps: [
                { title: 'Supabase auth', detail: 'Sign up, sign in, profiles' },
                { title: 'Postgres tables', detail: 'Lists, reviews, votes, comments' },
              ],
            },
          ]}
        />
      </Figure>

      <CaseHeading id="rate-limits" level={2}>
        Fighting the Rate Limit
      </CaseHeading>
      <P>
        Jikan is free, which is great, but it only lets you make a few requests a second. And my dashboard alone wanted
        recommended, trending and upcoming shows all at once, plus the cover for every review on your reviews page. So
        pages would load half their sections and the rest would come back as errors.
      </P>
      <P>
        The fix was to stop letting each component call the API on its own. Every request now goes through one small
        class that queues them, spaces them out, caches what came back, and backs off and retries when Jikan still says
        no.
      </P>
      <CodeBlock label="animeApi.ts (simplified)">{`
class APIRateLimiter {
  private minInterval = 350;              // ~3 requests a second
  private cacheExpiry = 5 * 60 * 1000;    // reuse answers for 5 minutes

  async call<T>(url: string): Promise<T> {
    const cached = this.cache.get(url);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) return cached.data;
    // otherwise wait for our turn in the queue, fetch,
    // and retry with a growing wait on a 429
  }
}
`}</CodeBlock>
      <P>
        The cache helped more than I expected. Going back to a page you'd already seen became instant, and the dashboard
        and browse page share a lot of the same requests.
      </P>

      <CaseHeading id="reviews" level={2}>
        Making Reviews Work
      </CaseHeading>
      <P>
        Reviews were the part I cared about most, and the part that fought back the most. The write-a-review page got
        stuck in a render loop for a while, because the form callbacks depended on state they were also updating. Moving
        the form data into refs fixed it (the commit message for that one was just "yessirrrrr").
      </P>
      <P>
        I also wanted you to keep drafts without ending up with two reviews of the same show. A plain unique constraint
        would've blocked drafts too, so the reviews table uses a <C>partial unique index</C>: one published review per
        user per anime, as many drafts as you want.
      </P>
      <P>
        Small one: I switched ratings from out of ten to out of five. It looked better, and honestly nobody can tell the
        difference between a 7 and an 8.
      </P>

      <CaseHeading id="looking-back" level={2}>
        Looking Back
      </CaseHeading>
      <P>
        When you build on someone else's free API, their limits become your design. I should've put every request through
        one place from day one instead of finding out page by page.
      </P>
      <P>
        Next, I want the recommender to learn from your own ratings and reviews instead of leaning on what's popular, and
        to bring the review feed more front and centre so it feels like a community, not just a tracker.
      </P>
    </>
  );
}
