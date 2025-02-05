import { ExpoRoot } from 'expo-router';
import { combineContexts } from './combineContexts';
import { StoreProvider } from '../../core-store/src/index';

interface Props {
  contexts: any;
}

export function MicroAppRoot({ contexts }: Props) {
  return (
    <StoreProvider>
      <ExpoRoot context={combineContexts(contexts)} />
    </StoreProvider>
  );
}
