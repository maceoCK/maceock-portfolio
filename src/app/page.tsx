"use client";

import { useEffect, useRef, useState } from "react";
import {
  MapIcon,
  CellularIcon,
  GridIcon,
  StackIcon,
  ShipIcon,
} from "@/components/ProjectIcons";

// Word transformation pairs for scroll animations
const wordTransitions = [
  { from: "ENGINEER", to: "BUILDER" },
  { from: "FRONTEND", to: "FULLSTACK" },
  { from: "CODE", to: "SHIP" },
];

// Featured projects from GitHub - impressive ones with live demos
const projects = [
  {
    title: "IN THE SAME BOATS",
    category: "REACT / DECK.GL / DATA VIS",
    description:
      "Interactive mapping of cultural movements across the 20th century Afro-Atlantic world. Built with Linked Places data standards.",
    link: "https://github.com/maceoCK/itsb",
    demo: "https://performant-software.github.io/itsb/",
    Icon: MapIcon,
  },
  {
    title: "CELLULAR AUTOMATA",
    category: "WEBGL / GLSL SHADERS",
    description:
      "Multi-neighborhood cellular automata simulator with real-time shader-based rendering and configurable life parameters.",
    link: "https://github.com/maceoCK/multiNeighborhoodCelllular",
    demo: "https://multi-neighborhood-celllular.vercel.app",
    Icon: CellularIcon,
  },
  {
    title: "GRID EXPAND",
    category: "TYPESCRIPT / CANVAS",
    description:
      "Grid drawing assistant for artists. Dynamic grid configuration, image cropping, progress tracking, and print functionality.",
    link: "https://github.com/maceoCK/gridExpand",
    demo: "https://grid-expand.vercel.app",
    Icon: GridIcon,
  },
  {
    title: "LIST SYNC",
    category: "REACT / WEBSOCKET / ELASTICSEARCH",
    description:
      "Full-stack app with real-time WebSocket progress tracking, Elasticsearch search, and bulk operations with optimistic updates.",
    link: "https://github.com/maceoCK/realtime-list-manager",
    Icon: StackIcon,
  },
  {
    title: "FREIGHT LOGISTICS",
    category: "GO / REACT / TERRAFORM / AWS",
    description:
      "End-to-end logistics platform with Go backend, React frontend, and AWS infrastructure defined in Terraform/Terragrunt.",
    link: "https://github.com/maceoCK/freight-logistics",
    Icon: ShipIcon,
  },
];

const skills = [
  {
    title: "LANGUAGES",
    items: ["TypeScript", "Python", "Go", "Rust", "JavaScript"],
  },
  {
    title: "FRONTEND",
    items: ["React", "Next.js", "WebGL/GLSL", "Three.js", "Deck.GL"],
  },
  {
    title: "BACKEND",
    items: ["Node.js", "PostgreSQL", "Elasticsearch", "WebSockets"],
  },
  {
    title: "INFRA",
    items: ["AWS", "Terraform", "Docker", "Vercel"],
  },
];

function AnimatedLetter({
  index,
  isAnimating,
  fromChar,
  toChar,
  progress,
}: {
  index: number;
  isAnimating: boolean;
  fromChar: string;
  toChar: string;
  progress: number;
}) {
  const delay = index * 0.05;
  const letterProgress = Math.max(0, Math.min(1, (progress - delay) / 0.3));

  if (!isAnimating || letterProgress === 0) {
    return <span className="letter inline-block">{fromChar}</span>;
  }

  if (letterProgress >= 1) {
    return <span className="letter inline-block">{toChar}</span>;
  }

  const yOffset = Math.sin(letterProgress * Math.PI) * -100;
  const rotation = Math.sin(letterProgress * Math.PI * 2) * 15;
  const opacity =
    letterProgress < 0.5 ? 1 - letterProgress * 2 : (letterProgress - 0.5) * 2;
  const displayChar = letterProgress < 0.5 ? fromChar : toChar;

  return (
    <span
      className="letter inline-block"
      style={{
        transform: `translateY(${yOffset}px) rotate(${rotation}deg)`,
        opacity: Math.max(0.3, opacity),
      }}
    >
      {displayChar}
    </span>
  );
}

function WordTransition({
  fromWord,
  toWord,
  progress,
}: {
  fromWord: string;
  toWord: string;
  progress: number;
}) {
  const maxLength = Math.max(fromWord.length, toWord.length);
  const isAnimating = progress > 0 && progress < 1;

  return (
    <span className="inline-block">
      {Array.from({ length: maxLength }).map((_, i) => (
        <AnimatedLetter
          key={i}
          index={i}
          isAnimating={isAnimating}
          fromChar={fromWord[i] || ""}
          toChar={toWord[i] || ""}
          progress={progress}
        />
      ))}
    </span>
  );
}

function ScrollText({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {text.split("").map((char, i) => (
        <span
          key={i}
          className={`letter ${isVisible ? "letter-falling" : ""}`}
          style={{
            animationDelay: `${i * 0.05}s`,
            opacity: isVisible ? 1 : 0,
          }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </div>
  );
}

export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  const [currentTransition, setCurrentTransition] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      const viewportHeight = window.innerHeight;
      const transitionIndex = Math.floor(
        window.scrollY / (viewportHeight * 1.5)
      );
      setCurrentTransition(
        Math.min(transitionIndex, wordTransitions.length - 1)
      );
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const viewportHeight =
    typeof window !== "undefined" ? window.innerHeight : 1000;
  const transitionStart = currentTransition * viewportHeight * 1.5;
  const progress = Math.max(
    0,
    Math.min(1, (scrollY - transitionStart) / (viewportHeight * 0.8))
  );

  return (
    <main className="bg-white">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="section flex flex-col justify-center items-center px-8 relative overflow-hidden"
        style={{ minHeight: "100vh" }}
      >
        {/* Large background letters */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
          style={{
            transform: `translateY(${scrollY * 0.3}px)`,
          }}
        >
          <span
            className="text-[40vw] font-bold text-black/5 leading-none"
            style={{ letterSpacing: "-0.1em" }}
          >
            MCK
          </span>
        </div>

        {/* Main title */}
        <div className="relative z-10 text-center px-4">
          <h1 className="text-[14vw] sm:text-[12vw] md:text-[10vw] font-bold leading-[0.85] tracking-tight uppercase">
            <ScrollText text="MACEO" className="block" />
            <span className="block text-red">
              <ScrollText text="CARDINALE" />
            </span>
            <ScrollText text="KWIK" className="block" />
          </h1>

          <div className="mt-8 md:mt-12 text-base sm:text-xl md:text-2xl font-bold uppercase tracking-widest">
            <WordTransition
              fromWord={wordTransitions[currentTransition].from}
              toWord={wordTransitions[currentTransition].to}
              progress={progress}
            />
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 scroll-indicator">
          <div className="w-px h-16 bg-black/30" />
        </div>
      </section>

      {/* About Section - Red Block */}
      <section className="section red-block flex flex-col justify-center px-6 sm:px-8 md:px-16 lg:px-24 py-16 md:py-0">
        <div className="max-w-6xl mx-auto">
          <ScrollText
            text="ABOUT"
            className="text-[12vw] sm:text-[8vw] md:text-[6vw] font-bold leading-none mb-6 md:mb-8 text-white/30"
          />
          <div className="grid md:grid-cols-2 gap-8 md:gap-24">
            <div>
              <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight">
                Full Stack Software Engineer building at the intersection of
                performance and user experience.
              </p>
            </div>
            <div className="text-base sm:text-lg md:text-xl opacity-80 space-y-4 md:space-y-6">
              <p>
                Based in Brooklyn, NY. Currently engineering at Traba. I build
                systems that scale—from WebGL visualizations to distributed
                backends.
              </p>
              <p>
                TypeScript by day, Rust by curiosity. Always optimizing, always
                shipping.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="flex flex-col justify-center px-6 sm:px-8 md:px-16 lg:px-24 bg-white py-16 md:py-24">
        <div className="max-w-6xl mx-auto w-full">
          <ScrollText
            text="PROJECTS"
            className="text-[12vw] sm:text-[8vw] md:text-[6vw] font-bold leading-none mb-10 md:mb-16 text-black/10"
          />

          {/* Project Grid */}
          <div className="grid sm:grid-cols-2 gap-10 md:gap-12">
            {projects.map((project, i) => (
              <div
                key={i}
                className="group border-b-4 border-black pb-6 md:pb-8 hover:border-red transition-colors"
              >
                {/* Icon Container */}
                <div className="aspect-[4/3] bg-black/5 mb-4 md:mb-6 overflow-hidden relative flex items-center justify-center group-hover:bg-red/5 transition-colors">
                  <project.Icon className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 text-black/20 group-hover:text-red/40 transition-colors" />
                </div>

                <p className="text-[10px] sm:text-xs tracking-widest text-black/50 mb-1 md:mb-2">
                  {project.category}
                </p>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold group-hover:text-red transition-colors mb-2">
                  {project.title}
                </h3>
                <p className="text-sm sm:text-base text-black/60 mb-3 md:mb-4">
                  {project.description}
                </p>

                {/* Links */}
                <div className="flex gap-4 text-xs sm:text-sm font-bold tracking-widest">
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-red transition-colors"
                  >
                    CODE →
                  </a>
                  {project.demo && (
                    <a
                      href={project.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-red transition-colors"
                    >
                      LIVE →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* View All Link */}
          <div className="mt-10 md:mt-16 text-center">
            <a
              href="https://github.com/maceoCK"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-base sm:text-xl font-bold tracking-widest border-b-4 border-black hover:border-red hover:text-red transition-colors pb-2"
            >
              VIEW ALL ON GITHUB →
            </a>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section className="bg-black text-white flex flex-col justify-center px-6 sm:px-8 md:px-16 lg:px-24 py-16 md:py-24">
        <div className="max-w-6xl mx-auto w-full">
          <ScrollText
            text="STACK"
            className="text-[12vw] sm:text-[8vw] md:text-[6vw] font-bold leading-none mb-10 md:mb-16 text-white/20"
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {skills.map((skill, i) => (
              <div key={i}>
                <h3 className="text-red text-sm sm:text-lg font-bold mb-4 md:mb-6 tracking-widest">
                  {skill.title}
                </h3>
                <ul className="space-y-2 md:space-y-3">
                  {skill.items.map((item, j) => (
                    <li
                      key={j}
                      className="text-sm sm:text-lg opacity-70 hover:opacity-100 transition-opacity cursor-default"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="red-block flex flex-col justify-center items-center px-6 sm:px-8 text-center py-16 md:py-24 min-h-[80vh] md:min-h-screen">
        <ScrollText
          text="LET'S BUILD"
          className="text-[12vw] sm:text-[10vw] md:text-[8vw] font-bold leading-[0.9] mb-2 md:mb-4"
        />
        <ScrollText
          text="TOGETHER"
          className="text-[12vw] sm:text-[10vw] md:text-[8vw] font-bold leading-[0.9] text-black"
        />

        <div className="mt-10 md:mt-16 space-y-4">
          <a
            href="mailto:Maceo.ck@gmail.com"
            className="block text-lg sm:text-2xl md:text-3xl font-bold hover:text-black transition-colors break-all"
          >
            Maceo.ck@gmail.com
          </a>
          <div className="flex gap-6 sm:gap-8 justify-center text-sm sm:text-lg font-bold tracking-widest pt-6 md:pt-8 flex-wrap">
            <a
              href="https://github.com/maceoCK"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-black transition-colors"
            >
              GITHUB
            </a>
            <a
              href="https://www.linkedin.com/in/maceo-cardinale-kwik"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-black transition-colors"
            >
              LINKEDIN
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-6 md:py-8 px-6 sm:px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs sm:text-sm tracking-widest opacity-50 text-center md:text-left">
            MACEO CARDINALE KWIK — BROOKLYN, NY
          </p>
          <div className="flex gap-4 sm:gap-6 text-xs sm:text-sm tracking-widest opacity-50">
            <a
              href="https://github.com/maceoCK"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-100 transition-opacity"
            >
              GITHUB
            </a>
            <a
              href="https://www.linkedin.com/in/maceo-cardinale-kwik"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-100 transition-opacity"
            >
              LINKEDIN
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
