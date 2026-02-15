-- Add Clinic Address Fields for Practitioners
-- This migration adds dedicated clinic location fields separate from service location

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS clinic_address TEXT,
ADD COLUMN IF NOT EXISTS clinic_latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS clinic_longitude DECIMAL(11, 8);

COMMENT ON COLUMN public.users.clinic_address IS 'Physical address of practitioner clinic or practice location';
COMMENT ON COLUMN public.users.clinic_latitude IS 'Latitude of clinic location for mapping';
COMMENT ON COLUMN public.users.clinic_longitude IS 'Longitude of clinic location for mapping';

