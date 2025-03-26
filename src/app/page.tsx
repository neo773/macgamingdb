import SearchBar from '@/components/search/search-bar';
import Image from 'next/image';
import { Metadata } from 'next';
import * as React from "react"
import { SVGProps } from "react"

export const metadata: Metadata = {
  title: 'MacGamingDB - Game Compatibility Database for Mac',
  description: 'Discover how Windows games perform on Mac with different compatibility methods like CrossOver and Parallels.',
  openGraph: {
    title: 'MacGamingDB - Game Compatibility Database for Mac',
    description: 'Discover how Windows games perform on Mac with different compatibility methods like CrossOver and Parallels.',
    type: 'website',
  },
};


const GameIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 231.062 144.438"
    {...props}
  >
    <path
      fill={props.fill || "#fff"}
      fillOpacity={0.85}
      d="M49.063 56c0-3.5 2.187-5.75 5.937-5.75h16.25V34.062c0-3.624 2.125-5.874 5.688-5.874 3.437 0 5.562 2.25 5.562 5.875V50.25h15.625c3.937 0 6.313 2.25 6.313 5.75 0 3.688-2.376 5.938-6.313 5.938H82.5v16.25c0 3.624-2.125 5.874-5.563 5.874-3.562 0-5.687-2.25-5.687-5.874v-16.25H55c-3.75 0-5.938-2.25-5.938-5.938Zm117.687-1.25c-6.312 0-11.562-5.125-11.562-11.563 0-6.437 5.25-11.562 11.562-11.562 6.438 0 11.625 5.125 11.625 11.563 0 6.437-5.187 11.562-11.625 11.562Zm-24.812 24.625a11.536 11.536 0 0 1-11.563-11.563c0-6.374 5.187-11.562 11.563-11.562 6.437 0 11.624 5.188 11.624 11.563 0 6.437-5.187 11.562-11.624 11.562ZM29.813 144.438c10.375 0 18.062-3.938 24.687-12.126l14.875-18c2.125-2.562 4.5-3.75 7.063-3.75h78.187c2.563 0 4.937 1.188 7.063 3.75l14.812 18c6.688 8.188 14.375 12.126 24.75 12.126 17.875 0 29.812-11.938 29.812-30.25 0-7.876-1.874-17-5-27.5-4.937-16.5-13.562-38.938-21.874-56.5-6.813-14.25-10.25-20.5-26.813-24.25C161.938 2.374 140.812.125 115.5.125c-25.25 0-46.375 2.25-61.813 5.813-16.562 3.75-20 10-26.812 24.25-8.313 17.562-16.938 40-21.875 56.5-3.125 10.5-5 19.624-5 27.5 0 18.312 11.938 30.25 29.813 30.25Z"
    />
  </svg>
)


export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-8">
      <header className="w-full max-w-7xl flex flex-col items-center justify-center py-12 text-center">
        <h1 className="text-4xl font-bold mb-4">
          <GameIcon className="w-10 h-10 inline-block mr-2" fill="#000" />
          MacGamingDB
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl">
          Find out how your favorite games perform on Mac across different compatibility layers
        </p>
        
        <SearchBar />
      </header>

      <main className="w-full max-w-7xl flex-1 py-8">
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <div className="text-blue-600 dark:text-blue-400 text-3xl mb-4">1</div>
              <h3 className="text-xl font-semibold mb-2">Search</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Find the game you're interested in playing on your Mac
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <div className="text-blue-600 dark:text-blue-400 text-3xl mb-4">2</div>
              <h3 className="text-xl font-semibold mb-2">Compare</h3>
              <p className="text-gray-600 dark:text-gray-400">
                See how it performs with different translation layers and methods
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <div className="text-blue-600 dark:text-blue-400 text-3xl mb-4">3</div>
              <h3 className="text-xl font-semibold mb-2">Play</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Choose the best method for your hardware and start gaming
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Compatibility Methods</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">CrossOver</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Run Windows games directly on macOS using different translation layers like DXVK, DXMT, and D3D Metal.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">Parallels</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Run Windows games in a virtual machine for better compatibility at the cost of some performance.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full py-6 border-t border-gray-200 dark:border-gray-800 text-center text-gray-600 dark:text-gray-400">
        <p>© {new Date().getFullYear()} MacGamingDB - A community resource for Mac gamers</p>
      </footer>
    </div>
  );
}
