import React from 'react';
import Link from 'next/link';
import { Activity, BookOpen, Github, Map, Trophy } from 'lucide-react';
import { LogoIcon } from './LogoIcon';

const Footer = () => {
  return (
    <footer className="mt-auto w-full relative">
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <Link href="/" className="flex items-center gap-2 w-fit">
              <LogoIcon className="size-5" />
              <span className="text-lg font-medium bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
                MacGamingDB
              </span>
            </Link>
            <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
              A community-driven resource helping Mac gamers discover and share
              game compatibility information.
            </p>
          </div>

          {/* Resources */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-medium text-gray-300">Resources</h3>
            <nav className="flex flex-col gap-2.5">
              <Link
                href="/blog"
                className="text-sm text-gray-500 hover:text-white transition-colors w-fit flex items-center gap-2"
              >
                <BookOpen className="size-3.5" />
                Blog
              </Link>
              <Link
                href="/contributors"
                className="text-sm text-gray-500 hover:text-white transition-colors w-fit flex items-center gap-2"
              >
                <Trophy className="size-3.5" />
                Contributors
              </Link>
              <Link
                href="https://macgamingdb.userjot.com/"
                target="_blank"
                className="text-sm text-gray-500 hover:text-white transition-colors w-fit flex items-center gap-2"
              >
                <Map className="size-3.5" />
                Roadmap
              </Link>
            </nav>
          </div>

          {/* Community */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-medium text-gray-300">Community</h3>
            <nav className="flex flex-col gap-2.5">
              <Link
                href="https://github.com/neo773/macgamingdb"
                target="_blank"
                className="text-sm text-gray-500 hover:text-white transition-colors w-fit flex items-center gap-2"
              >
                <Github className="size-3.5" />
                GitHub
              </Link>
              <a
                href="https://x.com/n3o773"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-500 hover:text-white transition-colors w-fit flex items-center gap-2"
              >
                <span className="text-base leading-none">𝕏</span>
                Twitter
              </a>
              <a
                href="https://macgamingdb.betteruptime.com/"
                target="_blank"
                className="text-sm text-gray-500 hover:text-white transition-colors w-fit flex items-center gap-2"
              >
                <Activity className="size-3.5" />
                Uptime Status
              </a>
            </nav>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-sm text-gray-500">
            &copy; 2025&ndash;{new Date().getFullYear()} MacGamingDB
          </p>
          <p className="text-sm text-gray-500">
            Made with &#10084;&#65039; in Mumbai &#127470;&#127475;
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
