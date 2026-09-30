import { render, screen } from '@testing-library/react-native';
import TaskListScreen from './TaskListScreen';

describe('TaskListScreen', () => {
  it('renders without crashing', () => {
    render(<TaskListScreen />);
    // Basic smoke test - component should render without errors
    expect(screen).toBeTruthy();
  });
});
