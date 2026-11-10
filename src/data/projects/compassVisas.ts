import { Project } from './index';

export const compassVisasProject: Project = {
  id: 'compass-visas',
  title: 'Compass Visas Platform',
  description:
    'The app Compass Visas runs on: clients, employers, sales and attorneys all work in one place to take an O-1, EB-1, ' +
    'TN or H-1B case from signed agreement to filed petition.',
  image: '/images/projects/compass-visas.webp',
  // Cover: free Pexels clips (videos 9207809, 31155915, 32402606, 35451425, 8471105, 29024872, 36244262) with the Compass logo.
  thumbnailVideo: '/images/projects/compass-visas.mp4',
  technologies: ['React', 'TypeScript', 'Express', 'PostgreSQL', 'Supabase', 'Drizzle ORM', 'Stripe', 'Claude API', 'OpenAI', 'Vercel', 'PostHog'],
  category: 'Full-Stack · In Production',
  demoUrl: 'https://compassvisas.com',
  demoLabel: 'Website',
  githubUrl: '',
  featured: true,
  date: '2025-06-03',
  tags: ['Work', 'Immigration', 'AI'],
  status: 'Ongoing',
  longDescription:
    'I build this with one other engineer at Compass Visas, an immigration firm for founders and specialists. It replaces ' +
    'a mix of forms, email threads and spreadsheets with one app: clients do a guided intake and upload evidence, their ' +
    'employer answers company questions in a separate portal, and the team handles agreements, case review and filing from ' +
    'an admin dashboard. It is in daily use, with more than 100 clients and 200 cases so far. It runs on about 184,000 lines of TypeScript, 84 database tables and 80 screens across four portals.',
  keyFeatures:
    'A client portal with a guided intake for personal details, employment, criteria and evidence, plus progress tracking. ' +
    'An employer portal that only shows a company what it needs to see of a client\'s case. Sales agreements that are ' +
    'created, signed and paid for in the app, with Stripe and automatic reminders. An attorney queue with case assignment, ' +
    'comment threads and AI petition review. Automatically filled USCIS forms, including the I-129 and its supplements. ' +
    'And AI that drafts responses to Requests for Evidence from the facts in the case file.',
  architecture:
    '1. Frontend. React and TypeScript with TanStack Query, React Hook Form and Zod, and shadcn/ui components.\n\n' +
    '2. Backend. An Express API in TypeScript, deployed as a serverless function on Vercel, with Vercel Cron for reminders ' +
    'and syncs.\n\n' +
    '3. Data. PostgreSQL on Supabase through Drizzle ORM, Supabase Auth, and private storage buckets served through ' +
    'signed URLs. Migrations deploy through GitHub Actions.\n\n' +
    '4. Integrations. Stripe for payments, Resend for email, Google Drive for case folders, the firm\'s CRM for sales, ' +
    'PostHog for analytics, and Claude and OpenAI for resume parsing, petition review and RFE drafting.',
  challenges:
    'Keeping sensitive data in the right hands. A case is seen by the client, their employer, sales staff and attorneys, ' +
    'and each should see something different. I built a firewall for the employer portal so a company only sees the parts ' +
    'of a case meant for it.\n\n' +
    'Giving one person several cases. A returning client, say an O-1 renewal or a move from O-1 to EB-1, needs a new case ' +
    'without touching the one already filed. Rather than rework every table, each extra case is its own user record that ' +
    'points back at the person\'s main record, so every existing ownership check works per case unchanged. Clients switch ' +
    'cases from the sidebar, and at signing the old case\'s answers are copied into the new one.\n\n' +
    'Syncing to Google Drive without fighting staff. Every upload is filed into the client\'s Drive folder by role or ' +
    'contribution, but the sync kept renaming folders back on each upload, overwriting names staff had chosen. Now it ' +
    'remembers the name it gave each folder and only renames a folder that still has that name.\n\n' +
    'Spotting duplicate evidence. Clients often upload the same file twice, or a new version under the same name. Admin ' +
    'lists now flag byte-identical files using the storage hash, and same-named files with different contents, with a ' +
    'tooltip showing where each copy lives. Nothing is deleted automatically.',
  learnings:
    'I learned to own features end to end in a real product with real users: talking to staff, shipping small changes ' +
    'quickly, and fixing what they report. I also learned how to design permissions for many kinds of users, run ' +
    'database migrations safely in production, and put AI into a workflow where mistakes are costly.',
  futureImprovements:
    'More of the petition drafted automatically from the evidence, and a clearer view for clients of what is left to do on their case.',
};
