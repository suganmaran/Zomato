import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 }
    );
  }

  const { restaurantId, rating, comment } = (body ?? {}) as Record<
    string,
    unknown
  >;

  // Validation order matters: report the first thing that is wrong.
  if (
    typeof rating !== "number" ||
    !Number.isInteger(rating) ||
    rating < 1 ||
    rating > 5
  ) {
    return NextResponse.json(
      { error: "Rating must be a whole number from 1 to 5." },
      { status: 400 }
    );
  }

  if (typeof comment !== "string" || comment.trim() === "") {
    return NextResponse.json(
      { error: "Comment cannot be empty." },
      { status: 400 }
    );
  }

  if (
    typeof restaurantId !== "number" ||
    !Number.isInteger(restaurantId) ||
    restaurantId < 1
  ) {
    return NextResponse.json(
      { error: "Restaurant id must be a positive whole number." },
      { status: 400 }
    );
  }

  try {
    const sql = db();

    const restaurant = await sql`
      SELECT id FROM restaurants WHERE id = ${restaurantId}
    `;

    if (restaurant.length === 0) {
      return NextResponse.json(
        { error: "Restaurant does not exist." },
        { status: 400 }
      );
    }

    // One row in, one row out. No average is written anywhere.
    const inserted = (await sql`
      INSERT INTO reviews (restaurant_id, rating, comment)
      VALUES (${restaurantId}, ${rating}, ${comment.trim()})
      RETURNING id
    `) as { id: number }[];

    return NextResponse.json(
      { success: true, reviewId: inserted[0].id },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/reviews failed", error);
    return NextResponse.json(
      { error: "The server could not save this review." },
      { status: 500 }
    );
  }
}
