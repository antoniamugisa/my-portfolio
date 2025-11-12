import { ReactNode } from 'react';
import emotifImage from '@/assets/emotif.png';
// Temporarily use the same image until we can properly upload the team image
import emotifTeamImage from '@/assets/emotif-team.jpeg';

export const emotifProject = {
  id: "emotif",
  title: "Emotif",
  description: "An AI-powered calendar extension with Gemini AI and Firebase allowing users to log moods and receive personalized check-ins and playlist recommendations using LLM-based responses.",
  image: emotifImage,
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
  
  keyFeatures: [
    "AI-powered mood analysis using Gemini AI",
    "Personalized check-ins and recommendations",
    "Playlist generation based on emotional state",
    "Firebase integration for real-time data sync",
    "Modern React UI with TypeScript",
    "Responsive design with Tailwind CSS"
  ],
  
  challenges: [
    "Integrating multiple AI services seamlessly",
    "Creating intuitive mood tracking interface",
    "Optimizing LLM responses for emotional context",
    "Ensuring real-time data synchronization"
  ],
  
  learnings: [
    "Advanced AI/ML integration techniques.",
    "User experience design for mental health apps.",
    "Real-time data management with Firebase.",
    "Responsive design patterns."
  ],
  
  futureImprovements: [
    "Add more sophisticated mood prediction algorithms.",
    "Integrate with more music streaming services.",
    "Add social features for mood sharing.",
    "Implement advanced analytics dashboard."
  ],
  
  teamImage: emotifTeamImage,
  teamCaption: "When we won 3rd place!"
};
