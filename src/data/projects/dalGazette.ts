import { ReactNode } from 'react';
import dalGazetteImage from '@/assets/dal-gazette.jpg';

export const dalGazetteProject = {
  id: "dal gazette app",
  title: "Dal Gazette App",
  description: "A mobile application for Dalhousie University's campus newspaper using React Native and TypeScript, delivering real-time news articles, event updates, and campus announcements to 5,000+ students.",
  image: dalGazetteImage,
  technologies: ["TypeScript", "Tailwind", "React Native"],
  category: "Mobile",
  // demoUrl: "#", // Commented out for now
  githubUrl: "https://github.com/antoniamugisa/dal-gazette-app",
  featured: false,
  date: "2024-09-10",
  tags: ["React Native", "TypeScript", "News", "Events", "Campus Announcements"],
  
  // Additional project details that can be expanded
  longDescription: `
    The Dal Gazette App is a comprehensive mobile application developed for Dalhousie University's official campus newspaper. 
    The app serves over 5,000 students with real-time news articles, campus events, and important announcements, creating a 
    centralized hub for university information and student engagement.
    
    Built with React Native and TypeScript, the application provides a native mobile experience across iOS and Android platforms. 
    The app features real-time content updates, push notifications for breaking news, and an intuitive interface designed specifically 
    for the university community.
  `,
  
  keyFeatures: [
    "Real-time news article delivery",
    "Campus event calendar and updates",
    "Push notifications for important announcements",
    "Cross-platform mobile compatibility",
    "User-friendly interface for students",
    "Offline reading capabilities"
  ],
  
  challenges: [
    "Managing real-time content updates for large user base",
    "Ensuring cross-platform compatibility",
    "Implementing efficient push notification system",
    "Designing intuitive interface for diverse student population"
  ],
  
  learnings: [
    "React Native development and deployment",
    "Real-time data management",
    "Mobile app performance optimization",
    "User experience design for educational institutions"
  ],
  
  futureImprovements: [
    "Add user authentication and personalization",
    "Implement social features for student interaction",
    "Add multimedia content support",
    "Integrate with university systems for seamless data flow"
  ]
};
