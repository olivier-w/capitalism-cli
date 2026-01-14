# Capitalism CLI
<img width="527" height="466" alt="image" src="https://github.com/user-attachments/assets/c4eb295f-a9eb-430d-9171-df8c76c06b15" />

## Quick Start

To install dependencies:

```bash
bun install
bun start
```

## How to Play

You start with **$100** and a **bicycle** in Metro City. Your goal: make as much money as possible in **30 days**.

### The Core Loop

1. **Buy** commodities where they're cheap (cities that produce them)
2. **Travel** to another city
3. **Sell** where demand is high (cities that need them)
4. **Upgrade** your vehicle to carry more cargo
5. **Repeat**

### Cities & Markets

| City | Produces (Cheap) | Needs (Expensive) |
|------|------------------|-------------------|
| Metro City | Electronics | Produce, Fuel |
| Port Town | Coffee, Textiles | Electronics |
| Industrial Zone | Fuel | Coffee, Textiles |

### Commodities

- **Coffee** - Base price $40
- **Electronics** - Base price $150
- **Textiles** - Base price $30
- **Fuel** - Base price $60
- **Produce** - Base price $20

Prices fluctuate daily. Learn the patterns to maximize profits.

### Vehicles

| Vehicle | Capacity | Cost | Notes |
|---------|----------|------|-------|
| Bicycle | 20 | Free | Starting vehicle |
| Car | 50 | $500 | Faster travel |
| Truck | 150 | $2,000 | Serious hauling |
| Cargo Plane | 100 | $10,000 | Most efficient |
| Cargo Ship | 500 | $25,000 | Maximum capacity |

### Energy

- You have **100 energy** per day
- Trading costs **5 energy**
- Travel costs **20-30 energy** (depends on destination and vehicle)
- **Rest** to advance to the next day and restore energy

### Controls

Use **arrow keys** to navigate menus and **Enter** to select. When buying/selling, type the quantity and press **Enter**.

## Scoring

After 30 days, your final score is calculated:

```
Final Score = Cash + Cargo Value + Vehicle Value (50% of cost)
```

### Ranks

| Score | Rank |
|-------|------|
| $50,000+ | Trade Baron |
| $20,000+ | Wealthy Merchant |
| $10,000+ | Successful Trader |
| $5,000+ | Aspiring Entrepreneur |
| $1,000+ | Small Business Owner |
| < $1,000 | Struggling Peddler |

## Tips

- Electronics have the highest profit margins but cost more upfront
- Watch for price patterns - some commodities have weekly cycles
- Upgrade to a truck early to increase your earning potential
- Don't waste energy traveling with empty cargo

## Development

```bash
# Run in development mode (auto-reload)
bun dev

# Run normally
bun start
```

### Project Structure

```
src/
├── index.tsx          # Entry point
├── data/              # Game data (commodities, locations, vehicles)
├── game/              # Game state types
├── systems/           # Market price calculation
├── store/             # Zustand state management
└── ui/
    ├── components/    # Reusable UI components
    └── screens/       # Game screens
```

### Tech Stack

- **Bun** - Runtime
- **TypeScript** - Language
- **Ink** - React for CLI
- **Zustand** - State management

## License

MIT
