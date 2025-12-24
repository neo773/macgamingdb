'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import Acccount from '@/components/ui/account';
import { Map, Menu, Trophy, X, Heart } from 'lucide-react';
import { LogoIcon } from './LogoIcon';
import { DonationDialog } from './DonationDialog';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="relative w-full">
      <div className="relative z-50 mx-auto flex w-full max-w-7xl flex-col items-center justify-between px-4 md:flex-row ">
        <div className="w-full py-8 md:px-8 flex justify-center">
          <div className="max-w-7xl w-full">
            <nav className="bg-input/30 border-2 border-input/70 backdrop-blur-sm rounded-full px-5 py-3 flex items-center justify-between shadow-lg">
              <Link href={'/'} className="flex items-center">
                <LogoIcon className="size-6 mr-2" />
                <h1 className="text-xl font-medium bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
                  MacGamingDB
                </h1>
              </Link>

              <div className="flex items-center gap-6">
                <div className="hidden sm:flex items-center space-x-4">
                  <DonationDialog>
                    <button className="text-blue-400 hover:text-white px-3 py-1 transition-colors flex items-center gap-2 cursor-pointer">
                      <Heart className="size-4 " />
                      Donate
                    </button>
                  </DonationDialog>
                  <Acccount />
                  <Link
                    href="/contributors"
                    className="text-gray-300 hover:text-white px-3 py-1 transition-colors flex items-center gap-2"
                  >
                    <Trophy className="size-4" />
                    Contributors
                  </Link>
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
              <div className="sm:hidden fixed top-[85px] left-0 right-0 mx-4 mt-4 bg-[#1B1B1D] border border-input/70 rounded-xl p-4 shadow-lg z-50">
                <div className="flex flex-col space-y-4">
                  <DonationDialog>
                    <button className="text-blue-400 hover:text-white px-3 py-2 transition-colors flex items-center gap-2 cursor-pointer w-full text-left">
                      <Heart className="size-4" />
                      Donate
                    </button>
                  </DonationDialog>
                  <Acccount />
                  <Link
                    href="/contributors"
                    className="text-gray-300 hover:text-white px-3 py-2 transition-colors flex items-center gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Trophy className="size-4" />
                    Contributors
                  </Link>
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
