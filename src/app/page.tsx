import { SteamGameSearchObject } from "@/server/helpers/steam";
import { LogoIcon } from "@/components/shared/LogoIcon";
import Footer from "@/components/shared/Footer";
import Header from "@/components/shared/Header";
import { createServerHelpers } from "@/lib/trpc/server";
import HomeClient from "./home-client";

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // revalidate every hour

export default async function Home() {
  // Server-side fetch of all initial data
  const helpers = await createServerHelpers();
  
  // Get global stats without any filters to use as initial data
  const initialData = await helpers.game.getInitialStats.fetch();
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <p className="text-xl md:text-3xl text-gray-300 mb-8 mx-6 text-center font-medium md:mx-auto">
        Find out how your favorite games <br />
        perform on Mac across different compatibility layers
      </p>

      <main className="flex-1 w-full max-w-7xl mx-auto px-8 pb-8 pt-6">
        <HomeClient initialData={initialData} />
      </main>
      
      <Footer />
    </div>
  );
}
