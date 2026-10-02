import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getResumeText(resume: any): string {
  if (!resume) return "";
  if (resume.parsed_content) return resume.parsed_content;
  if (resume.improved_content) return resume.improved_content;
  if (resume.content) {
    if (typeof resume.content === "string") return resume.content;
    if (typeof resume.content === "object") {
      const c = resume.content;
      if (c.text && typeof c.text === "string") return c.text;
      
      // If it's a wizard-created structured resume
      if (c.personalInfo || c.skills || c.projects || c.experience) {
        const lines: string[] = [];
        
        if (c.personalInfo) {
          const pi = c.personalInfo;
          if (pi.fullName) lines.push(`# ${pi.fullName}`);
          const contact = [pi.email, pi.phone, pi.location, pi.linkedin, pi.github].filter(Boolean).join(" | ");
          if (contact) lines.push(contact);
          lines.push("");
          if (pi.summary) {
            lines.push("## Professional Summary");
            lines.push(pi.summary);
            lines.push("");
          }
        }
        
        if (c.skills) {
          lines.push("## Skills");
          const technical = Array.isArray(c.skills.technical) ? c.skills.technical.join(", ") : "";
          const tools = Array.isArray(c.skills.tools) ? c.skills.tools.join(", ") : "";
          const soft = Array.isArray(c.skills.soft) ? c.skills.soft.join(", ") : "";
          const languages = Array.isArray(c.skills.languages) ? c.skills.languages.join(", ") : "";
          
          if (technical) lines.push(`- **Technical Skills**: ${technical}`);
          if (tools) lines.push(`- **Tools & Platforms**: ${tools}`);
          if (soft) lines.push(`- **Soft Skills**: ${soft}`);
          if (languages) lines.push(`- **Languages**: ${languages}`);
          lines.push("");
        }
        
        if (c.experience && Array.isArray(c.experience) && c.experience.length > 0) {
          lines.push("## Work Experience");
          c.experience.forEach((exp: any) => {
            if (exp.company || exp.role) {
              lines.push(`### ${exp.role || "Role"} - ${exp.company || "Company"}`);
              if (exp.duration) lines.push(`*Duration: ${exp.duration}*`);
              if (exp.responsibilities) lines.push(exp.responsibilities);
              lines.push("");
            }
          });
        }
        
        if (c.projects && Array.isArray(c.projects) && c.projects.length > 0) {
          lines.push("## Projects");
          c.projects.forEach((p: any) => {
            if (p.title) {
              lines.push(`### ${p.title}`);
              if (p.techStack) lines.push(`*Technologies: ${p.techStack}*`);
              if (p.description) lines.push(p.description);
              const links = [
                p.githubLink ? `[GitHub](${p.githubLink})` : "",
                p.liveLink ? `[Live Demo](${p.liveLink})` : ""
              ].filter(Boolean).join(" | ");
              if (links) lines.push(links);
              lines.push("");
            }
          });
        }
        
        if (c.education && Array.isArray(c.education) && c.education.length > 0) {
          lines.push("## Education");
          c.education.forEach((edu: any) => {
            if (edu.college || edu.degree) {
              lines.push(`### ${edu.degree || "Degree"} - ${edu.college || "College"}`);
              lines.push(`*Year: ${edu.year || "N/A"} | CGPA/Score: ${edu.cgpa || "N/A"}*`);
              lines.push("");
            }
          });
        }
        
        if (c.certifications && Array.isArray(c.certifications) && c.certifications.length > 0) {
          lines.push("## Certifications");
          c.certifications.forEach((cert: any) => {
            if (cert.name) {
              lines.push(`- **${cert.name}** (${cert.issuer || "Issuer"}), ${cert.date || "Date"}`);
            }
          });
          lines.push("");
        }
        
        return lines.join("\n").trim();
      }
    }
  }
  return "";
}
