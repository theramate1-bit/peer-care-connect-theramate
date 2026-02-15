/**
 * Messages Screen
 * Conversation list with therapists
 */

import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { MessageCircle, Search } from 'lucide-react-native';

import { PressableCard } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Colors } from '@/constants/colors';

const mockConversations = [
  {
    id: '1',
    participant_name: 'Sarah Johnson',
    last_message: 'Looking forward to our session tomorrow!',
    last_message_at: '2026-01-05T09:30:00',
    unread_count: 2,
  },
  {
    id: '2',
    participant_name: 'Michael Chen',
    last_message: 'Thanks for the session notes. Very helpful!',
    last_message_at: '2026-01-04T16:45:00',
    unread_count: 0,
  },
  {
    id: '3',
    participant_name: 'Emma Williams',
    last_message: "I'll send over the exercise plan shortly.",
    last_message_at: '2026-01-03T11:20:00',
    unread_count: 0,
  },
];

function formatTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return date.toLocaleDateString('en-GB', { weekday: 'short' });
  } else {
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  }
}

function ConversationItem({ conversation }: { conversation: typeof mockConversations[0] }) {
  return (
    <PressableCard
      variant="default"
      padding="md"
      className="mb-2"
      onPress={() => router.push(`/(tabs)/messages/${conversation.id}`)}
    >
      <View className="flex-row items-center">
        <View className="relative">
          <Avatar name={conversation.participant_name} size="lg" />
          {conversation.unread_count > 0 && (
            <View className="absolute -top-1 -right-1 w-5 h-5 bg-sage-500 rounded-full items-center justify-center">
              <Text className="text-white text-xs font-bold">
                {conversation.unread_count}
              </Text>
            </View>
          )}
        </View>

        <View className="flex-1 ml-3">
          <View className="flex-row items-center justify-between">
            <Text
              className={`font-semibold ${
                conversation.unread_count > 0 ? 'text-charcoal-900' : 'text-charcoal-700'
              }`}
            >
              {conversation.participant_name}
            </Text>
            <Text className="text-charcoal-400 text-xs">
              {formatTime(conversation.last_message_at)}
            </Text>
          </View>

          <Text
            className={`text-sm mt-1 ${
              conversation.unread_count > 0
                ? 'text-charcoal-700 font-medium'
                : 'text-charcoal-500'
            }`}
            numberOfLines={1}
          >
            {conversation.last_message}
          </Text>
        </View>
      </View>
    </PressableCard>
  );
}

export default function MessagesScreen() {
  return (
    <SafeAreaView className="flex-1 bg-cream-50" edges={['top']}>
      {/* Header */}
      <Animated.View
        entering={FadeInDown.delay(100).duration(500)}
        className="px-6 pt-4 pb-4"
      >
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-charcoal-900 text-2xl font-bold">Messages</Text>
          <TouchableOpacity className="p-2 bg-cream-100 rounded-lg">
            <Search size={20} color={Colors.charcoal[600]} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Conversations List */}
      <FlatList
        data={mockConversations}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInDown.delay(200 + index * 100).duration(500)}
            className="px-6"
          >
            <ConversationItem conversation={item} />
          </Animated.View>
        )}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center justify-center py-16 px-6">
            <MessageCircle size={48} color={Colors.charcoal[300]} />
            <Text className="text-charcoal-500 mt-4 text-center">
              No messages yet
            </Text>
            <Text className="text-charcoal-400 mt-2 text-center text-sm">
              Start a conversation with a therapist after booking a session
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

