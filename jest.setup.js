/**
 * The stores log every action with emoji prefixes, which drowns out test
 * output. Silence those channels but keep warnings and errors visible.
 */
beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'group').mockImplementation(() => {});
  jest.spyOn(console, 'groupEnd').mockImplementation(() => {});
});

afterAll(() => {
  jest.restoreAllMocks();
});
