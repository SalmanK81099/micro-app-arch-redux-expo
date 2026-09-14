import { combineContexts, type RequireContext } from '../combineContexts';

/** Builds a minimal `require.context` stand-in backed by a plain object. */
const makeContext = (modules: Record<string, unknown>): RequireContext => {
  const ctx = ((id: string) => modules[id]) as RequireContext;
  ctx.keys = () => Object.keys(modules);
  ctx.resolve = (id: string) => id;
  ctx.id = 'test';
  return ctx;
};

describe('combineContexts', () => {
  const host = makeContext({
    './index.tsx': 'host-index',
    './_layout.tsx': 'host-layout',
  });
  const payments = makeContext({ './pay.tsx': 'payments-pay' });
  const support = makeContext({ './call-us.tsx': 'support-call-us' });

  const combined = combineContexts([
    { context: host, prefix: '.' },
    { context: payments, prefix: '(payments)' },
    { context: support, prefix: '(support)' },
  ]);

  it('exposes every route from every micro app', () => {
    expect(combined.keys()).toEqual([
      './index.tsx',
      './_layout.tsx',
      '(payments)/pay.tsx',
      '(support)/call-us.tsx',
    ]);
  });

  it('namespaces each micro app behind its prefix', () => {
    expect(combined.keys()).toContain('(payments)/pay.tsx');
    expect(combined.keys()).toContain('(support)/call-us.tsx');
  });

  it('resolves a host route to the host module', () => {
    expect(combined('./index.tsx')).toBe('host-index');
  });

  it('resolves a prefixed route to the owning micro app module', () => {
    expect(combined('(payments)/pay.tsx')).toBe('payments-pay');
    expect(combined('(support)/call-us.tsx')).toBe('support-call-us');
  });

  it('returns null for a route no micro app provides', () => {
    expect(combined('(payments)/does-not-exist.tsx')).toBeNull();
  });

  it('reports a stable context id', () => {
    expect(combined.id).toBe('combinedContext');
    expect(combined.resolve('(payments)/pay.tsx')).toBe('(payments)/pay.tsx');
  });
});
