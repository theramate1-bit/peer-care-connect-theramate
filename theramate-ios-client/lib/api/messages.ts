/**
 * Messages API
 * API functions for messaging operations
 */

import { supabase, realtimeHelpers } from '../supabase';
import type { Conversation, Message } from '@/types/database';

/**
 * Get user's conversations
 */
export async function getConversations(userId: string) {
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      participant_1:participant_1_id (
        id,
        first_name,
        last_name,
        email
      ),
      participant_2:participant_2_id (
        id,
        first_name,
        last_name,
        email
      )
    `)
    .or(`participant_1_id.eq.${userId},participant_2_id.eq.${userId}`)
    .order('last_message_at', { ascending: false });

  return { data, error };
}

/**
 * Get or create conversation between two users
 */
export async function getOrCreateConversation(userId1: string, userId2: string) {
  // Check if conversation exists
  const { data: existing } = await supabase
    .from('conversations')
    .select('*')
    .or(
      `and(participant_1_id.eq.${userId1},participant_2_id.eq.${userId2}),and(participant_1_id.eq.${userId2},participant_2_id.eq.${userId1})`
    )
    .single();

  if (existing) {
    return { data: existing, error: null, created: false };
  }

  // Create new conversation
  const { data, error } = await supabase
    .from('conversations')
    .insert({
      participant_1_id: userId1,
      participant_2_id: userId2,
    })
    .select()
    .single();

  return { data, error, created: true };
}

/**
 * Get messages for a conversation
 */
export async function getMessages(
  conversationId: string,
  options: { limit?: number; before?: string } = {}
) {
  const { limit = 50, before } = options;

  let query = supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (before) {
    query = query.lt('created_at', before);
  }

  const { data, error } = await query;

  // Return in chronological order
  return { data: data?.reverse() || [], error };
}

/**
 * Send a message
 */
export async function sendMessage(
  conversationId: string,
  senderId: string,
  content: string
) {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content,
    })
    .select()
    .single();

  if (!error) {
    // Update conversation's last_message_at
    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId);
  }

  return { data, error };
}

/**
 * Mark messages as read
 */
export async function markMessagesAsRead(conversationId: string, userId: string) {
  const { error } = await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('conversation_id', conversationId)
    .neq('sender_id', userId)
    .eq('is_read', false);

  return { error };
}

/**
 * Get unread message count for a user
 */
export async function getUnreadCount(userId: string) {
  // Get all user's conversations
  const { data: conversations } = await supabase
    .from('conversations')
    .select('id')
    .or(`participant_1_id.eq.${userId},participant_2_id.eq.${userId}`);

  if (!conversations?.length) {
    return { count: 0, error: null };
  }

  const conversationIds = conversations.map((c) => c.id);

  // Count unread messages
  const { count, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .in('conversation_id', conversationIds)
    .neq('sender_id', userId)
    .eq('is_read', false);

  return { count: count || 0, error };
}

/**
 * Subscribe to new messages in a conversation
 */
export function subscribeToMessages(
  conversationId: string,
  onMessage: (message: Message) => void
) {
  return realtimeHelpers.subscribeToMessages(conversationId, (payload) => {
    if (payload.new) {
      onMessage(payload.new as Message);
    }
  });
}

/**
 * Unsubscribe from messages
 */
export function unsubscribeFromMessages(
  channel: ReturnType<typeof supabase.channel>
) {
  realtimeHelpers.unsubscribe(channel);
}

