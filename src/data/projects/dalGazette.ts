import dalGazetteImage from '@/assets/dal-gazette-logo.webp';
import type { Project } from './index';

export const dalGazetteProject: Project = {
  id: "dal gazette app",
  title: "Dal Gazette App",
  demoVideo: "/videos/dal-gazette-demo.mp4",
  heroVideo: "/images/projects/dal-gazette.mp4",
  thumbnailFit: "contain",
  description: "A mobile app for the Dal Gazette, Dalhousie's student newspaper, built with React Native and a small scraper that turns the site's feed into readable articles.",
  image: dalGazetteImage,
  technologies: ["React Native", "Expo", "TypeScript", "Express"],
  category: "Mobile",
  demoUrl: "#",
  githubUrl: "#",
  featured: false,
  date: "2024-09-10",
  tags: ["React Native", "TypeScript", "News", "Events", "Campus Announcements"],
  status: "Ongoing",
  
  longDescription: `
    The Dal Gazette App is a comprehensive mobile application developed for Dalhousie University's official campus newspaper. The app serves over 5,000 students with real-time news articles, campus events, and important announcements, creating a centralized hub for university information and student engagement.
    
    Built with React Native and TypeScript, the application provides a native mobile experience across iOS and Android platforms. The app features real-time content updates, push notifications for breaking news, and an intuitive interface designed specifically for the university community.
  `,
  
  keyFeatures:
    'The Dal Gazette App delivers campus news in real time, alongside an event calendar and push notifications for important announcements. Built with React Native and TypeScript, it runs on both iOS and Android with a student-friendly interface and offline reading when connectivity drops.',

  challenges:
    'Supporting thousands of students meant solving reliable real-time updates, keeping behavior consistent across platforms, building an efficient push notification pipeline, and designing an interface that works for a wide range of students.',

  learnings:
    'I learned React Native development and release workflows, real-time content management on mobile, performance tuning for campus-scale usage, and how to design UX that fits an educational community.',

  futureImprovements:
    'Future work includes authentication and personalization, light social features for student discussion, richer multimedia in articles, and tighter integration with university systems so content stays in sync automatically.',
};
