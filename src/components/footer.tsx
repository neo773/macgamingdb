import React from "react";
import { Github, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="mt-auto w-full py-6 border-t border-gray-900 text-center text-gray-600">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-center md:justify-between gap-4 md:gap-0">
        <p className="text-xs md:text-sm">
          © {new Date().getFullYear()} MacGamingDB - A community resource for
          Mac gamers
        </p>
        <div className="flex items-center gap-4">
          <a
            href="https://x.com/n3o773"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-gray-400 transition-colors"
          >
            <Twitter size={18} />
          </a>
          <a
            className="text-gray-500 hover:text-gray-400 transition-colors flex items-center gap-1 cursor-not-allowed"
            title="Source code coming soon"
          >
            <Github size={18} />
            <span className="text-xs">Coming soon</span>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
