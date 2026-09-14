import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { StoreProvider } from '../index';
import {
  setOnlineStatus,
  setTheme,
  setUser,
  store,
  useAppSelector,
  useMainAppUser,
  type User,
} from '../root';
import { setTickets } from '@micro/features-support/src/store/index';
import { setTransactions } from '@micro/features-payments/src/store/index';

const user: User = {
  id: 'u1',
  email: 'ada@example.com',
  name: 'Ada',
  preferences: { language: 'en', notifications: true },
};

describe('root store composition', () => {
  it('mounts core, payments and support reducers into one state tree', () => {
    expect(Object.keys(store.getState()).sort()).toEqual(
      [
        'mainApi',
        'mobile',
        'paymentMethods',
        'paymentSettings',
        'paymentsApi',
        'supportApi',
        'tickets',
        'transactions',
        'user',
      ].sort()
    );
  });

  it('applies core slice actions', () => {
    store.dispatch(setUser(user));
    expect(store.getState().user.user).toEqual(user);

    store.dispatch(setTheme('dark'));
    store.dispatch(setOnlineStatus(false));
    expect(store.getState().mobile).toEqual({ theme: 'dark', isOnline: false });
  });

  it('routes a support micro-app action into the shared store', () => {
    store.dispatch(
      setTickets([
        {
          id: '1',
          title: 'Card declined',
          description: 'Declined at the till',
          status: 'open',
          createdAt: '2026-01-01',
        },
      ])
    );
    expect(store.getState().tickets.items).toHaveLength(1);
  });

  it('routes a payments micro-app action into the shared store', () => {
    store.dispatch(
      setTransactions([{ id: 't1', amount: 42.5, date: '2026-01-01', status: 'settled' }])
    );
    expect(store.getState().transactions.transactions).toHaveLength(1);
  });
});

describe('StoreProvider', () => {
  it('exposes core user state to a consuming component', async () => {
    store.dispatch(setUser(user));

    const Consumer = () => {
      const { user: current } = useMainAppUser();
      return <Text>{current ? `Hello ${current.name}` : 'No user'}</Text>;
    };

    await render(
      <StoreProvider>
        <Consumer />
      </StoreProvider>
    );

    expect(screen.getByText('Hello Ada')).toBeTruthy();
  });

  it('exposes micro-app state through the shared typed selector', async () => {
    store.dispatch(setTheme('light'));

    const Consumer = () => {
      const theme = useAppSelector((state) => state.mobile.theme);
      return <Text>{`theme:${theme}`}</Text>;
    };

    await render(
      <StoreProvider>
        <Consumer />
      </StoreProvider>
    );

    expect(screen.getByText('theme:light')).toBeTruthy();
  });
});
