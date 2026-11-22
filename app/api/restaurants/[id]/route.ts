import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

type RestaurantRow = {
  id: number;
  name: string;
  cuisine: string;
  area: string;
};

type ReviewRow = {
  id: number;
  rating: number;
  comment: string;
  created_at: string | Date;
};

type StatsRow = {
  average: number | null;
  count: number;
};

function toReview(row: ReviewRow) {
  return {
    id: row.id,
    rating: row.rating,
    comment: row.comment,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const restaurantId = Number(id);

  if (!Number.isInteger(restaurantId) || restaurantId < 1) {
    return NextResponse.json(
      { error: "Restaurant id must be a positive whole number." },
      { status: 404 }
    );
  }

  try {
    const sql = db();

    const restaurants = (await sql`
      SELECT id, name, cuisine, area
      FROM restaurants
      WHERE id = ${restaurantId}
    `) as RestaurantRow[];

    if (restaurants.length === 0) {
      return NextResponse.json(
        { error: "Restaurant not found." },
        { status: 404 }
      );
    }

    const restaurant = restaurants[0];

    // The answers are computed fresh on every request.
    const stats = (await sql`
      SELECT AVG(rating)::float8 AS average, COUNT(*)::int AS count
      FROM reviews
      WHERE restaurant_id = ${restaurantId}
    `) as StatsRow[];

    const latestRows = (await sql`
      SELECT id, rating, comment, created_at
      FROM reviews
      WHERE restaurant_id = ${restaurantId}
      ORDER BY created_at DESC, id DESC
      LIMIT 1
    `) as ReviewRow[];

    const latest = latestRows[0] ?? null;

    // Every review except the latest one, newest first, so the page can show
    // the latest separately without printing it twice.
    const olderRows = (
      latest
        ? await sql`
            SELECT id, rating, comment, created_at
            FROM reviews
            WHERE restaurant_id = ${restaurantId}
              AND id <> ${latest.id}
            ORDER BY created_at DESC, id DESC
          `
        : []
    ) as ReviewRow[];

    const average = stats[0]?.average ?? null;

    return NextResponse.json({
      name: restaurant.name,
      cuisine: restaurant.cuisine,
      area: restaurant.area,
      averageRating:
        average === null ? null : Math.round(average * 10) / 10,
      totalReviews: stats[0]?.count ?? 0,
      latestReview: latest ? toReview(latest) : null,
      reviews: olderRows.map(toReview),
    });
  } catch (error) {
    console.error("GET /api/restaurants/[id] failed", error);
    return NextResponse.json(
      { error: "The server could not load this restaurant." },
      { status: 500 }
    );
  }
}
