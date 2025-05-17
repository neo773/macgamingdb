"use client";

import Link from "next/link";
import React, { useState } from "react";
import Acccount from "../ui/account";
import { Map, Menu, X } from "lucide-react";
import { LogoIcon } from "./LogoIcon";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="relative w-full">
      <div className="fixed inset-0 w-full h-full z-0 pointer-events-none overflow-hidden grayscale-100">
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
            <nav className="bg-input/30 border-2 border-input/70 backdrop-blur-sm rounded-full px-5 py-3 flex items-center justify-between shadow-lg">
              <Link href={"/"} className="flex items-center">
                <LogoIcon className="size-6 mr-2" />
                <h1 className="text-xl font-medium bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
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
