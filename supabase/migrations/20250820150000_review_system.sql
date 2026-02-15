-- Migration: Review & Rating System
-- Description: Implements comprehensive review and rating system with moderation and fraud detection

-- Create ENUMs for review system
CREATE TYPE IF NOT EXISTS review_status AS ENUM ('pending', 'approved', 'rejected', 'flagged');
CREATE TYPE IF NOT EXISTS rating_type AS ENUM ('overall', 'professionalism', 'effectiveness', 'communication', 'punctuality');
CREATE TYPE IF NOT EXISTS moderation_action AS ENUM ('approve', 'reject', 'flag', 'escalate');

-- Reviews table - main review storage
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES public.sessions(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    therapist_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
    review_text TEXT,
    review_status review_status DEFAULT 'pending',
    is_verified_session BOOLEAN DEFAULT false,
    helpful_votes INTEGER DEFAULT 0,
    unhelpful_votes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    moderated_at TIMESTAMP WITH TIME ZONE,
    moderated_by UUID REFERENCES auth.users(id),
    moderation_notes TEXT,
    
    -- Ensure one review per session per client
    UNIQUE(session_id, client_id)
);

-- Detailed ratings for different aspects
CREATE TABLE IF NOT EXISTS public.detailed_ratings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
    rating_type rating_type NOT NULL,
    rating_value INTEGER NOT NULL CHECK (rating_value >= 1 AND rating_value <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one rating per type per review
    UNIQUE(review_id, rating_type)
);

-- Review moderation log
CREATE TABLE IF NOT EXISTS public.review_moderation_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
    moderator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action moderation_action NOT NULL,
    reason TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Review flags for suspicious content
CREATE TABLE IF NOT EXISTS public.review_flags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
    flagged_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    flag_reason TEXT NOT NULL,
    flag_details TEXT,
    is_resolved BOOLEAN DEFAULT false,
    resolved_by UUID REFERENCES auth.users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Review helpfulness votes
CREATE TABLE IF NOT EXISTS public.review_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
    voter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_helpful BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one vote per user per review
    UNIQUE(review_id, voter_id)
);

-- Review notification tracking
CREATE TABLE IF NOT EXISTS public.review_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL, -- 'new_review', 'review_approved', 'review_rejected', 'review_flagged'
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    delivery_method TEXT DEFAULT 'email', -- 'email', 'sms', 'push'
    delivery_status TEXT DEFAULT 'sent' -- 'sent', 'delivered', 'failed'
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_reviews_therapist_id ON public.reviews(therapist_id);
CREATE INDEX IF NOT EXISTS idx_reviews_client_id ON public.reviews(client_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON public.reviews(review_status);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at);
CREATE INDEX IF NOT EXISTS idx_detailed_ratings_review_id ON public.detailed_ratings(review_id);
CREATE INDEX IF NOT EXISTS idx_review_flags_review_id ON public.review_flags(review_id);
CREATE INDEX IF NOT EXISTS idx_review_votes_review_id ON public.review_votes(review_id);

-- Enable Row Level Security
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detailed_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_moderation_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reviews
CREATE POLICY "Users can view approved reviews" ON public.reviews
    FOR SELECT USING (review_status = 'approved');

CREATE POLICY "Users can view their own reviews" ON public.reviews
    FOR SELECT USING (
        auth.uid() = client_id OR 
        auth.uid() = therapist_id OR
        review_status = 'approved'
    );

CREATE POLICY "Clients can create reviews for their sessions" ON public.reviews
    FOR INSERT WITH CHECK (
        auth.uid() = client_id AND
        EXISTS (
            SELECT 1 FROM public.sessions 
            WHERE id = session_id 
            AND client_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own reviews" ON public.reviews
    FOR UPDATE USING (auth.uid() = client_id);

CREATE POLICY "Admins and moderators can manage all reviews" ON public.reviews
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'moderator')
        )
    );

-- RLS Policies for detailed_ratings
CREATE POLICY "Users can view ratings for approved reviews" ON public.detailed_ratings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.reviews 
            WHERE id = review_id 
            AND review_status = 'approved'
        )
    );

CREATE POLICY "Users can view ratings for their own reviews" ON public.detailed_ratings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.reviews 
            WHERE id = review_id 
            AND (client_id = auth.uid() OR therapist_id = auth.uid())
        )
    );

CREATE POLICY "Clients can create ratings for their reviews" ON public.detailed_ratings
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.reviews 
            WHERE id = review_id 
            AND client_id = auth.uid()
        )
    );

-- RLS Policies for review_moderation_log
CREATE POLICY "Only admins and moderators can view moderation logs" ON public.review_moderation_log
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'moderator')
        )
    );

-- RLS Policies for review_flags
CREATE POLICY "Users can view flags for their own reviews" ON public.review_flags
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.reviews 
            WHERE id = review_id 
            AND (client_id = auth.uid() OR therapist_id = auth.uid())
        )
    );

CREATE POLICY "Admins and moderators can view all flags" ON public.review_flags
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'moderator')
        )
    );

CREATE POLICY "Users can flag reviews" ON public.review_flags
    FOR INSERT WITH CHECK (auth.uid() = flagged_by);

-- RLS Policies for review_votes
CREATE POLICY "Users can view votes for approved reviews" ON public.review_votes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.reviews 
            WHERE id = review_id 
            AND review_status = 'approved'
        )
    );

CREATE POLICY "Users can vote on reviews" ON public.review_votes
    FOR INSERT WITH CHECK (auth.uid() = voter_id);

CREATE POLICY "Users can update their own votes" ON public.review_votes
    FOR UPDATE USING (auth.uid() = voter_id);

-- RLS Policies for review_notifications
CREATE POLICY "Users can view their own notifications" ON public.review_notifications
    FOR SELECT USING (auth.uid() = recipient_id);

CREATE POLICY "System can create notifications" ON public.review_notifications
    FOR INSERT WITH CHECK (true);

-- Function to calculate weighted average rating
CREATE OR REPLACE FUNCTION calculate_weighted_rating(therapist_uuid UUID)
RETURNS DECIMAL AS $$
DECLARE
    total_weighted_rating DECIMAL := 0;
    total_weight DECIMAL := 0;
    review_record RECORD;
    days_old INTEGER;
    weight DECIMAL;
BEGIN
    FOR review_record IN 
        SELECT r.overall_rating, r.created_at, r.is_verified_session
        FROM public.reviews r
        WHERE r.therapist_id = therapist_uuid 
        AND r.review_status = 'approved'
    LOOP
        -- Calculate days since review
        days_old := EXTRACT(DAY FROM (NOW() - review_record.created_at));
        
        -- Weight formula: newer reviews get higher weight, verified sessions get bonus
        weight := GREATEST(0.1, 1.0 - (days_old::DECIMAL / 365.0));
        
        -- Bonus weight for verified sessions
        IF review_record.is_verified_session THEN
            weight := weight * 1.2;
        END IF;
        
        total_weighted_rating := total_weighted_rating + (review_record.overall_rating * weight);
        total_weight := total_weight + weight;
    END LOOP;
    
    IF total_weight > 0 THEN
        RETURN ROUND((total_weighted_rating / total_weight)::DECIMAL, 2);
    ELSE
        RETURN 0;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to detect potential review fraud
CREATE OR REPLACE FUNCTION detect_review_fraud(new_review_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    review_record RECORD;
    client_reviews_count INTEGER;
    recent_reviews_count INTEGER;
    avg_rating DECIMAL;
    fraud_score INTEGER := 0;
BEGIN
    -- Get review details
    SELECT * INTO review_record FROM public.reviews WHERE id = new_review_id;
    
    -- Check for multiple reviews from same client to same therapist
    SELECT COUNT(*) INTO client_reviews_count
    FROM public.reviews 
    WHERE client_id = review_record.client_id 
    AND therapist_id = review_record.therapist_id;
    
    IF client_reviews_count > 1 THEN
        fraud_score := fraud_score + 20;
    END IF;
    
    -- Check for rapid review posting
    SELECT COUNT(*) INTO recent_reviews_count
    FROM public.reviews 
    WHERE client_id = review_record.client_id 
    AND created_at > NOW() - INTERVAL '24 hours';
    
    IF recent_reviews_count > 3 THEN
        fraud_score := fraud_score + 30;
    END IF;
    
    -- Check for rating patterns
    SELECT AVG(overall_rating) INTO avg_rating
    FROM public.reviews 
    WHERE client_id = review_record.client_id;
    
    -- If this review is significantly different from user's average
    IF avg_rating IS NOT NULL AND ABS(review_record.overall_rating - avg_rating) > 2 THEN
        fraud_score := fraud_score + 15;
    END IF;
    
    -- Return true if fraud score is high enough
    RETURN fraud_score >= 50;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update therapist rating statistics
CREATE OR REPLACE FUNCTION update_therapist_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update therapist profile with new rating stats
    UPDATE public.therapist_profiles 
    SET 
        average_rating = (
            SELECT AVG(overall_rating)::DECIMAL(3,2)
            FROM public.reviews 
            WHERE therapist_id = NEW.therapist_id 
            AND review_status = 'approved'
        ),
        total_reviews = (
            SELECT COUNT(*) 
            FROM public.reviews 
            WHERE therapist_id = NEW.therapist_id 
            AND review_status = 'approved'
        )
    WHERE user_id = NEW.therapist_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating rating stats
CREATE TRIGGER trigger_update_rating_stats
    AFTER INSERT OR UPDATE ON public.reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_therapist_rating_stats();

-- Function to log moderation actions
CREATE OR REPLACE FUNCTION log_moderation_action()
RETURNS TRIGGER AS $$
BEGIN
    -- Log the moderation action
    INSERT INTO public.review_moderation_log (
        review_id, 
        moderator_id, 
        action, 
        reason, 
        notes
    ) VALUES (
        NEW.id,
        NEW.moderated_by,
        CASE 
            WHEN NEW.review_status = 'approved' THEN 'approve'
            WHEN NEW.review_status = 'rejected' THEN 'reject'
            WHEN NEW.review_status = 'flagged' THEN 'flag'
            ELSE 'escalate'
        END,
        NEW.moderation_notes,
        NEW.moderation_notes
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for logging moderation actions
CREATE TRIGGER trigger_log_moderation
    AFTER UPDATE OF review_status ON public.reviews
    FOR EACH ROW
    WHEN (OLD.review_status IS DISTINCT FROM NEW.review_status)
    EXECUTE FUNCTION log_moderation_action();

-- Insert sample data for testing (optional)
-- This can be removed in production
INSERT INTO public.reviews (session_id, client_id, therapist_id, overall_rating, review_text, review_status, is_verified_session)
VALUES 
    (gen_random_uuid(), (SELECT id FROM auth.users LIMIT 1), (SELECT id FROM auth.users LIMIT 1), 5, 'Excellent session!', 'approved', true),
    (gen_random_uuid(), (SELECT id FROM auth.users LIMIT 1), (SELECT id FROM auth.users LIMIT 1), 4, 'Very good experience', 'approved', false)
ON CONFLICT DO NOTHING;
