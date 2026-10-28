import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Linkedin, Send } from 'lucide-react';
import { XLogo } from '@/components/ui/x-logo';

const Hero: React.FC = () => {
  return (
    <section id="home" className="relative min-h-screen bg-background pt-28 pb-24 md:pt-36">
      <div className="mx-auto w-full max-w-3xl px-6 md:px-6">
        <div className="space-y-6 text-[15px] md:text-base text-foreground/70 leading-relaxed">
          <div>
            <h1 className="font-normal text-foreground leading-relaxed">
              Hi, I&apos;m Antonia.
            </h1>
            <p className="font-normal text-foreground leading-relaxed">Software Engineer</p>
          </div>

            <p>
              I love shipping thoughtful, well-crafted tools, from AI systems to interfaces that feel
              as good as they look.
            </p>

            <p>
              Right now, I&apos;m building document intelligence and immigration automation at{' '}
              <strong className="font-semibold text-foreground">Compass Visas</strong> in Toronto.
            </p>

            <p>
              At <strong className="font-semibold text-foreground">Avanade</strong>, I built a{' '}
              <strong className="font-semibold text-foreground">RAG</strong> pipeline and an AI
              lease document reader that cut search time to under 10 seconds.
            </p>

            <p>
              On a <strong className="font-semibold text-foreground">Microsoft</strong> engagement, I
              scaled Azure infra for 5,000+ legal documents a day and automated deployments with
              Kubernetes, Docker, and Terraform.
            </p>

            <p>
              I love playful side{' '}
              <Link
                to="/projects"
                className="text-foreground underline underline-offset-2 decoration-foreground/40 hover:decoration-foreground"
              >
                projects
              </Link>
              : open-data maps, anime recommenders, and tools that feel more human.
            </p>

            <p>
              Outside of software, I&apos;m usually shooting{' '}
              <Link
                to="/photos"
                className="text-foreground underline underline-offset-2 decoration-foreground/40 hover:decoration-foreground"
              >
                film
              </Link>
              ,{' '}
              <Link
                to="/interests"
                className="text-foreground underline underline-offset-2 decoration-foreground/40 hover:decoration-foreground"
              >
                anime
              </Link>
              ,{' '}
              <Link
                to="/interests"
                className="text-foreground underline underline-offset-2 decoration-foreground/40 hover:decoration-foreground"
              >
                games
              </Link>
              , and spending time with family in South Africa.
            </p>
          </div>

          <div className="flex gap-3 pt-8">
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
          </div>
      </div>
    </section>
  );
};

export default Hero;
