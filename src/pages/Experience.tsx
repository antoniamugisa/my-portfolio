import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin } from 'lucide-react';

const Experience = () => {
  const experiences = [
    {
      company: "TechCorp Solutions",
      position: "Senior Full-Stack Developer",
      duration: "2022 - Present",
      location: "Remote",
      description: "Leading development of scalable web applications using React, Node.js, and cloud technologies. Mentoring junior developers and implementing best practices for code quality and performance.",
      achievements: [
        "Reduced application load time by 40% through optimization",
        "Led a team of 5 developers on a major product redesign",
        "Implemented CI/CD pipeline that improved deployment efficiency by 60%"
      ],
      technologies: ["React", "TypeScript", "Node.js", "AWS", "PostgreSQL", "Docker"]
    },
    {
      company: "Digital Innovations Inc",
      position: "Frontend Developer",
      duration: "2020 - 2022",
      location: "San Francisco, CA",
      description: "Developed responsive user interfaces and collaborated with UX/UI designers to create engaging user experiences. Focused on modern frontend technologies and accessibility standards.",
      achievements: [
        "Built 15+ responsive web applications from scratch",
        "Improved accessibility score by 35% across all projects",
        "Mentored 3 interns and junior developers"
      ],
      technologies: ["React", "JavaScript", "SCSS", "Webpack", "Jest", "Figma"]
    },
    {
      company: "StartupLab",
      position: "Junior Developer",
      duration: "2019 - 2020",
      location: "Austin, TX",
      description: "Started my professional journey building dynamic web applications and learning industry best practices. Contributed to multiple client projects while rapidly expanding technical skills.",
      achievements: [
        "Delivered 8 client projects on time and within budget",
        "Learned 5 new technologies in the first 6 months",
        "Received 'Rising Star' award for exceptional growth"
      ],
      technologies: ["HTML", "CSS", "JavaScript", "PHP", "MySQL", "WordPress"]
    }
  ];

  const education = [
    {
      institution: "University of Technology",
      degree: "Bachelor of Science in Computer Science",
      duration: "2015 - 2019",
      description: "Graduated Magna Cum Laude with focus on software engineering and algorithms.",
      highlights: ["GPA: 3.8/4.0", "Dean's List: 6 semesters", "Programming Club President"]
    }
  ];

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto px-6 py-16 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-[1.2] pb-2 experience-title">
            Experience
          </h1>
          <p className="text-xl text-foreground/70 max-w-2xl mx-auto leading-relaxed">
            My professional journey through the world of software development
          </p>
        </div>

        {/* Experience Timeline */}
        <div className="space-y-8 mb-16">
          <h2 className="text-3xl font-bold font-heading text-center mb-12">Professional Experience</h2>
          
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-primary transform md:-translate-x-1/2"></div>
            
            <div className="space-y-12">
              {experiences.map((exp, index) => (
                <div
                  key={index}
                  className={`relative flex flex-col md:flex-row items-start md:items-center ${
                    index % 2 === 0 ? 'md:flex-row-reverse' : ''
                  }`}
                >
                  {/* Timeline dot */}
                  <div className="absolute left-2 md:left-1/2 w-4 h-4 bg-primary rounded-full transform md:-translate-x-1/2 border-4 border-background shadow-glow"></div>
                  
                  {/* Content */}
                  <div className={`ml-12 md:ml-0 md:w-1/2 ${index % 2 === 0 ? 'md:pr-8' : 'md:pl-8'}`}>
                    <Card className="p-6 bg-card hover:bg-card/80 border-border hover:border-primary/50 transition-all duration-300 hover:shadow-card">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-primary">{exp.position}</h3>
                          <h4 className="text-lg font-semibold text-foreground/90">{exp.company}</h4>
                        </div>
                        <img src="/matlab-logo.svg" alt="MATLAB" className="w-8 h-8 mt-1" />
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-foreground/70 mb-4">
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {exp.duration}
                        </span>
                        <span className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {exp.location}
                        </span>
                      </div>
                      
                      <p className="text-foreground/80 mb-4 leading-relaxed">{exp.description}</p>
                      
                      <div className="space-y-4">
                        <div>
                          <h5 className="font-semibold mb-2">Key Achievements:</h5>
                          <ul className="space-y-1 text-foreground/80">
                            {exp.achievements.map((achievement, achIndex) => (
                              <li key={achIndex} className="flex items-start">
                                <span className="text-primary mr-2">•</span>
                                {achievement}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h5 className="font-semibold mb-2">Technologies:</h5>
                          <div className="flex flex-wrap gap-2">
                            {exp.technologies.map((tech, techIndex) => (
                              <Badge
                                key={techIndex}
                                variant="secondary"
                                className="text-xs bg-primary/10 text-primary border-primary/20"
                              >
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Education Section */}
        <div className="space-y-8">
          <h2 className="text-3xl font-bold font-heading text-center mb-12">Education</h2>
          
          {education.map((edu, index) => (
            <Card
              key={index}
              className="p-8 bg-gradient-secondary border-border/50 hover:border-primary/50 transition-all duration-300"
            >
              <div className="text-center space-y-4">
                <h3 className="text-2xl font-bold text-primary">{edu.degree}</h3>
                <h4 className="text-xl font-semibold">{edu.institution}</h4>
                <p className="text-foreground/70">{edu.duration}</p>
                <p className="text-foreground/80 leading-relaxed max-w-2xl mx-auto">{edu.description}</p>
                
                <div className="flex flex-wrap justify-center gap-4 pt-4">
                  {edu.highlights.map((highlight, hIndex) => (
                    <Badge
                      key={hIndex}
                      variant="outline"
                      className="border-primary/50 text-primary"
                    >
                      {highlight}
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Experience;