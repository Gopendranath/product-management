# Product Management Dashboard (`application/`)

Responsive product dashboard. Browse, search, filter, sort, and paginate [DummyJSON](https://dummyjson.com/products) products, view details, add products via a validated form. Hiring assignment scope (~8h). Quality and maintainability over breadth.

Live URL: `TODO: add Vercel prod URL here` (preview deploys per PR).

## Setup

Requires Node 24 + pnpm 11 (see `packageManager` in `package.json`).

```bash
pnpm install
pnpm dev      # http://localhost:3000
```

No `.env` needed. Public DummyJSON API only. No secrets in repo.

## Scripts

| Command          | Purpose                              |
| ---------------- | ------------------------------------ |
| `pnpm dev`       | Local dev server                     |
| `pnpm build`     | Production build (verify before PR)  |
| `pnpm start`     | Serve production build               |
| `pnpm typecheck` | `tsc --noEmit`, strict, no `any`     |
| `pnpm lint`      | Biome check (read-only)              |
| `pnpm lint:fix`  | Biome check with safe fixes applied  |
| `pnpm format`    | Biome formatter                      |

Verify before claiming done: `pnpm typecheck && pnpm lint && pnpm build`.

## Choices

- Next.js App Router + TypeScript strict (`noUncheckedIndexedAccess`, no `any`). SSR listing/details for first paint; client controls for filters.
- Tailwind v4 + Shadcn/UI primitives (`src/components/ui`). Tokens in `src/app/globals.css`.
- State: split Context providers (`src/store`): filters, favs, theme, toasts, local products, mock auth. No mega-store.
- API: single-axis `src/services` client over `https://dummyjson.com/products` (`q` wins, else category, else base). Listing owns combine + display-total rule.
- Motion: CSS transitions default; springs (`motion` package) isolated to drawer/modal/sheet.
- Icons: `@phosphor-icons/react` only, stroke 1.5. Fonts: Geist + Geist Mono via `next/font`.
- Images: `next/image` with remote patterns (`cdn.dummyjson.com`, `picsum.photos` fallback); user URLs unoptimized + placeholder.

## Structure

```text
src/
  app/            # routes: / (listing), /products/[id], /products/new
  components/     # shared UI + ui/ primitives
  services/       # api-client (single-axis fetch, typed errors)
  store/          # split Context providers
  hooks/          # debounced search, media, form helpers
  types/          # strict Product, Paginated, ApiError models
  utils/          # formatting, slugs, validation helpers
  layouts/        # shell/nav slots
  lib/            # shadcn utils (cn)
```

Specs live one level up: `../HLD.md`, `../LLD/`, `../DESIGN.md`, `../TODO.md`.

## State approach

- Filters: `search/category/sortBy/order/page`, `pageSize 12` const. Page resets only on search/category/sort change.
- Favs + theme + mock-auth persist (`favs-v1`, `theme-v1`, `auth-mock-v1`) with parse guards. SSR starts light, client applies system theme.
- Local adds: mock POST id ignored, temp `-Date.now()` assigned, memory only. Visible per display-total rule (server total + locals on page-1 default view).
- Toasts keyed by action, max 3, single toast per failure. api-client never toasts.

## Assumptions and limits

- DummyJSON POST is mock and does not persist; reload loses local adds (accepted demo behavior).
- Search + category + sort do not compose server-side; listing combines within the returned page.
- Mock auth gates `/products/new` only; listing/details public. Demo-only, bypassable. No test accounts needed.
- Categories fall back to `beauty, fragrances, furniture, groceries` when the API fails.
- Lint is Biome (`pnpm lint`), not ESLint — scaffold default, accepted deviation from `TODO.md` §0 label.
- Git root is `application/`; specs (`HLD.md`, `LLD/`, `DESIGN.md`, `TODO.md`) live one level up, outside the repo.

## Time spent

- Setup + tooling: this scaffold pass.
