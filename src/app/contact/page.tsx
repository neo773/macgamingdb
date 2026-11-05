import { type Metadata } from 'next';
import { Header } from '@/modules/layout/components/Header';
import { Footer } from '@/modules/layout/components/Footer';
import { Container } from 'macgamingdb-ui/layout/Container';

export const metadata: Metadata = {
  title: 'Contact — MacGamingDB',
  description: 'How to get in touch with MacGamingDB.',
};

const ContactPage = () => {
  return (
    <div className="min-h-dvh flex flex-col">
      <Header />

      <Container>
        <h1 className="text-3xl md:text-4xl text-white font-bold mb-2">
          Contact
        </h1>
        <p className="text-gray-400 mb-8">
          Questions, feedback, or issues with the website or the iOS app? Reach
          out and we&apos;ll get back to you.
        </p>

        <section className="space-y-6 leading-relaxed text-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-white">Email</h2>
            <p className="mt-3">
              <a
                className="text-blue-400 underline"
                href="mailto:support@macgamingdb.app"
              >
                support@macgamingdb.app
              </a>
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white">Legal name</h2>
            <p className="mt-3">TAANNUM SALAHUDDIN ANSARI</p>
          </div>
        </section>
      </Container>

      <Footer />
    </div>
  );
};

export default ContactPage;
