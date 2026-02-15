/**
 * Explore/Marketplace Screen
 * Find and browse therapists
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  Search,
  MapPin,
  Filter,
  Star,
  ChevronRight,
  Heart,
} from 'lucide-react-native';

import { Card, PressableCard } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { SPECIALIZATIONS } from '@/constants/config';

// Mock data for now
const mockTherapists = [
  {
    id: '1',
    first_name: 'Sarah',
    last_name: 'Johnson',
    specializations: ['sports_therapy'],
    average_rating: 4.9,
    total_reviews: 47,
    location: 'London, UK',
    hourly_rate: 80,
    verified: true,
  },
  {
    id: '2',
    first_name: 'Michael',
    last_name: 'Chen',
    specializations: ['massage_therapy', 'rehabilitation'],
    average_rating: 4.8,
    total_reviews: 32,
    location: 'Manchester, UK',
    hourly_rate: 65,
    verified: true,
  },
  {
    id: '3',
    first_name: 'Emma',
    last_name: 'Williams',
    specializations: ['osteopathy'],
    average_rating: 4.7,
    total_reviews: 28,
    location: 'Birmingham, UK',
    hourly_rate: 90,
    verified: false,
  },
];

function TherapistCard({ therapist }: { therapist: typeof mockTherapists[0] }) {
  const specializationLabels = therapist.specializations
    .map((s) => SPECIALIZATIONS.find((spec) => spec.value === s)?.label)
    .filter(Boolean)
    .join(', ');

  return (
    <PressableCard
      variant="default"
      padding="md"
      className="mb-3"
      onPress={() => router.push(`/(tabs)/explore/${therapist.id}`)}
    >
      <View className="flex-row">
        <Avatar
          name={`${therapist.first_name} ${therapist.last_name}`}
          size="xl"
          verified={therapist.verified}
        />
        <View className="flex-1 ml-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-charcoal-900 font-semibold text-base">
              {therapist.first_name} {therapist.last_name}
            </Text>
            <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Heart size={20} color={Colors.charcoal[300]} />
            </TouchableOpacity>
          </View>

          <Text className="text-charcoal-500 text-sm mt-0.5">
            {specializationLabels}
          </Text>

          <View className="flex-row items-center mt-2">
            <Star size={14} color={Colors.warning} fill={Colors.warning} />
            <Text className="text-charcoal-700 text-sm ml-1 font-medium">
              {therapist.average_rating}
            </Text>
            <Text className="text-charcoal-400 text-sm ml-1">
              ({therapist.total_reviews} reviews)
            </Text>
          </View>

          <View className="flex-row items-center justify-between mt-2">
            <View className="flex-row items-center">
              <MapPin size={14} color={Colors.charcoal[400]} />
              <Text className="text-charcoal-500 text-sm ml-1">
                {therapist.location}
              </Text>
            </View>
            <Text className="text-sage-600 font-semibold">
              £{therapist.hourly_rate}/hr
            </Text>
          </View>
        </View>
      </View>
    </PressableCard>
  );
}

export default function ExploreScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState<string | null>(null);

  return (
    <SafeAreaView className="flex-1 bg-cream-50" edges={['top']}>
      {/* Header */}
      <Animated.View
        entering={FadeInDown.delay(100).duration(500)}
        className="px-6 pt-4 pb-4"
      >
        <Text className="text-charcoal-900 text-2xl font-bold mb-4">
          Find Therapists
        </Text>

        {/* Search Bar */}
        <View className="flex-row items-center bg-white border border-cream-300 rounded-xl px-4 py-3">
          <Search size={20} color={Colors.charcoal[400]} />
          <TextInput
            className="flex-1 ml-3 text-base text-charcoal-900"
            placeholder="Search by name, location..."
            placeholderTextColor={Colors.charcoal[300]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity className="ml-2 p-2 bg-cream-100 rounded-lg">
            <Filter size={18} color={Colors.charcoal[600]} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Specialization Filters */}
      <Animated.View entering={FadeInDown.delay(200).duration(500)}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-6 pb-4"
          contentContainerStyle={{ gap: 8 }}
        >
          <TouchableOpacity
            className={`px-4 py-2 rounded-full border ${
              !selectedSpecialization
                ? 'bg-sage-500 border-sage-500'
                : 'bg-white border-cream-300'
            }`}
            onPress={() => setSelectedSpecialization(null)}
          >
            <Text
              className={`text-sm font-medium ${
                !selectedSpecialization ? 'text-white' : 'text-charcoal-700'
              }`}
            >
              All
            </Text>
          </TouchableOpacity>

          {SPECIALIZATIONS.map((spec) => (
            <TouchableOpacity
              key={spec.value}
              className={`px-4 py-2 rounded-full border ${
                selectedSpecialization === spec.value
                  ? 'bg-sage-500 border-sage-500'
                  : 'bg-white border-cream-300'
              }`}
              onPress={() => setSelectedSpecialization(spec.value)}
            >
              <Text
                className={`text-sm font-medium ${
                  selectedSpecialization === spec.value
                    ? 'text-white'
                    : 'text-charcoal-700'
                }`}
              >
                {spec.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      {/* Results */}
      <FlatList
        data={mockTherapists}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInDown.delay(300 + index * 100).duration(500)}
            className="px-6"
          >
            <TherapistCard therapist={item} />
          </Animated.View>
        )}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View className="px-6 pb-3">
            <Text className="text-charcoal-500 text-sm">
              {mockTherapists.length} therapists found
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

