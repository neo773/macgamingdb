import { type Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — MacGamingDB',
  description: 'How MacGamingDB collects, uses, and protects your data.',
};

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 text-gray-200">
      <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
      <p className="mt-2 text-sm text-gray-400">Last updated: June 8, 2026</p>

      <section className="mt-8 space-y-6 leading-relaxed">
        <p>
          MacGamingDB (&quot;we&quot;, &quot;our&quot;) operates the
          macgamingdb.app website and the MacGamingDB iOS application. This
          policy explains what we collect and how we use it.
        </p>

        <div>
          <h2 className="text-xl font-semibold text-white">What we collect</h2>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>
              <strong>Account data.</strong> When you sign in we store your
              email address (or the private relay address Apple provides with
              Sign in with Apple) and a display name derived from it.
            </li>
            <li>
              <strong>Content you submit.</strong> Game performance reviews,
              ratings, hardware details you choose to share, notes, and
              screenshots you upload.
            </li>
            <li>
              <strong>Steam library data.</strong> If you link your Steam
              account, we store your SteamID and your list of owned games and
              playtime so we can match them against our database. We never
              receive your Steam credentials.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white">
            How we use your data
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>To operate the service: showing reviews, stats, and your library.</li>
            <li>To attribute your reviews to your account.</li>
            <li>To send sign-in verification codes by email.</li>
          </ul>
          <p className="mt-3">
            We do not sell your data, show ads, or share personal data with
            third parties beyond the infrastructure providers that host the
            service.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white">Data retention and deletion</h2>
          <p className="mt-3">
            You can delete individual reviews at any time from the app or
            website. Deleting your account removes your account data and all
            associated reviews permanently. You can also unlink your Steam
            account at any time, which removes your stored library data.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white">Contact</h2>
          <p className="mt-3">
            Questions about this policy:{' '}
            <a className="text-blue-400 underline" href="mailto:support@macgamingdb.app">
              support@macgamingdb.app
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
