# 🌟 Anime Dev Space - Portfolio Website

A modern, responsive portfolio website showcasing my development journey with an anime-inspired design. Built with cutting-edge technologies and featuring a sleek, interactive user experience.

![Portfolio Preview](https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200)

## ✨ Features

### 🎨 **Design & User Experience**
- **Anime-Inspired Aesthetic**: Clean, modern design with anime-inspired color palette
- **Dark/Light Mode Toggle**: Seamless theme switching with persistent user preferences
- **Responsive Design**: Optimized for all devices (desktop, tablet, mobile)
- **Smooth Animations**: Elegant transitions and hover effects throughout
- **Interactive Navigation**: Smart scroll-based navigation with active section highlighting

### 📱 **Core Sections**
- **Hero Section**: Eye-catching introduction with profile image and social links
- **About**: Personal story and professional background
- **Experience**: Detailed work history with achievements and technologies
- **Projects**: Interactive project showcase with filtering and detailed views
- **Blog**: Dynamic blog system with post previews and full article views
- **Interests**: Personal interests and hobbies
- **Contact**: Professional contact form with validation

### 🚀 **Technical Features**
- **Client-Side Routing**: Fast navigation with React Router
- **Type Safety**: Full TypeScript implementation
- **Component Architecture**: Modular, reusable React components
- **State Management**: Efficient local state management
- **Performance Optimized**: Lazy loading and optimized assets
- **SEO Ready**: Meta tags and structured data

## 🛠️ Tech Stack

### **Frontend Framework**
- **React 18.3.1** - Modern React with hooks and functional components
- **TypeScript 5.5.3** - Type-safe development
- **Vite 5.4.1** - Lightning-fast build tool and dev server

### **Styling & UI**
- **Tailwind CSS 3.4.11** - Utility-first CSS framework
- **shadcn/ui** - High-quality, accessible component library
- **Radix UI** - Unstyled, accessible UI primitives
- **Lucide React** - Beautiful, customizable icons
- **Custom CSS Variables** - Theme-aware design system

### **Routing & Navigation**
- **React Router DOM 7.8.2** - Client-side routing
- **Smooth Scrolling** - Native browser smooth scroll behavior

### **Development Tools**
- **ESLint 9.9.0** - Code linting and quality assurance
- **PostCSS 8.4.47** - CSS processing
- **Autoprefixer 10.4.20** - Automatic vendor prefixes

### **Additional Libraries**
- **React Hook Form 7.53.0** - Form handling and validation
- **Zod 3.23.8** - Schema validation
- **Date-fns 3.6.0** - Date manipulation
- **Sonner 1.5.0** - Toast notifications
- **Embla Carousel 8.3.0** - Touch-friendly carousels

## 🎯 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── sections/        # Page sections (Hero, About, etc.)
│   └── ui/              # shadcn/ui components
├── pages/               # Route components
├── data/                # Static data and content
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
└── assets/              # Images and static files
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/antoniamugisa/anime-dev-space.git
   cd anime-dev-space
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` (or the port shown in terminal)

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint

# Build variants
npm run build:dev    # Build in development mode
```

## 🎨 Customization

### **Theme Customization**
The site uses CSS custom properties for theming. Modify colors in `src/index.css`:

```css
:root {
  --primary: 222 100% 65%;        /* Main brand color */
  --anime-pink: 330 100% 70%;     /* Anime accent colors */
  --anime-cyan: 180 100% 60%;
  --anime-purple: 280 100% 65%;
}
```

### **Content Updates**
- **Personal Info**: Update `src/data/portfolio.tsx`
- **Projects**: Modify the projects array in the same file
- **Blog Posts**: Edit `src/data/blogPosts.ts`
- **Images**: Replace files in `src/assets/`

### **Adding New Sections**
1. Create component in `src/components/sections/`
2. Add route in `src/pages/`
3. Update navigation in `src/components/Navigation.tsx`

## 🌐 Deployment

### **Vercel (Recommended)**
```bash
npm run build
# Deploy to Vercel
```

### **Netlify**
```bash
npm run build
# Deploy dist/ folder to Netlify
```

### **GitHub Pages**
```bash
npm run build
# Deploy dist/ folder to gh-pages branch
```

## 📱 Browser Support

- **Chrome** (latest)
- **Firefox** (latest)
- **Safari** (latest)
- **Edge** (latest)
- **Mobile browsers** (iOS Safari, Chrome Mobile)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

**Antonia Mugisa**
- GitHub: [@antoniamugisa](https://github.com/antoniamugisa)
- LinkedIn: [antonia-mugisa](https://www.linkedin.com/in/antoniamugisa/)
- Twitter: [@antmugisa](https://twitter.com/antmugisa)
- Email: antoniamugisa@gmail.com

## 🙏 Acknowledgments

- **shadcn/ui** for the beautiful component library
- **Tailwind CSS** for the utility-first CSS framework
- **Vite** for the lightning-fast development experience
- **React** team for the amazing framework
- **Anime community** for design inspiration

---

⭐ **Star this repository if you found it helpful!**

*Built with ❤️ and lots of ☕*