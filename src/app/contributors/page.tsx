import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import { createServerHelpers } from "@/lib/trpc/server";
import ContributorsClient from "./client";

export const dynamic = "force-dynamic";
export const revalidate = 3600; // revalidate every hour

export default async function ContributorsPage() {
  const helpers = await createServerHelpers();
  
  // Fetch top contributors
  const contributorsData = await helpers.contributor.getTopContributors.fetch({
    limit: 20,
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-8 py-8">
        <h1 className="text-3xl md:text-4xl text-white font-bold mb-2">Contributors</h1>
        <p className="text-gray-400 mb-8">
          Recognizing our community members who help make Mac gaming better for everyone.
        </p>
        
        <ContributorsClient contributorsData={contributorsData} />
      </main>
      
      <Footer />
    </div>
  );
} 