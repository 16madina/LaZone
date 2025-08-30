-- Corriger la contrainte property_type pour inclure les types commerciaux
ALTER TABLE public.listings DROP CONSTRAINT listings_property_type_check;

ALTER TABLE public.listings ADD CONSTRAINT listings_property_type_check 
CHECK (property_type = ANY (ARRAY['apartment'::text, 'house'::text, 'land'::text, 'commercial'::text]));