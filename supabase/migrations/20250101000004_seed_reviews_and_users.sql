-- Seed data migration for reviews and additional user profiles
-- Create user profiles for Ana Paula, Beatriz Laiz, and Carlos Miguel
-- Note: This assumes the users already exist in auth.users with the IDs below

-- Insert user profiles for reviewers
INSERT INTO user_profiles (id, user_id, type, created_at, updated_at)
VALUES 
  -- Ana Paula
  (
    gen_random_uuid(),
    'e8a60886-fbea-465a-a2c3-4e61d898ea03'::uuid,
    'participant'::user_type,
    NOW(),
    NOW()
  ),
  -- Beatriz Laiz
  (
    gen_random_uuid(),
    'c8687446-0f4d-46ff-a6ea-bfd49e08d27b'::uuid,
    'participant'::user_type,
    NOW(),
    NOW()
  ),
  -- Carlos Miguel
  (
    gen_random_uuid(),
    'a2690edc-9be3-4305-af43-644bebf61d56'::uuid,
    'participant'::user_type,
    NOW(),
    NOW()
  )
ON CONFLICT (user_id) DO UPDATE
SET type = 'participant'::user_type,
    updated_at = NOW();

-- Create registrations for reviewers so they can create reviews
-- First, we need to get the event IDs by title
DO $$
DECLARE
  event_jazz_id UUID;
  event_maratona_id UUID;
  event_culinaria_id UUID;
  event_arte_id UUID;
  event_tech_id UUID;
  event_yoga_id UUID;
  ana_paula_profile_id UUID;
  beatriz_profile_id UUID;
  carlos_profile_id UUID;
BEGIN
  -- Get event IDs
  SELECT id INTO event_jazz_id FROM events WHERE title = 'Festival de Jazz na Praça' LIMIT 1;
  SELECT id INTO event_maratona_id FROM events WHERE title = 'Maratona Solidária da Cidade' LIMIT 1;
  SELECT id INTO event_culinaria_id FROM events WHERE title = 'Workshop de Culinária Italiana' LIMIT 1;
  SELECT id INTO event_arte_id FROM events WHERE title = 'Exposição de Arte Contemporânea' LIMIT 1;
  SELECT id INTO event_tech_id FROM events WHERE title = 'Conferência de Tecnologia e Inovação' LIMIT 1;
  SELECT id INTO event_yoga_id FROM events WHERE title = 'Aula de Yoga ao Ar Livre' LIMIT 1;

  -- Get user profile IDs
  SELECT id INTO ana_paula_profile_id FROM user_profiles WHERE user_id = 'e8a60886-fbea-465a-a2c3-4e61d898ea03'::uuid;
  SELECT id INTO beatriz_profile_id FROM user_profiles WHERE user_id = 'c8687446-0f4d-46ff-a6ea-bfd49e08d27b'::uuid;
  SELECT id INTO carlos_profile_id FROM user_profiles WHERE user_id = 'a2690edc-9be3-4305-af43-644bebf61d56'::uuid;

  -- Create registrations for Ana Paula
  IF event_culinaria_id IS NOT NULL AND ana_paula_profile_id IS NOT NULL THEN
    INSERT INTO registrations (user_id, event_id, status, registration_date, created_at, updated_at)
    VALUES (ana_paula_profile_id, event_culinaria_id, 'confirmed'::registration_status, NOW() - INTERVAL '5 days', NOW(), NOW())
    ON CONFLICT (user_id, event_id) DO NOTHING;
  END IF;

  -- Create registrations for Beatriz
  IF event_culinaria_id IS NOT NULL AND beatriz_profile_id IS NOT NULL THEN
    INSERT INTO registrations (user_id, event_id, status, registration_date, created_at, updated_at)
    VALUES (beatriz_profile_id, event_culinaria_id, 'confirmed'::registration_status, NOW() - INTERVAL '3 days', NOW(), NOW())
    ON CONFLICT (user_id, event_id) DO NOTHING;
  END IF;

  -- Create registrations for Carlos
  IF event_culinaria_id IS NOT NULL AND carlos_profile_id IS NOT NULL THEN
    INSERT INTO registrations (user_id, event_id, status, registration_date, created_at, updated_at)
    VALUES (carlos_profile_id, event_culinaria_id, 'confirmed'::registration_status, NOW() - INTERVAL '4 days', NOW(), NOW())
    ON CONFLICT (user_id, event_id) DO NOTHING;
  END IF;

  -- Create reviews for Workshop de Culinária Italiana
  -- Ana Paula's review (5 stars)
  IF event_culinaria_id IS NOT NULL AND ana_paula_profile_id IS NOT NULL THEN
    INSERT INTO reviews (user_id, event_id, rating, comment, review_date, created_at, updated_at)
    VALUES (
      ana_paula_profile_id,
      event_culinaria_id,
      5,
      'Uma experiência incrível! A variedade de comidas era sensacional e o ambiente muito divertido. Voltarei com certeza!',
      NOW() - INTERVAL '2 days',
      NOW(),
      NOW()
    )
    ON CONFLICT (user_id, event_id) DO UPDATE
    SET rating = 5,
        comment = 'Uma experiência incrível! A variedade de comidas era sensacional e o ambiente muito divertido. Voltarei com certeza!',
        review_date = NOW() - INTERVAL '2 days',
        updated_at = NOW();
  END IF;

  -- Carlos's review (4 stars)
  IF event_culinaria_id IS NOT NULL AND carlos_profile_id IS NOT NULL THEN
    INSERT INTO reviews (user_id, event_id, rating, comment, review_date, created_at, updated_at)
    VALUES (
      carlos_profile_id,
      event_culinaria_id,
      4,
      'Ótimo evento, muita opção e música boa. A fila de alguns food trucks estava um pouco longa, mas valeu a pena.',
      NOW() - INTERVAL '1 day',
      NOW(),
      NOW()
    )
    ON CONFLICT (user_id, event_id) DO UPDATE
    SET rating = 4,
        comment = 'Ótimo evento, muita opção e música boa. A fila de alguns food trucks estava um pouco longa, mas valeu a pena.',
        review_date = NOW() - INTERVAL '1 day',
        updated_at = NOW();
  END IF;

  -- Beatriz's review (5 stars)
  IF event_culinaria_id IS NOT NULL AND beatriz_profile_id IS NOT NULL THEN
    INSERT INTO reviews (user_id, event_id, rating, comment, review_date, created_at, updated_at)
    VALUES (
      beatriz_profile_id,
      event_culinaria_id,
      5,
      'Adorei a organização e a diversidade cultural! Meus filhos se divertiram muito nas atividades infantis.',
      NOW() - INTERVAL '3 days',
      NOW(),
      NOW()
    )
    ON CONFLICT (user_id, event_id) DO UPDATE
    SET rating = 5,
        comment = 'Adorei a organização e a diversidade cultural! Meus filhos se divertiram muito nas atividades infantis.',
        review_date = NOW() - INTERVAL '3 days',
        updated_at = NOW();
  END IF;

  -- Add more reviews for other events
  -- Ana Paula's review for Festival de Jazz
  IF event_jazz_id IS NOT NULL AND ana_paula_profile_id IS NOT NULL THEN
    INSERT INTO registrations (user_id, event_id, status, registration_date, created_at, updated_at)
    VALUES (ana_paula_profile_id, event_jazz_id, 'confirmed'::registration_status, NOW() - INTERVAL '10 days', NOW(), NOW())
    ON CONFLICT (user_id, event_id) DO NOTHING;

    INSERT INTO reviews (user_id, event_id, rating, comment, review_date, created_at, updated_at)
    VALUES (
      ana_paula_profile_id,
      event_jazz_id,
      5,
      'Show incrível! A qualidade musical estava excelente e o ambiente estava muito acolhedor.',
      NOW() - INTERVAL '8 days',
      NOW(),
      NOW()
    )
    ON CONFLICT (user_id, event_id) DO NOTHING;
  END IF;

  -- Carlos's review for Maratona
  IF event_maratona_id IS NOT NULL AND carlos_profile_id IS NOT NULL THEN
    INSERT INTO registrations (user_id, event_id, status, registration_date, created_at, updated_at)
    VALUES (carlos_profile_id, event_maratona_id, 'confirmed'::registration_status, NOW() - INTERVAL '7 days', NOW(), NOW())
    ON CONFLICT (user_id, event_id) DO NOTHING;

    INSERT INTO reviews (user_id, event_id, rating, comment, review_date, created_at, updated_at)
    VALUES (
      carlos_profile_id,
      event_maratona_id,
      4,
      'Organização impecável! A maratona foi bem sinalizada e os postos de apoio estavam bem equipados.',
      NOW() - INTERVAL '5 days',
      NOW(),
      NOW()
    )
    ON CONFLICT (user_id, event_id) DO NOTHING;
  END IF;

  -- Beatriz's review for Yoga
  IF event_yoga_id IS NOT NULL AND beatriz_profile_id IS NOT NULL THEN
    INSERT INTO registrations (user_id, event_id, status, registration_date, created_at, updated_at)
    VALUES (beatriz_profile_id, event_yoga_id, 'confirmed'::registration_status, NOW() - INTERVAL '6 days', NOW(), NOW())
    ON CONFLICT (user_id, event_id) DO NOTHING;

    INSERT INTO reviews (user_id, event_id, rating, comment, review_date, created_at, updated_at)
    VALUES (
      beatriz_profile_id,
      event_yoga_id,
      5,
      'Experiência muito relaxante! A instrutora foi excelente e o ambiente ao ar livre foi perfeito.',
      NOW() - INTERVAL '4 days',
      NOW(),
      NOW()
    )
    ON CONFLICT (user_id, event_id) DO NOTHING;
  END IF;

END $$;

-- Create a view to get reviews with user information
-- This view combines reviews with user_profiles and auth metadata
CREATE OR REPLACE VIEW reviews_with_users AS
SELECT 
  r.id,
  r.user_id,
  r.event_id,
  r.rating,
  r.comment,
  r.review_date,
  r.created_at,
  r.updated_at,
  up.user_id as auth_user_id,
  -- Use a placeholder for display name since we can't access auth.users directly
  COALESCE(
    CASE 
      WHEN up.user_id = 'e8a60886-fbea-465a-a2c3-4e61d898ea03'::uuid THEN 'Ana Paula S.'
      WHEN up.user_id = 'c8687446-0f4d-46ff-a6ea-bfd49e08d27b'::uuid THEN 'Beatriz L.'
      WHEN up.user_id = 'a2690edc-9be3-4305-af43-644bebf61d56'::uuid THEN 'Carlos M.'
      ELSE 'Usuário'
    END,
    'Usuário'
  ) as user_display_name
FROM reviews r
JOIN user_profiles up ON r.user_id = up.id;

-- Grant access to the view
GRANT SELECT ON reviews_with_users TO authenticated;
GRANT SELECT ON reviews_with_users TO anon;