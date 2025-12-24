import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/modules/layout/components/Header';
import Footer from '@/modules/layout/components/Footer';
import { Container } from '@/components/ui/container';

export function GamePageError() {
  return (
    <div className="min-h-dvh flex flex-col bg-black">
      <Header />
      <Container>
        <div className="mb-4">
          <Link
            href="/"
            className="text-blue-400 hover:text-blue-300 inline-flex items-center"
          >
            <ChevronLeft className="text-blue-400" />
            Home
          </Link>
        </div>

        <Card className="bg-primary-gradient shadow-lg mt-8">
          <CardContent className="p-8">
            <h1 className="text-2xl font-bold text-white mb-4">
              Game Information Temporarily Unavailable
            </h1>
            <p className="text-gray-300 mb-4">
              We're having trouble loading the information for this game. This could be
              due to:
            </p>
            <ul className="list-disc pl-5 text-gray-300 mb-6 space-y-2">
              <li>Temporary Steam API unavailability</li>
              <li>Network connectivity issues</li>
              <li>Server-side caching problems</li>
            </ul>
            <p className="text-gray-300">
              Please try again later or return to the{' '}
              <Link href="/" className="text-blue-400 hover:underline">
                home page
              </Link>
              .
            </p>
          </CardContent>
        </Card>
      </Container>
      <Footer />
    </div>
  );
}
