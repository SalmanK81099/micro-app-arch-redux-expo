// Re-export everything from root store
export * from './root';
import React from 'react';

// Export Provider component
import { Provider } from 'react-redux';
import { store } from './root';

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <Provider store={store}>{children}</Provider>;
};
