import { useNavigation } from 'expo-router';
import { StyleSheet, View, Text } from 'react-native';
import { StyledPageLayout, StyledText } from '@micro/core-components';
import { useEffect } from 'react';
import {
  useAppDispatch,
  useMainAppUser,
} from '@micro/core-store/src/slices/user/index';
import {
  useGetTicketsQuery,
  useCreateTicketMutation,
  useAppSelector,
  Ticket,
  setTickets,
} from '../store';

export const ChatWithUsScreen = () => {
  const navigation = useNavigation();
  const { user } = useMainAppUser();

  // Get tickets from the slice state
  const tickets = useAppSelector((state) => state.tickets.items);
  // const ticketsError = useAppSelector((state) => state.tickets.error);
  const dispatch = useAppDispatch();

  console.log('🎫 ChatWithUsScreen ~ tickets from slice:', tickets);

  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: 'Chat with Us',
      headerBackTitleVisible: false,
    });

    dispatch(
      setTickets([
        {
          id: '1',
          title: 'Test Ticket',
          description: 'Test Description',
          status: 'open',
          createdAt: '2021-01-01',
        },
      ])
    );
  }, [navigation]);

  return (
    <StyledPageLayout>
      <View>
        <Text style={styles.title}>Chat with Us Screen</Text>
        {user && <Text>{`Welcome, ${user.name}!`}</Text>}
      </View>
      {tickets && tickets.length > 0 ? (
        <View>
          <Text style={styles.title}>Your Tickets:</Text>
          {tickets.map((ticket: Ticket) => (
            <Text key={ticket.id} style={styles.ticket}>
              {`${ticket.title} - ${ticket.status}`}
            </Text>
          ))}
        </View>
      ) : (
        <Text>No tickets found</Text>
      )}
    </StyledPageLayout>
  );
};

const styles = StyleSheet.create({
  title: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  ticket: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});
