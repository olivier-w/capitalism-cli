# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun start          # Run the game
bun dev            # Run with auto-reload on file changes
bun install        # Install dependencies
```

## Architecture

This is a CLI trading game built with Bun, TypeScript, and Ink (React for terminals).

### Data Flow

```
User Input → Ink UI → Zustand Store → Game State → UI Re-render
```

### Key Modules

- **`src/store/gameStore.ts`** - Zustand store containing all game state and actions (buy, sell, travel, rest, buyVehicle). This is the single source of truth.

- **`src/systems/MarketSystem.ts`** - Price calculation algorithm. Prices are deterministic based on day + location + commodity using seeded random. Location modifiers (produces/needs) create arbitrage opportunities.

- **`src/data/`** - Static game data:
  - `commodities.ts` - Tradeable goods with base prices and min/max bounds
  - `locations.ts` - 3 regions with multiple cities, connections, production, and demand
  - `vehicles.ts` - 5 vehicle tiers with capacity and energy efficiency
  - `events.ts` - Market events (weather, economic) with price effects and durations

- **`src/ui/`** - Ink React components:
  - `App.tsx` - Root component handling screen routing (menu → game → game over)
  - `screens/` - Full-screen views (GameScreen, MarketScreen, TravelScreen, etc.)
  - `components/` - Reusable pieces (Header, Message)

### Game Mechanics

- 30-day timed mode with energy system (100/day)
- Prices vary by location (cheap where produced, expensive where needed)
- Weekly price cycles and daily variance for learnable patterns
- Vehicle upgrades increase cargo capacity and energy efficiency
- **Region unlocking** - 3 regions (starter free, coastal $5k, farming $3k) gate access to locations and commodities
- **Weather/market events** - Random events (25% daily chance) affect commodity prices for several days. Events can be global, regional, or location-specific.

### TypeScript Notes

- Uses `.ts` extensions in imports (required by `allowImportingTsExtensions`)
- `noUncheckedIndexedAccess` is enabled - array access returns `T | undefined`
- JSX uses `react-jsx` transform (no React import needed in components)
