/**
 * Home/Dashboard Screen
 * Shows upcoming sessions and quick actions
 */

import React from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  Calendar,
  MapPin,
  Clock,
  ChevronRight,
  Search,
  Star,
  Heart,
} from 'lucide-react-native';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Card, PressableCard, CardHeader, CardTitle } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Colors } from '@/constants/colors';

export default function HomeScreen() {
  const { userProfile } = useAuth();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    // Refresh data here
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const firstName = userProfile?.first_name || 'there';

  return (
    <SafeAreaView className="flex-1 bg-cream-50" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.sage[500]}
          />
        }
      >
        {/* Header */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(500)}
          className="px-6 pt-4 pb-6"
        >
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-charcoal-500 text-base">Good morning,</Text>
              <Text className="text-charcoal-900 text-2xl font-bold">
                {firstName} 👋
              </Text>
            </View>
            <Avatar
              source={undefined}
              name={`${userProfile?.first_name} ${userProfile?.last_name}`}
              size="lg"
            />
          </View>
        </Animated.View>

        {/* Next Session Card */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(500)}
          className="px-6 mb-6"
        >
          <Card variant="elevated" className="bg-sage-500 p-5">
            <Text className="text-white/80 text-sm mb-2">Next Session</Text>
            <View className="flex-row items-center mb-3">
              <Avatar name="Sarah Johnson" size="md" />
              <View className="ml-3 flex-1">
                <Text className="text-white font-semibold text-lg">
                  Sarah Johnson
                </Text>
                <Text className="text-white/80 text-sm">Sports Therapy</Text>
              </View>
            </View>
            <View className="flex-row items-center space-x-4">
              <View className="flex-row items-center">
                <Calendar size={16} color="white" />
                <Text className="text-white ml-2 text-sm">Tomorrow</Text>
              </View>
              <View className="flex-row items-center">
                <Clock size={16} color="white" />
                <Text className="text-white ml-2 text-sm">10:00 AM</Text>
              </View>
            </View>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 border-white/30"
            >
              <Text className="text-white font-medium">View Details</Text>
            </Button>
          </Card>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(500)}
          className="px-6 mb-6"
        >
          <Text className="text-charcoal-900 font-semibold text-lg mb-4">
            Quick Actions
          </Text>
          <View className="flex-row space-x-3">
            <Link href="/(tabs)/explore" asChild>
              <PressableCard
                variant="filled"
                padding="md"
                className="flex-1 items-center"
              >
                <View className="w-12 h-12 bg-sage-500/10 rounded-full items-center justify-center mb-2">
                  <Search size={24} color={Colors.sage[500]} />
                </View>
                <Text className="text-charcoal-700 font-medium text-sm">
                  Find Therapist
                </Text>
              </PressableCard>
            </Link>

            <Link href="/(tabs)/bookings" asChild>
              <PressableCard
                variant="filled"
                padding="md"
                className="flex-1 items-center"
              >
                <View className="w-12 h-12 bg-terracotta-500/10 rounded-full items-center justify-center mb-2">
                  <Calendar size={24} color={Colors.terracotta[500]} />
                </View>
                <Text className="text-charcoal-700 font-medium text-sm">
                  My Sessions
                </Text>
              </PressableCard>
            </Link>

            <Link href="/(tabs)/profile" asChild>
              <PressableCard
                variant="filled"
                padding="md"
                className="flex-1 items-center"
              >
                <View className="w-12 h-12 bg-info/10 rounded-full items-center justify-center mb-2">
                  <Heart size={24} color={Colors.info} />
                </View>
                <Text className="text-charcoal-700 font-medium text-sm">
                  Favorites
                </Text>
              </PressableCard>
            </Link>
          </View>
        </Animated.View>

        {/* Recent Therapists */}
        <Animated.View
          entering={FadeInDown.delay(400).duration(500)}
          className="px-6"
        >
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-charcoal-900 font-semibold text-lg">
              Recently Viewed
            </Text>
            <Link href="/(tabs)/explore" asChild>
              <Text className="text-sage-500 font-medium">See All</Text>
            </Link>
          </View>

          {/* Placeholder cards */}
          {[1, 2].map((i) => (
            <PressableCard
              key={i}
              variant="default"
              padding="md"
              className="mb-3"
            >
              <View className="flex-row items-center">
                <Avatar name={`Therapist ${i}`} size="lg" verified />
                <View className="flex-1 ml-3">
                  <Text className="text-charcoal-900 font-semibold">
                    Dr. Jane Smith
                  </Text>
                  <Text className="text-charcoal-500 text-sm">
                    Osteopathy
                  </Text>
                  <View className="flex-row items-center mt-1">
                    <Star size={14} color={Colors.warning} fill={Colors.warning} />
                    <Text className="text-charcoal-700 text-sm ml-1">4.9</Text>
                    <Text className="text-charcoal-400 text-sm ml-1">
                      (47 reviews)
                    </Text>
                  </View>
                </View>
                <ChevronRight size={20} color={Colors.charcoal[300]} />
              </View>
            </PressableCard>
          ))}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

