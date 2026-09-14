import {
  paymentMethodsSlice,
  paymentsApi,
  paymentsMiddleware,
  paymentsReducer,
  setPaymentMethods,
  setTransactions,
  setTransactionsError,
  setTransactionsLoading,
  settingsSlice,
  transactionsSlice,
  updateSettings,
  type PaymentMethod,
  type Transaction,
} from '../index';

const transaction: Transaction = {
  id: 't1',
  amount: 42.5,
  date: '2026-01-01',
  status: 'settled',
};

const method: PaymentMethod = {
  id: 'm1',
  type: 'card',
  details: { last4: '4242' },
  isDefault: true,
};

describe('transactions slice', () => {
  const reduce = transactionsSlice.reducer;
  const initialState = reduce(undefined, { type: '@@INIT' });

  it('starts empty and idle', () => {
    expect(initialState).toEqual({ transactions: [], loading: false, error: null });
  });

  it('stores transactions and tracks loading/error', () => {
    expect(reduce(initialState, setTransactions([transaction])).transactions).toEqual([
      transaction,
    ]);
    expect(reduce(initialState, setTransactionsLoading(true)).loading).toBe(true);
    expect(reduce(initialState, setTransactionsError('nope')).error).toBe('nope');
  });
});

describe('payment methods slice', () => {
  const reduce = paymentMethodsSlice.reducer;
  const initialState = reduce(undefined, { type: '@@INIT' });

  it('stores payment methods', () => {
    expect(reduce(initialState, setPaymentMethods([method])).methods).toEqual([method]);
  });
});

describe('payment settings slice', () => {
  const reduce = settingsSlice.reducer;
  const initialState = reduce(undefined, { type: '@@INIT' });

  it('defaults to USD with auto-pay off', () => {
    expect(initialState.settings).toEqual({
      currency: 'USD',
      autoPayEnabled: false,
      paymentThreshold: 0,
    });
  });

  it('merges a partial update instead of replacing the settings object', () => {
    const state = reduce(initialState, updateSettings({ currency: 'GBP' }));
    expect(state.settings).toEqual({
      currency: 'GBP',
      autoPayEnabled: false,
      paymentThreshold: 0,
    });
  });
});

describe('payments store wiring', () => {
  it('exports every reducer the root store mounts', () => {
    expect(Object.keys(paymentsReducer).sort()).toEqual([
      'paymentMethods',
      'paymentSettings',
      'transactions',
      paymentsApi.reducerPath,
    ].sort());
  });

  it('exports the RTK Query middleware', () => {
    expect(paymentsMiddleware).toBe(paymentsApi.middleware);
  });
});
