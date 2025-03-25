import SearchBar from '@/components/search/search-bar';
import Image from 'next/image';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MacGamingDB - Game Compatibility Database for Mac',
  description: 'Discover how Windows games perform on Mac with different compatibility methods like CrossOver and Parallels.',
  openGraph: {
    title: 'MacGamingDB - Game Compatibility Database for Mac',
    description: 'Discover how Windows games perform on Mac with different compatibility methods like CrossOver and Parallels.',
    type: 'website',
  },
};

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-8">
      <header className="w-full max-w-7xl flex flex-col items-center justify-center py-12 text-center">
        <h1 className="text-4xl font-bold mb-4">MacGamingDB</h1>
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
