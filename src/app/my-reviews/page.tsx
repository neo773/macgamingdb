import { createPrismaClient } from "@/lib/prisma";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import MyReviewsClient from "./client";

export default async function MyReviewsPage() {
  const prisma = createPrismaClient(
    process.env.NODE_ENV === "production"
      ? new PrismaLibSQL({
          url: `${process.env.LIBSQL_DATABASE_URL}`,
          authToken: `${process.env.LIBSQL_DATABASE_TOKEN}`,
        })
      : undefined
  );

  const session = await auth(prisma).api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return <div>Not authenticated</div>;
  }

  const userReviews = await prisma.gameReview.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      game: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return <MyReviewsClient userReviews={userReviews} isAuthenticated={true} />;
}
