import React from 'react';
import { Card } from '@/components/ui/card';
import { Mail, Phone, MapPin, Github, Linkedin, Download } from 'lucide-react';
import { XLogo } from '@/components/ui/x-logo';
import { contactInfo as rawContactInfo, socialLinks as rawSocialLinks } from '@/data/portfolio';

const iconMap: Record<string, React.ReactNode> = {
  Mail: <Mail className="w-5 h-5" />,
  Phone: <Phone className="w-5 h-5" />,
  MapPin: <MapPin className="w-5 h-5" />,
  Github: <Github className="w-5 h-5" />,
  Linkedin: <Linkedin className="w-5 h-5" />,
  Twitter: <XLogo className="w-5 h-5" />,
};

const Contact: React.FC = () => {
  const contactInfo = rawContactInfo.map((c) => ({ ...c, icon: iconMap[c.icon] }));
  const primaryEmail = contactInfo.find((c) => c.label === 'Email');
  const secondaryContacts = contactInfo.filter(
    (c) => c.label !== 'Email' && c.label !== 'Phone'
  );
  const socialLinks = rawSocialLinks.map((s) => ({ ...s, icon: iconMap[s.icon] }));
  
  return (
    <section id="contact" className="py-12 md:py-16 bg-background">
      <div className="container mx-auto px-6 md:px-6 max-w-4xl">
        <Card className="p-6 md:p-8 bg-background border-border/40">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="text-center md:text-left space-y-2">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-foreground/60">
                LET'S CONNECT
              </p>
              <p className="text-sm md:text-base text-foreground/70">
                Let's do something awesome together!
              </p>
            </div>
            <div className="flex flex-col items-center gap-4 md:items-end">
              {primaryEmail && (
                <a
                  href={primaryEmail.href}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:border-primary/70 hover:text-primary transition-colors"
                >
                  <span className="text-primary">{primaryEmail.icon}</span>
                  <span>{primaryEmail.value}</span>
                </a>
              )}
              <div className="flex flex-wrap justify-center gap-3 md:justify-end">
                {secondaryContacts.map((info, index) => {
                  const content = (
                    <>
                      <span className="text-primary">{info.icon}</span>
                      <span>{info.value}</span>
                    </>
                  );

                  const className =
                    'inline-flex items-center gap-2 rounded-full bg-background/60 px-3 py-1 text-xs md:text-sm border border-border hover:border-primary/50 hover:text-primary transition-colors';

                  // Location should be non-interactive (no external link)
                  if (info.label === 'Location') {
                    return (
                      <div key={index} className={className}>
                        {content}
                      </div>
                    );
                  }

                  return (
                    <a key={index} href={info.href} className={className}>
                      {content}
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-center md:justify-start gap-3">
            {socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-2 rounded-full bg-background/60 border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-card ${social.color}`}
                aria-label={social.label}
              >
                {social.icon}
              </a>
            ))}
            <a
              href="/resume.pdf"
              download="Antonia_Mugisa_Resume.pdf"
              className="p-2 rounded-full bg-background/60 border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-card"
              aria-label="Download Resume"
            >
              <Download className="w-5 h-5" />
            </a>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default Contact;
