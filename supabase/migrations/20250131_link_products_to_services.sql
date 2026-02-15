-- Link practitioner_products to services_offered categories
-- This allows packages to be categorized by the services practitioners offer

-- Add service_category field to link products to services_offered values
ALTER TABLE public.practitioner_products
ADD COLUMN IF NOT EXISTS service_category TEXT;

-- Add index for filtering products by service category
CREATE INDEX IF NOT EXISTS idx_products_service_category 
ON public.practitioner_products(service_category) 
WHERE service_category IS NOT NULL;

-- Add composite index for practitioner + category queries
CREATE INDEX IF NOT EXISTS idx_products_practitioner_category 
ON public.practitioner_products(practitioner_id, service_category) 
WHERE service_category IS NOT NULL;

-- Add comment explaining the relationship
COMMENT ON COLUMN public.practitioner_products.service_category IS 
'Links product to a service from users.services_offered array. Values match service codes like "sports_injury_assessment", "deep_tissue", etc.';

