/**
 * Guards the import paths that packages and the README advertise as public.
 * A broken `main` field or a missing barrel re-export only shows up at
 * bundle time otherwise — Metro's extension probing hides it from tsc.
 */
import { StoreProvider, useAppSelector, useMainAppUser } from '@micro/core-store';
import { setUser, setTheme, store } from '@micro/core-store/src/root';
import {
  setTickets,
  useCreateTicketMutation,
  useGetTicketsQuery,
} from '@micro/features-support/src/store';
import {
  setTransactions,
  useAddTransactionMutation,
  useGetTransactionsQuery,
} from '@micro/features-payments/src/store';
import { SupportScreen } from '@micro/features-support';
import { PaymentScreen } from '@micro/features-payments';

describe('@micro/core-store public surface', () => {
  it('exports the provider and the shared typed hooks', () => {
    expect(typeof StoreProvider).toBe('function');
    expect(typeof useAppSelector).toBe('function');
    expect(typeof useMainAppUser).toBe('function');
  });

  it('exports the store and core slice actions from /src/root', () => {
    expect(typeof setUser).toBe('function');
    expect(typeof setTheme).toBe('function');
    expect(typeof store.getState).toBe('function');
  });
});

describe('feature package surfaces', () => {
  it('exposes support slice actions and query hooks from the store entry point', () => {
    expect(typeof setTickets).toBe('function');
    expect(typeof useGetTicketsQuery).toBe('function');
    expect(typeof useCreateTicketMutation).toBe('function');
  });

  it('exposes payments slice actions and query hooks from the store entry point', () => {
    expect(typeof setTransactions).toBe('function');
    expect(typeof useGetTransactionsQuery).toBe('function');
    expect(typeof useAddTransactionMutation).toBe('function');
  });

  it('exposes screens from the package root', () => {
    expect(typeof SupportScreen).toBe('function');
    expect(typeof PaymentScreen).toBe('function');
  });
});
