import {
  addTicket,
  setError,
  setLoading,
  setTickets,
  ticketsSlice,
  updateTicketStatus,
  type Ticket,
} from '../slices/tickets';

const ticket = (overrides: Partial<Ticket> = {}): Ticket => ({
  id: '1',
  title: 'Card declined',
  description: 'My card was declined at the till',
  status: 'open',
  createdAt: '2026-01-01',
  ...overrides,
});

const reduce = ticketsSlice.reducer;
const initialState = reduce(undefined, { type: '@@INIT' });

describe('tickets slice', () => {
  it('starts empty and idle', () => {
    expect(initialState).toEqual({ items: [], loading: false, error: null });
  });

  it('replaces the list on setTickets', () => {
    const state = reduce(initialState, setTickets([ticket()]));
    expect(state.items).toHaveLength(1);
    expect(state.items[0].title).toBe('Card declined');
  });

  it('appends on addTicket without dropping existing tickets', () => {
    const withOne = reduce(initialState, setTickets([ticket()]));
    const state = reduce(withOne, addTicket(ticket({ id: '2', title: 'Lost card' })));
    expect(state.items.map((t) => t.id)).toEqual(['1', '2']);
  });

  it('updates the status of the addressed ticket only', () => {
    const seeded = reduce(
      initialState,
      setTickets([ticket(), ticket({ id: '2', title: 'Lost card' })])
    );
    const state = reduce(seeded, updateTicketStatus({ id: '2', status: 'closed' }));
    expect(state.items.find((t) => t.id === '2')?.status).toBe('closed');
    expect(state.items.find((t) => t.id === '1')?.status).toBe('open');
  });

  it('ignores a status update for an unknown ticket', () => {
    const seeded = reduce(initialState, setTickets([ticket()]));
    const state = reduce(seeded, updateTicketStatus({ id: 'nope', status: 'closed' }));
    expect(state.items).toEqual(seeded.items);
  });

  it('tracks loading and error flags', () => {
    expect(reduce(initialState, setLoading(true)).loading).toBe(true);
    expect(reduce(initialState, setError('boom')).error).toBe('boom');
    expect(reduce(initialState, setError(null)).error).toBeNull();
  });

  it('does not mutate the previous state', () => {
    const seeded = reduce(initialState, setTickets([ticket()]));
    reduce(seeded, addTicket(ticket({ id: '2' })));
    expect(seeded.items).toHaveLength(1);
  });
});
