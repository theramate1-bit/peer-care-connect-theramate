/**
 * Bookings/Sessions Screen
 * View upcoming and past sessions
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  Calendar,
  Clock,
  MapPin,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react-native';

import { PressableCard } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';

type TabType = 'upcoming' | 'past';

const mockSessions = {
  upcoming: [
    {
      id: '1',
      therapist_name: 'Sarah Johnson',
      session_type: 'Sports Therapy',
      session_date: '2026-01-08',
      start_time: '10:00',
      duration_minutes: 60,
      status: 'confirmed',
      price: 80,
    },
    {
      id: '2',
      therapist_name: 'Michael Chen',
      session_type: 'Massage Therapy',
      session_date: '2026-01-12',
      start_time: '14:30',
      duration_minutes: 45,
      status: 'scheduled',
      price: 55,
    },
  ],
  past: [
    {
      id: '3',
      therapist_name: 'Emma Williams',
      session_type: 'Osteopathy',
      session_date: '2025-12-28',
      start_time: '11:00',
      duration_minutes: 60,
      status: 'completed',
      price: 90,
    },
    {
      id: '4',
      therapist_name: 'Sarah Johnson',
      session_type: 'Sports Therapy',
      session_date: '2025-12-20',
      start_time: '16:00',
      duration_minutes: 60,
      status: 'completed',
      price: 80,
    },
  ],
};

const StatusBadge = ({ status }: { status: string }) => {
  const config = {
    confirmed: { color: 'bg-success/10', text: 'text-success', icon: CheckCircle2, label: 'Confirmed' },
    scheduled: { color: 'bg-info/10', text: 'text-info', icon: AlertCircle, label: 'Scheduled' },
    completed: { color: 'bg-sage-500/10', text: 'text-sage-600', icon: CheckCircle2, label: 'Completed' },
    cancelled: { color: 'bg-error/10', text: 'text-error', icon: XCircle, label: 'Cancelled' },
  }[status] || { color: 'bg-charcoal-100', text: 'text-charcoal-500', icon: AlertCircle, label: status };

  const Icon = config.icon;

  return (
    <View className={`flex-row items-center px-2 py-1 rounded-full ${config.color}`}>
      <Icon size={12} color={config.text.includes('success') ? Colors.success : 
        config.text.includes('info') ? Colors.info :
        config.text.includes('sage') ? Colors.sage[600] :
        config.text.includes('error') ? Colors.error : Colors.charcoal[500]} />
      <Text className={`text-xs font-medium ml-1 ${config.text}`}>
        {config.label}
      </Text>
    </View>
  );
};

function SessionCard({ session, isPast }: { session: typeof mockSessions.upcoming[0]; isPast: boolean }) {
  const date = new Date(session.session_date);
  const formattedDate = date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  return (
    <PressableCard variant="default" padding="md" className="mb-3">
      <View className="flex-row items-start">
        <View className="items-center justify-center bg-cream-100 rounded-lg p-3 mr-4">
          <Text className="text-charcoal-400 text-xs uppercase">
            {date.toLocaleDateString('en-GB', { weekday: 'short' })}
          </Text>
          <Text className="text-charcoal-900 text-xl font-bold">
            {date.getDate()}
          </Text>
          <Text className="text-charcoal-500 text-xs">
            {date.toLocaleDateString('en-GB', { month: 'short' })}
          </Text>
        </View>

        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-charcoal-900 font-semibold">
              {session.therapist_name}
            </Text>
            <StatusBadge status={session.status} />
          </View>

          <Text className="text-charcoal-500 text-sm mb-2">
            {session.session_type}
          </Text>

          <View className="flex-row items-center">
            <Clock size={14} color={Colors.charcoal[400]} />
            <Text className="text-charcoal-500 text-sm ml-1">
              {session.start_time} • {session.duration_minutes} min
            </Text>
          </View>

          <View className="flex-row items-center justify-between mt-3">
            <Text className="text-sage-600 font-semibold">
              £{session.price}
            </Text>
            {!isPast && (
              <Button variant="ghost" size="sm">
                <Text className="text-charcoal-700">View Details</Text>
                <ChevronRight size={16} color={Colors.charcoal[400]} />
              </Button>
            )}
            {isPast && session.status === 'completed' && (
              <Button variant="outline" size="sm">
                <Text className="text-sage-500">Leave Review</Text>
              </Button>
            )}
          </View>
        </View>
      </View>
    </PressableCard>
  );
}

export default function BookingsScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const sessions = mockSessions[activeTab];

  return (
    <SafeAreaView className="flex-1 bg-cream-50" edges={['top']}>
      {/* Header */}
      <Animated.View
        entering={FadeInDown.delay(100).duration(500)}
        className="px-6 pt-4 pb-4"
      >
        <Text className="text-charcoal-900 text-2xl font-bold mb-4">
          My Sessions
        </Text>

        {/* Tabs */}
        <View className="flex-row bg-cream-100 p-1 rounded-xl">
          {(['upcoming', 'past'] as TabType[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              className={`flex-1 py-2.5 rounded-lg ${
                activeTab === tab ? 'bg-white shadow-sm' : ''
              }`}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                className={`text-center font-medium ${
                  activeTab === tab ? 'text-charcoal-900' : 'text-charcoal-500'
                }`}
              >
                {tab === 'upcoming' ? 'Upcoming' : 'Past'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>

      {/* Sessions List */}
      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {sessions.length === 0 ? (
          <View className="items-center justify-center py-16">
            <Calendar size={48} color={Colors.charcoal[300]} />
            <Text className="text-charcoal-500 mt-4 text-center">
              No {activeTab} sessions
            </Text>
            <Button variant="primary" className="mt-4">
              Find a Therapist
            </Button>
          </View>
        ) : (
          sessions.map((session, index) => (
            <Animated.View
              key={session.id}
              entering={FadeInDown.delay(200 + index * 100).duration(500)}
            >
              <SessionCard session={session} isPast={activeTab === 'past'} />
            </Animated.View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

