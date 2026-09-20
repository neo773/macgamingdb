import Link from 'next/link';
import { type Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { Container } from 'macgamingdb-ui/layout/Container';
import { Header } from '@/modules/layout/components/Header';
import { Footer } from '@/modules/layout/components/Footer';
import { SITE_URL } from '@/modules/layout/constants/SITE_URL';
import { createServerHelpers } from '@/modules/trpc/utils/createServerHelpers';
import { GAME_CATEGORIES } from '@/modules/category/constants/GAME_CATEGORIES';
import { isGameCategorySlug } from '@/modules/category/utils/isGameCategorySlug';
import { buildCategoryGamesInput } from '@/modules/category/utils/buildCategoryGamesInput';
import { generateCategoryJsonLd } from '@/modules/category/utils/generateCategoryJsonLd';
import { CategoryGameGrid } from '@/modules/category/components/CategoryGameGrid';
import { CategoryLinks } from '@/modules/category/components/CategoryLinks';

export const revalidate = 3600;

export const generateStaticParams = async () =>
  Object.keys(GAME_CATEGORIES).map((category) => ({ category }));

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> => {
  const { category: categorySlug } = await params;

  if (!isGameCategorySlug(categorySlug)) {
    return { title: 'Mac Games | MacGamingDB' };
  }

  const category = GAME_CATEGORIES[categorySlug];

  return {
    title: category.metaTitle,
    description: category.metaDescription,
    alternates: {
      canonical: `${SITE_URL}/mac-games/${categorySlug}`,
    },
    openGraph: {
      title: category.metaTitle,
      description: category.metaDescription,
      type: 'website',
    },
  };
};

const MacGamesCategoryPage = async ({
  params,
}: {
  params: Promise<{ category: string }>;
}) => {
  const { category: categorySlug } = await params;

  if (!isGameCategorySlug(categorySlug)) {
    notFound();
  }

  const category = GAME_CATEGORIES[categorySlug];
  const helpers = await createServerHelpers();
  const initialGamesPage = await helpers.game.getGames.fetch(
    buildCategoryGamesInput(category),
  );

  const jsonLd = generateCategoryJsonLd({ slug: categorySlug, category });

  return (
    <div className="min-h-dvh flex flex-col bg-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <Container>
        <div className="mb-4">
          <Link
            href="/mac-games"
            className="inline-flex items-center text-sm text-gray-400 transition-colors hover:text-white"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            All Mac games
          </Link>
        </div>

        <div className="mb-8 max-w-3xl">
          <h1 className="mb-3 text-3xl font-bold text-white md:text-4xl">
            {category.heading}
          </h1>
          <p className="mb-4 text-lg text-gray-400">{category.subheading}</p>
          <p className="leading-relaxed text-gray-300">
            {category.introduction}
          </p>
        </div>

        <CategoryGameGrid
          category={category}
          initialGamesPage={initialGamesPage}
        />

        <CategoryLinks
          currentSlug={categorySlug}
          title="Browse other Mac gaming categories"
        />
      </Container>
      <Footer />
    </div>
  );
};

export default MacGamesCategoryPage;
