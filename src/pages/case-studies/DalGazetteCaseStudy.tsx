import { CaseHeading, Figure, P, StepLanes } from '@/components/case-study/CaseStudyText';

export default function DalGazetteCaseStudy() {
  return (
    <>
      <CaseHeading id="why" level={2}>
        Why I Built It
      </CaseHeading>
      <P>
        The Dal Gazette is Dalhousie's student newspaper, and the team does great work. But it lives on a website you have to remember to go
        to, while everyone's on their phone all day.
      </P>
      <P>
        So I'm building it an app. I honestly think we need more real journalism (and more reading) on campus, and the
        Gazette deserves a bigger reach into the student body.
      </P>

      <CaseHeading id="what-it-does" level={2}>
        What It Does
      </CaseHeading>
      <P>
        It opens on featured stories and a feed of the latest articles. You can filter by News, Arts &amp; Culture,
        Opinions and Sports, search by title or author, and pull down to refresh. Each article opens full screen, made for
        actually reading, not skimming.
      </P>
      <P>
        It's in Dalhousie's black and gold, with light and dark themes that follow your phone's setting. There are also
        early Listen and Play tabs.
      </P>
      <Figure title="The app so far" caption="Browsing sections, reading an article, and the settings screen." bare>
        <video className="w-full bg-black" src="/videos/dal-gazette-demo.mp4" controls playsInline preload="metadata" />
      </Figure>

      <CaseHeading id="getting-the-articles" level={2}>
        Getting the Articles
      </CaseHeading>
      <P>
        The Gazette doesn't have an API, which was the first real problem. I started with mock data to get the screens
        right, then wrote a small Express server that reads the site's RSS feed and turns it into something the app can
        use.
      </P>
      <Figure title="From the Gazette's site to your phone" caption="The highlighted step is where most of the work went.">
        <StepLanes
          lanes={[
            {
              label: 'Scraper server',
              steps: [
                { title: 'Read the RSS feed', detail: 'Express + axios' },
                { title: 'Clean the content', detail: 'HTML → readable paragraphs + images', active: true },
                { title: 'Cache articles', detail: 'Saved to articles.json' },
              ],
            },
            {
              label: 'In the app',
              steps: [
                { title: 'Load into context', detail: 'One store shared by every screen' },
                { title: 'Filter per section', detail: 'Memoised, so tabs switch instantly' },
              ],
            },
          ]}
        />
      </Figure>
      <P>
        RSS gives you HTML, and an article full of stray tags and <code>&amp;nbsp;</code> doesn't read well on a phone.
        So the scraper strips the markup, decodes entities, rebuilds proper paragraphs, and pulls out the lead image so
        every card has a picture.
      </P>

      <CaseHeading id="one-source-of-truth" level={3}>
        One Source of Truth
      </CaseHeading>
      <P>
        At first each screen loaded its own articles, so News, Sports and Culture could disagree about what was new.
        Moving everything into one shared context fixed that: the app fetches once, and each tab just filters what's
        already there.
      </P>

      <CaseHeading id="where-its-at" level={2}>
        Where It's At
      </CaseHeading>
      <P>
        It's still in progress. The scraper runs on my local network for now, so the next big step is hosting it properly
        and getting the app into the stores.
      </P>
      <P>
        After that I'd like push notifications for breaking news, saved articles, and a way for the Gazette team to
        feature stories themselves instead of me picking them in code.
      </P>
    </>
  );
}
