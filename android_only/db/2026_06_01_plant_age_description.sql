-- Adds the optional plant age/life-stage field used by the Expo Add/Edit Plant form.
-- Existing custom age strings are cleared before adding the constraint so the
-- database matches the frontend dropdown values.

ALTER TABLE public.plants
ADD COLUMN IF NOT EXISTS age_description VARCHAR(100);

UPDATE public.plants
SET age_description = NULL
WHERE age_description IS NOT NULL
  AND age_description NOT IN (
    'Cutting / propagation',
    'Seedling',
    'Young plant',
    'Mature plant',
    'Established plant'
  );

ALTER TABLE public.plants
DROP CONSTRAINT IF EXISTS plants_age_description_chk;

ALTER TABLE public.plants
ADD CONSTRAINT plants_age_description_chk
CHECK (
  age_description IS NULL OR age_description IN (
    'Cutting / propagation',
    'Seedling',
    'Young plant',
    'Mature plant',
    'Established plant'
  )
);
