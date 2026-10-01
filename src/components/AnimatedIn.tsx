import React, { useEffect, useState } from 'react';
import { Animated, type ViewProps } from 'react-native';

interface AnimatedInProps extends ViewProps {
  delay?: number;
}

/**
 * Wraps children in an Animated.View that fades and slides in on mount.
 * Useful for list items and cards to provide a polished feel.
 */
export function AnimatedIn({ children, delay = 0, style, ...props }: AnimatedInProps) {
  const [opacity] = useState(() => new Animated.Value(0));
  const [translateY] = useState(() => new Animated.Value(16));

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        delay,
        useNativeDriver: true,
      }),
    ]);

    animation.start();
    return () => animation.stop();
  }, [opacity, translateY, delay]);

  return (
    <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]} {...props}>
      {children}
    </Animated.View>
  );
}
