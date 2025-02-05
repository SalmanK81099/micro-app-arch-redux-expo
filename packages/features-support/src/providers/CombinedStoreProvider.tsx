import React from 'react';
import { StoreProvider } from '@micro/core-store';
import { SupportStoreProvider } from '../store/provider';

export const CombinedStoreProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <SupportStoreProvider>{children}</SupportStoreProvider>;
};
