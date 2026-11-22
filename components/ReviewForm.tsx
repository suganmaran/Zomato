"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const STAR_VALUES = [1, 2, 3, 4, 5];

export default function ReviewForm({ restaurantId }: { restaurantId: string }) {
  const router = useRouter();
  const [name, setName] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadName() {
      try {
        const response = await fetch(`/api/restaurants/${restaurantId}`, {
          cache: "no-store",
        });
        const body = await response.json();
        if (!cancelled && response.ok) {
          setName(body.name);
        }
      } catch {
        // The form still works; only the heading is missing.
      }
    }

    loadName();
    return () => {
      cancelled = true;
    };
  }, [restaurantId]);

  const canSubmit = rating > 0 && comment.trim() !== "" && !submitting;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId: Number(restaurantId),
          rating,
          comment,
        }),
      });

      const body = await response.json();

      if (!response.ok) {
        // Show exactly what the backend said. Do not invent a message.
        setError(body.error ?? "Could not save this review.");
        setSubmitting(false);
        return;
      }

      router.push(`/restaurant/${restaurantId}`);
    } catch {
      setError("Could not reach the server.");
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-[560px] px-6 py-12 sm:py-16">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">
        Write a review
      </p>
      <h1 className="mt-3 font-serif text-3xl leading-tight tracking-tight">
        {name ?? "Ludhiana Burrito"}
      </h1>

      <form onSubmit={handleSubmit} className="mt-10">
        <fieldset>
          <legend className="text-sm font-medium">Your rating</legend>
          <div className="mt-3 flex gap-1">
            {STAR_VALUES.map((value) => {
              const selected = value <= rating;
              return (
                <button
                  key={value}
                  type="button"
                  aria-label={`${value} ${value === 1 ? "star" : "stars"}`}
                  aria-pressed={rating === value}
                  onClick={() => setRating(value)}
                  className={`rounded-md px-1 text-4xl leading-none transition-colors ${
                    selected
                      ? "text-accent"
                      : "text-[#d9d1c6] hover:text-accent/60"
                  }`}
                >
                  ★
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-8">
          <label htmlFor="comment" className="text-sm font-medium">
            Your review
          </label>
          <textarea
            id="comment"
            rows={5}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="What did you order? How was it?"
            className="mt-3 w-full resize-none rounded-lg border border-line bg-white px-4 py-3 text-[15px] leading-relaxed outline-none transition-colors placeholder:text-muted/70 focus:border-accent"
          />
        </div>

        {error && (
          <p
            role="alert"
            className="mt-6 border-l-2 border-accent pl-3 text-sm text-accent"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="mt-8 inline-flex items-center rounded-lg bg-accent px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#93401f] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitting ? "Submitting…" : "Submit review"}
        </button>
      </form>
    </main>
  );
}
