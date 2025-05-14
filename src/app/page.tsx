import { SteamGameSearchObject } from "@/server/helpers/steam";
import { LogoIcon } from "@/components/shared/LogoIcon";
import Footer from "@/components/shared/Footer";
import Header from "@/components/shared/Header";
import { createServerHelpers } from "@/lib/trpc/server";
import HomeClient from "./home-client";

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // revalidate every hour

export default async function Home() {
  // Server-side fetch of the rating counts
  const helpers = await createServerHelpers();
  const { ratingCounts } = await helpers.game.getGames.fetch({ limit: 1, filter: 'ALL' });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <p className="text-xl md:text-3xl text-gray-300 mb-8 mx-6 text-center font-medium md:mx-auto">
        Find out how your favorite games <br />
        perform on Mac across different compatibility layers
      </p>

      <main className="flex-1 w-full max-w-7xl mx-auto px-8 pb-8 pt-6">
        <HomeClient ratingCounts={ratingCounts} />
      </main>
      
      <Footer />
    </div>
  );
}
