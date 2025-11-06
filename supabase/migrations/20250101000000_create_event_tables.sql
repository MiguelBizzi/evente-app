-- Create ENUM types
CREATE TYPE user_type AS ENUM ('organizer', 'participant');
CREATE TYPE registration_status AS ENUM ('confirmed', 'cancelled');

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    type user_type NOT NULL DEFAULT 'participant',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date TIMESTAMPTZ NOT NULL,
    location VARCHAR(255) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    zip_code VARCHAR(20),
    category VARCHAR(100) NOT NULL,
    organizer_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    capacity INTEGER,
    price DECIMAL(10, 2) DEFAULT 0.00,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create registrations table
CREATE TABLE IF NOT EXISTS registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    status registration_status NOT NULL DEFAULT 'confirmed',
    registration_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, event_id)
);

-- Create tickets table
CREATE TABLE IF NOT EXISTS tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID NOT NULL UNIQUE REFERENCES registrations(id) ON DELETE CASCADE,
    qr_code VARCHAR(255) NOT NULL UNIQUE,
    is_used BOOLEAN NOT NULL DEFAULT false,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    review_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, event_id)
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_registrations_updated_at
    BEFORE UPDATE ON registrations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at
    BEFORE UPDATE ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better query performance

-- User profiles indexes
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_type ON user_profiles(type);

-- Events indexes
CREATE INDEX idx_events_organizer_id ON events(organizer_id);
CREATE INDEX idx_events_event_date ON events(event_date);
CREATE INDEX idx_events_category ON events(category);
CREATE INDEX idx_events_is_active ON events(is_active);
CREATE INDEX idx_events_location ON events(location);

-- Registrations indexes
CREATE INDEX idx_registrations_user_id ON registrations(user_id);
CREATE INDEX idx_registrations_event_id ON registrations(event_id);
CREATE INDEX idx_registrations_status ON registrations(status);
CREATE INDEX idx_registrations_registration_date ON registrations(registration_date);

-- Tickets indexes
CREATE INDEX idx_tickets_registration_id ON tickets(registration_id);
CREATE INDEX idx_tickets_qr_code ON tickets(qr_code);
CREATE INDEX idx_tickets_is_used ON tickets(is_used);

-- Reviews indexes
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_event_id ON reviews(event_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_review_date ON reviews(review_date);

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (users can read all, but only modify their own data)
-- User profiles: users can view all profiles but only update their own
CREATE POLICY "Users can view all profiles"
    ON user_profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update their own profile"
    ON user_profiles FOR UPDATE
    USING (auth.uid() = user_id);

-- Events: users can view all active events, organizers can manage their own
CREATE POLICY "Users can view active events"
    ON events FOR SELECT
    USING (is_active = true);

CREATE POLICY "Organizers can manage their own events"
    ON events FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = events.organizer_id
            AND user_profiles.user_id = auth.uid()
        )
    );

-- Registrations: users can view their own registrations and create new ones
CREATE POLICY "Users can view their own registrations"
    ON registrations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = registrations.user_id
            AND user_profiles.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create registrations"
    ON registrations FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = registrations.user_id
            AND user_profiles.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own registrations"
    ON registrations FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = registrations.user_id
            AND user_profiles.user_id = auth.uid()
        )
    );

-- Tickets: users can view tickets for their registrations
CREATE POLICY "Users can view their own tickets"
    ON tickets FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM registrations
            JOIN user_profiles ON user_profiles.id = registrations.user_id
            WHERE registrations.id = tickets.registration_id
            AND user_profiles.user_id = auth.uid()
        )
    );

-- Organizers can view tickets for their events
CREATE POLICY "Organizers can view tickets for their events"
    ON tickets FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM registrations
            JOIN events ON events.id = registrations.event_id
            JOIN user_profiles ON user_profiles.id = events.organizer_id
            WHERE registrations.id = tickets.registration_id
            AND user_profiles.user_id = auth.uid()
        )
    );

-- Organizers can update tickets for their events (for check-in)
CREATE POLICY "Organizers can update tickets for their events"
    ON tickets FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM registrations
            JOIN events ON events.id = registrations.event_id
            JOIN user_profiles ON user_profiles.id = events.organizer_id
            WHERE registrations.id = tickets.registration_id
            AND user_profiles.user_id = auth.uid()
        )
    );

-- Reviews: users can view all reviews and manage their own
CREATE POLICY "Users can view all reviews"
    ON reviews FOR SELECT
    USING (true);

CREATE POLICY "Users can create reviews for events they attended"
    ON reviews FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = reviews.user_id
            AND user_profiles.user_id = auth.uid()
            AND EXISTS (
                SELECT 1 FROM registrations
                WHERE registrations.user_id = reviews.user_id
                AND registrations.event_id = reviews.event_id
                AND registrations.status = 'confirmed'
            )
        )
    );

CREATE POLICY "Users can update their own reviews"
    ON reviews FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = reviews.user_id
            AND user_profiles.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own reviews"
    ON reviews FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = reviews.user_id
            AND user_profiles.user_id = auth.uid()
        )
    );

