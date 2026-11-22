-- The two tables. Note what is NOT here:
-- no average_rating column, no latest_review column.
-- Those are answers we compute, not facts we store.

CREATE TABLE IF NOT EXISTS restaurants (
  id        SERIAL PRIMARY KEY,
  name      TEXT NOT NULL,
  cuisine   TEXT NOT NULL,
  area      TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS reviews (
  id            SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id),
  rating        INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment       TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed one restaurant. The explicit id makes /restaurant/1 predictable.
INSERT INTO restaurants (id, name, cuisine, area)
VALUES (1, 'Ludhiana Burrito', 'Indian', 'Sector 32')
ON CONFLICT (id) DO NOTHING;

-- Seed three reviews only when the table is still empty for this restaurant.
INSERT INTO reviews (restaurant_id, rating, comment, created_at)
SELECT 1, 5, 'Paneer burrito is unreal', NOW() - INTERVAL '8 days'
WHERE NOT EXISTS (SELECT 1 FROM reviews WHERE restaurant_id = 1);

INSERT INTO reviews (restaurant_id, rating, comment, created_at)
SELECT 1, 4, 'Good, but slow service', NOW() - INTERVAL '6 days'
WHERE (SELECT COUNT(*) FROM reviews WHERE restaurant_id = 1) = 1;

INSERT INTO reviews (restaurant_id, rating, comment, created_at)
SELECT 1, 4, 'Solid. Would repeat.', NOW() - INTERVAL '2 days'
WHERE (SELECT COUNT(*) FROM reviews WHERE restaurant_id = 1) = 2;

-- Keep the SERIAL sequence in step after inserting an explicit id.
SELECT setval(
  pg_get_serial_sequence('restaurants', 'id'),
  GREATEST((SELECT MAX(id) FROM restaurants), 1)
);
