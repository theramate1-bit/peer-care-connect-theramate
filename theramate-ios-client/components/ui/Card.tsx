/**
 * Card Component
 * Soft cream theme card with subtle shadows
 */

import React from 'react';
import { View, ViewProps, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

interface PressableCardProps extends Omit<TouchableOpacityProps, 'style'> {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

const variantStyles = {
  default: 'bg-white border border-cream-200',
  elevated: 'bg-white shadow-soft',
  outlined: 'bg-transparent border-2 border-cream-300',
  filled: 'bg-cream-100',
};

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export function Card({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  ...props
}: CardProps) {
  return (
    <View
      className={`
        rounded-xl
        ${variantStyles[variant]}
        ${paddingStyles[padding]}
        ${className}
      `}
      {...props}
    >
      {children}
    </View>
  );
}

export function PressableCard({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  onPressIn,
  onPressOut,
  ...props
}: PressableCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = (e: any) => {
    scale.value = withSpring(0.98, { damping: 15 });
    onPressIn?.(e);
  };

  const handlePressOut = (e: any) => {
    scale.value = withSpring(1, { damping: 15 });
    onPressOut?.(e);
  };

  return (
    <AnimatedTouchableOpacity
      style={animatedStyle}
      className={`
        rounded-xl
        ${variantStyles[variant]}
        ${paddingStyles[padding]}
        ${className}
      `}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
      {...props}
    >
      {children}
    </AnimatedTouchableOpacity>
  );
}

// Card subcomponents
export function CardHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <View className={`mb-3 ${className}`}>
      {children}
    </View>
  );
}

export function CardTitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <Animated.Text className={`text-lg font-semibold text-charcoal-900 ${className}`}>
      {children}
    </Animated.Text>
  );
}

export function CardDescription({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <Animated.Text className={`text-sm text-charcoal-500 mt-1 ${className}`}>
      {children}
    </Animated.Text>
  );
}

export function CardContent({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <View className={className}>
      {children}
    </View>
  );
}

export function CardFooter({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <View className={`mt-4 flex-row items-center ${className}`}>
      {children}
    </View>
  );
}

export default Card;

