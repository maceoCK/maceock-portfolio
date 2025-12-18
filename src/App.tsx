import './App.css';
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import Oscilloscope from './components/Oscilloscope';
import BarGraph from './components/BarGraph';
import DataStream from './components/DataStream';
import RadarDisplay from './components/RadarDisplay';
import TechGraph3D from './components/TechGraph3D';
import ConnectHub3D from './components/ConnectHub3D';
import HeartbeatMonitor from './components/HeartbeatMonitor';

function App() {
  return (
    <BrowserRouter>
      <div className="eva-interface hex-pattern">
        <div className="crt-overlay" />

        {/* Header */}
        <header className="eva-header">
          <div className="header-left">
            <span className="header-title glow-green">MACEO CARDINALE KWIK</span>
            <span className="header-subtitle">SOFTWARE ENGINEER // FULL-STACK</span>
          </div>
          <div className="header-center">
            <span className="header-status pulse">SYSTEM ACTIVE</span>
          </div>
          <div className="header-right">
            <span className="header-unit">NYC</span>
          </div>
        </header>

        {/* Main Content */}
        <main className="portfolio-main">
          {/* Left Sidebar - Navigation & Visuals */}
          <aside className="portfolio-sidebar">
            <nav className="nav-panel">
              <div className="nav-header">NAVIGATION</div>
              <NavButton label="ABOUT" to="/about" />
              <NavButton label="EXPERIENCE" to="/experience" />
              <NavButton label="PROJECTS" to="/projects" />
              <NavButton label="SKILLS" to="/skills" />
            </nav>

          <div className="sidebar-visuals">
            <Oscilloscope width={200} height={80} color="#00ff41" frequency={1.5} amplitude={0.6} waveType="sine" label="NEURAL ACTIVITY" />
            <BarGraph width={200} height={60} barCount={8} color="#00ff41" label="SYSTEM LOAD" />
          </div>

          <div className="contact-panel">
            <div className="contact-header">CONNECT</div>
            <a href="https://github.com/MaceoCK" target="_blank" rel="noopener noreferrer" className="contact-link">
              <span className="contact-indicator" /> GITHUB
            </a>
            <a href="https://linkedin.com/in/maceo-cardinale-kwik" target="_blank" rel="noopener noreferrer" className="contact-link">
              <span className="contact-indicator" /> LINKEDIN
            </a>
            <a href="mailto:maceo.ck@gmail.com" className="contact-link">
              <span className="contact-indicator" /> EMAIL
            </a>
          </div>

          <DataStream width={200} height={120} color="#00ff41" label="DATA STREAM" />
        </aside>

        {/* Main Content Area */}
        <div className="portfolio-content">
          <Routes>
            <Route path="/" element={<Navigate to="/about" replace />} />
            <Route path="/about" element={<AboutSection />} />
            <Route path="/experience" element={<ExperienceSection />} />
            <Route path="/projects" element={<ProjectsSection />} />
            <Route path="/skills" element={<SkillsSection />} />
          </Routes>
        </div>

        {/* Right Sidebar - Status Displays */}
        <aside className="portfolio-status">
          <RadarDisplay size={160} color="#00ff41" label="ACTIVITY SCAN" />

          <div className="status-block">
            <div className="status-block-header">CURRENT STATUS</div>
            <StatusItem label="ROLE" value="Software Engineer" />
            <StatusItem label="COMPANY" value="Traba" />
            <StatusItem label="LOCATION" value="New York, NY" />
            <StatusItem label="FOCUS" value="AI & Automation" />
          </div>

          <div className="status-block">
            <div className="status-block-header">EDUCATION</div>
            <StatusItem label="DEGREE" value="B.S. Computer Science" />
            <StatusItem label="SCHOOL" value="Virginia Tech" />
            <StatusItem label="GPA" value="4.0" />
            <StatusItem label="HONORS" value="Summa Cum Laude" />
          </div>

          <div className="heartbeat-row">
            <HeartbeatMonitor width={180} height={50} color="#00ff41" label="ECG-I" />
            <HeartbeatMonitor width={180} height={50} color="#ff6600" label="ECG-II" />
          </div>
        </aside>
      </main>

      {/* Footer */}
      <footer className="eva-footer">
        <div className="footer-section">
          <span>TYPESCRIPT</span>
          <div className="footer-indicator active" />
        </div>
        <div className="footer-section">
          <span>REACT</span>
          <div className="footer-indicator active" />
        </div>
        <div className="footer-section">
          <span>PYTHON</span>
          <div className="footer-indicator active" />
        </div>
        <div className="footer-section">
          <span>GO</span>
          <div className="footer-indicator active" />
        </div>
        <div className="footer-divider" />
        <div className="footer-section">
          <span className="footer-status">ALL SYSTEMS OPERATIONAL</span>
        </div>
        <div className="footer-coords">
          <span>MaceoCK.me</span>
        </div>
      </footer>
      </div>
    </BrowserRouter>
  );
}

function NavButton({ label, to }: {
  label: string;
  to: string;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `nav-button ${isActive ? 'active' : ''}`}
    >
      <span className="nav-indicator" />
      {label}
    </NavLink>
  );
}

function StatusItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="status-item-row">
      <span className="status-label">{label}</span>
      <span className="status-value-text">{value}</span>
    </div>
  );
}

function AboutSection() {
  return (
    <div className="section-container">
      <div className="section-header">
        <span className="section-title glow-green">ABOUT // PROFILE DATA</span>
        <Oscilloscope width={300} height={50} color="#00ff41" frequency={2} amplitude={0.4} waveType="sine" label="" />
      </div>

      <div className="about-content">
        <div className="about-text">
          <p className="about-intro">
            Software engineer with a passion for building fast, scalable tools—from AI-embedded
            search systems handling millions of records to cross-platform applications used by thousands.
          </p>

          <p className="about-body">
            Currently building AI-powered systems at <span className="highlight-text">Traba</span>—a
            Founders Fund backed Series A startup revolutionizing light industrial staffing. Building
            intelligent matching systems to connect workers with shifts at scale, automating the future of work.
          </p>

          <p className="about-body">
            Graduated from <span className="highlight-text">Virginia Tech</span> with a B.S. in Computer Science,
            Summa Cum Laude. Co-founded <span className="highlight-text">Lighthouse Startups</span>, a 501(c)(3)
            non-profit helping students experience entrepreneurship.
          </p>

          <div className="about-interests">
            <span className="interest-tag">Competitive Fencing</span>
            <span className="interest-tag">Bouldering</span>
            <span className="interest-tag">Science Fiction</span>
            <span className="interest-tag">Vintage Thrifting</span>
          </div>

          <ConnectHub3D width={400} height={250} />
        </div>
      </div>
    </div>
  );
}

function ExperienceSection() {
  return (
    <div className="section-container">
      <div className="section-header">
        <span className="section-title glow-orange">EXPERIENCE // WORK HISTORY</span>
        <Oscilloscope width={300} height={50} color="#ff6600" frequency={1.5} amplitude={0.5} waveType="square" label="" />
      </div>

      <div className="experience-list">
        <ExperienceCard
          company="Traba"
          role="Software Engineer"
          period="Oct 2024 - Present"
          location="New York, NY"
          color="#00ff41"
          description={[
            "Building AI-powered systems to intelligently match workers with shifts at scale",
            "Working on the Automation Pod to revolutionize light industrial staffing",
            "Developing full-stack features with TypeScript, React, and Node.js",
          ]}
          tech={["TypeScript", "React", "Node.js", "GCP"]}
        />

        <ExperienceCard
          company="SimonComputing"
          role="Software Engineer"
          period="Jun 2023 - Oct 2024"
          location="Washington, DC"
          color="#ff6600"
          description={[
            "Built FastAPI backend in Docker for semantic search over 92,000+ files (+35% speedup)",
            "Integrated pgvector with PostgreSQL for embedding search over 1M+ records",
            "Developed Go backend deployed in Docker, increasing data processing speed by 30%",
            "Created cross-platform React + Electron frontend, improving UI performance by 25%",
            "Built React component library reducing UI development time by 40%",
            "Optimized PostgreSQL database with 1.4M+ records on AWS (25% query improvement)",
          ]}
          tech={["Python", "Go", "React", "FastAPI", "PostgreSQL", "Docker", "AWS"]}
        />

        <ExperienceCard
          company="Performant Software"
          role="Software Engineer Intern"
          period="May 2023 - Aug 2023"
          location="Remote"
          color="#00ffff"
          description={[
            "Engineered SQL queries and PostgreSQL database handling 600,000+ rows",
            "Created interactive D3.js visualizations increasing user engagement by 50%",
            "Collaborated with 5+ clients achieving 98% satisfaction rate",
          ]}
          tech={["Python", "React", "D3.js", "PostgreSQL"]}
        />
      </div>
    </div>
  );
}

function ExperienceCard({ company, role, period, location, color, description, tech }: {
  company: string;
  role: string;
  period: string;
  location: string;
  color: string;
  description: string[];
  tech: string[];
}) {
  return (
    <div className="experience-card" style={{ borderColor: color }}>
      <div className="experience-header">
        <div className="experience-title">
          <span className="company-name" style={{ color }}>{company}</span>
          <span className="role-name">{role}</span>
        </div>
        <div className="experience-meta">
          <span className="period">{period}</span>
          <span className="location">{location}</span>
        </div>
      </div>
      <ul className="experience-description">
        {description.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
      <div className="experience-tech">
        {tech.map((t, i) => (
          <span key={i} className="tech-tag" style={{ borderColor: color, color }}>{t}</span>
        ))}
      </div>
    </div>
  );
}

function ProjectsSection() {
  return (
    <div className="section-container">
      <div className="section-header">
        <span className="section-title glow-cyan">PROJECTS // ACTIVE BUILDS</span>
        <Oscilloscope width={300} height={50} color="#00ffff" frequency={3} amplitude={0.4} waveType="noise" label="" />
      </div>

      <div className="projects-grid">
        <ProjectCard
          name="Pravost"
          description="AI-powered verification and validation system. Advanced machine learning pipeline for automated truth assessment and data integrity checking."
          tech={["Python", "FastAPI", "PostgreSQL", "ML"]}
          color="#00ff41"
          github="https://github.com/MaceoCK/pravost"
          status="IN DEVELOPMENT"
        />

        <ProjectCard
          name="Datost"
          description="Cross-platform database management tool with AI-powered natural language queries. Visual query builder supporting PostgreSQL, MySQL, and SQLite with MCP server integration."
          tech={["Tauri", "Rust", "React", "TypeScript"]}
          color="#ff6600"
          github="https://github.com/MaceoCK/datost"
          status="IN DEVELOPMENT"
        />

        <ProjectCard
          name="DirectDrive Now"
          description="Scalable ride management platform deployed on AWS ECS. Features Twilio SMS notifications, WebSocket real-time updates, and Flutter mobile app."
          tech={["Python", "Flask", "Flutter", "AWS", "Docker"]}
          color="#00ffff"
          github="https://github.com/MaceoCK"
          status="DEPLOYED"
        />

        <ProjectCard
          name="Prosperity Trading Bot"
          description="Python trading engine with market-making, arbitrage, and Black-Scholes option pricing. Placed top 10 in US (top 0.1%) in IMC Prosperity Challenge."
          tech={["Python", "NumPy", "Algorithm Design"]}
          color="#9933ff"
          github="https://github.com/MaceoCK"
          status="COMPLETED"
        />

        <ProjectCard
          name="Amazon Boycott Detector"
          description="Product boycott detection tool using web scraping and data analysis to help consumers make informed purchasing decisions."
          tech={["Python", "Web Scraping", "Data Analysis"]}
          color="#ffcc00"
          github="https://github.com/MaceoCK/AmazonBoycottDetector"
          status="ACTIVE"
        />

        <ProjectCard
          name="Conway's Game of Life"
          description="Interactive cellular automaton simulation with customizable rules and real-time visualization using modern web technologies."
          tech={["TypeScript", "React", "Canvas"]}
          color="#00ff41"
          github="https://github.com/MaceoCK/conway"
          status="COMPLETED"
        />
      </div>
    </div>
  );
}

function ProjectCard({ name, description, tech, color, github, status }: {
  name: string;
  description: string;
  tech: string[];
  color: string;
  github: string;
  status: string;
}) {
  return (
    <a href={github} target="_blank" rel="noopener noreferrer" className="project-card" style={{ borderColor: color }}>
      <div className="project-header">
        <span className="project-name" style={{ color }}>{name}</span>
        <span className="project-status" style={{
          backgroundColor: status === 'DEPLOYED' ? '#00ff41' :
                          status === 'ACTIVE' ? '#ff6600' :
                          status === 'COMPLETED' ? '#00ffff' : '#ffcc00',
          color: '#000'
        }}>{status}</span>
      </div>
      <p className="project-description">{description}</p>
      <div className="project-tech">
        {tech.map((t, i) => (
          <span key={i} className="tech-tag-small">{t}</span>
        ))}
      </div>
      <div className="project-link">
        VIEW ON GITHUB →
      </div>
    </a>
  );
}

function SkillsSection() {
  return (
    <div className="section-container skills-section">
      <div className="section-header">
        <span className="section-title glow-purple">SKILLS // TECH NETWORK</span>
        <Oscilloscope width={300} height={50} color="#9933ff" frequency={2.5} amplitude={0.5} waveType="sawtooth" label="" />
      </div>

      <TechGraph3D width={750} height={400} />

      <div className="proficiency-grid">
        <div className="proficiency-category">
          <div className="proficiency-header" style={{ borderColor: '#00ff41' }}>
            <span style={{ color: '#00ff41' }}>LANGUAGES</span>
          </div>
          <div className="proficiency-bars">
            <ProficiencyBar name="TypeScript" level={95} color="#00ff41" />
            <ProficiencyBar name="Python" level={90} color="#00ff41" />
            <ProficiencyBar name="Rust" level={70} color="#00ff41" />
            <ProficiencyBar name="Go" level={85} color="#00ff41" />
          </div>
        </div>

        <div className="proficiency-category">
          <div className="proficiency-header" style={{ borderColor: '#ff6600' }}>
            <span style={{ color: '#ff6600' }}>FRAMEWORKS</span>
          </div>
          <div className="proficiency-bars">
            <ProficiencyBar name="React" level={95} color="#ff6600" />
            <ProficiencyBar name="FastAPI" level={88} color="#ff6600" />
            <ProficiencyBar name="Tauri" level={75} color="#ff6600" />
            <ProficiencyBar name="Node.js" level={90} color="#ff6600" />
          </div>
        </div>

        <div className="proficiency-category">
          <div className="proficiency-header" style={{ borderColor: '#00ffff' }}>
            <span style={{ color: '#00ffff' }}>INFRASTRUCTURE</span>
          </div>
          <div className="proficiency-bars">
            <ProficiencyBar name="Docker" level={90} color="#00ffff" />
            <ProficiencyBar name="AWS" level={85} color="#00ffff" />
            <ProficiencyBar name="PostgreSQL" level={90} color="#00ffff" />
            <ProficiencyBar name="GCP" level={80} color="#00ffff" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ProficiencyBar({ name, level, color }: { name: string; level: number; color: string }) {
  return (
    <div className="proficiency-item">
      <div className="proficiency-info">
        <span className="proficiency-name">{name}</span>
        <span className="proficiency-level" style={{ color }}>{level}%</span>
      </div>
      <div className="proficiency-track">
        <div
          className="proficiency-fill"
          style={{
            width: `${level}%`,
            backgroundColor: color,
            boxShadow: `0 0 8px ${color}`,
          }}
        />
      </div>
    </div>
  );
}

export default App;
