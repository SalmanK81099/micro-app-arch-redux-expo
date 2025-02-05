import { Stack } from 'expo-router';
import { CombinedStoreProvider } from '@micro/features-support/src/providers/CombinedStoreProvider';

export default function SupportAppLayout() {
  return (
    <CombinedStoreProvider>
      <Stack>
        <Stack.Screen
          name='(support)'
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </CombinedStoreProvider>
  );
}
