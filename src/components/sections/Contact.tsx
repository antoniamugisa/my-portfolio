import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, Phone, MapPin, Send, Clock, Github, Linkedin, Twitter } from 'lucide-react';
import { contactInfo as rawContactInfo, socialLinks as rawSocialLinks } from '@/data/portfolio';

type ContactProps = {
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void> | void;
};

const iconMap: Record<string, React.ReactNode> = {
  Mail: <Mail className="w-5 h-5" />,
  Phone: <Phone className="w-5 h-5" />,
  MapPin: <MapPin className="w-5 h-5" />,
  Github: <Github className="w-5 h-5" />,
  Linkedin: <Linkedin className="w-5 h-5" />,
  Twitter: <Twitter className="w-5 h-5" />,
};

const Contact: React.FC<ContactProps> = ({ isSubmitting, onSubmit }) => {
  const contactInfo = rawContactInfo.map((c) => ({ ...c, icon: iconMap[c.icon] }));
  const socialLinks = rawSocialLinks.map((s) => ({ ...s, icon: iconMap[s.icon] }));
  
  return (
    <section id="contact" className="py-24 bg-gradient-secondary">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">let's connect</h2>
          <p className="text-xl text-foreground/70 max-w-2xl mx-auto leading-relaxed">ready to bring your ideas to life? let's discuss how we can work together to create something amazing.</p>
        </div>
        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <Card className="p-8 bg-card border-border">
              <h3 className="text-2xl font-bold mb-6">send me a message</h3>
              <form onSubmit={onSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">name</Label>
                    <Input id="name" type="text" placeholder="Your name" required className="mt-2" />
                  </div>
                  <div>
                    <Label htmlFor="email">email</Label>
                    <Input id="email" type="email" placeholder="your.email@example.com" required className="mt-2" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" type="text" placeholder="What's this about?" required className="mt-2" />
                </div>
                <div>
                  <Label htmlFor="message">message</Label>
                  <Textarea id="message" placeholder="Tell me about your project..." required rows={6} className="mt-2" />
                </div>
                <Button type="submit" size="lg" className="w-full bg-gradient-primary hover:shadow-glow" disabled={isSubmitting}>
                  {isSubmitting ? (<><Clock className="w-4 h-4 mr-2 animate-spin" />sending...</>) : (<><Send className="w-4 h-4 mr-2" />Send Message</>)}
                </Button>
              </form>
            </Card>
          </div>
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">get in touch!</h3>
              <p className="text-foreground/80 leading-relaxed mb-8">i'm always excited to hear about new opportunities and interesting projects. Whether you're looking for a developer, have a question, or just want to say hello, don't hesitate to reach out!</p>
            </div>
            <div className="space-y-6">
              {contactInfo.map((info, index) => (
                <Card key={index} className="p-4 bg-card border-border hover:border-primary/50 transition-colors">
                  <a href={info.href} className="flex items-center space-x-4 text-foreground hover:text-primary transition-colors">
                    <div className="text-primary">{info.icon}</div>
                    <div>
                      <p className="font-medium">{info.label}</p>
                      <p className="text-sm text-foreground/70">{info.value}</p>
                    </div>
                  </a>
                </Card>
              ))}
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">follow me</h4>
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => (
                  <a key={index} href={social.href} target="_blank" rel="noopener noreferrer" className={`p-3 rounded-full bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-card ${social.color}`} aria-label={social.label}>
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;


