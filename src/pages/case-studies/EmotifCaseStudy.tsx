import { C, CaseHeading, CodeBlock, Figure, P, StepLanes } from '@/components/case-study/CaseStudyText';
import emotifTeamImage from '@/assets/emotif-team.jpeg';

export default function EmotifCaseStudy() {
  return (
    <>
      <CaseHeading id="what-we-built" level={2}>
        What We Built
      </CaseHeading>
      <P>
        Emotif is a calendar that asks how you're doing. You tap one of five moods for the day (happy, confident, tired,
        anxious or angry), and Gemini looks at that next to your schedule and drops suggestions into your free time.
        Something like "go for a walk, it'll make you feel less anxious", right there between your 12:00 and your 15:00.
      </P>
      <P>
        We built it in one weekend for the 2025 ShiftKey hackathon, where the theme was mental wellbeing. It placed
        third.
      </P>

      <CaseHeading id="why-a-calendar" level={3}>
        Why a Calendar
      </CaseHeading>
      <P>
        Most mood trackers live in their own app, which means one more thing to remember to open. Your calendar you
        already check every day, and it already knows the part that actually matters for a suggestion: when you're
        free. So instead of a journal, we made the mood a thing you log right next to your events.
      </P>

      <CaseHeading id="how-it-works" level={2}>
        How It Works
      </CaseHeading>
      <P>
        It's a Next.js app. Events and moods live in Firebase, the calendar reads them when you change dates, and a small
        API route sends the day to Gemini 1.5 Flash.
      </P>
      <Figure title="From a mood to a suggestion" caption="The highlighted step is the only one that leaves the app.">
        <StepLanes
          lanes={[
            {
              label: 'In the calendar',
              steps: [
                { title: 'Log a mood', detail: 'One of five, for the day' },
                { title: 'Load the day', detail: 'Events + moods from Firebase' },
              ],
            },
            {
              label: 'On the server',
              steps: [
                { title: 'Ask Gemini', detail: 'Events + moods in, JSON events out', active: true },
                { title: 'Write them back', detail: 'Suggestions saved as calendar events' },
              ],
            },
          ]}
        />
      </Figure>

      <CaseHeading id="json-from-an-llm" level={3}>
        Getting Calendar Events Out of an LLM
      </CaseHeading>
      <P>
        The trick was getting Gemini to answer in something the calendar could use directly, not a paragraph. So the
        prompt hands it the day's events and moods and asks for the same shape our events already have, with an example:
      </P>
      <CodeBlock label="the shape we asked Gemini for">{`
[{
  "date": "20-01-2025",
  "starttime": "12:55",
  "endtime": "14:35",
  "name": "AI suggested activity: Go for a walk, it will make you feel less anxious"
}]
`}</CodeBlock>
      <P>
        That way a suggestion is just another event. We <C>JSON.parse</C> the reply, save each one to Firebase, and the
        calendar draws it like anything else, no special UI needed.
      </P>
      <P>
        It didn't go perfectly. Gemini kept wrapping its answer in a Markdown code fence, which breaks{' '}
        <C>JSON.parse</C>, so the final prompt literally says please don't do that.
      </P>

      <CaseHeading id="the-team" level={2}>
        The Team
      </CaseHeading>
      <Figure title="Third place at ShiftKey 2025" caption="When we won 3rd place!" bare>
        <img src={emotifTeamImage} alt="The Emotif team at the ShiftKey hackathon" className="h-auto w-full" />
      </Figure>

      <CaseHeading id="looking-back" level={2}>
        Looking Back
      </CaseHeading>
      <P>
        The biggest thing I took away: when an LLM's output feeds straight into your app, the format matters more than
        the wording. Asking for our exact event shape is what made the whole feature small enough to build in a weekend.
      </P>
      <P>
        If I picked it back up, I'd check Gemini's reply against a schema instead of trusting the prompt, move the API
        key out of the code and onto the server, and keep a history of moods so suggestions could learn from more than
        one day.
      </P>
    </>
  );
}
