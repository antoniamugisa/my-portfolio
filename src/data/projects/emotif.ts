import { ReactNode } from 'react';
import emotifImage from '@/assets/emotif.png';
// Temporarily use the same image until we can properly upload the team image
import emotifTeamImage from '@/assets/emotif-team.jpeg';

export const emotifProject = {
  id: "emotif",
  title: "Emotif",
  description: "An AI-powered calendar extension with Gemini AI and Firebase allowing users to log moods and receive personalized check-ins and playlist recommendations using LLM-based responses.",
  image: emotifImage,
  thumbnailVideo: "/images/projects/emotif.mp4",
  thumbnailBackground: "/images/projects/emotif-bg.png",
  technologies: ["React", "TypeScript", "Vite", "Tailwind CSS", "shadcn/ui", "React Router"],
  category: "Frontend",
  demoUrl: "https://devpost.com/software/wits-you-can-change-this-at-any-time",
  githubUrl: "https://github.com/antoniamugisa/emotif",
  featured: true,
  date: "2025-01-17",
  tags: ["GenAI", "Mood Tracking", "Firebase"],
  status: "Completed" as const,

  // Additional project details that can be expanded
  longDescription: `
    Emotif is an innovative AI-powered calendar extension that revolutionizes how users track and understand their emotional well-being. Built with cutting-edge technology including Gemini AI and Firebase, the application provides personalized mood tracking, intelligent check-ins, and curated playlist recommendations based on user's emotional state and patterns.
    
    The project demonstrates advanced integration of Large Language Models (LLMs) to provide contextual and empathetic responses, making mental health tracking more engaging and insightful. Users can seamlessly log their daily moods, receive AI-generated insights about their emotional patterns, and get personalized recommendations for music and activities that match their current state.
  `,
  
  keyFeatures:
    'Emotif combines Gemini AI mood analysis with personalized check-ins and playlist recommendations based on how you feel. Moods sync in real time through Firebase, and the interface is a modern React and TypeScript app styled with Tailwind CSS so it stays clear and usable across devices.',

  challenges:
    'The hardest parts were weaving multiple AI services into one smooth flow, designing a mood tracker that felt natural rather than clinical, shaping LLM responses so they stayed emotionally aware, and keeping Firebase data in sync without lag or conflicting updates.',

  learnings:
    'Building Emotif pushed me deeper into AI and LLM integration, UX for mental health tools, real-time data with Firebase, and responsive layout patterns that hold up on both desktop and mobile.',

  futureImprovements:
    'Next I would add stronger mood prediction, support more music streaming services, optional social mood sharing, and a richer analytics dashboard so users can see longer-term emotional patterns.',
  
  teamImage: emotifTeamImage,
  teamCaption: "When we won 3rd place!"
};
