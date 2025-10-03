import { ReactNode } from 'react';
import socialUpImage from '@/assets/social-up-logo.jpg';

export const socialUpProject = {
  id: "socialUp",
  title: "SocialUp",
  description: "A mobile-first analytics application using React and TypeScript to track followers, analyze engagement metrics, and schedule posts based on traffic data for optimal reach.",
  image: socialUpImage,
  technologies: ["React", "TypeScript"],
  category: "Frontend",
  // demoUrl: "#", // Commented out for now
  githubUrl: "https://github.com/antoniamugisa/social-up",
  featured: false,
  date: "2024-10-20",
  tags: ["React", "TypeScript", "Analytics", "Social Media", "Mobile"],
  
  // Additional project details that can be expanded
  longDescription: `
    SocialUp is a comprehensive mobile-first analytics platform designed to help content creators and social media managers 
    optimize their social media presence. The application provides detailed insights into follower growth, engagement metrics, 
    and optimal posting times to maximize reach and engagement.
    
    Built with modern React and TypeScript, SocialUp offers a clean, intuitive interface for analyzing social media performance. 
    The platform processes large amounts of social media data to provide actionable insights and recommendations for content strategy.
  `,
  
  keyFeatures: [
    "Real-time follower tracking and analytics",
    "Engagement metrics visualization",
    "Optimal posting time recommendations",
    "Mobile-first responsive design",
    "Data-driven content strategy insights",
    "Performance trend analysis"
  ],
  
  challenges: [
    "Processing large volumes of social media data",
    "Creating intuitive data visualizations",
    "Implementing real-time data updates",
    "Designing mobile-optimized analytics interface"
  ],
  
  learnings: [
    "Data visualization techniques",
    "Social media API integration",
    "Mobile-first design principles",
    "Performance optimization for data-heavy applications"
  ],
  
  futureImprovements: [
    "Add support for more social media platforms",
    "Implement AI-powered content suggestions",
    "Add team collaboration features",
    "Integrate advanced scheduling capabilities"
  ]
};
