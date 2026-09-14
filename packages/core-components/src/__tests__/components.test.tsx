import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text } from 'react-native';

import {
  StyledIcon,
  StyledListItem,
  StyledPageLayout,
  StyledText,
  Widget,
  microColors,
} from '../index';

/** SafeAreaView needs measured insets; supply them so layout resolves synchronously. */
const initialMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

const renderWithSafeArea = (ui: React.ReactElement) =>
  render(<SafeAreaProvider initialMetrics={initialMetrics}>{ui}</SafeAreaProvider>);

describe('StyledText', () => {
  it('renders its content', async () => {
    await render(<StyledText>Hello</StyledText>);
    expect(screen.getByText('Hello')).toBeTruthy();
  });

  it.each(['default', 'bold', 'caption'] as const)(
    'renders the %s variant',
    async (type) => {
      await render(<StyledText type={type}>Variant</StyledText>);
      expect(screen.getByText('Variant')).toBeTruthy();
    }
  );
});

describe('Widget', () => {
  it('renders its children', async () => {
    await render(
      <Widget>
        <Text>Body</Text>
      </Widget>
    );
    expect(screen.getByText('Body')).toBeTruthy();
  });

  it('renders the header, subtitle and button label when provided', async () => {
    await render(
      <Widget title="My accounts" subtitle="Total balance: £340.80" buttonLabel="Add +">
        <Text>Body</Text>
      </Widget>
    );
    expect(screen.getByText('My accounts')).toBeTruthy();
    expect(screen.getByText('Total balance: £340.80')).toBeTruthy();
    expect(screen.getByText('Add +')).toBeTruthy();
  });

  it('omits the header entirely when there is no title', async () => {
    await render(
      <Widget>
        <Text>Body</Text>
      </Widget>
    );
    expect(screen.queryByText('My accounts')).toBeNull();
  });
});

describe('StyledListItem', () => {
  it('renders title, subtitle and caption', async () => {
    await render(
      <StyledListItem title="Main account" subtitle="Current" caption="£140.80" />
    );
    expect(screen.getByText('Main account')).toBeTruthy();
    expect(screen.getByText('Current')).toBeTruthy();
    expect(screen.getByText('£140.80')).toBeTruthy();
  });

  it('calls onPress when tapped', async () => {
    const onPress = jest.fn();
    await render(<StyledListItem title="Pay" onPress={onPress} />);
    await fireEvent.press(screen.getByText('Pay'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders an icon when given one', async () => {
    await render(
      <StyledListItem
        title="Savings"
        icon={<StyledIcon name="savings" color={microColors.blue} />}
      />
    );
    expect(screen.getByText('Savings')).toBeTruthy();
  });
});

describe('StyledPageLayout', () => {
  // Exercises react-native-media-query, whose responsive styles must still
  // resolve on the React Native version shipped with Expo SDK 57.
  it('renders children inside the responsive safe-area layout', async () => {
    await renderWithSafeArea(
      <StyledPageLayout>
        <Text>Page content</Text>
      </StyledPageLayout>
    );
    expect(screen.getByText('Page content')).toBeTruthy();
  });
});
