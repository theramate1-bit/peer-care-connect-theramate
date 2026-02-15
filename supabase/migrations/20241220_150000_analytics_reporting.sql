-- Phase 5: Analytics and Reporting - Database Schema
-- This migration implements comprehensive analytics and reporting functionality

-- Create ENUMs for analytics
CREATE TYPE metric_type AS ENUM ('count', 'percentage', 'currency', 'duration', 'rating', 'score');
CREATE TYPE trend_direction AS ENUM ('increasing', 'decreasing', 'stable', 'fluctuating');
CREATE TYPE report_frequency AS ENUM ('daily', 'weekly', 'monthly', 'quarterly', 'yearly');
CREATE TYPE report_status AS ENUM ('draft', 'generated', 'delivered', 'archived');

-- Analytics Dashboard Configuration
CREATE TABLE public.analytics_dashboards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    dashboard_name TEXT NOT NULL,
    dashboard_type TEXT NOT NULL, -- 'client', 'therapist', 'admin'
    layout_config JSONB,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dashboard Widgets
CREATE TABLE public.dashboard_widgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dashboard_id UUID NOT NULL REFERENCES public.analytics_dashboards(id) ON DELETE CASCADE,
    widget_type TEXT NOT NULL, -- 'chart', 'metric', 'table', 'list'
    widget_title TEXT NOT NULL,
    widget_config JSONB,
    position_x INTEGER DEFAULT 0,
    position_y INTEGER DEFAULT 0,
    width INTEGER DEFAULT 1,
    height INTEGER DEFAULT 1,
    refresh_interval INTEGER DEFAULT 300, -- seconds
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics Metrics Master Table
CREATE TABLE public.analytics_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name TEXT NOT NULL UNIQUE,
    metric_description TEXT,
    metric_type metric_type NOT NULL,
    metric_unit TEXT,
    metric_category TEXT NOT NULL, -- 'performance', 'financial', 'engagement', 'quality'
    calculation_logic TEXT,
    data_source TEXT,
    is_custom BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics Data Points
CREATE TABLE public.analytics_data_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_id UUID NOT NULL REFERENCES public.analytics_metrics(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    metric_value DECIMAL(15,4),
    metric_date DATE NOT NULL,
    metric_hour INTEGER, -- 0-23 for hourly data
    context_data JSONB, -- Additional context for the metric
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance Tracking
CREATE TABLE public.performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    project_completion_rate DECIMAL(5,2), -- percentage
    average_project_duration DECIMAL(8,2), -- days
    client_satisfaction_score DECIMAL(3,2), -- 1-5 scale
    response_time_hours DECIMAL(6,2),
    project_success_rate DECIMAL(5,2), -- percentage
    total_projects_completed INTEGER,
    total_revenue DECIMAL(12,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Financial Analytics
CREATE TABLE public.financial_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_revenue DECIMAL(12,2) DEFAULT 0,
    total_expenses DECIMAL(12,2) DEFAULT 0,
    net_profit DECIMAL(12,2) DEFAULT 0,
    profit_margin DECIMAL(5,2), -- percentage
    average_project_value DECIMAL(10,2),
    payment_collection_rate DECIMAL(5,2), -- percentage
    outstanding_invoices DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Engagement Analytics
CREATE TABLE public.engagement_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    login_frequency INTEGER DEFAULT 0,
    session_duration_minutes INTEGER DEFAULT 0,
    features_used TEXT[], -- Array of feature names
    messages_sent INTEGER DEFAULT 0,
    documents_uploaded INTEGER DEFAULT 0,
    reviews_submitted INTEGER DEFAULT 0,
    support_tickets INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trend Analysis
CREATE TABLE public.trend_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_id UUID NOT NULL REFERENCES public.analytics_metrics(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    trend_period TEXT NOT NULL, -- 'daily', 'weekly', 'monthly'
    trend_start_date DATE NOT NULL,
    trend_end_date DATE NOT NULL,
    trend_direction trend_direction NOT NULL,
    trend_strength DECIMAL(5,2), -- 0-1 scale
    change_percentage DECIMAL(8,2),
    confidence_level DECIMAL(5,2), -- 0-1 scale
    seasonality_factor DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Custom Reports
CREATE TABLE public.custom_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    report_name TEXT NOT NULL,
    report_description TEXT,
    report_type TEXT NOT NULL, -- 'performance', 'financial', 'engagement', 'custom'
    report_config JSONB NOT NULL, -- Query parameters, filters, etc.
    schedule_frequency report_frequency,
    schedule_config JSONB, -- Cron-like configuration
    last_generated_at TIMESTAMP WITH TIME ZONE,
    next_generation_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Report Deliveries
CREATE TABLE public.report_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES public.custom_reports(id) ON DELETE CASCADE,
    delivery_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivery_method TEXT NOT NULL, -- 'email', 'dashboard', 'export'
    delivery_status report_status DEFAULT 'generated',
    recipient_email TEXT,
    file_path TEXT, -- For exported reports
    file_size INTEGER,
    delivery_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics Alerts
CREATE TABLE public.analytics_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    alert_name TEXT NOT NULL,
    alert_description TEXT,
    metric_id UUID NOT NULL REFERENCES public.analytics_metrics(id) ON DELETE CASCADE,
    alert_condition TEXT NOT NULL, -- 'above', 'below', 'equals', 'changes_by'
    threshold_value DECIMAL(15,4),
    alert_frequency TEXT DEFAULT 'immediate', -- 'immediate', 'daily', 'weekly'
    is_active BOOLEAN DEFAULT true,
    last_triggered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alert Notifications
CREATE TABLE public.alert_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_id UUID NOT NULL REFERENCES public.analytics_alerts(id) ON DELETE CASCADE,
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    current_value DECIMAL(15,4),
    threshold_value DECIMAL(15,4),
    notification_sent BOOLEAN DEFAULT false,
    notification_method TEXT, -- 'email', 'push', 'sms'
    notification_sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_dashboards_user_id ON public.analytics_dashboards(user_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_dashboard_id ON public.dashboard_widgets(dashboard_id);
CREATE INDEX IF NOT EXISTS idx_analytics_data_points_metric_date ON public.analytics_data_points(metric_date);
CREATE INDEX IF NOT EXISTS idx_analytics_data_points_user_metric ON public.analytics_data_points(user_id, metric_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_user_date ON public.performance_metrics(user_id, metric_date);
CREATE INDEX IF NOT EXISTS idx_financial_analytics_user_period ON public.financial_analytics(user_id, period_start);
CREATE INDEX IF NOT EXISTS idx_engagement_analytics_user_date ON public.engagement_analytics(user_id, metric_date);
CREATE INDEX IF NOT EXISTS idx_trend_analysis_metric_period ON public.trend_analysis(metric_id, trend_period);
CREATE INDEX IF NOT EXISTS idx_custom_reports_user_id ON public.custom_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_alerts_user_id ON public.analytics_alerts(user_id);

-- Enable Row Level Security for all new tables
ALTER TABLE public.analytics_dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_data_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engagement_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trend_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for analytics_dashboards
CREATE POLICY "Users can view their own dashboards" ON public.analytics_dashboards
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own dashboards" ON public.analytics_dashboards
    FOR ALL USING (user_id = auth.uid());

-- RLS Policies for dashboard_widgets
CREATE POLICY "Users can view widgets on their dashboards" ON public.dashboard_widgets
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.analytics_dashboards 
            WHERE analytics_dashboards.id = dashboard_widgets.dashboard_id 
            AND analytics_dashboards.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage widgets on their dashboards" ON public.dashboard_widgets
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.analytics_dashboards 
            WHERE analytics_dashboards.id = dashboard_widgets.dashboard_id 
            AND analytics_dashboards.user_id = auth.uid()
        )
    );

-- RLS Policies for analytics_metrics (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view metrics" ON public.analytics_metrics
    FOR SELECT USING (auth.role() = 'authenticated');

-- RLS Policies for analytics_data_points
CREATE POLICY "Users can view their own data points" ON public.analytics_data_points
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert data points" ON public.analytics_data_points
    FOR INSERT WITH CHECK (true);

-- RLS Policies for performance_metrics
CREATE POLICY "Users can view their own performance metrics" ON public.performance_metrics
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert performance metrics" ON public.performance_metrics
    FOR INSERT WITH CHECK (true);

-- RLS Policies for financial_analytics
CREATE POLICY "Users can view their own financial analytics" ON public.financial_analytics
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert financial analytics" ON public.financial_analytics
    FOR INSERT WITH CHECK (true);

-- RLS Policies for engagement_analytics
CREATE POLICY "Users can view their own engagement analytics" ON public.engagement_analytics
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert engagement analytics" ON public.engagement_analytics
    FOR INSERT WITH CHECK (true);

-- RLS Policies for trend_analysis
CREATE POLICY "Users can view trends for their metrics" ON public.trend_analysis
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert trend analysis" ON public.trend_analysis
    FOR INSERT WITH CHECK (true);

-- RLS Policies for custom_reports
CREATE POLICY "Users can view their own reports" ON public.custom_reports
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own reports" ON public.custom_reports
    FOR ALL USING (user_id = auth.uid());

-- RLS Policies for report_deliveries
CREATE POLICY "Users can view their report deliveries" ON public.report_deliveries
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.custom_reports 
            WHERE custom_reports.id = report_deliveries.report_id 
            AND custom_reports.user_id = auth.uid()
        )
    );

CREATE POLICY "System can insert report deliveries" ON public.report_deliveries
    FOR INSERT WITH CHECK (true);

-- RLS Policies for analytics_alerts
CREATE POLICY "Users can view their own alerts" ON public.analytics_alerts
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own alerts" ON public.analytics_alerts
    FOR ALL USING (user_id = auth.uid());

-- RLS Policies for alert_notifications
CREATE POLICY "Users can view their alert notifications" ON public.alert_notifications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.analytics_alerts 
            WHERE analytics_alerts.id = alert_notifications.alert_id 
            AND analytics_alerts.user_id = auth.uid()
        )
    );

CREATE POLICY "System can insert alert notifications" ON public.alert_notifications
    FOR INSERT WITH CHECK (true);

-- Insert default analytics metrics
INSERT INTO public.analytics_metrics (metric_name, metric_description, metric_type, metric_unit, metric_category, calculation_logic, data_source) VALUES
('project_completion_rate', 'Percentage of projects completed successfully', 'percentage', 'percent', 'performance', 'completed_projects / total_projects * 100', 'projects'),
('average_project_duration', 'Average time to complete projects', 'duration', 'days', 'performance', 'AVG(actual_duration_weeks * 7)', 'project_phases'),
('client_satisfaction_score', 'Average client satisfaction rating', 'rating', 'score', 'quality', 'AVG(overall_rating)', 'project_reviews'),
('response_time', 'Average time to respond to client messages', 'duration', 'hours', 'performance', 'AVG(response_time_hours)', 'project_messages'),
('revenue_per_project', 'Average revenue generated per project', 'currency', 'USD', 'financial', 'total_revenue / total_projects', 'projects'),
('project_success_rate', 'Percentage of projects meeting success criteria', 'percentage', 'percent', 'performance', 'successful_projects / total_projects * 100', 'projects'),
('client_retention_rate', 'Percentage of clients who return for additional projects', 'percentage', 'percent', 'engagement', 'returning_clients / total_clients * 100', 'client_profiles'),
('average_project_rating', 'Average rating across all projects', 'rating', 'score', 'quality', 'AVG(overall_rating)', 'project_reviews'),
('monthly_revenue', 'Total revenue generated per month', 'currency', 'USD', 'financial', 'SUM(actual_cost)', 'projects'),
('project_completion_time', 'Time from start to completion of projects', 'duration', 'days', 'performance', 'end_date - start_date', 'projects');

-- Create functions for analytics calculations
CREATE OR REPLACE FUNCTION public.calculate_performance_metrics(target_user_id UUID, target_date DATE)
RETURNS VOID AS $$
DECLARE
    completion_rate DECIMAL(5,2);
    avg_duration DECIMAL(8,2);
    satisfaction_score DECIMAL(3,2);
    response_time DECIMAL(6,2);
    success_rate DECIMAL(5,2);
    total_completed INTEGER;
    total_revenue DECIMAL(12,2);
BEGIN
    -- Calculate project completion rate
    SELECT 
        CASE 
            WHEN COUNT(*) = 0 THEN 0
            ELSE (COUNT(*) FILTER (WHERE project_status = 'completed'))::DECIMAL / COUNT(*) * 100
        END INTO completion_rate
    FROM public.projects 
    WHERE client_id IN (
        SELECT id FROM public.client_profiles WHERE user_id = target_user_id
    );
    
    -- Calculate average project duration
    SELECT AVG(actual_duration_weeks * 7) INTO avg_duration
    FROM public.project_phases 
    WHERE project_id IN (
        SELECT id FROM public.projects 
        WHERE client_id IN (
            SELECT id FROM public.client_profiles WHERE user_id = target_user_id
        )
    ) AND phase_status = 'completed';
    
    -- Calculate client satisfaction score
    SELECT AVG(overall_rating) INTO satisfaction_score
    FROM public.project_reviews 
    WHERE client_id IN (
        SELECT id FROM public.client_profiles WHERE user_id = target_user_id
    );
    
    -- Calculate response time (placeholder - would need message tracking)
    response_time := 24.0; -- Default 24 hours
    
    -- Calculate project success rate
    SELECT 
        CASE 
            WHEN COUNT(*) = 0 THEN 0
            ELSE (COUNT(*) FILTER (WHERE phase_rating >= 4))::DECIMAL / COUNT(*) * 100
        END INTO success_rate
    FROM public.project_phases 
    WHERE project_id IN (
        SELECT id FROM public.projects 
        WHERE client_id IN (
            SELECT id FROM public.client_profiles WHERE user_id = target_user_id
        )
    ) AND phase_status = 'completed';
    
    -- Get total completed projects
    SELECT COUNT(*) INTO total_completed
    FROM public.projects 
    WHERE client_id IN (
        SELECT id FROM public.client_profiles WHERE user_id = target_user_id
    ) AND project_status = 'completed';
    
    -- Calculate total revenue
    SELECT COALESCE(SUM(actual_cost), 0) INTO total_revenue
    FROM public.projects 
    WHERE client_id IN (
        SELECT id FROM public.client_profiles WHERE user_id = target_user_id
    ) AND project_status = 'completed';
    
    -- Insert or update performance metrics
    INSERT INTO public.performance_metrics (
        user_id, metric_date, project_completion_rate, average_project_duration,
        client_satisfaction_score, response_time_hours, project_success_rate,
        total_projects_completed, total_revenue
    ) VALUES (
        target_user_id, target_date, completion_rate, avg_duration,
        satisfaction_score, response_time, success_rate, total_completed, total_revenue
    )
    ON CONFLICT (user_id, metric_date) DO UPDATE SET
        project_completion_rate = EXCLUDED.project_completion_rate,
        average_project_duration = EXCLUDED.average_project_duration,
        client_satisfaction_score = EXCLUDED.client_satisfaction_score,
        response_time_hours = EXCLUDED.response_time_hours,
        project_success_rate = EXCLUDED.project_success_rate,
        total_projects_completed = EXCLUDED.total_projects_completed,
        total_revenue = EXCLUDED.total_revenue;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate financial analytics
CREATE OR REPLACE FUNCTION public.calculate_financial_analytics(target_user_id UUID, period_start DATE, period_end DATE)
RETURNS VOID AS $$
DECLARE
    total_rev DECIMAL(12,2);
    total_exp DECIMAL(12,2);
    net_prof DECIMAL(12,2);
    profit_marg DECIMAL(5,2);
    avg_project_val DECIMAL(10,2);
    collection_rate DECIMAL(5,2);
    outstanding_amt DECIMAL(12,2);
BEGIN
    -- Calculate total revenue for the period
    SELECT COALESCE(SUM(actual_cost), 0) INTO total_rev
    FROM public.projects 
    WHERE client_id IN (
        SELECT id FROM public.client_profiles WHERE user_id = target_user_id
    ) AND project_status = 'completed'
    AND start_date >= period_start AND start_date <= period_end;
    
    -- For now, set expenses to 0 (would need expense tracking table)
    total_exp := 0;
    net_prof := total_rev - total_exp;
    
    -- Calculate profit margin
    profit_marg := CASE 
        WHEN total_rev = 0 THEN 0
        ELSE (net_prof / total_rev) * 100
    END;
    
    -- Calculate average project value
    SELECT AVG(actual_cost) INTO avg_project_val
    FROM public.projects 
    WHERE client_id IN (
        SELECT id FROM public.client_profiles WHERE user_id = target_user_id
    ) AND project_status = 'completed'
    AND start_date >= period_start AND start_date <= period_end;
    
    -- Set collection rate to 100% for now (would need payment tracking)
    collection_rate := 100.0;
    
    -- Set outstanding amount to 0 for now
    outstanding_amt := 0;
    
    -- Insert or update financial analytics
    INSERT INTO public.financial_analytics (
        user_id, period_start, period_end, total_revenue, total_expenses,
        net_profit, profit_margin, average_project_value, payment_collection_rate,
        outstanding_invoices
    ) VALUES (
        target_user_id, period_start, period_end, total_rev, total_exp,
        net_prof, profit_marg, avg_project_val, collection_rate, outstanding_amt
    )
    ON CONFLICT (user_id, period_start, period_end) DO UPDATE SET
        total_revenue = EXCLUDED.total_revenue,
        total_expenses = EXCLUDED.total_expenses,
        net_profit = EXCLUDED.net_profit,
        profit_margin = EXCLUDED.profit_margin,
        average_project_value = EXCLUDED.average_project_value,
        payment_collection_rate = EXCLUDED.payment_collection_rate,
        outstanding_invoices = EXCLUDED.outstanding_invoices;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate engagement analytics
CREATE OR REPLACE FUNCTION public.calculate_engagement_analytics(target_user_id UUID, target_date DATE)
RETURNS VOID AS $$
DECLARE
    login_freq INTEGER;
    session_duration INTEGER;
    features_used_arr TEXT[];
    messages_sent_count INTEGER;
    documents_uploaded_count INTEGER;
    reviews_submitted_count INTEGER;
    support_tickets_count INTEGER;
BEGIN
    -- For now, set default values (would need actual tracking)
    login_freq := 1;
    session_duration := 30;
    features_used_arr := ARRAY['dashboard', 'projects', 'messages'];
    messages_sent_count := 0;
    documents_uploaded_count := 0;
    reviews_submitted_count := 0;
    support_tickets_count := 0;
    
    -- Insert or update engagement analytics
    INSERT INTO public.engagement_analytics (
        user_id, metric_date, login_frequency, session_duration_minutes,
        features_used, messages_sent, documents_uploaded, reviews_submitted,
        support_tickets
    ) VALUES (
        target_user_id, target_date, login_freq, session_duration,
        features_used_arr, messages_sent_count, documents_uploaded_count,
        reviews_submitted_count, support_tickets_count
    )
    ON CONFLICT (user_id, metric_date) DO UPDATE SET
        login_frequency = EXCLUDED.login_frequency,
        session_duration_minutes = EXCLUDED.session_duration_minutes,
        features_used = EXCLUDED.features_used,
        messages_sent = EXCLUDED.messages_sent,
        documents_uploaded = EXCLUDED.documents_uploaded,
        reviews_submitted = EXCLUDED.reviews_submitted,
        support_tickets = EXCLUDED.support_tickets;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for automatic analytics updates
CREATE OR REPLACE FUNCTION public.trigger_analytics_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Update performance metrics when projects change
    IF TG_TABLE_NAME = 'projects' THEN
        PERFORM public.calculate_performance_metrics(
            (SELECT user_id FROM public.client_profiles WHERE id = NEW.client_id),
            CURRENT_DATE
        );
    END IF;
    
    -- Update project analytics when phases change
    IF TG_TABLE_NAME = 'project_phases' THEN
        PERFORM public.calculate_performance_metrics(
            (SELECT user_id FROM public.client_profiles WHERE id = (
                SELECT client_id FROM public.projects WHERE id = NEW.project_id
            )),
            CURRENT_DATE
        );
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for projects table
CREATE TRIGGER trigger_projects_analytics_update
    AFTER INSERT OR UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_analytics_update();

-- Create trigger for project_phases table
CREATE TRIGGER trigger_project_phases_analytics_update
    AFTER INSERT OR UPDATE ON public.project_phases
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_analytics_update();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
