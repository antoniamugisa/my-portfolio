import { ReactNode } from 'react';
import { Code2, Gamepad2, Heart, Bike } from 'lucide-react';

export const skills: string[] = [
  'React', 'JavaScript', 'Node.js', 'Python', 'Kubernetes', 'Terraform',
  'Java', 'MongoDB', 'Azure', 'Docker', 'Git', 'SQL', 'GraphQL', 'REST APIs', 'CI/CD', 'OpenAI'
];

export const certifications = [
  { name: 'Azure Fundamentals: AZ-900', issuer: 'Microsoft', year: '2023' },
  { name: 'Azure Data Fundamentals: DP-900', issuer: 'Microsoft', year: '2023' },
  { name: 'Azure Artificial Intelligence Fundamentals: AI-900', issuer: 'Microsoft', year: '2024' },
  { name: 'Azure AI Engineer Associate', issuer: 'Microsoft', year: '2024' }
];

export const interests: { icon: ReactNode; title: string; desc: string }[] = [
  { icon: <Code2 className="w-5 h-5" />, title: 'Coding', desc: 'Passionate about clean, efficient code' },
  { icon: <Gamepad2 className="w-5 h-5" />, title: 'Anime & Gaming', desc: 'Enjoying watching my favourite shows' },
  { icon: <Bike className="w-5 h-5" />, title: 'Biking', desc: 'Enjoying nature by moving my body' },
  { icon: <Heart className="w-5 h-5" />, title: 'Open Source', desc: 'Contributing to the developer community' }
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
    title: "Portfolio Website",
    description: "A modern, responsive portfolio website showcasing my development journey with an anime-inspired design. Features include dynamic project showcases, blog integration, and a sleek UI built with React and TypeScript.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600",
    technologies: ["React", "TypeScript", "Vite", "Tailwind CSS", "shadcn/ui", "React Router"],
    category: "Frontend",
    demoUrl: "#",
    githubUrl: "https://github.com/antoniamugisa/anime-dev-space",
    featured: true
  },
  {
    title: "E-Commerce Platform",
    description: "A full-stack e-commerce solution with React frontend, Node.js backend, and Stripe integration. Features include user authentication, product management, shopping cart, and payment processing.",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600",
    technologies: ["React", "Node.js", "PostgreSQL", "Stripe", "AWS"],
    category: "Full-Stack",
    demoUrl: "#",
    githubUrl: "#",
    featured: true
  },
  {
    title: "Anime Recommendation Engine",
    description: "Machine learning-powered recommendation system that suggests anime based on user preferences and viewing history. Built with Python and React with a sleek anime-inspired interface.",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600",
    technologies: ["Python", "React", "TensorFlow", "MongoDB", "Docker"],
    category: "Machine Learning",
    demoUrl: "#",
    githubUrl: "#",
    featured: true
  },
  {
    title: "Task Management API",
    description: "RESTful API for task management with user authentication, role-based permissions, and comprehensive documentation. Includes automated testing and CI/CD pipeline.",
    image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=600",
    technologies: ["Node.js", "Express", "MongoDB", "JWT", "Jest"],
    category: "Backend",
    demoUrl: "#",
    githubUrl: "#",
    featured: false
  }
];

export const categories = ['All', 'Full-Stack', 'Frontend', 'Backend', 'Machine Learning'];

export const contactInfo = [
  {
    icon: 'Mail',
    label: 'Email',
    value: 'antoniamugisa@gmail.com',
    href: 'mailto:antoniamugisa@gmail.com'
  },
  {
    icon: 'Phone',
    label: 'Phone',
    value: '+1 (902) 237-0744',
    href: 'tel:+19022370744'
  },
  {
    icon: 'MapPin',
    label: 'Location',
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
    label: 'Twitter',
    href: 'https://twitter.com/antmugisa',
    color: 'hover:text-blue-400'
  }
];



