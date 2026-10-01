import React from 'react';
import { Text } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import { AnimatedIn } from './AnimatedIn';
import { AnimatedStatusBadge } from './AnimatedStatusBadge';

describe('AnimatedIn', () => {
  it('renders children', async () => {
    await render(
      <AnimatedIn>
        <Text>Hello</Text>
      </AnimatedIn>
    );

    expect(screen.getByText('Hello')).toBeTruthy();
  });
});

describe('AnimatedStatusBadge', () => {
  it('renders status text', async () => {
    await render(<AnimatedStatusBadge status="New" color="#3b82f6" />);

    expect(screen.getByText('New')).toBeTruthy();
  });

  it('renders different statuses', async () => {
    await render(<AnimatedStatusBadge status="Completed" color="#10b981" />);

    expect(screen.getByText('Completed')).toBeTruthy();
  });
});
