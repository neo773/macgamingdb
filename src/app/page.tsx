import Footer from "@/components/shared/Footer";
import Header from "@/components/shared/Header";
import HomeClient from "./home-client";
import { createServerHelpers } from "@/lib/trpc/server";
import { SearchURLParamsKeys, createFilterConfig } from "@/lib/constants";

export const dynamic = "force-dynamic";
export const revalidate = 3600; // revalidate every hour

export default async function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const performanceParam = searchParams[SearchURLParamsKeys.PERFORMANCE] as string;
  const chipsetParam = searchParams[SearchURLParamsKeys.CHIPSET] as string;
  const filterConfig = createFilterConfig(performanceParam, chipsetParam);

  const helpers = await createServerHelpers();

  const GamesPage = await helpers.game.getGames.fetch(filterConfig);


  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <p className="text-xl md:text-3xl text-gray-300 mb-8 mx-6 text-center font-medium md:mx-auto">
        Find out how your favorite games <br />
        perform on Mac across different compatibility layers
      </p>

      <main className="flex-1 w-full max-w-7xl mx-auto px-8 pb-8 pt-6">
        <HomeClient 
          GamesPage={GamesPage} 
          PerformanceFilter={filterConfig.filter}
          ChipsetFilter={chipsetParam || "all"}
        />
      </main>
      
      <Footer />
    </div>
  );
}
