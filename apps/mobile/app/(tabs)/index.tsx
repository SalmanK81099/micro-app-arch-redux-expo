import { LogBox, StyleSheet } from 'react-native';

import { StyledPageLayout, StyledText } from '@micro/core-components';
import { AccountWidget } from '@micro/features-accounts';
import { UpcomingPaymentWidget } from '@micro/features-payments';
import { useMainAppUser } from '@micro/core-store/src/root';

LogBox.ignoreAllLogs();

export default function HomeScreen() {
  const { user } = useMainAppUser();
  console.log('👤 User:', user);
  return (
    <StyledPageLayout>
      <StyledText style={styles.title}>Welcome to Micro</StyledText>
      <AccountWidget />
      <UpcomingPaymentWidget />
    </StyledPageLayout>
  );
}

const styles = StyleSheet.create({
  title: {
    textAlign: 'center',
  },
});
