-- Create event_category enum with predefined categories
CREATE TYPE event_category AS ENUM (
    'music',
    'sports',
    'food',
    'art',
    'education',
    'technology',
    'health',
    'wellness',
    'business',
    'religion',
    'community',
    'entertainment',
    'culture',
    'workshop',
    'conference',
    'networking',
    'other'
);

-- Add a temporary column to store the enum value
ALTER TABLE events ADD COLUMN category_enum event_category;

-- Migrate existing data: convert VARCHAR category to enum
-- Map common category strings to enum values (case-insensitive)
UPDATE events
SET category_enum = CASE
    WHEN LOWER(category) IN ('music', 'música', 'musica', 'musical', 'show', 'concerto') THEN 'music'::event_category
    WHEN LOWER(category) IN ('sports', 'esporte', 'esportes', 'sport', 'atividade física', 'atividade_fisica') THEN 'sports'::event_category
    WHEN LOWER(category) IN ('food', 'culinária', 'culinaria', 'comida', 'gastronomia', 'receita', 'cooking') THEN 'food'::event_category
    WHEN LOWER(category) IN ('art', 'arte', 'artístico', 'artistico', 'exposição', 'exposicao') THEN 'art'::event_category
    WHEN LOWER(category) IN ('education', 'educação', 'educacao', 'educacional', 'curso', 'palestra', 'aula') THEN 'education'::event_category
    WHEN LOWER(category) IN ('technology', 'tecnologia', 'tech', 'programação', 'programacao', 'software') THEN 'technology'::event_category
    WHEN LOWER(category) IN ('health', 'saúde', 'saude', 'saudavel', 'médico', 'medico') THEN 'health'::event_category
    WHEN LOWER(category) IN ('wellness', 'bem-estar', 'bem_estar', 'yoga', 'meditação', 'meditacao', 'fitness') THEN 'wellness'::event_category
    WHEN LOWER(category) IN ('business', 'negócios', 'negocios', 'empreendedorismo', 'startup') THEN 'business'::event_category
    WHEN LOWER(category) IN ('religion', 'religião', 'religiao', 'religioso', 'espiritual') THEN 'religion'::event_category
    WHEN LOWER(category) IN ('community', 'comunidade', 'comunitário', 'comunitario', 'social') THEN 'community'::event_category
    WHEN LOWER(category) IN ('entertainment', 'entretenimento', 'diversão', 'diversao', 'festival') THEN 'entertainment'::event_category
    WHEN LOWER(category) IN ('culture', 'cultura', 'cultural', 'tradição', 'tradicao') THEN 'culture'::event_category
    WHEN LOWER(category) IN ('workshop', 'oficina', 'workshop') THEN 'workshop'::event_category
    WHEN LOWER(category) IN ('conference', 'conferência', 'conferencia', 'simpósio', 'simposio') THEN 'conference'::event_category
    WHEN LOWER(category) IN ('networking', 'networking', 'networking', 'encontro profissional', 'encontro_profissional') THEN 'networking'::event_category
    ELSE 'other'::event_category
END
WHERE category_enum IS NULL;

-- Set default value for any NULL categories
UPDATE events
SET category_enum = 'other'::event_category
WHERE category_enum IS NULL;

-- Make the new column NOT NULL
ALTER TABLE events ALTER COLUMN category_enum SET NOT NULL;

-- Drop the old category column
ALTER TABLE events DROP COLUMN category;

-- Rename the new column to category
ALTER TABLE events RENAME COLUMN category_enum TO category;

-- Drop the old index on category (it was on VARCHAR)
DROP INDEX IF EXISTS idx_events_category;

-- Create new index on the enum column
CREATE INDEX idx_events_category ON events(category);

-- Add comment to the enum type for documentation
COMMENT ON TYPE event_category IS 'Predefined categories for events: music, sports, food, art, education, technology, health, wellness, business, religion, community, entertainment, culture, workshop, conference, networking, other';

