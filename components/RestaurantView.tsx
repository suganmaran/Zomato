"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { RestaurantDTO, ReviewDTO } from "@/lib/types";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

function ReviewText({ review }: { review: ReviewDTO }) {
  return (
    <>
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-sm font-medium text-accent">
          {review.rating} / 5
        </span>
        <time className="text-xs text-muted" dateTime={review.createdAt}>
          {formatDate(review.createdAt)}
        </time>
      </div>
      <p className="mt-2 text-[15px] leading-relaxed">{review.comment}</p>
    </>
  );
}

export default function RestaurantView({ id }: { id: string }) {
  const [data, setData] = useState<RestaurantDTO | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch(`/api/restaurants/${id}`, {
          cache: "no-store",
        });
        const body = await response.json();

        if (cancelled) return;

        if (!response.ok) {
          setError(body.error ?? "Could not load this restaurant.");
          return;
        }

        setData(body as RestaurantDTO);
      } catch {
        if (!cancelled) {
          setError("Could not reach the server.");
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (error) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-[560px] px-6 py-16">
        <p className="text-sm text-accent">{error}</p>
        <Link
          href="/restaurant/1"
          className="mt-6 inline-block text-sm underline underline-offset-4"
        >
          Go to Ludhiana Burrito
        </Link>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-[560px] px-6 py-16">
        <p className="text-sm text-muted">Loading…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-[560px] px-6 py-12 sm:py-16">
      <header>
        <h1 className="font-serif text-4xl leading-tight tracking-tight">
          {data.name}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {data.cuisine} · {data.area}
        </p>
      </header>

      <section className="mt-10 border-b border-line pb-10">
        <div className="flex items-end gap-3">
          <span className="font-serif text-7xl leading-none tracking-tight">
            {data.averageRating === null ? "—" : data.averageRating}
          </span>
          <span className="pb-2 text-sm text-muted">
            {data.averageRating === null ? "no ratings yet" : "average rating"}
            {" · "}
            {data.totalReviews}{" "}
            {data.totalReviews === 1 ? "review" : "reviews"}
          </span>
        </div>
      </section>

      {data.latestReview ? (
        <section className="mt-10">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">
            Latest review
          </p>
          <div className="mt-3 rounded-xl border border-line bg-card p-5">
            <ReviewText review={data.latestReview} />
          </div>
        </section>
      ) : (
        <section className="mt-10 rounded-xl border border-line bg-card p-6">
          <p className="font-serif text-xl">No reviews yet.</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Be the first to say what you thought.
          </p>
        </section>
      )}

      {data.reviews.length > 0 && (
        <section className="mt-10">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">
            Earlier reviews
          </p>
          <ul className="mt-2 divide-y divide-line">
            {data.reviews.map((review) => (
              <li key={review.id} className="py-5">
                <ReviewText review={review} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-12">
        <Link
          href={`/review/${id}`}
          className="inline-flex items-center rounded-lg bg-accent px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#93401f]"
        >
          Write a review
        </Link>
      </div>
    </main>
  );
}
