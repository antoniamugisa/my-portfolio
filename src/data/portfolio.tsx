
export const experiences = [
  {
    company: "Compass Visas",
    position: "Software Engineer",
    duration: "Oct 2025 - Present",
    location: "Toronto, ON",
    description: "Engineered document processing solutions using RAG and vector embeddings, optimized client workflows, and resolved critical system issues to improve operational efficiency.",
    technologies: ["RAG", "Vector Embeddings"]
  },
  {
    company: "Avanade",
    position: "Software Engineer Intern",
    duration: "May 2024 - Aug 2024",
    location: "Halifax, NS",
    description: "Designed and deployed high-accuracy AI solutions by integrating Azure Cognitive Search, OpenAI LLMs, and Azure Form Recognizer into a Retrieval-Augmented Generation pipeline, reducing search time to under 10 seconds and achieving up to 95% QA accuracy.",
    technologies: ["LLMs", "Terraform", "Docker"]
  },
  {
    company: "Avanade",
    position: "Software Engineer Intern",
    duration: "May 2023 - Aug 2023",
    location: "Halifax, NS",
    description: "Supported the migration of legacy services to Azure, optimized infrastructure for performance, and automated deployments to enhance scalability and security for Microsoft.",
    technologies: ["Azure", "Kubernetes"]
  }
];


// Import projects from the new organized structure
import { projects } from './projects';

// Re-export projects for backward compatibility
export { projects };
