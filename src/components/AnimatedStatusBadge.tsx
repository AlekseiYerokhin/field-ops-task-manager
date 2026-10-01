import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import type { TaskStatus } from '../types';

interface AnimatedStatusBadgeProps {
  status: TaskStatus;
  color: string;
}

/**
 * Status badge that scales in when the status changes, giving feedback
 * that the state transitioned.
 */
export function AnimatedStatusBadge({ status, color }: AnimatedStatusBadgeProps) {
  const [scale] = useState(() => new Animated.Value(0.8));

  useEffect(() => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 4,
      tension: 60,
      useNativeDriver: true,
    }).start();
  }, [status, scale]);

  return (
    <Animated.View style={[styles.badge, { backgroundColor: color, transform: [{ scale }] }]}>
      <Text style={styles.text}>{status}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
