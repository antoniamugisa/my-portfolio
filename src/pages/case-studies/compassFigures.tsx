import React, { useState } from 'react';

/** The stages a case moves through, from signed agreement to decision. */
const STAGES = [
  { label: 'Agreement signed', who: 'Sales' },
  { label: 'Questionnaires', who: 'Client + employer' },
  { label: 'Strategy call', who: 'Client + team' },
  { label: 'Drafting', who: 'Team' },
  { label: 'Attorney review', who: 'Attorney' },
  { label: 'Client review', who: 'Client' },
  { label: 'Final review', who: 'Attorney' },
  { label: 'Print and ship', who: 'Team' },
  { label: 'Receipted', who: 'USCIS' },
  { label: 'Approved', who: 'USCIS' },
];

export function StageTrackFigure() {
  return (
    <ol className="grid gap-x-2 gap-y-3 sm:grid-cols-5">
      {STAGES.map((s, i) => (
        <li key={s.label} className="flex flex-col rounded-lg border border-border bg-background/70 px-3 py-2.5">
          <span className="font-mono text-xs text-muted-foreground">{String(i + 1).padStart(2, '0')}</span>
          <span className="mt-1 text-sm text-foreground">{s.label}</span>
          <span className="text-xs text-muted-foreground">{s.who}</span>
        </li>
      ))}
    </ol>
  );
}

type Access = 'yes' | 'progress' | 'no';

const VISIBILITY_ROWS: { item: string; companyOnly: Access; full: Access }[] = [
  { item: 'Company and job offer questions', companyOnly: 'yes', full: 'yes' },
  { item: 'Company documents they upload', companyOnly: 'yes', full: 'yes' },
  { item: 'How far along each section is', companyOnly: 'progress', full: 'yes' },
  { item: 'Personal information and passport', companyOnly: 'no', full: 'yes' },
  { item: 'Past jobs and salaries', companyOnly: 'no', full: 'yes' },
  { item: 'Evidence for the criteria', companyOnly: 'no', full: 'yes' },
];

function AccessCell({ value }: { value: Access }) {
  const styles: Record<Access, string> = {
    yes: 'bg-emerald-500/15 text-foreground',
    progress: 'bg-amber-500/15 text-foreground',
    no: 'bg-red-500/10 text-muted-foreground',
  };
  const text: Record<Access, string> = { yes: 'Sees it', progress: 'Progress only', no: 'Blocked' };
  return <span className={`inline-block rounded px-1.5 py-0.5 text-xs ${styles[value]}`}>{text[value]}</span>;
}

export function EmployerVisibilityFigure() {
  const [mode, setMode] = useState<'companyOnly' | 'full'>('companyOnly');
  return (
    <div>
      <div className="mb-4 flex justify-end">
        <div className="inline-flex rounded-lg border border-border bg-background p-0.5 text-xs" role="radiogroup" aria-label="Employer access setting">
          {[
            { v: 'companyOnly' as const, label: 'Company only (default)' },
            { v: 'full' as const, label: 'Full case' },
          ].map((o) => (
            <button
              key={o.v}
              type="button"
              role="radio"
              aria-checked={mode === o.v}
              onClick={() => setMode(o.v)}
              className={`rounded-md px-2.5 py-1 transition-colors ${mode === o.v ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="text-left text-xs text-muted-foreground">
            <th className="pb-2 pr-3 font-normal">Part of the case</th>
            <th className="pb-2 font-normal">What the employer gets</th>
          </tr>
        </thead>
        <tbody>
          {VISIBILITY_ROWS.map((r) => (
            <tr key={r.item} className="border-t border-border">
              <td className="py-2 pr-3 text-foreground/80">{r.item}</td>
              <td className="py-2">
                <AccessCell value={r[mode]} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** One person, several cases: each extra case is its own record pointing at the main one. */
export function CaseRecordsFigure() {
  const records = [
    { id: 'user A', label: 'Main record', detail: 'First O-1, filed and approved', main: true },
    { id: 'case B', label: 'O-1 renewal', detail: 'case_of_user_id → user A', main: false },
    { id: 'case C', label: 'EB-1 green card', detail: 'case_of_user_id → user A', main: false },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {records.map((r) => (
        <div
          key={r.id}
          className={`rounded-lg border px-3 py-3 ${r.main ? 'border-foreground/40 bg-background shadow-subtle' : 'border-border bg-background/70'}`}
        >
          <div className="font-mono text-xs text-muted-foreground">{r.id}</div>
          <div className="mt-1 text-sm text-foreground">{r.label}</div>
          <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">{r.detail}</div>
        </div>
      ))}
      <p className="text-xs text-muted-foreground sm:col-span-3">
        Documents, answers and requests stay keyed by record, so each case keeps its own, and the old case stays exactly as filed.
      </p>
    </div>
  );
}

/** Should the Drive sync rename this folder? */
export function DriveRenameFigure() {
  const rows = [
    { folder: 'Role · Lumen Robotics', lastSet: 'Role · Lumen Robotics', action: 'Rename to the new role name', rename: true },
    { folder: 'Microsoft', lastSet: 'Role · Microsoft Research', action: 'Leave it: staff renamed it', rename: false },
    { folder: 'Press (moved)', lastSet: 'Contribution · Press', action: 'Leave it: staff remapped it', rename: false },
  ];
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[30rem] border-collapse text-sm">
        <thead>
          <tr className="text-left text-xs text-muted-foreground">
            <th className="pb-2 pr-3 font-normal">Folder in Drive now</th>
            <th className="pb-2 pr-3 font-normal">Name the sync last gave it</th>
            <th className="pb-2 font-normal">On the next upload</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.folder} className="border-t border-border">
              <td className="py-2 pr-3 font-mono text-[12px] text-foreground/80">{r.folder}</td>
              <td className="py-2 pr-3 font-mono text-[12px] text-muted-foreground">{r.lastSet}</td>
              <td className="py-2">
                <span className={`inline-block rounded px-1.5 py-0.5 text-xs ${r.rename ? 'bg-emerald-500/15' : 'bg-muted/60'} text-foreground`}>
                  {r.action}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Headline numbers: rounded usage (Nov 2026, test accounts excluded), then size from the repo.
 */
const COMPASS_NUMBERS: { value: string; label: string }[] = [
  { value: '100+', label: 'clients in the portal' },
  { value: '200+', label: 'cases so far' },
  { value: '184k', label: 'lines of TypeScript' },
  { value: '84', label: 'database tables' },
  { value: '80', label: 'screens, 4 portals' },
  { value: '743', label: 'tests' },
  { value: '170', label: 'merged pull requests' },
  { value: '1,090', label: 'of the commits are mine' },
];

export function NumbersStrip() {
  return (
    <dl className="my-10 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-4">
      {COMPASS_NUMBERS.map((n) => (
        <div key={n.label} className="flex flex-col-reverse bg-background px-4 py-4">
          <dt className="mt-1 text-xs text-muted-foreground">{n.label}</dt>
          <dd className="font-mono text-2xl text-foreground md:text-3xl">{n.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function Box({ title, detail, strong = false }: { title: string; detail?: string; strong?: boolean }) {
  return (
    <div className={`rounded-lg border px-3 py-2 ${strong ? 'border-foreground/40 bg-background shadow-subtle' : 'border-border bg-background/70'}`}>
      <div className="text-sm text-foreground">{title}</div>
      {detail && <div className="text-xs text-muted-foreground">{detail}</div>}
    </div>
  );
}

function Tier({ label, children, cols }: { label: string; children: React.ReactNode; cols: string }) {
  return (
    <div>
      <div className="mb-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">{label}</div>
      <div className={`grid gap-2 ${cols}`}>{children}</div>
    </div>
  );
}

const Arrow = () => (
  <div className="flex justify-center py-1 text-muted-foreground" aria-hidden>
    ↓
  </div>
);

/** The whole system on one page: portals, the API, the data grouped by area, background jobs and services. */
export function SystemMapFigure() {
  return (
    <div className="space-y-2">
      <Tier label="4 portals · 80 screens" cols="grid-cols-2 sm:grid-cols-4">
        <Box title="Client" detail="Intake, evidence, progress" />
        <Box title="Employer" detail="Company questions, docs" />
        <Box title="Sales" detail="Agreements, payment" />
        <Box title="Admin + attorneys" detail="Pipeline, review, filing" />
      </Tier>
      <Arrow />
      <Tier label="Express API on Vercel · 85+ endpoints" cols="grid-cols-1 sm:grid-cols-3">
        <Box title="Auth and access checks" detail="Role, case, employer visibility" strong />
        <Box title="Business logic" detail="Stages, agreements, USCIS forms, AI review" />
        <Box title="Storage layer" detail="Drizzle ORM, signed URLs" />
      </Tier>
      <Arrow />
      <Tier label="Postgres on Supabase · 84 tables" cols="grid-cols-2 sm:grid-cols-4">
        <Box title="People and cases" detail="Clients, extra cases, stages" />
        <Box title="Evidence" detail="Documents, criteria, requests" />
        <Box title="Sales" detail="Agreements, line items, payments" />
        <Box title="Employers" detail="Companies, invites, access" />
      </Tier>
      <div className="grid gap-2 pt-4 sm:grid-cols-2">
        <Tier label="In the background" cols="grid-cols-1">
          <Box title="12 scheduled jobs" detail="Reminders, syncs, health checks" />
          <Box title="15 email templates" detail="Invites, reminders, updates" />
        </Tier>
        <Tier label="Connected services" cols="grid-cols-2">
          <Box title="Stripe" />
          <Box title="Google Drive" />
          <Box title="Resend" />
          <Box title="CRM" />
          <Box title="Claude + OpenAI" />
          <Box title="PostHog" />
        </Tier>
      </div>
    </div>
  );
}

const OWNED: { area: string; detail: string }[] = [
  { area: 'Guided client intake', detail: 'One question at a time, stage covers, save and exit, welcome back' },
  { area: 'Employer portal', detail: 'Invites, company profiles, the visibility firewall' },
  { area: 'Sales agreements', detail: 'Create, sign, decline, pay with Stripe, store signed PDFs' },
  { area: 'Returning clients', detail: 'Several cases per person, copying a past case at signing' },
  { area: 'Google Drive filing', detail: 'Folder per company and client, every document type routed' },
  { area: 'USCIS forms', detail: 'Filled I-129 with H-1B and O-1 supplements' },
  { area: 'Attorney queue', detail: 'Stage-by-stage threads, checklists, Send to Final Review' },
  { area: 'Evidence requests', detail: 'Preview, test and approve what clients are asked for' },
];

export function OwnershipList() {
  return (
    <ul className="my-8 grid gap-2 sm:grid-cols-2">
      {OWNED.map((o) => (
        <li key={o.area} className="rounded-lg border border-border px-3 py-2.5">
          <div className="text-sm text-foreground">{o.area}</div>
          <div className="text-xs text-muted-foreground">{o.detail}</div>
        </li>
      ))}
    </ul>
  );
}

/** What the app does on its own (rounded, Nov 2026). */
export function OutcomeStats() {
  const stats = [
    { value: '60+', label: 'sales agreements signed and paid in the app, with no PDFs over email' },
    { value: '1 in 4', label: 'case stage changes made by the app itself, not by staff' },
    { value: '1000s', label: 'of documents filed into the right Drive folder automatically' },
  ];
  return (
    <div className="my-8 grid gap-6 border-l-2 border-foreground/30 pl-5 sm:grid-cols-3">
      {stats.map((s) => (
        <div key={s.value}>
          <div className="font-mono text-2xl text-foreground md:text-3xl">{s.value}</div>
          <div className="mt-1 text-sm leading-snug text-muted-foreground">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

const DECISIONS: { title: string; mine: boolean; decision: string; why: string; cost: string }[] = [
  {
    title: 'One Express app, two hosts',
    mine: false,
    decision: 'The same Express app runs locally and as one catch-all serverless function on Vercel.',
    why: 'One code path for every endpoint, so there is nothing to keep in sync between environments.',
    cost: 'Functions stop after the response. I moved slow work like the Drive sync after it with waitUntil, so an upload is confirmed as soon as it is saved instead of waiting up to 15 seconds.',
  },
  {
    title: 'A small database pool, on purpose',
    mine: true,
    decision: 'I capped each serverless instance at 3 Postgres connections.',
    why: 'Every instance shares the Supabase pooler\'s 200-connection limit, so a burst of traffic can\'t exhaust it.',
    cost: 'I wrapped flaky calls in a retry and added a cron job that keeps the pool warm, to avoid cold-start timeouts.',
  },
  {
    title: 'File links that never get saved',
    mine: true,
    decision: 'I made the database keep only a file\'s permanent location. Expiring links are created when the file is shown, in one place.',
    why: 'A temporary link can never be stored by accident or outlive the reason it was made.',
    cost: 'Every response goes through that one step, so no feature is allowed to make its own links.',
  },
  {
    title: 'Extra cases as linked records',
    mine: true,
    decision: 'I made a returning client\'s new case its own user record, pointing at their main one.',
    why: 'Dozens of tables and every ownership check already keyed on the client kept working unchanged.',
    cost: 'Email lookups have to know to return the main record, so that logic lives in one place.',
  },
  {
    title: 'One schema, shared by both sides',
    mine: false,
    decision: 'The Drizzle schema and Zod validation live in a shared folder used by the React app and the API.',
    why: 'A field added to the database is type-checked all the way to the form that fills it.',
    cost: 'The shared folder can\'t import anything server-only, which keeps it deliberately small.',
  },
];

export function DecisionList() {
  return (
    <div className="my-8 space-y-3">
      {DECISIONS.map((d, i) => (
        <div key={d.title} className="rounded-xl border border-border px-4 py-4">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xs text-muted-foreground">{String(i + 1).padStart(2, '0')}</span>
            <span className="text-[15px] text-foreground">{d.title}</span>
            <span
              className={`ml-auto shrink-0 rounded px-1.5 py-0.5 text-[11px] ${d.mine ? 'bg-foreground text-background' : 'bg-muted/60 text-muted-foreground'}`}
            >
              {d.mine ? 'My call' : 'Team call'}
            </span>
          </div>
          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-[6rem_1fr]">
            <dt className="text-xs uppercase tracking-[0.12em] text-muted-foreground sm:pt-0.5">Decision</dt>
            <dd className="text-foreground/75">{d.decision}</dd>
            <dt className="text-xs uppercase tracking-[0.12em] text-muted-foreground sm:pt-0.5">Why</dt>
            <dd className="text-foreground/75">{d.why}</dd>
            <dt className="text-xs uppercase tracking-[0.12em] text-muted-foreground sm:pt-0.5">Trade-off</dt>
            <dd className="text-foreground/75">{d.cost}</dd>
          </dl>
        </div>
      ))}
    </div>
  );
}

const SECURITY: { layer: string; how: string }[] = [
  { layer: 'Sign-in', how: 'Clients, staff and employers each sign in their own way, and every request is tied to who is making it.' },
  { layer: 'Access checks', how: 'Every request is checked on the server against the case it touches. Nothing relies on the interface hiding a button.' },
  { layer: 'Employer visibility', how: 'Clients decide how much of their case their employer can see, and the server enforces it.' },
  { layer: 'Sensitive numbers', how: 'Identity numbers are encrypted at rest and masked everywhere they appear.' },
  { layer: 'Files', how: 'Documents live in private storage and open only through links that expire.' },
  { layer: 'Payments', how: 'Payment events are verified before they change anything, and retries can\'t charge twice.' },
];

export function SecurityLayers() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[30rem] border-collapse text-sm">
        <tbody>
          {SECURITY.map((s) => (
            <tr key={s.layer} className="border-t border-border first:border-t-0">
              <td className="w-40 py-2.5 pr-4 align-top text-foreground">{s.layer}</td>
              <td className="py-2.5 text-foreground/70">{s.how}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const PRACTICES: { title: string; detail: string }[] = [
  { title: 'Strict TypeScript as the gate', detail: 'The whole repo type-checks in strict mode before anything ships.' },
  { title: '743 tests', detail: 'Across 76 test files, on node:test, covering agreements, form filling, permissions and the AI tools.' },
  { title: 'Migrations as code', detail: '27 SQL migrations, deployed by GitHub Actions to staging first, then production.' },
  { title: 'A real staging environment', detail: 'Its own database with realistic seeded clients, employers and cases at every stage.' },
  { title: 'Small PRs', detail: '170 merged pull requests, kept small and focused, with commit messages that explain why.' },
  { title: 'Measured, then fixed', detail: 'PostHog events show where clients stall in the intake; errors post to Slack as they happen.' },
  { title: 'AI with a human in the loop', detail: 'AI parses resumes, reviews petitions and drafts RFE responses. Drafts are checked against the case file and an attorney always signs off.' },
  { title: 'Docs next to the code', detail: 'Architecture, API, RLS and environment docs live in the repo, not in someone\'s head.' },
];

export function PracticesGrid() {
  return (
    <ul className="my-8 grid gap-2 sm:grid-cols-2">
      {PRACTICES.map((p) => (
        <li key={p.title} className="rounded-lg border border-border px-3 py-2.5">
          <div className="text-sm text-foreground">{p.title}</div>
          <div className="text-xs leading-relaxed text-muted-foreground">{p.detail}</div>
        </li>
      ))}
    </ul>
  );
}
