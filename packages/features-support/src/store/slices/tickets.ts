import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'closed' | 'in-progress';
  createdAt: string;
}

interface TicketsState {
  items: Ticket[];
  loading: boolean;
  error: string | null;
}

const initialState: TicketsState = {
  items: [],
  loading: false,
  error: null,
};

export const ticketsSlice = createSlice({
  name: 'tickets',
  initialState,
  reducers: {
    setTickets: (state, action: PayloadAction<Ticket[]>) => {
      console.log('🎫 Setting Tickets:', action.payload);
      state.items = action.payload;
    },
    addTicket: (state, action: PayloadAction<Ticket>) => {
      console.log('➕ Adding Ticket:', action.payload);
      state.items.push(action.payload);
    },
    updateTicketStatus: (
      state,
      action: PayloadAction<{ id: string; status: Ticket['status'] }>
    ) => {
      console.log('🔄 Updating Ticket Status:', action.payload);
      const ticket = state.items.find((t) => t.id === action.payload.id);
      if (ticket) {
        ticket.status = action.payload.status;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      console.log('⏳ Tickets Loading:', action.payload);
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      console.log('❌ Tickets Error:', action.payload);
      state.error = action.payload;
    },
  },
});

export const {
  setTickets,
  addTicket,
  updateTicketStatus,
  setLoading,
  setError,
} = ticketsSlice.actions;
