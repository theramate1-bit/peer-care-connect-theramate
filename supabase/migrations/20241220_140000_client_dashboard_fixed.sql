-- Phase 4: Client Dashboard - Database Schema (Fixed)
-- This migration extends existing client_profiles and adds comprehensive client dashboard functionality

-- Create ENUMs for client dashboard
CREATE TYPE client_type AS ENUM ('individual', 'corporate', 'healthcare_provider', 'sports_team', 'wellness_center');
CREATE TYPE project_status AS ENUM ('planning', 'active', 'on_hold', 'completed', 'cancelled');
CREATE TYPE project_phase_status AS ENUM ('not_started', 'in_progress', 'review', 'completed', 'approved');
CREATE TYPE document_type AS ENUM ('contract', 'invoice', 'medical_record', 'assessment', 'treatment_plan', 'progress_report', 'discharge_summary', 'other');
CREATE TYPE document_status AS ENUM ('draft', 'pending_review', 'approved', 'rejected', 'archived');
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded', 'disputed');
CREATE TYPE project_message_type AS ENUM ('general', 'update', 'question', 'feedback', 'urgent');

-- Extend existing client_profiles table with new columns
ALTER TABLE public.client_profiles 
ADD COLUMN IF NOT EXISTS client_type client_type DEFAULT 'individual',
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS industry TEXT,
ADD COLUMN IF NOT EXISTS contact_person TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact JSONB,
ADD COLUMN IF NOT EXISTS communication_preferences JSONB,
ADD COLUMN IF NOT EXISTS billing_info JSONB,
ADD COLUMN IF NOT EXISTS insurance_info JSONB,
ADD COLUMN IF NOT EXISTS referral_source TEXT,
ADD COLUMN IF NOT EXISTS profile_completion_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_projects INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_spent DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS average_project_rating DECIMAL(3,2),
ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;

-- Projects Table
CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES public.client_profiles(id) ON DELETE CASCADE,
    therapist_id UUID NOT NULL REFERENCES public.therapist_profiles(id) ON DELETE CASCADE,
    project_name TEXT NOT NULL,
    project_description TEXT,
    project_type TEXT NOT NULL,
    project_status project_status DEFAULT 'planning',
    start_date DATE,
    end_date DATE,
    estimated_duration_weeks INTEGER,
    actual_duration_weeks INTEGER,
    budget_range JSONB,
    actual_cost DECIMAL(10,2),
    project_goals TEXT[],
    success_metrics JSONB,
    special_requirements TEXT[],
    location_preference TEXT,
    scheduling_preferences JSONB,
    communication_preferences JSONB,
    risk_assessment JSONB,
    quality_assurance JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Phases Table
CREATE TABLE public.project_phases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    phase_name TEXT NOT NULL,
    phase_description TEXT,
    phase_order INTEGER NOT NULL,
    phase_status project_phase_status DEFAULT 'not_started',
    start_date DATE,
    end_date DATE,
    estimated_duration_days INTEGER,
    actual_duration_days INTEGER,
    deliverables TEXT[],
    acceptance_criteria TEXT[],
    phase_notes TEXT,
    phase_rating DECIMAL(3,2),
    phase_feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Documents Table
CREATE TABLE public.project_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    phase_id UUID REFERENCES public.project_phases(id) ON DELETE SET NULL,
    document_name TEXT NOT NULL,
    document_type document_type NOT NULL,
    document_status document_status DEFAULT 'draft',
    file_path TEXT,
    file_size INTEGER,
    file_type TEXT,
    version TEXT DEFAULT '1.0',
    uploaded_by UUID NOT NULL REFERENCES public.users(id),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_by UUID REFERENCES public.users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_notes TEXT,
    is_required BOOLEAN DEFAULT false,
    due_date DATE,
    tags TEXT[],
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Messages Table (extends messaging system)
CREATE TABLE public.project_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
    message_type project_message_type DEFAULT 'general',
    sender_id UUID NOT NULL REFERENCES public.users(id),
    recipient_id UUID REFERENCES public.users(id),
    subject TEXT,
    message_content TEXT NOT NULL,
    is_urgent BOOLEAN DEFAULT false,
    requires_response BOOLEAN DEFAULT false,
    response_deadline TIMESTAMP WITH TIME ZONE,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    parent_message_id UUID REFERENCES public.project_messages(id),
    attachments JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Reviews Table (extends review system)
CREATE TABLE public.project_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.client_profiles(id) ON DELETE CASCADE,
    therapist_id UUID NOT NULL REFERENCES public.therapist_profiles(id) ON DELETE CASCADE,
    overall_rating DECIMAL(3,2) NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
    review_text TEXT,
    project_satisfaction INTEGER CHECK (project_satisfaction >= 1 AND project_satisfaction <= 5),
    communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
    quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
    value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 5),
    would_recommend BOOLEAN,
    review_status TEXT DEFAULT 'pending',
    is_verified BOOLEAN DEFAULT false,
    helpful_votes INTEGER DEFAULT 0,
    unhelpful_votes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Payments Table
CREATE TABLE public.project_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    phase_id UUID REFERENCES public.project_phases(id) ON DELETE SET NULL,
    payment_type TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    payment_status payment_status DEFAULT 'pending',
    payment_method TEXT,
    transaction_id TEXT,
    stripe_payment_intent_id TEXT,
    payment_date TIMESTAMP WITH TIME ZONE,
    due_date DATE,
    description TEXT,
    invoice_number TEXT,
    receipt_url TEXT,
    refund_amount DECIMAL(10,2),
    refund_reason TEXT,
    refund_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Analytics Table
CREATE TABLE public.project_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    metric_name TEXT NOT NULL,
    metric_value DECIMAL(10,4),
    metric_unit TEXT,
    metric_category TEXT,
    measurement_date DATE DEFAULT CURRENT_DATE,
    comparison_period TEXT,
    trend_direction TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_client_profiles_client_type ON public.client_profiles(client_type);
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON public.projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_therapist_id ON public.projects(therapist_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(project_status);
CREATE INDEX IF NOT EXISTS idx_projects_dates ON public.projects(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_project_phases_project_id ON public.project_phases(project_id);
CREATE INDEX IF NOT EXISTS idx_project_phases_status ON public.project_phases(phase_status);
CREATE INDEX IF NOT EXISTS idx_project_documents_project_id ON public.project_documents(project_id);
CREATE INDEX IF NOT EXISTS idx_project_documents_type ON public.project_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_project_documents_status ON public.project_documents(document_status);
CREATE INDEX IF NOT EXISTS idx_project_messages_project_id ON public.project_messages(project_id);
CREATE INDEX IF NOT EXISTS idx_project_messages_sender ON public.project_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_project_reviews_project_id ON public.project_reviews(project_id);
CREATE INDEX IF NOT EXISTS idx_project_payments_project_id ON public.project_payments(project_id);
CREATE INDEX IF NOT EXISTS idx_project_payments_status ON public.project_payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_project_analytics_project_id ON public.project_analytics(project_id);

-- Enable Row Level Security for new tables
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for projects
CREATE POLICY "Clients can view their own projects" ON public.projects
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.client_profiles 
            WHERE client_profiles.id = projects.client_id 
            AND client_profiles.user_id = auth.uid()
        )
    );

CREATE POLICY "Clients can create projects" ON public.projects
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.client_profiles 
            WHERE client_profiles.id = projects.client_id 
            AND client_profiles.user_id = auth.uid()
        )
    );

CREATE POLICY "Clients can update their own projects" ON public.projects
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.client_profiles 
            WHERE client_profiles.id = projects.client_id 
            AND client_profiles.user_id = auth.uid()
        )
    );

CREATE POLICY "Therapists can view projects assigned to them" ON public.projects
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.therapist_profiles 
            WHERE therapist_profiles.id = projects.therapist_id 
            AND therapist_profiles.user_id = auth.uid()
        )
    );

CREATE POLICY "Therapists can update projects assigned to them" ON public.projects
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.therapist_profiles 
            WHERE therapist_profiles.id = projects.therapist_id 
            AND therapist_profiles.user_id = auth.uid()
        )
    );

-- RLS Policies for project_phases
CREATE POLICY "Project participants can view phases" ON public.project_phases
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE projects.id = project_phases.project_id 
            AND (
                EXISTS (
                    SELECT 1 FROM public.therapist_profiles 
                    WHERE therapist_profiles.id = projects.therapist_id 
                    AND therapist_profiles.user_id = auth.uid()
                )
                OR EXISTS (
                    SELECT 1 FROM public.client_profiles 
                    WHERE client_profiles.id = projects.client_id 
                    AND client_profiles.user_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Project participants can manage phases" ON public.project_phases
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE projects.id = project_phases.project_id 
            AND (
                EXISTS (
                    SELECT 1 FROM public.therapist_profiles 
                    WHERE therapist_profiles.id = projects.therapist_id 
                    AND therapist_profiles.user_id = auth.uid()
                )
                OR EXISTS (
                    SELECT 1 FROM public.client_profiles 
                    WHERE client_profiles.id = projects.client_id 
                    AND client_profiles.user_id = auth.uid()
                )
            )
        )
    );

-- RLS Policies for project_documents
CREATE POLICY "Project participants can view documents" ON public.project_documents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE projects.id = project_documents.project_id 
            AND (
                EXISTS (
                    SELECT 1 FROM public.therapist_profiles 
                    WHERE therapist_profiles.id = projects.therapist_id 
                    AND therapist_profiles.user_id = auth.uid()
                )
                OR EXISTS (
                    SELECT 1 FROM public.client_profiles 
                    WHERE client_profiles.id = projects.client_id 
                    AND client_profiles.user_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Project participants can manage documents" ON public.project_documents
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE projects.id = project_documents.project_id 
            AND (
                EXISTS (
                    SELECT 1 FROM public.therapist_profiles 
                    WHERE therapist_profiles.id = projects.therapist_id 
                    AND therapist_profiles.user_id = auth.uid()
                )
                OR EXISTS (
                    SELECT 1 FROM public.client_profiles 
                    WHERE client_profiles.id = projects.client_id 
                    AND client_profiles.user_id = auth.uid()
                )
            )
        )
    );

-- RLS Policies for project_messages
CREATE POLICY "Project participants can view messages" ON public.project_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE projects.id = project_messages.project_id 
            AND (
                EXISTS (
                    SELECT 1 FROM public.therapist_profiles 
                    WHERE therapist_profiles.id = projects.therapist_id 
                    AND therapist_profiles.user_id = auth.uid()
                )
                OR EXISTS (
                    SELECT 1 FROM public.client_profiles 
                    WHERE client_profiles.id = projects.client_id 
                    AND client_profiles.user_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Project participants can send messages" ON public.project_messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE projects.id = project_messages.project_id 
            AND (
                EXISTS (
                    SELECT 1 FROM public.therapist_profiles 
                    WHERE therapist_profiles.id = projects.therapist_id 
                    AND therapist_profiles.user_id = auth.uid()
                )
                OR EXISTS (
                    SELECT 1 FROM public.client_profiles 
                    WHERE client_profiles.id = projects.client_id 
                    AND client_profiles.user_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Message senders can update their messages" ON public.project_messages
    FOR UPDATE USING (sender_id = auth.uid());

-- RLS Policies for project_reviews
CREATE POLICY "Public can view approved project reviews" ON public.project_reviews
    FOR SELECT USING (review_status = 'approved');

CREATE POLICY "Clients can view their own reviews" ON public.project_reviews
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.client_profiles 
            WHERE client_profiles.id = project_reviews.client_id 
            AND client_profiles.user_id = auth.uid()
        )
    );

CREATE POLICY "Therapists can view reviews for their projects" ON public.project_reviews
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE projects.id = project_reviews.project_id 
            AND EXISTS (
                SELECT 1 FROM public.therapist_profiles 
                WHERE therapist_profiles.id = projects.therapist_id 
                AND therapist_profiles.user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Clients can create reviews for their projects" ON public.project_reviews
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.client_profiles 
            WHERE client_profiles.id = project_reviews.client_id 
            AND client_profiles.user_id = auth.uid()
        )
    );

-- RLS Policies for project_payments
CREATE POLICY "Project participants can view payments" ON public.project_payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE projects.id = project_payments.project_id 
            AND (
                EXISTS (
                    SELECT 1 FROM public.therapist_profiles 
                    WHERE therapist_profiles.id = projects.therapist_id 
                    AND therapist_profiles.user_id = auth.uid()
                )
                OR EXISTS (
                    SELECT 1 FROM public.client_profiles 
                    WHERE client_profiles.id = projects.client_id 
                    AND client_profiles.user_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "Clients can manage their payments" ON public.project_payments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE projects.id = project_payments.project_id 
            AND EXISTS (
                SELECT 1 FROM public.client_profiles 
                WHERE client_profiles.id = projects.client_id 
                AND client_profiles.user_id = auth.uid()
            )
        )
    );

-- RLS Policies for project_analytics
CREATE POLICY "Project participants can view analytics" ON public.project_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE projects.id = project_analytics.project_id 
            AND (
                EXISTS (
                    SELECT 1 FROM public.therapist_profiles 
                    WHERE therapist_profiles.id = projects.therapist_id 
                    AND therapist_profiles.user_id = auth.uid()
                )
                OR EXISTS (
                    SELECT 1 FROM public.client_profiles 
                    WHERE client_profiles.id = projects.client_id 
                    AND client_profiles.user_id = auth.uid()
                )
            )
        )
    );

-- Create functions for client dashboard
CREATE OR REPLACE FUNCTION public.calculate_client_profile_score(client_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    score INTEGER := 0;
    profile_record RECORD;
BEGIN
    SELECT * INTO profile_record FROM public.client_profiles WHERE id = client_uuid;
    
    IF profile_record.company_name IS NOT NULL AND profile_record.company_name != '' THEN
        score := score + 10;
    END IF;
    
    IF profile_record.contact_person IS NOT NULL AND profile_record.contact_person != '' THEN
        score := score + 10;
    END IF;
    
    IF profile_record.phone IS NOT NULL AND profile_record.phone != '' THEN
        score := score + 10;
    END IF;
    
    IF profile_record.address IS NOT NULL THEN
        score := score + 15;
    END IF;
    
    IF profile_record.medical_history IS NOT NULL THEN
        score := score + 20;
    END IF;
    
    IF profile_record.preferences IS NOT NULL THEN
        score := score + 15;
    END IF;
    
    IF profile_record.communication_preferences IS NOT NULL THEN
        score := score + 10;
    END IF;
    
    IF profile_record.billing_info IS NOT NULL THEN
        score := score + 10;
    END IF;
    
    RETURN LEAST(score, 100);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.update_project_analytics()
RETURNS TRIGGER AS $$
BEGIN
    -- Update project completion percentage
    IF TG_OP = 'UPDATE' OR TG_OP = 'INSERT' THEN
        INSERT INTO public.project_analytics (project_id, metric_name, metric_value, metric_unit, metric_category)
        SELECT 
            NEW.project_id,
            'completion_percentage',
            CASE 
                WHEN COUNT(*) = 0 THEN 0
                ELSE (COUNT(*) FILTER (WHERE phase_status = 'completed'))::DECIMAL / COUNT(*) * 100
            END,
            'percent',
            'progress'
        FROM public.project_phases 
        WHERE project_id = NEW.project_id;
        
        -- Update average phase duration
        INSERT INTO public.project_analytics (project_id, metric_name, metric_value, metric_unit, metric_category)
        SELECT 
            NEW.project_id,
            'average_phase_duration',
            AVG(actual_duration_days),
            'days',
            'timing'
        FROM public.project_phases 
        WHERE project_id = NEW.project_id AND actual_duration_days IS NOT NULL;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
CREATE TRIGGER trigger_update_project_analytics
    AFTER INSERT OR UPDATE ON public.project_phases
    FOR EACH ROW
    EXECUTE FUNCTION public.update_project_analytics();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
