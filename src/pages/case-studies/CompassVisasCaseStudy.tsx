import { C, CaseHeading, CodeBlock, Figure, P } from '@/components/case-study/CaseStudyText';
import {
  CaseRecordsFigure,
  DecisionList,
  DriveRenameFigure,
  EmployerVisibilityFigure,
  NumbersStrip,
  OutcomeStats,
  OwnershipList,
  PracticesGrid,
  SecurityLayers,
  StageTrackFigure,
  SystemMapFigure,
} from './compassFigures';

export default function CompassVisasCaseStudy() {
  return (
    <>
      <CaseHeading id="what-it-is" level={2}>
        What It Is
      </CaseHeading>
      <P>
        Every Compass Visas case runs through it, from the first intake question to the petition that gets shipped to
        USCIS. It's private to invited clients, so this page covers
        how it's built rather than how it looks.
      </P>
      <NumbersStrip />

      <CaseHeading id="what-it-changed" level={2}>
        What It Changed
      </CaseHeading>
      <P>
        Before the app, a petition was assembled from forms, email threads and spreadsheets. Now the busywork happens on
        its own:
      </P>
      <OutcomeStats />

      <CaseHeading id="what-i-own" level={2}>
        What I Own
      </CaseHeading>
      <P>
        About 1,090 of the 2,610 commits are mine. These are the parts I built end to end, from
        the tables to the screens and the emails they send:
      </P>
      <OwnershipList />

      <CaseHeading id="a-case-from-start-to-finish" level={2}>
        A Case From Start to Finish
      </CaseHeading>
      <P>
        Every case moves through the same stages, with a different person doing the work at each one. The app's job is to
        make it obvious whose turn it is, and hand the next person everything they need.
      </P>
      <Figure title="The stages of a case" caption="Who does the work at each stage. A Request for Evidence can come in after the case is receipted.">
        <StageTrackFigure />
      </Figure>

      <CaseHeading id="how-its-built" level={2}>
        How It's Built
      </CaseHeading>
      <P>
        A React and TypeScript front end on one Express API, running as a serverless function on Vercel, with Postgres on
        Supabase through Drizzle. Scheduled jobs on Vercel Cron send reminders and run the syncs.
      </P>
      <Figure title="The whole system" caption="Four portals on one API, the data grouped by area, and what runs around it. The highlighted step is checked on every request.">
        <SystemMapFigure />
      </Figure>

      <CaseHeading id="architecture-decisions" level={3}>
        Architecture Decisions
      </CaseHeading>
      <P>The choices that shaped the codebase, why they were made, and what they cost. Three of the five were my call:</P>
      <DecisionList />

      <CaseHeading id="security" level={2}>
        Security
      </CaseHeading>
      <P>
        The app holds passports, salaries and immigration histories, so privacy is enforced on the server in layers,
        never by hiding buttons in the interface. Most of this layer is my code.
      </P>
      <Figure title="How the data is protected" caption="Each layer works on its own, so one mistake doesn't expose a case.">
        <SecurityLayers />
      </Figure>

      <CaseHeading id="who-sees-what" level={3}>
        Who Sees What
      </CaseHeading>
      <P>
        Employers are the hardest case: they sponsor the visa, but an employee's passport, past salaries and evidence are
        none of their business. So each client has an employer access setting. By default the employer gets only
        the company and job questions, their own uploads, and how far along the other sections are, with no answers.
        Clients choose the setting once their employer gets access, and an employer can never read or change it.
      </P>
      <Figure title="What an employer sees of a case" caption="Switch the setting to compare. The default is company only, for new and existing clients.">
        <EmployerVisibilityFigure />
      </Figure>

      <CaseHeading id="engineering-practices" level={2}>
        How We Work
      </CaseHeading>
      <P>A two-person team on a live legal product can't afford regressions, so the process does a lot of the checking:</P>
      <PracticesGrid />

      <CaseHeading id="one-person-several-cases" level={2}>
        One Person, Several Cases
      </CaseHeading>
      <P>
        Clients come back. Someone with an approved O-1 renews it, or moves on to an EB-1 green card, and they need a new
        case without changing the one already filed. But the whole app was keyed on one client, one case.
      </P>
      <P>
        Rather than rework every table, I made each extra case its own user record with a <C>case_of_user_id</C> pointing
        back at the person's main record. Every table and ownership check keyed by client already worked per case, so
        almost nothing else had to change. Email lookups return the main record, the sidebar has a case switcher, and when
        a returning client signs a new agreement their past answers are copied into the new case.
      </P>
      <CodeBlock label="Illustration · the idea, not the production schema">{`
// A person's first case is their main record. Every later case is a row of its own
// that points back at it, so anything keyed by case keeps working unchanged.
type ClientRecord = {
  id: string;
  email: string;
  mainRecordId: string | null; // null on the main record
};

const isExtraCase = (r: ClientRecord) => r.mainRecordId !== null;
const personOf = (r: ClientRecord) => r.mainRecordId ?? r.id;
`}</CodeBlock>
      <Figure title="Extra cases point back at the person" caption="The main record is the person. Each new case is a record of its own, linked to it.">
        <CaseRecordsFigure />
      </Figure>

      <CaseHeading id="filing-into-drive" level={2}>
        Filing Into Google Drive
      </CaseHeading>
      <P>
        The legal team works out of Google Drive, so every upload is filed into the client's folder automatically, by role
        or contribution, nested under their company. The first version renamed each folder back to its role name on every
        upload, overwriting names staff had chosen on purpose. Now the sync remembers the name it gave each folder and only
        renames one that still has that name. If it's different, a person changed it, and the sync leaves it alone.
      </P>
      <P>
        I kept the rule as a small pure function, separate from the Drive API calls, so it can be tested without touching
        Drive. Simplified, it looks like this:
      </P>
      <CodeBlock label="Illustration · simplified from the real sync">{`
type FolderAction = "leave" | "remember" | "rename";

/**
 * nameNow:    what the folder is called in Drive right now
 * nameWanted: what the sync would call it today
 * nameWeGave: what the sync called it last time, if anything
 */
function decideFolderName(nameNow: string, nameWanted: string, nameWeGave?: string): FolderAction {
  if (nameNow === nameWanted) return nameWeGave === nameWanted ? "leave" : "remember";
  // Only rename a folder that still has our name. Anything else, a person chose.
  return nameNow === nameWeGave ? "rename" : "leave";
}

test("only renames folders the sync still owns", () => {
  expect(decideFolderName("Engineer · Acme", "Senior Engineer · Acme", "Engineer · Acme")).toBe("rename");
  expect(decideFolderName("Acme (keep)", "Senior Engineer · Acme", "Engineer · Acme")).toBe("leave");
  expect(decideFolderName("Engineer · Acme", "Engineer · Acme")).toBe("remember");
});
`}</CodeBlock>
      <Figure title="Should the sync rename this folder?" caption="Only when the folder still has the name the sync gave it last time.">
        <DriveRenameFigure />
      </Figure>
      <P>
        The same pass catches duplicate evidence, since a repeated exhibit in a petition looks careless. Files that are
        byte-identical to another upload are flagged using the hash storage already keeps, and files that share a name but
        not their contents get a warning with links to each copy. Nothing is deleted automatically; staff decide.
      </P>

      <CaseHeading id="what-i-learned" level={2}>
        What I Learned
      </CaseHeading>
      <P>
        This is the first thing I've built that people depend on every day. I learned to ship small changes quickly,
        listen to what staff run into, and fix it the same week. I also learned to design permissions for many kinds of
        users, run migrations safely on a production database, and put AI into work where a mistake really matters.
      </P>
      <P>
        Next, I'd like more of the petition drafted straight from the evidence, and a clearer view for clients of what's
        left to do on their case.
      </P>
    </>
  );
}
