import { personalInfo } from '@/data/personal';

export default function Footer() {
  return (
    <footer className="section-container py-12 border-t border-background-subtle mt-20">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-center md:text-left">
          <p className="text-text-primary font-medium mb-1">{personalInfo.name}</p>
          <p className="text-text-muted text-sm">{personalInfo.location}</p>
        </div>

        <div className="flex flex-wrap gap-6 justify-center">
          <a
            href={`mailto:${personalInfo.email}`}
            className="text-text-muted hover:text-primary-blue transition-colors"
          >
            Email
          </a>
          <a
            href={`https://${personalInfo.github}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-muted hover:text-primary-blue transition-colors"
          >
            GitHub
          </a>
        </div>

        <div className="text-text-muted text-sm">
          © {new Date().getFullYear()} All rights reserved
        </div>
      </div>
    </footer>
  );
}
