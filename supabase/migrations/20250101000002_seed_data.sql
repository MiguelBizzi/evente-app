-- Seed data migration
-- Create user profile for Allan Bronzatto (organizer)
-- Note: This assumes the user already exists in auth.users with the ID below

-- Insert user profile for Allan Bronzatto
-- Using a fixed UUID for the profile so we can reference it in events
INSERT INTO user_profiles (id, user_id, type, created_at, updated_at)
VALUES (
  'a1b2c3d4-e5f6-4789-a012-345678901234'::uuid,
  '89399734-8615-4506-a734-e6488738b165'::uuid,
  'organizer'::user_type,
  NOW(),
  NOW()
)
ON CONFLICT (user_id) DO UPDATE
SET type = 'organizer'::user_type,
    updated_at = NOW();

-- Insert events with the organizer profile ID
INSERT INTO events (
  id, title, description, event_date, location, address, city, state, zip_code,
  category, organizer_id, capacity, price, image_url, is_active, created_at, updated_at
) VALUES
(
  gen_random_uuid(),
  'Festival de Jazz na Praça',
  'Uma noite inesquecível com os melhores talentos do jazz local e convidados especiais. Venha se encantar com a música que transforma a cidade.',
  '2024-07-15 19:00:00+00'::timestamptz,
  'Praça Central',
  'Praça Central, 123',
  'São Paulo',
  'SP',
  '01310-100',
  'music'::event_category,
  'a1b2c3d4-e5f6-4789-a012-345678901234'::uuid,
  500,
  0.00,
  'https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2?auto=format&fit=crop&w=800&q=80',
  true,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'Maratona Solidária da Cidade',
  'Corra por uma boa causa! Participe da nossa maratona beneficente e ajude a comunidade. Distâncias de 5km, 10km e 21km disponíveis.',
  '2024-08-20 08:00:00+00'::timestamptz,
  'Parque Municipal',
  'Av. Parque Municipal, 1000',
  'São Paulo',
  'SP',
  '01234-567',
  'sports'::event_category,
  'a1b2c3d4-e5f6-4789-a012-345678901234'::uuid,
  1000,
  25.00,
  'https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=800&q=80',
  true,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'Workshop de Culinária Italiana',
  'Aprenda a fazer massas frescas e molhos autênticos com chefs italianos. Inclui degustação e receitas exclusivas para levar para casa.',
  '2024-06-10 14:00:00+00'::timestamptz,
  'Escola de Culinária Bella',
  'Rua das Flores, 456',
  'Rio de Janeiro',
  'RJ',
  '20000-000',
  'food'::event_category,
  'a1b2c3d4-e5f6-4789-a012-345678901234'::uuid,
  20,
  150.00,
  'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80',
  true,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'Exposição de Arte Contemporânea',
  'Explore as obras de artistas locais e internacionais em uma exposição única. Visitas guiadas disponíveis nos finais de semana.',
  '2024-07-01 10:00:00+00'::timestamptz,
  'Galeria de Arte Moderna',
  'Av. Cultural, 789',
  'Belo Horizonte',
  'MG',
  '30112-000',
  'art'::event_category,
  'a1b2c3d4-e5f6-4789-a012-345678901234'::uuid,
  NULL,
  30.00,
  'https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&w=800&q=80',
  true,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'Conferência de Tecnologia e Inovação',
  'Palestras sobre as últimas tendências em tecnologia, IA, blockchain e startups. Networking e oportunidades de negócio.',
  '2024-09-15 09:00:00+00'::timestamptz,
  'Centro de Convenções',
  'Av. Inovação, 2000',
  'São Paulo',
  'SP',
  '04567-890',
  'technology'::event_category,
  'a1b2c3d4-e5f6-4789-a012-345678901234'::uuid,
  300,
  200.00,
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
  true,
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'Aula de Yoga ao Ar Livre',
  'Pratique yoga em contato com a natureza. Todos os níveis são bem-vindos. Traga seu tapete e venha relaxar conosco.',
  '2024-06-08 07:00:00+00'::timestamptz,
  'Parque do Ibirapuera',
  'Parque do Ibirapuera',
  'São Paulo',
  'SP',
  '04094-000',
  'wellness'::event_category,
  'a1b2c3d4-e5f6-4789-a012-345678901234'::uuid,
  50,
  0.00,
  'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80',
  true,
  NOW(),
  NOW()
);

