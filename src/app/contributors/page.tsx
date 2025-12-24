import Header from '@/modules/layout/components/Header';
import Footer from '@/modules/layout/components/Footer';
import { createServerHelpers } from '@/lib/trpc/server';
import ContributorsClient from './client';
import { Container } from '@/components/ui/container';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // revalidate every hour

export default async function ContributorsPage() {
  const helpers = await createServerHelpers();

  const contributorsData = await helpers.contributor.getTopContributors.fetch({
    limit: 20,
  });

  return (
    <div className="min-h-dvh flex flex-col">
      <Header />

      <Container>
        <h1 className="text-3xl md:text-4xl text-white font-bold mb-2">
          Contributors
        </h1>
        <p className="text-gray-400 mb-8">
          Recognizing our community members who help make Mac gaming better for
          everyone.
        </p>

        <ContributorsClient contributorsData={contributorsData} />
      </Container>

      <Footer />
    </div>
  );
}
