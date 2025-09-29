import { ReactNode } from 'react';
import { Code2, Gamepad2, Heart, Bike } from 'lucide-react';
import emotifImage from '@/assets/emotif.png';
import socialUpImage from '@/assets/social-up-logo.jpg';
import dalGazetteImage from '@/assets/dal-gazette.jpg';
import anidojoImage from '@/assets/anidojo-logo.png';

export const skills: string[] = [
  'React', 'JavaScript', 'Node.js', 'Python', 'Kubernetes', 'Terraform',
  'Java', 'MongoDB', 'Azure', 'Docker', 'Git', 'SQL', 'GraphQL', 'REST APIs', 'CI/CD', 'OpenAI'
];

export const certifications = [
  { name: 'Azure Fundamentals: AZ-900', issuer: 'Microsoft', year: ' Issued 2023' },
  { name: 'Azure Data Fundamentals: DP-900', issuer: 'Microsoft', year: 'Issued 2023' },
  { name: 'Azure Artificial Intelligence Fundamentals: AI-900', issuer: 'Microsoft', year: 'Issued 2024' },
  { name: 'Azure AI Engineer Associate', issuer: 'Microsoft', year: 'Issued 2024' }
];

export const experiences = [
  {
    company: "Avanade",
    position: "Software Engineer Intern",
    duration: "May 2024 - Aug 2024",
    location: "Halifax, NS",
    description: "Designed and deployed high-accuracy AI solutions by integrating Azure Cognitive Search, OpenAI LLMs, and Azure Form Recognizer into a Retrieval-Augmented Generation pipeline, reducing search time to under 10 seconds and achieving up to 95% QA accuracy.",
    achievements: [
      "Achieved 95% QA accuracy by optimizing a RAG pipeline with OpenAI LLMs and Azure Cognitive Search.",
      "Cut search time to under 10 seconds using an AI-powered lease document reader.",
      "Automated deployments with Terraform, Docker, and CI/CD on Azure Kubernetes Service."
    ],
    technologies: ["Azure Cognitive Search", "OpenAI Large Language Models", "Azure Form Recognizer", "Azure Functions", "Terraform", "Docker"]
  },
  {
    company: "Avanade",
    position: "Software Engineer Intern",
    duration: "May 2023 - Aug 2023",
    location: "Halifax, NS",
    description: "Supported the migration of legacy services to Azure, optimized infrastructure for performance, and automated deployments to enhance scalability and security.",
    achievements: [
      "Successfully migrated large-scale legal document processing workloads from on-premises to Azure, improving performance and resilience.",
      "Automated CI/CD pipelines with PowerShell, Kubernetes, Docker, and Terraform, significantly reducing deployment times.",
      "Implemented IAM policies and conducted risk assessments to ensure compliance with security standards."
    ],
    technologies: ["Azure", "Kubernetes", "Docker", "Terraform", "Powershell", "App Services"]
  }
];

export const education = [
  {
    institution: "Dalhousie University",
    degree: "Bachelor of Science in Computer Science",
    duration: "2020 - 2025",
    description: "Graduating with a focus on cloud development, machine learning and software development.",
    highlights: ["Women in Technology Society Member" ,"Computer Science Society Member", "HerCampus Social Media Director" ]
  }
];

export const projects = [
  {
    id: "emotif",
    title: "emotif",
    description: "an AI-powered calendar extension with Gemini AI and Firebase allowing users to log moods and receive personalized check-ins and playlist recommendations using LLM-based responses.",
    image: emotifImage,
    technologies: ["React", "TypeScript", "Vite", "Tailwind CSS", "shadcn/ui", "React Router"],
    category: "Frontend",
    demoUrl: "https://devpost.com/software/wits-you-can-change-this-at-any-time",
    githubUrl: "https://github.com/antoniamugisa/emotif",
    featured: true,
    date: "2024-12-01",
    tags: ["AI", "Calendar", "Mood Tracking", "Firebase"]
  },
  {
    id: "anidojo",
    title: "anidojo",
    description: "machine learning-powered recommendation system that suggests anime based on user preferences and viewing history. Built with Python and React.",
    image: anidojoImage,
    technologies: ["Python", "React", "TensorFlow", "MongoDB", "Docker"],
    category: "Machine Learning",
    demoUrl: "#",
    githubUrl: "https://github.com/antoniamugisa/anidojo",
    featured: true,
    date: "2024-11-15",
    tags: ["Machine Learning", "Recommendation System", "Anime", "Python"]
  },
  {
    id: "socialUp",
    title: "socialUp",
    description: "a mobile-first analytics application using React and TypeScript to track followers, analyze engagement metrics, and schedule posts based on traffic data for optimal reach.",
    image: socialUpImage,
    technologies: ["React", "TypeScript"],
    category: "Frontend",
    demoUrl: "#",
    githubUrl: "https://github.com/antoniamugisa/social-up",
    featured: false,
    date: "2024-10-20",
    tags: ["React", "TypeScript", "Analytics", "Social Media", "Mobile"]
  },
    {
      id: "dal gazette app",
      title: "dal gazette app",
      description: "a mobile application for Dalhousie University's campus newspaper using React Native and TypeScript, delivering real-time news articles, event updates, and campus announcements to 5,000+ students.",
      image: dalGazetteImage,
      technologies: ["TypeScript", "Tailwind", "React Native"],
      category: "Mobile",
      demoUrl: "#",
      githubUrl: "#",
      featured: false,
      date: "2024-09-10",
      tags: ["React Native", "TypeScript", "News", "Events", "Campus Announcements"]
    }
];

export const categories = ['All', 'Full-Stack', 'Frontend', 'Backend', 'Machine Learning'];

export const contactInfo = [
  {
    icon: 'Mail',
    label: 'email',
    value: 'antoniamugisa@gmail.com',
    href: 'mailto:antoniamugisa@gmail.com'
  },
  {
    icon: 'Phone',
    label: 'phone',
    value: '+1 (902) 237-0744',
    href: 'tel:+19022370744'
  },
  {
    icon: 'MapPin',
    label: 'location',
    value: 'Toronto, Canada',
    href: '#'
  }
];

export const socialLinks = [
  {
    icon: 'Github',
    label: 'GitHub',
    href: 'https://github.com/antoniamugisa',
    color: 'hover:text-foreground'
  },
  {
    icon: 'Linkedin',
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/antoniamugisa/',
    color: 'hover:text-blue-400'
  },
  {
    icon: 'Twitter',
    label: 'X',
    href: 'https://x.com/antmugisa',
    color: 'hover:text-blue-400'
  }
];



