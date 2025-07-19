import Footer from "@/components/shared/Footer";
import Header from "@/components/shared/Header";
import HomeClient from "./home-client";
import { createServerHelpers } from "@/lib/trpc/server";
import { SearchURLParamsKeys, createFilterConfig, PlayMethodFilter } from "@/lib/constants";
import { Container } from "@/components/ui/container";

export const dynamic = "force-dynamic";
export const revalidate = 3600; // revalidate every hour

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const performanceParam = (await searchParams)[SearchURLParamsKeys.PERFORMANCE] as string;
  const chipsetParam = (await searchParams)[SearchURLParamsKeys.CHIPSET] as string;
  const playMethodParam = (await searchParams)[SearchURLParamsKeys.PLAY_METHOD] as PlayMethodFilter;
  
  const filterConfig = createFilterConfig(performanceParam, chipsetParam, playMethodParam);

  const helpers = await createServerHelpers();

  const GamesPage = await helpers.game.getGames.fetch(filterConfig);

  const ratingCounts = await helpers.game.getFilterCounts.fetch(filterConfig);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <p className="text-xl md:text-3xl text-gray-300 mb-8 mx-6 text-center font-medium md:mx-auto">
        Find out how your favorite games <br />
        perform on Mac across different compatibility layers
      </p>

      <Container>
        <HomeClient 
          GamesPage={{...GamesPage, ratingCounts}} 
          PerformanceFilter={filterConfig.performance}
          ChipsetFilter={chipsetParam || "all"}
          PlayMethodFilter={playMethodParam || "ALL"}
        />
      </Container>
      
      <Footer />
    </div>
  );
}
