import React from 'react';
import { Github, Linkedin, Download, Send } from 'lucide-react';
import { XLogo } from '@/components/ui/x-logo';

const Hero: React.FC = () => {
  return (
    <section id="home" className="relative min-h-screen bg-background pt-32 pb-24 md:pt-32">
      <div className="mx-auto w-full max-w-3xl px-4 md:px-6">
        <div className="space-y-10">
          <div className="space-y-2">
            <h1 className="text-[15px] md:text-base font-normal text-foreground leading-relaxed">
              Hi, I&apos;m Antonia.
            </h1>
            <p className="text-base md:text-lg text-foreground/50">Software Engineer</p>
          </div>

          <div className="space-y-6 text-[15px] md:text-base text-foreground/70 leading-relaxed">
            <p>
              I love shipping thoughtful, well-crafted tools; from AI-powered systems to interfaces
              that feel as good as they look.
            </p>

            <p>
              Currently, I&apos;m building document intelligence and immigration automation at{' '}
              <strong className="font-semibold text-foreground">Compass Visas</strong>. I&apos;m also
              experimenting with{' '}
              <strong className="font-semibold text-foreground">ML</strong>,{' '}
              <strong className="font-semibold text-foreground">NLP</strong>,{' '}
              <strong className="font-semibold text-foreground">RAG</strong>, and{' '}
              <strong className="font-semibold text-foreground">vector search</strong>, and staying
              involved in Toronto&apos;s growing tech community.
            </p>

            <p>
              Before that, I shipped an end-to-end immigration case management platform that
              streamlined O-1/EB-1 evidence collection for{' '}
              <strong className="font-semibold text-foreground">Compass Visas</strong>. At{' '}
              <strong className="font-semibold text-foreground">Avanade</strong>, I built AI-powered
              tools that cut search and sorting time for legal teams by hours each week. Earlier at{' '}
              <strong className="font-semibold text-foreground">Microsoft</strong>, I helped migrate
              large workloads to Azure and automate infra with Terraform, Docker, and Kubernetes.
            </p>

            <p>
              Currently, I'm enjoying quality time with my family and friends in
              South Africa.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <a
              href="mailto:antoniamugisa@gmail.com"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border transition-colors hover:bg-secondary"
              title="Get in touch"
            >
              <Send className="h-4 w-4 text-foreground" />
            </a>
            <a
              href="https://github.com/antoniamugisa"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border transition-colors hover:bg-secondary"
            >
              <Github className="h-4 w-4 text-foreground" />
            </a>
            <a
              href="https://www.linkedin.com/in/antoniamugisa/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border transition-colors hover:bg-secondary"
            >
              <Linkedin className="h-4 w-4 text-foreground" />
            </a>
            <a
              href="https://x.com/antmugisa"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border transition-colors hover:bg-secondary"
            >
              <XLogo className="h-4 w-4 text-foreground" />
            </a>
            <a
              href="/resume.pdf"
              download="Antonia_Mugisa_Resume.pdf"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border transition-colors hover:bg-secondary"
              title="Download Resume"
            >
              <Download className="h-4 w-4 text-foreground" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
