export const mockResumeHistory = [
  { id: 1, title: "resume_final_v2.pdf", date: "2 days ago", score: 85, version: "v2.1" },
  { id: 2, title: "resume_sde_draft.pdf", date: "1 week ago", score: 72, version: "v1.3" },
  { id: 3, title: "resume_old.pdf", date: "1 month ago", score: 55, version: "v1.0" },
];

export const mockStrengths = [
  "Strong Technical Skills",
  "Good Project Experience",
  "Relevant Technologies Listed",
  "Clean Resume Structure",
  "Quantifiable Achievements Present",
];

export const mockWeaknesses = [
  "Missing Impact Metrics in some sections",
  "Weak Summary Section",
  "Missing Industry Keywords",
  "No Certifications Listed",
  "Limited Open Source Contributions",
];

export const mockKeywords = {
  found: ["React", "Node.js", "Java", "SQL", "JavaScript", "TypeScript", "REST APIs", "Git"],
  missing: ["Docker", "AWS", "Kubernetes", "GraphQL", "CI/CD", "Microservices", "Redis"],
};

export const mockSuggestions = [
  { title: "Improve Project Descriptions", desc: "Use the STAR method for bullet points to highlight impact.", type: "improvement" },
  { title: "Add Quantifiable Results", desc: "Include metrics like 'Increased performance by 20%' or 'Reduced load time by 40%'.", type: "critical" },
  { title: "Include Certifications", desc: "Add relevant AWS or Azure certifications to stand out.", type: "addition" },
  { title: "Optimize Skills Section", desc: "Group skills by category (Frontend, Backend, Tools) and add proficiency levels.", type: "structure" },
  { title: "Enhance LinkedIn Profile", desc: "Ensure your LinkedIn has matching keywords and a professional headshot.", type: "improvement" },
  { title: "Add GitHub Links", desc: "Provide live repository links to showcase your work.", type: "addition" },
];

export const mockTemplates = [
  { id: "modern", name: "Modern", description: "Clean lines and subtle colors. Perfect for tech roles.", primaryColor: "#6366f1", secondaryColor: "#8b5cf6", font: "Inter" },
  { id: "professional", name: "Professional", description: "Balanced layout suitable for all industries.", primaryColor: "#1e293b", secondaryColor: "#475569", font: "SF Pro" },
  { id: "minimal", name: "Minimal", description: "Focus on typography and whitespace for a clean look.", primaryColor: "#18181b", secondaryColor: "#52525b", font: "Georgia" },
  { id: "corporate", name: "Corporate", description: "Traditional structure with professional serif fonts.", primaryColor: "#1e3a5f", secondaryColor: "#2d5a87", font: "Merriweather" },
  { id: "student", name: "Student", description: "Highlight education and projects for entry-level roles.", primaryColor: "#0d9488", secondaryColor: "#14b8a6", font: "Inter" },
];

export const mockResumeData = {
  header: {
    name: "John Doe",
    title: "Full Stack Software Engineer",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    linkedin: "linkedin.com/in/johndoe",
    github: "github.com/johndoe",
  },
  summary: "Results-driven Software Engineer with 3+ years of experience in building scalable web applications. Proficient in React, Node.js, and Java. Passionate about writing clean, maintainable code and solving complex technical challenges.",
  education: [
    { institution: "University of Technology", degree: "B.Sc. in Computer Science", date: "2018 - 2022", gpa: "3.8/4.0", details: "Relevant Coursework: Data Structures, Algorithms, Database Management, Web Development." },
  ],
  skills: {
    languages: ["JavaScript", "TypeScript", "Java", "Python", "SQL"],
    frontend: ["React", "Next.js", "Tailwind CSS", "Redux", "HTML/CSS"],
    backend: ["Node.js", "Express", "Spring Boot", "REST APIs"],
    tools: ["Git", "PostgreSQL", "MongoDB", "Figma"],
  },
  projects: [
    { title: "E-Commerce Platform", technologies: ["React", "Node.js", "MongoDB", "Stripe"], date: "Jan 2023 - Present", bullets: ["Developed a full-stack e-commerce application supporting 10,000+ products.", "Implemented secure payment processing using Stripe API.", "Optimized database queries, reducing load times by 30%."] },
    { title: "Real-time Chat Application", technologies: ["React", "Socket.io", "Express"], date: "Aug 2022 - Dec 2022", bullets: ["Built a real-time messaging app with WebSockets.", "Designed responsive UI components using Tailwind CSS.", "Handled concurrent connections effectively without latency."] },
  ],
  experience: [
    { company: "Tech Solutions Inc.", role: "Frontend Developer Intern", date: "May 2021 - Aug 2021", location: "Remote", bullets: ["Collaborated with a team of 5 to develop internal dashboard tools.", "Refactored legacy code to React functional components, improving render performance.", "Participated in daily stand-ups and agile development cycles."] },
  ],
  certifications: [],
};

export const mockJobMatch = {
  score: 82,
  matching: ["React", "JavaScript", "SQL", "Node.js", "REST APIs"],
  missing: ["AWS", "Docker", "Microservices"],
  suggestions: ["Add AWS experience with Lambda or S3", "Learn Docker containerization", "Study microservices architecture patterns"],
};

export const mockATSCategories = [
  { label: "Formatting", score: 94, color: "from-emerald-500 to-teal-500" },
  { label: "Keywords", score: 78, color: "from-amber-500 to-orange-500" },
  { label: "Projects", score: 88, color: "from-violet-500 to-purple-500" },
  { label: "Skills", score: 85, color: "from-blue-500 to-cyan-500" },
  { label: "Education", score: 92, color: "from-emerald-500 to-teal-500" },
  { label: "Experience", score: 76, color: "from-amber-500 to-orange-500" },
];

export const mockAnalysisHistory = [
  { date: "Jun 5, 2026", score: 85, changes: "+3" },
  { date: "May 28, 2026", score: 82, changes: "+10" },
  { date: "May 15, 2026", score: 72, changes: "+17" },
  { date: "Apr 30, 2026", score: 55, changes: "Initial" },
];

export const sampleFormData = {
  personalInfo: { fullName: "John Doe", email: "john@example.com", phone: "+1 555-1234", linkedin: "linkedin.com/in/johndoe", github: "github.com/johndoe", portfolio: "johndoe.dev", location: "San Francisco, CA" },
  education: [{ degree: "B.Sc. Computer Science", college: "University of Technology", cgpa: "3.8", year: "2022" }],
  skills: { technical: ["React", "Node.js", "TypeScript", "Python", "Java"], soft: ["Leadership", "Communication", "Problem Solving"], tools: ["Git", "Docker", "VS Code", "Figma"], languages: ["English", "Hindi"] },
  projects: [{ title: "E-Commerce Platform", description: "Full-stack marketplace with payment processing", techStack: "React, Node.js, MongoDB", githubLink: "github.com/johndoe/ecommerce", liveLink: "ecommerce.johndoe.dev" }],
  experience: [{ type: "internship", company: "Tech Solutions Inc.", role: "Frontend Developer Intern", duration: "May 2021 - Aug 2021", responsibilities: "Built UI components, refactored legacy code" }],
  certifications: [{ name: "AWS Certified Developer", issuer: "Amazon", date: "2024" }],
};
