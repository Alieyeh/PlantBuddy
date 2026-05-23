-- 2026-05-23: add watering frequency units for plant care profiles.
-- Run this in Supabase SQL Editor before deploying frontend code that writes
-- watering_frequency_unit.

ALTER TABLE public.plants
ADD COLUMN IF NOT EXISTS watering_frequency_unit TEXT NOT NULL DEFAULT 'days';

UPDATE public.plants
SET watering_frequency_unit = 'days'
WHERE watering_frequency_unit IS NULL;

ALTER TABLE public.plants
DROP CONSTRAINT IF EXISTS plants_watering_unit_chk;

ALTER TABLE public.plants
ADD CONSTRAINT plants_watering_unit_chk
CHECK (watering_frequency_unit IN ('days', 'weeks', 'months'));
