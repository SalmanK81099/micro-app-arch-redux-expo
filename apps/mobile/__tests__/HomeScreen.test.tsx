import { render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { StoreProvider } from '@micro/core-store';
import { setUser } from '@micro/core-store/src/root';
import { store } from '@micro/core-store/src/root';

import HomeScreen from '../app/(tabs)/index';

const initialMetrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

const renderHome = () =>
  render(
    <SafeAreaProvider initialMetrics={initialMetrics}>
      <StoreProvider>
        <HomeScreen />
      </StoreProvider>
    </SafeAreaProvider>
  );

describe('HomeScreen', () => {
  it('renders the host app heading', async () => {
    await renderHome();
    expect(screen.getByText('Welcome to Micro')).toBeTruthy();
  });

  it('renders the accounts widget owned by features-accounts', async () => {
    await renderHome();
    expect(screen.getByText('My accounts')).toBeTruthy();
    expect(screen.getByText('Main account')).toBeTruthy();
    expect(screen.getByText('Savings')).toBeTruthy();
    expect(screen.getByText('£140.80')).toBeTruthy();
  });

  it('renders the upcoming payment widget owned by features-payments', async () => {
    await renderHome();
    expect(screen.getByText('Upcoming payment')).toBeTruthy();
    expect(
      screen.getByText(
        'You have a £9 payment to Netflix scheduled to be taken tomorrow'
      )
    ).toBeTruthy();
  });

  it('reads the signed-in user from the shared core store', async () => {
    store.dispatch(
      setUser({
        id: 'u1',
        email: 'ada@example.com',
        name: 'Ada',
        preferences: { language: 'en', notifications: true },
      })
    );
    await renderHome();
    expect(store.getState().user.user?.name).toBe('Ada');
    expect(screen.getByText('Welcome to Micro')).toBeTruthy();
  });
});
