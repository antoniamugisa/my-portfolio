import { ReactNode } from 'react';
import { Code2, Gamepad2, Heart, Bike } from 'lucide-react';

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
    title: "emotif",
    description: "an AI-powered calendar extension with Gemini AI and Firebase allowing users to log moods and receive personalized check-ins and playlist recommendations using LLM-based responses and mood prediction prompts.",
    image: "src/assets/emotif.png",
    technologies: ["React", "TypeScript", "Vite", "Tailwind CSS", "shadcn/ui", "React Router"],
    category: "Frontend",
    demoUrl: "https://devpost.com/software/wits-you-can-change-this-at-any-time",
    githubUrl: "https://github.com/antoniamugisa/emotif",
    featured: true
  },
  {
    title: "anidojo",
    description: "Machine learning-powered recommendation system that suggests anime based on user preferences and viewing history. Built with Python and React.",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600",
    technologies: ["Python", "React", "TensorFlow", "MongoDB", "Docker"],
    category: "Machine Learning",
    demoUrl: "#",
    githubUrl: "https://github.com/antoniamugisa/anidojo",
    featured: true
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



