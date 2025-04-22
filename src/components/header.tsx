"use client";

import Link from "next/link";
import React, { SVGProps, useState } from "react";
import Acccount from "./ui/account";
import { Map, Menu, X } from "lucide-react";
// Game controller icon component
const GameIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 231.062 144.438"
    {...props}
  >
    <defs>
      <linearGradient id="iconGradient" gradientTransform="rotate(90)">
        <stop offset="0%" stopColor="white" />
        <stop offset="100%" stopColor="#9ca3af" />
      </linearGradient>
    </defs>
    <path
      fill="url(#iconGradient)"
      fillOpacity={0.85}
      d="M49.063 56c0-3.5 2.187-5.75 5.937-5.75h16.25V34.062c0-3.624 2.125-5.874 5.688-5.874 3.437 0 5.562 2.25 5.562 5.875V50.25h15.625c3.937 0 6.313 2.25 6.313 5.75 0 3.688-2.376 5.938-6.313 5.938H82.5v16.25c0 3.624-2.125 5.874-5.563 5.874-3.562 0-5.687-2.25-5.687-5.874v-16.25H55c-3.75 0-5.938-2.25-5.938-5.938Zm117.687-1.25c-6.312 0-11.562-5.125-11.562-11.563 0-6.437 5.25-11.562 11.562-11.562 6.438 0 11.625 5.125 11.625 11.563 0 6.437-5.187 11.562-11.625 11.562Zm-24.812 24.625a11.536 11.536 0 0 1-11.563-11.563c0-6.374 5.187-11.562 11.563-11.562 6.437 0 11.624 5.188 11.624 11.563 0 6.437-5.187 11.562-11.624 11.562ZM29.813 144.438c10.375 0 18.062-3.938 24.687-12.126l14.875-18c2.125-2.562 4.5-3.75 7.063-3.75h78.187c2.563 0 4.937 1.188 7.063 3.75l14.812 18c6.688 8.188 14.375 12.126 24.75 12.126 17.875 0 29.812-11.938 29.812-30.25 0-7.876-1.874-17-5-27.5-4.937-16.5-13.562-38.938-21.874-56.5-6.813-14.25-10.25-20.5-26.813-24.25C161.938 2.374 140.812.125 115.5.125c-25.25 0-46.375 2.25-61.813 5.813-16.562 3.75-20 10-26.812 24.25-8.313 17.562-16.938 40-21.875 56.5-3.125 10.5-5 19.624-5 27.5 0 18.312 11.938 30.25 29.813 30.25Z"
    />
  </svg>
);

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="relative w-full">
      <div className="fixed inset-0 w-full h-full z-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-0 left-0"
          style={{
            transform: "translateY(-350px) rotate(-45deg)",
            width: 560,
            height: "200vh",
            background:
              "radial-gradient(68.54% 68.72% at 55.02% 31.46%, rgba(179, 217, 255, 0.08) 0px, rgba(26, 140, 255, 0.02) 50%, rgba(0, 115, 230, 0) 80%)",
          }}
        />
        <div
          className="absolute top-0 left-0"
          style={{
            transform: "rotate(-45deg) translate(5%, -50%)",
            transformOrigin: "left top",
            width: 240,
            height: "200vh",
            background:
              "radial-gradient(50% 50% at 50% 50%, rgba(179, 217, 255, 0.06) 0px, rgba(26, 140, 255, 0.02) 80%, transparent 100%)",
          }}
        />
        <div
          className="absolute top-0 left-0"
          style={{
            borderRadius: 20,
            transform: "rotate(-45deg) translate(-180%, -70%)",
            transformOrigin: "left top",
            width: 240,
            height: "200vh",
            background:
              "radial-gradient(50% 50% at 50% 50%, rgba(179, 217, 255, 0.04) 0px, rgba(0, 115, 230, 0.02) 80%, transparent 100%)",
          }}
        />
      </div>
      <div className="relative z-50 mx-auto flex w-full max-w-7xl flex-col items-center justify-between px-4 md:flex-row ">
        <div className="w-full py-8 px-4 sm:px-8 flex justify-center">
          <div className="max-w-7xl w-full">
            <nav className="backdrop-blur-sm bg-gray-900/50 border border-gray-800/60 rounded-full px-5 py-3 flex items-center justify-between shadow-lg">
              <Link href={"/"} className="flex items-center">
                <GameIcon className="size-6 mr-2" />
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
                  MacGamingDB
                </h1>
              </Link>

              <div className="flex items-center gap-6">
                <div className="hidden sm:flex items-center space-x-4">
                  <Acccount />
                  <Link
                    href="https://macgamingdb.userjot.com/"
                    className="text-gray-300 hover:text-white px-3 py-1 transition-colors flex items-center gap-2"
                    target="_blank"
                  >
                    <Map className="size-4" />
                    Roadmap
                  </Link>
                </div>
                <button
                  className="sm:hidden text-gray-300 hover:text-white"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  aria-label="Toggle mobile menu"
                >
                  {mobileMenuOpen ? (
                    <X className="size-6" />
                  ) : (
                    <Menu className="size-6" />
                  )}
                </button>
              </div>
            </nav>

            {/* Mobile menu */}
            {mobileMenuOpen && (
              <div className="sm:hidden fixed top-[85px] left-0 right-0 mx-8 mt-4 backdrop-blur-md bg-gray-900/90 border border-gray-800/60 rounded-xl p-4 shadow-lg z-50">
                <div className="flex flex-col space-y-4">
                  <Acccount />
                  <Link
                    href="https://macgamingdb.userjot.com/"
                    className="text-gray-300 hover:text-white px-3 py-2 transition-colors flex items-center gap-2"
                    target="_blank"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Map className="size-4" />
                    Roadmap
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
