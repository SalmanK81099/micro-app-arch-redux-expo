import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { ticketsSlice, Ticket } from './slices/tickets';

// RTK Query API
export const supportApi = createApi({
  reducerPath: 'supportApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/support',
    prepareHeaders: (headers) => {
      console.log('🎫 Support API Request Headers:', headers);
      return headers;
    },
  }),
  tagTypes: ['Ticket'],
  endpoints: (builder) => ({
    getTickets: builder.query<Ticket[], void>({
      query: () => 'tickets',
      providesTags: ['Ticket'],
      onQueryStarted: async (_, { queryFulfilled, dispatch }) => {
        try {
          const { data } = await queryFulfilled;
          console.log('🎫 Support Tickets Fetched:', data);
          dispatch(ticketsSlice.actions.setTickets(data));
        } catch (error) {
          console.error('❌ Error fetching tickets:', error);
          dispatch(ticketsSlice.actions.setError('Failed to fetch tickets'));
        }
      },
    }),
    createTicket: builder.mutation<Ticket, Partial<Ticket>>({
      query: (ticket) => ({
        url: 'tickets',
        method: 'POST',
        body: ticket,
      }),
      invalidatesTags: ['Ticket'],
      onQueryStarted: async (ticket, { queryFulfilled, dispatch }) => {
        console.log('📝 Creating Support Ticket:', ticket);
        try {
          const { data } = await queryFulfilled;
          console.log('✅ Support Ticket Created:', data);
          dispatch(ticketsSlice.actions.addTicket(data));
        } catch (error) {
          console.error('❌ Error creating ticket:', error);
          dispatch(ticketsSlice.actions.setError('Failed to create ticket'));
        }
      },
    }),
    updateTicketStatus: builder.mutation<
      Ticket,
      { id: string; status: Ticket['status'] }
    >({
      query: ({ id, status }) => ({
        url: `tickets/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Ticket'],
      onQueryStarted: async ({ id, status }, { queryFulfilled, dispatch }) => {
        console.log(`🔄 Updating Ticket ${id} Status:`, status);
        try {
          const { data } = await queryFulfilled;
          console.log('✅ Ticket Status Updated:', data);
          dispatch(ticketsSlice.actions.updateTicketStatus({ id, status }));
        } catch (error) {
          console.error('❌ Error updating ticket status:', error);
          dispatch(
            ticketsSlice.actions.setError('Failed to update ticket status')
          );
        }
      },
    }),
  }),
});

// Export actions and hooks
export const {
  useGetTicketsQuery,
  useCreateTicketMutation,
  useUpdateTicketStatusMutation,
} = supportApi;

export * from './slices/tickets';

// Export reducers and middleware for the root store
export const supportReducer = {
  tickets: ticketsSlice.reducer,
  [supportApi.reducerPath]: supportApi.reducer,
};

export const supportMiddleware = supportApi.middleware;

// Types for the support store
export interface SupportRootState {
  tickets: ReturnType<typeof ticketsSlice.reducer>;
  [supportApi.reducerPath]: ReturnType<typeof supportApi.reducer>;
}

// Typed hooks
export const useAppDispatch = () => useDispatch();
export const useAppSelector: TypedUseSelectorHook<SupportRootState> =
  useSelector;
