-- Migration: set default ratings to 0 and recompute aggregates
BEGIN;

-- Set default rating to 0 for new rows
ALTER TABLE public.garages ALTER COLUMN rating SET DEFAULT 0;
ALTER TABLE public.spare_parts ALTER COLUMN rating SET DEFAULT 0;

-- Ensure existing NULL ratings become 0
UPDATE public.garages SET rating = 0 WHERE rating IS NULL;
UPDATE public.spare_parts SET rating = 0 WHERE rating IS NULL;

-- Recompute garage average rating and review_count from reviews table
UPDATE public.garages g
SET
  rating = COALESCE(sub.avg_rating, 0),
  review_count = COALESCE(sub.count_reviews, 0)
FROM (
  SELECT garage_id, ROUND(AVG(rating)::numeric, 2) AS avg_rating, COUNT(*)::int AS count_reviews
  FROM public.reviews
  WHERE garage_id IS NOT NULL
  GROUP BY garage_id
) AS sub
WHERE g.id = sub.garage_id;

-- Garages with no reviews should have rating 0 and review_count 0
UPDATE public.garages SET review_count = 0 WHERE review_count IS NULL;
UPDATE public.garages SET rating = 0 WHERE id NOT IN (SELECT DISTINCT garage_id FROM public.reviews WHERE garage_id IS NOT NULL);

COMMIT;
