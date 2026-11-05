import { type Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact — MacGamingDB',
  description: 'How to get in touch with MacGamingDB.',
};

const ContactPage = () => {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 text-gray-200">
      <h1 className="text-3xl font-bold text-white">Contact</h1>

      <section className="mt-8 space-y-6 leading-relaxed">
        <p>
          Questions, feedback, or issues with the website or the iOS app? Reach
          out and we&apos;ll get back to you.
        </p>

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
    </main>
  );
};

export default ContactPage;
