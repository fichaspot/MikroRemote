# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
# Development (starts Vite dev server + Tauri window)
npm run tauri dev

# Production build (outputs to src-tauri/target/release/bundle/)
npm run tauri build

# TypeScript type-check + Vite build (frontend only)
npm run build

# Rust-only check (from src-tauri/)
cd src-tauri && cargo check
```

**Prerequisites:** Node.js >= 18, Rust >= 1.70, Tauri CLI, Visual Studio Build Tools with C++ workload (Windows).

No test framework is configured. No linter is configured.

## Architecture

**Tauri 2.0 desktop app** — Rust backend with React 19 + TypeScript frontend rendered in a WebView.

### IPC Flow (Frontend → Backend)

```
React Component
  → Zustand Store (async actions)
    → lib/*-commands.ts (typed invoke wrappers + snake_case→camelCase mapping)
      → @tauri-apps/api invoke()
        → src-tauri/src/commands/*.rs (#[tauri::command])
          → domain modules (crypto/, database/, router/, ssh/)
```

Every `lib/` command wrapper explicitly maps Rust snake_case response fields to TypeScript camelCase. This mapping is done manually in each file — maintain this pattern when adding new commands.

### Frontend Structure

- **Routing:** Flat routes in `App.tsx` under `AppShell` layout (`/`, `/wireguard`, `/profiles`, `/routers`, `/chr-deploy`)
- **State:** Zustand stores in `src/stores/` — no persist middleware (except `app-store` which manually uses localStorage for theme)
- **Features:** Page-level modules in `src/features/`, each with colocated `components/` subfolder
- **UI primitives:** Custom shadcn-style components in `src/components/ui/` using CVA + tailwind-merge (not installed from shadcn registry)
- **Path alias:** `@/` maps to `./src/`

### Backend Structure (Rust)

- **`lib.rs`** — App setup: registers plugins (opener, dialog, fs), initializes SQLite DB, manages shared state, registers all invoke handlers
- **`commands/`** — Thin Tauri command wrappers (crypto, router, database, chr)
- **`router/connection.rs`** — `RouterState` holding live MikroTik connection via `Arc<Mutex<>>` (Tokio async mutex)
- **`database/`** — SQLite via rusqlite with `Arc<Mutex<Connection>>` (std sync mutex), accessed through `spawn_blocking`
- **`crypto/wireguard.rs`** — x25519-dalek Curve25519 key generation

### Key Patterns

- **WireGuard Wizard** is the core feature: 7-step flow managed by `useWizardStore`. Config generation (.rsc scripts, .conf files) is pure TypeScript in `src/lib/config-generators/`. Key generation is Rust-side.
- **No React Query/SWR** — data fetching lives directly in Zustand store actions
- **Profiles stored as JSON blobs** in SQLite TEXT columns (server, network, server_keys, clients fields)
- **CHR deploy** runs bash over SSH; reboot is fire-and-forget via `tokio::spawn`
- **Tauri v2 capabilities** declared in `src-tauri/capabilities/default.json`

### Styling

- **Tailwind CSS v4** configured via `@theme` directive in `src/styles/globals.css` (no `tailwind.config.js`)
- **Brand color:** `#CF132B` (MikroTik red) as CSS variable `--primary`
- **Theme:** Dark/light mode via `.dark` class on `<html>`, applied before React render in `main.tsx` to prevent flash
- **Fonts:** IBM Plex Sans + IBM Plex Mono loaded from Google Fonts

## Language

The README and UI are in Spanish. Follow existing language conventions when adding user-facing text.
