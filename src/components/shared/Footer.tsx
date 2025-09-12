import React from 'react';

const Footer = () => {
  return (
    <footer className="mt-auto w-full py-6 text-center text-gray-600 relative">
      <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center justify-center md:justify-between gap-4 md:gap-0">
        <p className="text-xs md:text-sm">
          © {new Date().getFullYear()} MacGamingDB - A community resource for
          Mac gamers
        </p>
        <div className="flex items-center gap-4">
          <a
            href="https://x.com/n3o773"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-gray-400 transition-colors flex items-center gap-2"
          >
            𝕏
          </a>
          <a href="https://www.buymeacoffee.com/huzef">
            <img
              className="w-26 mt-1"
              src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
              alt="Buy Me A Coffee"
            />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
