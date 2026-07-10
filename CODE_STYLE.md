# Code Style

Hard rules for this repo. PRs violating them get rejected. Backend rules apply to `packages/macgamingdb-server`, frontend rules to `src/` and `packages/macgamingdb-ui`.

## Shared TypeScript law

- Strict mode. No `any`, no `as` casts (fix the type, use `Pick<>`, or write a type guard; validate untrusted input with zod at the boundary, then trust the type).
- `type` over `interface` (except when extending third-party interfaces).
- String-literal unions over enums; model fixed sets as union + `Record<Union, T>`.
- One export per file; file name matches the export. Named exports only — no default exports (Next-required files excepted: `page.tsx`, `layout.tsx`, `route.ts`, `sitemap.ts`, `mdx-components.tsx`).
- Multi-arg functions take a single destructured object param.
- Early returns, no else-after-return, no nested ternaries. `const` over `let`. No mutation of inputs.
- No `as unknown as`. Avoid `unknown` — validate untrusted input with zod (`parseXOrThrow` naming), then trust the type.
- Prefer `undefined` over `null`; one nullish convention per boundary. Return `[]`, never `null`, for empty collections.
- `Pick<>`/`Omit<>` to narrow params to what's needed. Don't pass an entity plus its id; don't pass derivable data.
- Types declared above the function; exported types in their own file; don't export what's only used locally. Generics get descriptive names (`TData`, not `T`).
- Prefer `map`/`filter`/`reduce` over manual loops when it stays clear. Files < 300 lines (services < 500) — split when growing.
- Nullish/emptiness checks use guards, never manual expressions: `isDefined()` from `macgamingdb-shared/utils/isDefined` instead of `!== null && !== undefined`; `isNonEmptyString`/`isNonEmptyArray` and friends from `@sniptt/guards`. No `=== true`, no `Boolean()` casts.
- Code shared by frontend and backend lives in `packages/macgamingdb-shared` — pure types + utils, no framework imports.
- Always `await` promises — no fire-and-forget.
- No abbreviations, ever. Booleans read `isX`/`hasX`. One term per concept codebase-wide. Pluralize collections, singular for one entity. `generate` for creating values; never `get` for something that mutates. No `v2` suffixes or leaked internal qualifiers.
- Reserved words: `guard` = NestJS guard only, `Input` = API input schemas, plain argument types are `XParams`, `Context` = React context only, `Props` = component props only.
- Comments: almost none. Only single-line `//` for genuinely counter-intuitive behavior. No JSDoc blocks. Magic numbers become named constants. Debt gets `// TODO:` with an owner.
- Types derive from the API contract (`RouterOutputs`, zod `z.infer`) — never hand-redeclared.
- Errors: functions that throw are suffixed `...OrThrow`. No silent failures, no swallowed errors, no returning `undefined` where a throw is right.
- Prettier: 2-space, single quotes, trailing commas, semicolons, print width 80.
- Tests: AAA structure, names read "should [behavior] when [condition]", test data factories `createTestX(overrides)`. Run scoped to the file under work, not the whole suite.

## Backend (`packages/macgamingdb-server`)

- `engine/` vs `modules/` split. Engine is domain-agnostic infrastructure; engine never imports from modules.
- Module anatomy: `routers/ services/ utils/ types/ constants/ dtos/ exceptions/ drivers/ commands/` as leaf folders. Growth = sub-feature folder, not nesting inside leaves.
- kebab-case files with dotted suffixes: `.service.ts`, `.util.ts`, `.type.ts`, `.constant.ts`, `.dto.ts`, `.module.ts`, `.router.ts`, `.command.ts`, `.exception.ts`.
- Pure logic = util (arrow function, never takes a service). Needs DI = service. No thin wrapper services.
- External vendors live behind `drivers/<vendor>/` with a common contract; orchestrators inject each vendor service explicitly and dispatch with an exhaustive `switch` (throwing default).
- No stateful module-scope singletons — caches, clients, rate limiters are instance fields on injectable services.
- Services throw domain exceptions extending `CustomException` (`<domain>.exception.ts` with a string-literal code union) — never `TRPCError`, never bare `Error`. Mapping to transport errors happens in the tRPC middleware layer.
- Routers are thin: zod input/output + openapi meta + delegate to a service. No business logic in routers, no transport concerns in services.
- DTO per output, named after what it represents; return the narrowest DTO, never expose internal fields. Row shape ≠ DTO — separate types.
- Validation and behavior live in the owning service, not scattered at call sites.
- Auth on every protected procedure; allow-list over deny-list; no PII in logs.
- Exceptions carry a `userFriendlyMessage` separate from the technical message when they surface to users.
- CLI/backfill work = nest-commander `.command.ts` under the domain's `commands/`, always with `--dry-run`.
- Unit tests on utils only, colocated `__tests__/*.spec.ts`; services get exercised through API integration tests, and bug fixes include a regression test.

## Frontend (`src/`, `packages/macgamingdb-ui`)

- `src/app` routes stay thin: wiring + composition. All logic lives in `src/modules/<domain>/` with leaf folders `components/ hooks/ utils/ types/ constants/`.
- Frontend naming (NOT the backend scheme): `ArticleCard.tsx` PascalCase components, `useVerbNoun.ts` hooks, `computeThing.ts` camelCase utils, `SomeType.ts` types. No `.util.ts` suffixes here.
- No module barrels — import direct paths.
- Generic primitives live in `packages/macgamingdb-ui` (category folders `input/ display/ feedback/ layout/ utilities/`, PascalCase component folders). Feature modules never re-implement primitives.
- **`useEffect` is forbidden** unless absolutely necessary and unaddressable any other way. Prefer event handlers, callback refs (React 19 cleanup), `useSyncExternalStore` for subscriptions, and derivation over synced state. The rare unavoidable side effect goes in a dedicated `XxxEffect` component that renders null — never buried in a hook or regular component.
- **`useRef` for state is forbidden.** No state mirrors in refs, no functions-in-refs, no flag refs. DOM/imperative third-party instance handles are the only acceptable refs, and prefer native alternatives (`autoFocus`, `label htmlFor`) even then.
- No `useMemo`/`useCallback`/`memo` without a measured performance need.
- Derive, don't store: keep the id in state, derive the object. Server state belongs to the react-query cache — never copied into local state.
- No umbrella hooks bundling unrelated state + callbacks. No prop-drilling callbacks through 2+ levels.
- Props type suffixed `Props`, destructured in the signature. Callback props `onX`, implementations `handleX`. Props down, events up.
- Prefer a string prop over `children` when the component renders text. Avoid `forwardRef` unless genuinely required.
- Never declare a component inside another component. Components small and focused (< 300 lines) — compose, don't grow monoliths.
- Action hooks don't subscribe to state: a hook exposing a callback reads current values inside the callback at call time, so callers don't re-render on state change.
- Extract complex logic from components into hooks, and pure logic from hooks into utils (utils never receive clients — pass data).
- Prefer batch/many operations over per-item mutation loops. Prefer targeted cache updates (`setQueryData`/keyed invalidation) over blanket `invalidateQueries` where it matters.
- No imperative DOM manipulation (`createElement`, `innerHTML`) — state-driven rendering only.
- Tailwind for styling; extend a component with a prop/variant instead of re-styling it from outside. External styling may touch margins only — padding belongs to the component. No fixed widths on modals/dropdowns — content drives size. Z-index local to the caller, no global hierarchy.
- Component tests: behavior, not implementation — Testing Library, query by role/label/text (never test-ids), `user-event`, `findBy` for async.

## Stack decisions (settled — don't relitigate)

- tRPC + react-query is the data layer (plays Apollo's role). Bun everywhere. Drizzle is the only ORM. Tailwind + shadcn primitives (no CSS-in-JS). No Jotai, no Storybook, no i18n framework until a real need lands.
