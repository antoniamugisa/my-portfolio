import { ReactNode } from 'react';
import anidojoImage from '@/assets/anidojo-logo.png';

export const anidojoProject = {
  id: "anidojo",
  title: "Anidojo",
  description: "Machine learning-powered recommendation system that suggests anime based on user preferences and viewing history. Built with Python and React.",
  image: anidojoImage,
  technologies: ["Python", "React", "TensorFlow", "MongoDB", "Docker"],
  category: "Machine Learning",
  demoUrl: "#",
  githubUrl: "https://github.com/antoniamugisa/anidojo",
  featured: true,
  date: "2024-11-15",
  tags: ["Machine Learning", "Recommendation System", "Anime", "Python"],
  status: "Ongoing" as const,
  
  // Additional project details that can be expanded
  longDescription: `
    Anidojo is a sophisticated machine learning-powered recommendation system designed specifically for anime enthusiasts. The application leverages advanced ML algorithms to analyze user preferences, viewing history, and anime characteristics to provide highly personalized recommendations.
    
    Built with a robust Python backend using TensorFlow for the ML models and a modern React frontend, Anidojo demonstrates the power of collaborative filtering and content-based recommendation systems. The application processes large datasets of anime metadata, user ratings, and viewing patterns to generate accurate and diverse recommendations.
  `,
  
  keyFeatures: [
    "Advanced ML recommendation algorithms",
    "User preference learning and adaptation",
    "Comprehensive anime database integration",
    "Real-time recommendation updates",
    "Docker containerization for scalability",
    "MongoDB for efficient data storage"
  ],
  
  challenges: [
    "Processing large datasets efficiently",
    "Implementing accurate recommendation algorithms",
    "Creating intuitive user interface for complex data",
    "Optimizing model performance for real-time recommendations"
  ],
  
  learnings: [
    "Machine learning model development and training",
    "Recommendation system algorithms (collaborative filtering, content-based)",
    "Large-scale data processing techniques",
    "Docker containerization and deployment"
  ],
  
  futureImprovements: [
    "Implement deep learning models for better accuracy",
    "Add social features for sharing recommendations",
    "Integrate with streaming platforms",
    "Add advanced filtering and search capabilities"
  ]
};
