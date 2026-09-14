# Micro App Architecture Demo

A React Native monorepo that demonstrates **micro-frontends on Expo Router**: three
independently runnable Expo apps whose routes and Redux state compose into a single
host app at build time.

The demo is a small banking UI — accounts, payments and support — but the point is
the wiring, not the product. Two problems get solved here:

1. **Route composition.** `apps/payments` and `apps/support` are complete Expo apps
   you can run on their own. The host app (`apps/mobile`) merges their route trees
   into its own, so `(payments)/pay` and `(support)/call-us` become real routes in
   the host without those files moving out of their packages.
2. **Store composition.** Each feature owns its slices, RTK Query API and middleware.
   The host store mounts all of them into one state tree, so a screen shipped by the
   support team can read the user object owned by the core team.

Built on **Expo SDK 57** — React 19.2, React Native 0.86, Expo Router 57, with the
New Architecture and React Compiler enabled.

---

## Repository layout

```
apps/
  mobile/      Host app — composes every micro app into one route tree
  payments/    Payments micro app (standalone Expo app)
  support/     Support micro app (standalone Expo app)

packages/
  core-navigation/     combineContexts + MicroAppRoot — the composition engine
  core-store/          Root Redux store, user + mobile slices, StoreProvider
  core-components/     Shared design system (StyledText, Widget, StyledListItem…)
  features-accounts/   Accounts widget
  features-payments/   Payments screens, widgets, slices and RTK Query API
  features-support/    Support screens, widgets, slices and RTK Query API
```

Workspace names: `mobile`, `@micro/app-payments`, `@micro/app-support`, and
`@micro/<package-name>` for everything under `packages/`.

---

## Prerequisites

- **Node.js** `^20.19.4 || ^22.13.0 || ^24.3.0 || >=25` — the range React Native 0.86
  and Metro require. Older 20.x patches will fail to start Metro.
- **Yarn 1.x** (the repo pins Yarn 1.22.22 via `.yarnrc`; workspaces are Yarn Classic)
- Expo Go, or an iOS Simulator / Android Emulator for native builds

---

## Getting started

```bash
yarn install
```

Each app is its own Expo project, so start whichever one you want:

```bash
yarn workspace mobile start              # host app, includes payments + support
yarn workspace @micro/app-payments start # payments on its own
yarn workspace @micro/app-support start  # support on its own
```

Platform shortcuts are available per app:

```bash
yarn workspace mobile ios
yarn workspace mobile android
yarn workspace mobile web
```

> Metro watches the whole monorepo, so edits in `packages/` hot-reload into whichever
> app is running. The `EXPO_USE_METRO_WORKSPACE_ROOT=1` still present in each `start`
> script is a leftover — SDK 57 enables it by default and prints a notice saying so.
> Use `EXPO_NO_METRO_WORKSPACE_ROOT=1` if you ever need to turn it off.

---

## How route composition works

An Expo Router app is normally driven by a single `require.context` over its `app/`
directory. `combineContexts` builds a synthetic context that spans several.

The host declares which directories to pull in and under what route prefix
(`apps/mobile/index.js`):

```js
const contexts = [
  { context: require.context("./app", true, /.*/), prefix: "." },
  { context: require.context("../payments/app/(payments)", true, /.*/), prefix: "(payments)" },
  { context: require.context("../support/app/(support)", true, /.*/), prefix: "(support)" },
];

export function App() {
  return <MicroAppRoot contexts={contexts} />;
}
```

`combineContexts` (in `@micro/core-navigation`) merges them:

- `keys()` returns every route from every context, each rewritten to sit under its
  prefix — `./pay.tsx` from the payments app becomes `(payments)/pay.tsx`.
- Calling the context with a route strips the prefix and delegates to the context
  that owns it, returning `null` when no micro app provides that route.

`MicroAppRoot` then hands the merged context to Expo Router inside the shared store:

```tsx
<StoreProvider>
  <ExpoRoot context={combineContexts(contexts)} />
</StoreProvider>
```

The result: one navigation tree, one store, but each micro app stays a separate
buildable project. `packages/core-navigation/src/__tests__/combineContexts.test.ts`
pins this behaviour down.

---

## State architecture

### Root store

`@micro/core-store` owns the shared slices and mounts every feature's reducers and
middleware into one `configureStore` call. The resulting state tree:

| Key | Owner | Contents |
| --- | --- | --- |
| `user` | core-store | `{ user, loading, error }` |
| `mobile` | core-store | `{ theme, isOnline }` |
| `mainApi` | core-store | RTK Query cache |
| `tickets` | features-support | `{ items, loading, error }` |
| `supportApi` | features-support | RTK Query cache |
| `transactions` | features-payments | `{ transactions, loading, error }` |
| `paymentMethods` | features-payments | `{ methods, loading, error }` |
| `paymentSettings` | features-payments | `{ settings, loading, error }` |
| `paymentsApi` | features-payments | RTK Query cache |

Each feature exports a reducer map and middleware that the root store spreads in:

```ts
export const paymentsReducer = {
  transactions: transactionsSlice.reducer,
  paymentMethods: paymentMethodsSlice.reducer,
  paymentSettings: settingsSlice.reducer,
  [paymentsApi.reducerPath]: paymentsApi.reducer,
};

export const paymentsMiddleware = paymentsApi.middleware;
```

Adding a feature to the host store is therefore two spreads, not a rewrite.

### Reading state

Shared state and typed hooks come from `@micro/core-store`:

```tsx
import { useAppSelector, useMainAppUser } from '@micro/core-store';

const MyComponent = () => {
  const { user } = useMainAppUser();
  const theme = useAppSelector((state) => state.mobile.theme);
  // …
};
```

Feature slices and RTK Query hooks live in each feature's **store** entry point —
the package root only exports screens and widgets:

```tsx
// Correct
import { useCreateTicketMutation, setTickets } from '@micro/features-support/src/store';
import { useAddTransactionMutation } from '@micro/features-payments/src/store';

// Screens and widgets only — no store hooks here
import { SupportScreen } from '@micro/features-support';
```

### Debug logging

Every slice logs its transitions, and the root store has a logger middleware that
wraps each action in a `console.group`. Prefixes: 👤 user, 🎫 tickets, 💳 payments,
⏳ loading, ❌ errors. The test setup silences `console.log`/`group` so suites stay
readable.

---

## Testing

Tests run on `jest-expo` and React Native Testing Library, against the same runtime
the apps bundle with.

`jest.config.js` at the repo root is the **only** Jest config — each workspace is a
project inside it. Workspaces deliberately do not carry their own config, so a fix
made once at the root applies to every way of invoking the tests.

```bash
yarn test          # every workspace
yarn test:watch    # watch mode
yarn typecheck     # root TypeScript project — every app and package
```

Run a single workspace, either way round:

```bash
yarn test --selectProjects core-components   # from the root
yarn workspace @micro/core-store test        # from the workspace
```

> Workspace `test` scripts `cd` to the root before invoking Jest. Run from inside a
> package and Jest resolves the `@micro/*` workspace links against the wrong
> directory, which surfaces as a confusing `NoMappedModuleFound` error.

Current coverage — 46 tests in 7 suites across 6 workspaces:

| Suite | What it protects |
| --- | --- |
| `core-navigation` | Route merging, prefixing and miss-handling in `combineContexts` |
| `core-store` | Root store composition + cross-micro-app dispatch through `StoreProvider` |
| `core-store` (public API) | The import paths this README advertises actually resolve |
| `features-support` | Tickets slice reducers and immutability |
| `features-payments` | Transactions, payment methods and settings reducers |
| `core-components` | Design-system rendering, press handling, responsive layout |
| `mobile` | HomeScreen integration — widgets from three packages rendering together |

### Two things to know before writing tests

**RNTL v14 renders asynchronously.** `render(...)` and `fireEvent.*(...)` both return
promises and must be awaited. Forget the `await` and `screen` throws
`` `render` function has not been called ``, which is easy to misread as a setup
problem:

```tsx
await render(<StyledText>Hello</StyledText>);
await fireEvent.press(screen.getByText('Pay'));
expect(screen.getByText('Hello')).toBeTruthy();
```

**`immer` and `react-redux` are mapped to their CJS builds** in `jest.config.js`.
Both resolve their `react-native` export condition to an ESM bundle that Jest cannot
parse. If you add a dependency that fails with `Unexpected token 'export'`, it likely
needs the same treatment.

---

## Quality checks

```bash
yarn typecheck        # root typecheck, every app and package
yarn test             # every workspace

cd apps/mobile
npx tsc --noEmit                  # per-app typecheck
npx expo lint                     # eslint-config-expo, flat config
npx expo-doctor                   # dependency + config diagnostics
npx expo export -p ios --clear    # prove the bundle actually builds
```

`expo export` is the most useful pre-merge check: it catches module-resolution and
native-config breakage that typechecking alone misses. Targets are `ios`, `android`
and `web` — the host app is configured for static web rendering, so the web export
also pre-renders every route.

`expo-doctor` reports **19/21** in a sandboxed environment. The two failures are its
config-schema and React Native Directory checks, both of which need network access to
Expo's servers; they pass normally with connectivity.

---

## Upgrading the Expo SDK

Upgrades follow Expo's official [`expo-upgrade` skill](https://github.com/expo/skills),
vendored at `.claude/skills/expo-upgrade` and pinned in `skills-lock.json`. Re-install
or update it with:

```bash
npx skills@latest add expo/skills --skill expo-upgrade
```

The upgrade loop, per app:

```bash
npx expo install expo@latest
npx expo install --fix      # realign every dependency to the SDK's pinned versions
npx expo-doctor             # diagnose what the bump broke
npx expo export -p ios --clear
```

Then run `yarn test` and `yarn typecheck` from the root. The skill's
`references/` directory documents the per-SDK breaking changes (React 19, the New
Architecture, React Compiler, the React Navigation → Expo Router move).

---

## Known issues

These are real gaps in the demo, called out so nobody trusts them by accident:

- **`CombinedStoreProvider` does not combine stores.** Despite its name,
  `packages/features-support/src/providers/CombinedStoreProvider.tsx` mounts only the
  support store. `ChatWithUsScreen` calls `useMainAppUser()`, which reads `state.user`
  from the core store, so that screen only works inside the host app. Nesting the two
  providers would not fix it — with react-redux the innermost provider wins for every
  `useSelector` — the reducers need to be combined into one store.
- **All three apps share `"scheme": "myapp"`.** Deep links will collide if more than
  one is installed on the same device.
- **RTK Query `onQueryStarted` handlers log and forward, nothing more.** There are no
  optimistic updates and no automatic error clearing.
- **`react-native-media-query`** (used by `StyledPageLayout` and `InnerPadding`) was
  last published in 2023 and declares a `react-native-web ^0.18` peer against the
  SDK's 0.21. It bundles and renders correctly today — there is a test covering it —
  but it is the most likely thing to break on a future upgrade.

---

## Conventions

**Adding a slice.** Create it in the owning feature package, add it to that package's
exported reducer map, and give it explicit `loading`/`error` fields. The root store
picks it up through the existing spread.

**Adding an API endpoint.** Extend the feature's existing `createApi` call rather than
adding a second one — each API means another reducer key and another middleware in the
host store. Declare `providesTags`/`invalidatesTags` so the cache invalidates properly.

**Adding a route to a micro app.** Put it under that app's `app/(<name>)/` directory.
It becomes available in the host automatically via the prefix already registered in
`apps/mobile/index.js`; nothing in the host needs to change.

**Shared UI** belongs in `@micro/core-components`. Feature packages should not import
from each other — go through `core-*` packages instead.
