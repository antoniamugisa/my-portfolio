import anidojoImage from '@/assets/anidojo-logo.png';
import type { Project } from './index';

export const anidojoProject: Project = {
  id: "anidojo",
  title: "Anidojo",
  demoVideo: "/videos/anidojo-demo.mp4",
  thumbnailBackground: "/images/projects/anidojo-bg.png",
  description: "Machine learning-powered recommendation system that suggests anime based on user preferences and viewing history. Built with Python and React.",
  image: anidojoImage,
  technologies: ["Python", "React", "TensorFlow", "MongoDB", "Docker"],
  category: "Machine Learning",
  demoUrl: "#",
  githubUrl: "https://github.com/antoniamugisa/anidojo",
  featured: true,
  date: "2025-11-27",
  tags: ["Machine Learning", "Recommendation System", "Anime", "Python"],
  status: "Completed",
  
  longDescription: `
    Anidojo is a sophisticated machine learning-powered recommendation system designed specifically for anime enthusiasts. The application leverages advanced ML algorithms to analyze user preferences, viewing history, and anime characteristics to provide highly personalized recommendations.
    
    Built with a robust Python backend using TensorFlow for the ML models and a modern React frontend, Anidojo demonstrates the power of collaborative filtering and content-based recommendation systems. The application processes large datasets of anime metadata, user ratings, and viewing patterns to generate accurate and diverse recommendations.
  `,
  
  keyFeatures:
    'Anidojo uses machine learning to learn preferences from viewing history and return tailored anime suggestions, drawing on a broad anime database that updates as tastes change. The stack pairs a TensorFlow-backed Python service with a React frontend, MongoDB for storage, and Docker so the system can scale cleanly.',

  challenges:
    'The main challenges were processing large datasets without slowing the app down, building recommendation models that stayed accurate and diverse, presenting complex results in a simple interface, and keeping inference fast enough for real-time suggestions.',

  learnings:
    'This project taught me how to train and ship ML models, apply collaborative filtering and content-based recommendation techniques, work with large-scale data pipelines, and package services with Docker for reliable deployment.',

  futureImprovements:
    'I would explore deeper neural models for better accuracy, add social sharing around recommendations, connect to streaming platforms, and expand search and filtering so users can explore the catalog with more control.',
};
