import { ReactNode } from 'react';
import { Code2, Gamepad2, Heart, Bike } from 'lucide-react';
import emotifImage from '@/assets/emotif.png';

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
    description: "Machine learning-powered recommendation system that suggests anime based on user preferences and viewing history. Built with Python and React.",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600",
    technologies: ["Python", "React", "TensorFlow", "MongoDB", "Docker"],
    category: "Machine Learning",
    demoUrl: "#",
    githubUrl: "https://github.com/antoniamugisa/anidojo",
    featured: true,
    date: "2024-11-15",
    tags: ["Machine Learning", "Recommendation System", "Anime", "Python"]
  },
  {
    id: "vibetype",
    title: "vibetype",
    description: "an AI writing sidekick that lives in your browser. highlight text to rewrite, expand, or clean it up instantly. open the sidebar to pull context from your tabs and draft smarter, faster.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600",
    technologies: ["HTML", "CSS", "JavaScript", "Browser Extension"],
    category: "Frontend",
    demoUrl: "#",
    githubUrl: "#",
    featured: false,
    date: "2024-10-20",
    tags: ["AI Writing", "Browser Extension", "Productivity", "Inbound VC Interest", "Offered Spot in Spur Accelerator"]
  },
  {
    id: "shoppy-wrapped",
    title: "shoppy wrapped",
    description: "spotify wrapped, but for your shopping. built with Shopify's Shop Mini framework. shows your top shops, spend, orders, and shopping style in a smooth stories-style recap.",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600",
    technologies: ["TypeScript", "Tailwind", "Shopify"],
    category: "Full-Stack",
    demoUrl: "#",
    githubUrl: "#",
    featured: false,
    date: "2024-09-10",
    tags: ["Shopify", "E-commerce", "Data Visualization", "Won Shopify Toronto Tech Week Hackathon"]
  },
  {
    id: "tensorforest",
    title: "tensorforest",
    description: "drones that predict and prevent forest fires. used remote sensing, AI, and physical sensors to detect risk zones and alert early.",
    image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600",
    technologies: ["Python", "PyTorch", "TensorFlow", "Hardware"],
    category: "Machine Learning",
    demoUrl: "#",
    githubUrl: "#",
    featured: false,
    date: "2024-08-05",
    tags: ["AI", "Drones", "Environmental Tech", "Machine Learning"]
  },
  {
    id: "apocalypse-hacks",
    title: "apocalypse hacks",
    description: "founded canada's largest high school hackathon with 150 attendees and 40+ projects shipped. raised $50k from sponsors like shopify and doordash.",
    image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600",
    technologies: ["Event Organizing", "Fundraising", "Project Management"],
    category: "Full-Stack",
    demoUrl: "#",
    githubUrl: "#",
    featured: false,
    date: "2024-07-15",
    tags: ["Event Organizing", "Fundraising", "Project Management", "Raised $50k", "150 Attendees"]
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



