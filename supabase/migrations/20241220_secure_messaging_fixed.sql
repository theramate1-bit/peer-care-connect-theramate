-- Secure Messaging System Migration - Fixed Version
-- Phase 3: Real-time messaging infrastructure with encryption and file sharing

-- Create ENUMs for message and conversation status
CREATE TYPE message_status AS ENUM ('sent', 'delivered', 'read', 'failed');
CREATE TYPE conversation_status AS ENUM ('active', 'archived', 'blocked');
CREATE TYPE message_type AS ENUM ('text', 'file', 'image', 'document', 'system');

-- Conversations table to organize messages between users
CREATE TABLE public.conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_key TEXT UNIQUE NOT NULL, -- Encrypted unique identifier
    participant1_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    participant2_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    last_message_id UUID,
    conversation_status conversation_status DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure participants are different users
    CONSTRAINT different_participants CHECK (participant1_id != participant2_id)
);

-- Messages table for individual messages
CREATE TABLE public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    message_type message_type DEFAULT 'text',
    encrypted_content TEXT NOT NULL, -- Encrypted message content
    content_hash TEXT NOT NULL, -- Hash for integrity verification
    message_status message_status DEFAULT 'sent',
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMPTZ,
    reply_to_message_id UUID REFERENCES public.messages(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- File attachments table for secure file sharing
CREATE TABLE public.message_attachments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    encrypted_file_path TEXT NOT NULL, -- Encrypted path to file in storage
    file_hash TEXT NOT NULL, -- Hash for integrity verification
    thumbnail_url TEXT, -- Optional thumbnail for images
    is_virus_scanned BOOLEAN DEFAULT FALSE,
    virus_scan_result TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Message status tracking for delivery and read receipts
CREATE TABLE public.message_status_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    message_status message_status NOT NULL,
    status_updated_at TIMESTAMPTZ DEFAULT NOW(),
    device_info JSONB, -- Device information for tracking
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversation participants with additional metadata
CREATE TABLE public.conversation_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    is_archived BOOLEAN DEFAULT FALSE,
    is_muted BOOLEAN DEFAULT FALSE,
    last_read_message_id UUID REFERENCES public.messages(id),
    last_read_at TIMESTAMPTZ,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(conversation_id, user_id)
);

-- Message encryption keys for end-to-end encryption
CREATE TABLE public.conversation_keys (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    encrypted_private_key TEXT NOT NULL, -- User's encrypted private key
    public_key TEXT NOT NULL, -- User's public key
    key_version INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    
    UNIQUE(conversation_id, user_id, key_version)
);

-- Message notifications for real-time updates
CREATE TABLE public.message_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL, -- 'new_message', 'message_read', 'file_shared'
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, message_id)
);

-- Create indexes for performance
CREATE INDEX idx_conversations_participants ON public.conversations(participant1_id, participant2_id);
CREATE INDEX idx_conversations_status ON public.conversations(conversation_status);
CREATE INDEX idx_conversations_last_message ON public.conversations(last_message_at DESC);
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_messages_status ON public.messages(message_status);
CREATE INDEX idx_message_attachments_message ON public.message_attachments(message_id);
CREATE INDEX idx_message_status_tracking_message ON public.message_status_tracking(message_id);
CREATE INDEX idx_message_status_tracking_recipient ON public.message_status_tracking(recipient_id);
CREATE INDEX idx_conversation_participants_user ON public.conversation_participants(user_id);
CREATE INDEX idx_conversation_keys_user ON public.conversation_keys(user_id);
CREATE INDEX idx_message_notifications_user ON public.message_notifications(user_id, is_read);

-- Enable Row Level Security
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_status_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
CREATE POLICY "Users can view conversations they participate in" ON public.conversations
    FOR SELECT USING (
        auth.uid() IN (participant1_id, participant2_id)
    );

CREATE POLICY "Users can create conversations" ON public.conversations
    FOR INSERT WITH CHECK (
        auth.uid() IN (participant1_id, participant2_id)
    );

CREATE POLICY "Users can update conversations they participate in" ON public.conversations
    FOR UPDATE USING (
        auth.uid() IN (participant1_id, participant2_id)
    );

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their conversations" ON public.messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversations 
            WHERE id = conversation_id 
            AND auth.uid() IN (participant1_id, participant2_id)
        )
    );

CREATE POLICY "Users can send messages to conversations they participate in" ON public.messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id AND
        EXISTS (
            SELECT 1 FROM public.conversations 
            WHERE id = conversation_id 
            AND auth.uid() IN (participant1_id, participant2_id)
        )
    );

CREATE POLICY "Users can edit their own messages" ON public.messages
    FOR UPDATE USING (
        auth.uid() = sender_id
    );

-- RLS Policies for message attachments
CREATE POLICY "Users can view attachments in their conversations" ON public.message_attachments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.messages m
            JOIN public.conversations c ON m.conversation_id = c.id
            WHERE m.id = message_id 
            AND auth.uid() IN (c.participant1_id, c.participant2_id)
        )
    );

CREATE POLICY "Users can upload attachments to their messages" ON public.message_attachments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.messages m
            JOIN public.conversations c ON m.conversation_id = c.id
            WHERE m.id = message_id 
            AND m.sender_id = auth.uid()
            AND auth.uid() IN (c.participant1_id, c.participant2_id)
        )
    );

-- RLS Policies for message status tracking
CREATE POLICY "Users can view status of messages in their conversations" ON public.message_status_tracking
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.messages m
            JOIN public.conversations c ON m.conversation_id = c.id
            WHERE m.id = message_id 
            AND auth.uid() IN (c.participant1_id, c.participant2_id)
        )
    );

CREATE POLICY "Users can update status of messages sent to them" ON public.message_status_tracking
    FOR UPDATE USING (
        auth.uid() = recipient_id
    );

-- RLS Policies for conversation participants
CREATE POLICY "Users can view participants of their conversations" ON public.conversation_participants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversations 
            WHERE id = conversation_id 
            AND auth.uid() IN (participant1_id, participant2_id)
        )
    );

CREATE POLICY "Users can update their own participant status" ON public.conversation_participants
    FOR UPDATE USING (
        auth.uid() = user_id
    );

-- RLS Policies for conversation keys
CREATE POLICY "Users can view keys for conversations they participate in" ON public.conversation_keys
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversations 
            WHERE id = conversation_id 
            AND auth.uid() IN (participant1_id, participant2_id)
        )
    );

CREATE POLICY "Users can manage their own keys" ON public.conversation_keys
    FOR ALL USING (
        auth.uid() = user_id
    );

-- RLS Policies for message notifications
CREATE POLICY "Users can view their own notifications" ON public.message_notifications
    FOR SELECT USING (
        auth.uid() = user_id
    );

CREATE POLICY "Users can update their own notifications" ON public.message_notifications
    FOR UPDATE USING (
        auth.uid() = user_id
    );

-- Functions for conversation management
CREATE OR REPLACE FUNCTION public.create_conversation(
    p_participant1_id UUID,
    p_participant2_id UUID
) RETURNS UUID AS $$
DECLARE
    v_conversation_id UUID;
    v_conversation_key TEXT;
BEGIN
    -- Generate a unique conversation key
    v_conversation_key := encode(gen_random_bytes(32), 'base64');
    
    -- Create conversation
    INSERT INTO public.conversations (participant1_id, participant2_id, conversation_key)
    VALUES (p_participant1_id, p_participant2_id, v_conversation_key)
    RETURNING id INTO v_conversation_id;
    
    -- Add participants
    INSERT INTO public.conversation_participants (conversation_id, user_id)
    VALUES 
        (v_conversation_id, p_participant1_id),
        (v_conversation_id, p_participant2_id);
    
    RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get or create conversation between two users
CREATE OR REPLACE FUNCTION public.get_or_create_conversation(
    p_other_user_id UUID
) RETURNS UUID AS $$
DECLARE
    v_conversation_id UUID;
    v_current_user_id UUID;
BEGIN
    v_current_user_id := auth.uid();
    
    -- Check if conversation already exists
    SELECT id INTO v_conversation_id
    FROM public.conversations
    WHERE (participant1_id = v_current_user_id AND participant2_id = p_other_user_id)
       OR (participant1_id = p_other_user_id AND participant2_id = v_current_user_id);
    
    -- If no conversation exists, create one
    IF v_conversation_id IS NULL THEN
        v_conversation_id := public.create_conversation(v_current_user_id, p_other_user_id);
    END IF;
    
    RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update conversation last message
CREATE OR REPLACE FUNCTION public.update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.conversations
    SET last_message_at = NEW.created_at,
        last_message_id = NEW.id,
        updated_at = NOW()
    WHERE id = NEW.conversation_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create message status tracking entries
CREATE OR REPLACE FUNCTION public.create_message_status_entries()
RETURNS TRIGGER AS $$
DECLARE
    v_conversation_id UUID;
    v_other_participant_id UUID;
BEGIN
    v_conversation_id := NEW.conversation_id;
    
    -- Get the other participant's ID
    SELECT 
        CASE 
            WHEN participant1_id = NEW.sender_id THEN participant2_id
            ELSE participant1_id
        END INTO v_other_participant_id
    FROM public.conversations
    WHERE id = v_conversation_id;
    
    -- Create status tracking entry for the recipient
    INSERT INTO public.message_status_tracking (message_id, recipient_id, message_status)
    VALUES (NEW.id, v_other_participant_id, 'sent');
    
    -- Create notification for the recipient
    INSERT INTO public.message_notifications (user_id, conversation_id, message_id, notification_type)
    VALUES (v_other_participant_id, v_conversation_id, NEW.id, 'new_message');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trigger_update_conversation_last_message
    AFTER INSERT ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION public.update_conversation_last_message();

CREATE TRIGGER trigger_create_message_status_entries
    AFTER INSERT ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION public.create_message_status_entries();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.conversations TO authenticated;
GRANT ALL ON public.messages TO authenticated;
GRANT ALL ON public.message_attachments TO authenticated;
GRANT ALL ON public.message_status_tracking TO authenticated;
GRANT ALL ON public.conversation_participants TO authenticated;
GRANT ALL ON public.conversation_keys TO authenticated;
GRANT ALL ON public.message_notifications TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.create_conversation(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_or_create_conversation(UUID) TO authenticated;
