import Footer from '@/modules/layout/components/Footer';
import Header from '@/modules/layout/components/Header';

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh flex flex-col">
      <Header />
      <div className="relative mx-auto max-w-4xl px-4 pt-8 pb-4 md:px-6 md:pt-12">
        {/* Decorative gradient background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/3 rounded-full blur-2xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/4 rounded-full blur-3xl"></div>
        </div>
      </div>
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 md:px-8 pb-12">
        <article className="prose prose-invert max-w-none">{children}</article>
      </main>
      <Footer />
    </div>
  );
}
