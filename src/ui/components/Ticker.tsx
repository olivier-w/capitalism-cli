import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { type MarketPrice } from '../../systems/MarketSystem.ts';
import { type ActiveEvent } from '../../game/GameState.ts';
import { getEvent } from '../../data/events.ts';

interface TickerProps {
  prices: MarketPrice[];
  hotCommodity: string | null;
  coldCommodity: string | null;
  activeEvents: ActiveEvent[];
  day: number;
}

export const Ticker: React.FC<TickerProps> = ({
  prices,
  hotCommodity,
  coldCommodity,
  activeEvents,
  day,
}) => {
  const [offset, setOffset] = useState(0);

  // Build ticker items
  const items: Array<{ text: string; color: string }> = [];

  // Add hot/cold commodity info
  if (hotCommodity) {
    const hot = prices.find((p) => p.commodityId === hotCommodity);
    if (hot) {
      items.push({
        text: `[HOT] ${hot.name} +35%`,
        color: 'yellowBright',
      });
    }
  }

  if (coldCommodity) {
    const cold = prices.find((p) => p.commodityId === coldCommodity);
    if (cold) {
      items.push({
        text: `[COLD] ${cold.name} -30%`,
        color: 'gray',
      });
    }
  }

  // Add notable prices (cheap/expensive)
  const cheap = prices.filter((p) => p.trend === 'cheap').slice(0, 2);
  const expensive = prices.filter((p) => p.trend === 'expensive').slice(0, 2);

  for (const p of cheap) {
    items.push({
      text: `${p.name} $${p.buyPrice} [LOW]`,
      color: 'greenBright',
    });
  }

  for (const p of expensive) {
    items.push({
      text: `${p.name} $${p.buyPrice} [HIGH]`,
      color: 'redBright',
    });
  }

  // Add active events
  for (const active of activeEvents.slice(0, 2)) {
    const event = getEvent(active.eventId);
    if (event) {
      const daysLeft = active.endDay - day + 1;
      items.push({
        text: `[!] ${event.name} (${daysLeft}d)`,
        color: 'magentaBright',
      });
    }
  }

  // Scroll animation
  useEffect(() => {
    const timer = setInterval(() => {
      setOffset((prev) => (prev + 1) % Math.max(1, items.length));
    }, 2000);
    return () => clearInterval(timer);
  }, [items.length]);

  // Show 3 items at a time
  const visibleItems = [];
  for (let i = 0; i < 3 && items.length > 0; i++) {
    const idx = (offset + i) % items.length;
    const item = items[idx];
    if (item) {
      visibleItems.push(item);
    }
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <Box borderStyle="single" paddingX={1} marginBottom={1}>
      <Text color="cyan" bold>
        {'>>>'}{' '}
      </Text>
      {visibleItems.map((item, i) => (
        <React.Fragment key={i}>
          <Text color={item.color}>{item.text}</Text>
          {i < visibleItems.length - 1 && <Text color="dim"> | </Text>}
        </React.Fragment>
      ))}
      <Text color="cyan" bold>
        {' '}{'<<<'}
      </Text>
    </Box>
  );
};

// Static market summary bar (no animation)
interface MarketSummaryProps {
  prices: MarketPrice[];
  hotCommodity: string | null;
  coldCommodity: string | null;
}

export const MarketSummary: React.FC<MarketSummaryProps> = ({
  prices,
  hotCommodity,
  coldCommodity,
}) => {
  const hot = hotCommodity ? prices.find((p) => p.commodityId === hotCommodity) : null;
  const cold = coldCommodity ? prices.find((p) => p.commodityId === coldCommodity) : null;
  const cheapest = prices.reduce(
    (min, p) => (p.buyPrice < (min?.buyPrice ?? Infinity) ? p : min),
    prices[0]
  );
  const mostExpensive = prices.reduce(
    (max, p) => (p.buyPrice > (max?.buyPrice ?? 0) ? p : max),
    prices[0]
  );

  return (
    <Box marginBottom={1} gap={2}>
      {hot && (
        <Text>
          <Text color="yellowBright" bold>
            HOT:
          </Text>{' '}
          <Text color="yellow">{hot.name}</Text>
        </Text>
      )}
      {cold && (
        <Text>
          <Text color="gray" bold>
            COLD:
          </Text>{' '}
          <Text color="gray">{cold.name}</Text>
        </Text>
      )}
      {cheapest && (
        <Text>
          <Text color="greenBright">Cheap:</Text>{' '}
          <Text color="green">
            {cheapest.name} ${cheapest.buyPrice}
          </Text>
        </Text>
      )}
      {mostExpensive && (
        <Text>
          <Text color="redBright">Pricey:</Text>{' '}
          <Text color="red">
            {mostExpensive.name} ${mostExpensive.buyPrice}
          </Text>
        </Text>
      )}
    </Box>
  );
};
