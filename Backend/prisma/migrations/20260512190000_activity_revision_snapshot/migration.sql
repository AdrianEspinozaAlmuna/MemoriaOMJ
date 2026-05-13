ALTER TABLE actividad
ADD COLUMN IF NOT EXISTS revision_original_data JSONB;