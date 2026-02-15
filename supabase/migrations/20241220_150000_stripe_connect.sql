-- Phase 6: Stripe Connect Integration - Database Schema
-- This migration implements the payment system for practitioner payouts

-- Create ENUMs for payment system
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded');
CREATE TYPE payment_type AS ENUM ('subscription', 'one_time', 'connect_transfer');
CREATE TYPE connect_account_status AS ENUM ('pending', 'active', 'restricted', 'disabled');
CREATE TYPE payout_status AS ENUM ('pending', 'in_transit', 'paid', 'failed', 'cancelled');

-- Stripe Connect accounts for practitioners
CREATE TABLE public.connect_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    stripe_account_id TEXT UNIQUE NOT NULL,
    account_status connect_account_status DEFAULT 'pending',
    charges_enabled BOOLEAN DEFAULT false,
    payouts_enabled BOOLEAN DEFAULT false,
    details_submitted BOOLEAN DEFAULT false,
    requirements JSONB,
    capabilities JSONB,
    business_type TEXT,
    company JSONB,
    individual JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment transactions
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    therapist_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    session_id UUID, -- For individual sessions
    stripe_payment_intent_id TEXT UNIQUE,
    stripe_charge_id TEXT,
    amount INTEGER NOT NULL, -- Amount in pence
    currency TEXT DEFAULT 'gbp',
    payment_type payment_type NOT NULL,
    payment_status payment_status DEFAULT 'pending',
    application_fee INTEGER DEFAULT 0, -- Platform fee in pence
    transfer_amount INTEGER, -- Amount transferred to practitioner
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payouts to practitioners
CREATE TABLE public.payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connect_account_id UUID NOT NULL REFERENCES public.connect_accounts(id) ON DELETE CASCADE,
    stripe_payout_id TEXT UNIQUE,
    amount INTEGER NOT NULL, -- Amount in pence
    currency TEXT DEFAULT 'gbp',
    status payout_status DEFAULT 'pending',
    arrival_date TIMESTAMP WITH TIME ZONE,
    type TEXT DEFAULT 'bank_account',
    method TEXT,
    destination TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment disputes and refunds
CREATE TABLE public.payment_disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
    stripe_dispute_id TEXT UNIQUE,
    amount INTEGER NOT NULL, -- Disputed amount in pence
    currency TEXT DEFAULT 'gbp',
    reason TEXT,
    status TEXT,
    evidence JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Refunds
CREATE TABLE public.refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
    stripe_refund_id TEXT UNIQUE,
    amount INTEGER NOT NULL, -- Refund amount in pence
    currency TEXT DEFAULT 'gbp',
    reason TEXT,
    status TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment webhook events
CREATE TABLE public.webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stripe_event_id TEXT UNIQUE NOT NULL,
    event_type TEXT NOT NULL,
    event_data JSONB NOT NULL,
    processed BOOLEAN DEFAULT false,
    processing_error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_connect_accounts_user_id ON public.connect_accounts(user_id);
CREATE INDEX idx_connect_accounts_stripe_account_id ON public.connect_accounts(stripe_account_id);
CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_payments_therapist_id ON public.payments(therapist_id);
CREATE INDEX idx_payments_project_id ON public.payments(project_id);
CREATE INDEX idx_payments_stripe_payment_intent_id ON public.payments(stripe_payment_intent_id);
CREATE INDEX idx_payments_status ON public.payments(payment_status);
CREATE INDEX idx_payouts_connect_account_id ON public.payouts(connect_account_id);
CREATE INDEX idx_payouts_stripe_payout_id ON public.payouts(stripe_payout_id);
CREATE INDEX idx_payouts_status ON public.payouts(status);
CREATE INDEX idx_webhook_events_stripe_event_id ON public.webhook_events(stripe_event_id);
CREATE INDEX idx_webhook_events_processed ON public.webhook_events(processed);

-- Enable Row Level Security
ALTER TABLE public.connect_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for connect_accounts
CREATE POLICY "Users can view their own connect account" ON public.connect_accounts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own connect account" ON public.connect_accounts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert connect accounts" ON public.connect_accounts
    FOR INSERT WITH CHECK (true);

-- RLS Policies for payments
CREATE POLICY "Users can view their own payments" ON public.payments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Therapists can view payments for their services" ON public.payments
    FOR SELECT USING (auth.uid() = therapist_id);

CREATE POLICY "System can insert payments" ON public.payments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update payments" ON public.payments
    FOR UPDATE USING (true);

-- RLS Policies for payouts
CREATE POLICY "Users can view payouts from their connect account" ON public.payouts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.connect_accounts 
            WHERE connect_accounts.id = payouts.connect_account_id 
            AND connect_accounts.user_id = auth.uid()
        )
    );

CREATE POLICY "System can insert payouts" ON public.payouts
    FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update payouts" ON public.payouts
    FOR UPDATE USING (true);

-- RLS Policies for payment_disputes
CREATE POLICY "Users can view disputes for their payments" ON public.payment_disputes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.payments 
            WHERE payments.id = payment_disputes.payment_id 
            AND payments.user_id = auth.uid()
        )
    );

CREATE POLICY "System can insert disputes" ON public.payment_disputes
    FOR INSERT WITH CHECK (true);

-- RLS Policies for refunds
CREATE POLICY "Users can view refunds for their payments" ON public.refunds
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.payments 
            WHERE payments.id = refunds.payment_id 
            AND payments.user_id = auth.uid()
        )
    );

CREATE POLICY "System can insert refunds" ON public.refunds
    FOR INSERT WITH CHECK (true);

-- RLS Policies for webhook_events
CREATE POLICY "System can manage webhook events" ON public.webhook_events
    FOR ALL USING (true);

-- Create functions for payment processing
CREATE OR REPLACE FUNCTION public.create_payment_intent(
    p_amount INTEGER,
    p_currency TEXT DEFAULT 'gbp',
    p_payment_type payment_type,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_payment_id UUID;
    v_application_fee INTEGER;
    v_transfer_amount INTEGER;
BEGIN
    -- Calculate platform fee (10% for marketplace transactions)
    IF p_payment_type = 'one_time' THEN
        v_application_fee := ROUND(p_amount * 0.10);
        v_transfer_amount := p_amount - v_application_fee;
    ELSE
        v_application_fee := 0;
        v_transfer_amount := p_amount;
    END IF;

    -- Insert payment record
    INSERT INTO public.payments (
        user_id,
        amount,
        currency,
        payment_type,
        application_fee,
        transfer_amount,
        metadata
    ) VALUES (
        auth.uid(),
        p_amount,
        p_currency,
        p_payment_type,
        v_application_fee,
        v_transfer_amount,
        p_metadata
    ) RETURNING id INTO v_payment_id;

    RETURN jsonb_build_object(
        'payment_id', v_payment_id,
        'amount', p_amount,
        'currency', p_currency,
        'application_fee', v_application_fee,
        'transfer_amount', v_transfer_amount
    );
END;
$$;

-- Function to update payment status
CREATE OR REPLACE FUNCTION public.update_payment_status(
    p_payment_id UUID,
    p_status payment_status,
    p_stripe_payment_intent_id TEXT DEFAULT NULL,
    p_stripe_charge_id TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.payments
    SET 
        payment_status = p_status,
        stripe_payment_intent_id = COALESCE(p_stripe_payment_intent_id, stripe_payment_intent_id),
        stripe_charge_id = COALESCE(p_stripe_charge_id, stripe_charge_id),
        updated_at = NOW()
    WHERE id = p_payment_id;

    RETURN FOUND;
END;
$$;

-- Function to create connect account
CREATE OR REPLACE FUNCTION public.create_connect_account(
    p_stripe_account_id TEXT,
    p_business_type TEXT DEFAULT NULL,
    p_company JSONB DEFAULT NULL,
    p_individual JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_account_id UUID;
BEGIN
    INSERT INTO public.connect_accounts (
        user_id,
        stripe_account_id,
        business_type,
        company,
        individual
    ) VALUES (
        auth.uid(),
        p_stripe_account_id,
        p_business_type,
        p_company,
        p_individual
    ) RETURNING id INTO v_account_id;

    RETURN v_account_id;
END;
$$;

-- Function to update connect account status
CREATE OR REPLACE FUNCTION public.update_connect_account_status(
    p_stripe_account_id TEXT,
    p_status connect_account_status,
    p_charges_enabled BOOLEAN DEFAULT NULL,
    p_payouts_enabled BOOLEAN DEFAULT NULL,
    p_details_submitted BOOLEAN DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.connect_accounts
    SET 
        account_status = p_status,
        charges_enabled = COALESCE(p_charges_enabled, charges_enabled),
        payouts_enabled = COALESCE(p_payouts_enabled, payouts_enabled),
        details_submitted = COALESCE(p_details_submitted, details_submitted),
        updated_at = NOW()
    WHERE stripe_account_id = p_stripe_account_id;

    RETURN FOUND;
END;
$$;

-- Function to log webhook event
CREATE OR REPLACE FUNCTION public.log_webhook_event(
    p_stripe_event_id TEXT,
    p_event_type TEXT,
    p_event_data JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_event_id UUID;
BEGIN
    INSERT INTO public.webhook_events (
        stripe_event_id,
        event_type,
        event_data
    ) VALUES (
        p_stripe_event_id,
        p_event_type,
        p_event_data
    ) RETURNING id INTO v_event_id;

    RETURN v_event_id;
END;
$$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.connect_accounts TO authenticated;
GRANT ALL ON public.payments TO authenticated;
GRANT ALL ON public.payouts TO authenticated;
GRANT ALL ON public.payment_disputes TO authenticated;
GRANT ALL ON public.refunds TO authenticated;
GRANT ALL ON public.webhook_events TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.create_payment_intent TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_payment_status TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_connect_account TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_connect_account_status TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_webhook_event TO authenticated;
