export interface Location {
  id: string;
  name: string;
  description: string;
  produces: string[]; // Commodities that are cheap here
  needs: string[]; // Commodities that are expensive here
  connections: string[]; // Connected location IDs
  travelCost: number; // Energy cost to travel here
}

export const locations: Location[] = [
  {
    id: 'metro',
    name: 'Metro City',
    description: 'A bustling metropolis with high demand for food and fuel',
    produces: ['electronics'],
    needs: ['produce', 'fuel'],
    connections: ['port', 'industrial'],
    travelCost: 20,
  },
  {
    id: 'port',
    name: 'Port Town',
    description: 'A coastal trading hub with access to imported goods',
    produces: ['coffee', 'textiles'],
    needs: ['electronics'],
    connections: ['metro', 'industrial'],
    travelCost: 25,
  },
  {
    id: 'industrial',
    name: 'Industrial Zone',
    description: 'Factory district with refineries and warehouses',
    produces: ['fuel'],
    needs: ['coffee', 'textiles'],
    connections: ['metro', 'port'],
    travelCost: 20,
  },
];

export const getLocation = (id: string): Location | undefined => {
  return locations.find((l) => l.id === id);
};

export const getConnectedLocations = (currentId: string): Location[] => {
  const current = getLocation(currentId);
  if (!current) return [];
  return current.connections
    .map((id) => getLocation(id))
    .filter((l): l is Location => l !== undefined);
};
