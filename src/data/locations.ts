export type RegionId = 'starter' | 'coastal' | 'farming';

export interface Region {
  id: RegionId;
  name: string;
  description: string;
  unlockCost: number;
}

export const regions: Region[] = [
  {
    id: 'starter',
    name: 'Central Hub',
    description: 'The starting region with basic trade routes',
    unlockCost: 0,
  },
  {
    id: 'coastal',
    name: 'Coastal Territories',
    description: 'Maritime trading posts with exotic imports',
    unlockCost: 5000,
  },
  {
    id: 'farming',
    name: 'Agricultural Heartland',
    description: 'Rural region with abundant produce',
    unlockCost: 3000,
  },
];

export interface Location {
  id: string;
  name: string;
  description: string;
  region: RegionId;
  produces: string[];
  needs: string[];
  connections: string[];
  travelCost: number;
}

export const locations: Location[] = [
  // === STARTER REGION ===
  {
    id: 'metro',
    name: 'Metro City',
    region: 'starter',
    description: 'A bustling metropolis with high demand for food and fuel',
    produces: ['electronics'],
    needs: ['produce', 'fuel'],
    connections: ['port', 'industrial', 'crossroads'],
    travelCost: 20,
  },
  {
    id: 'port',
    name: 'Port Town',
    region: 'starter',
    description: 'A coastal trading hub with access to imported goods',
    produces: ['coffee', 'textiles'],
    needs: ['electronics'],
    connections: ['metro', 'industrial', 'harbor'],
    travelCost: 25,
  },
  {
    id: 'industrial',
    name: 'Industrial Zone',
    region: 'starter',
    description: 'Factory district with refineries and warehouses',
    produces: ['fuel'],
    needs: ['coffee', 'textiles'],
    connections: ['metro', 'port', 'farmtown'],
    travelCost: 20,
  },
  {
    id: 'crossroads',
    name: 'Crossroads Junction',
    region: 'starter',
    description: 'Where all trade routes meet - a neutral trading post',
    produces: [],
    needs: [],
    connections: ['metro', 'orchards'],
    travelCost: 15,
  },

  // === COASTAL REGION ===
  {
    id: 'harbor',
    name: 'Grand Harbor',
    region: 'coastal',
    description: 'Major shipping port with exotic goods from distant lands',
    produces: ['spices', 'silk'],
    needs: ['fuel', 'grain'],
    connections: ['port', 'lighthouse', 'docks'],
    travelCost: 30,
  },
  {
    id: 'lighthouse',
    name: 'Lighthouse Bay',
    region: 'coastal',
    description: 'Small fishing community with the freshest catches',
    produces: ['seafood'],
    needs: ['textiles', 'electronics'],
    connections: ['harbor', 'docks'],
    travelCost: 25,
  },
  {
    id: 'docks',
    name: 'The Docks',
    region: 'coastal',
    description: 'Rough waterfront district - cheap but chaotic',
    produces: ['textiles'],
    needs: ['spices', 'coffee'],
    connections: ['harbor', 'lighthouse'],
    travelCost: 20,
  },

  // === FARMING REGION ===
  {
    id: 'farmtown',
    name: 'Farmtown',
    region: 'farming',
    description: 'Central agricultural hub surrounded by fertile fields',
    produces: ['produce', 'grain'],
    needs: ['fuel', 'electronics'],
    connections: ['industrial', 'orchards', 'ranch'],
    travelCost: 25,
  },
  {
    id: 'orchards',
    name: 'Orchard Valley',
    region: 'farming',
    description: 'Rolling hills of fruit trees and coffee plantations',
    produces: ['produce', 'coffee'],
    needs: ['textiles', 'silk'],
    connections: ['farmtown', 'ranch', 'crossroads'],
    travelCost: 20,
  },
  {
    id: 'ranch',
    name: 'Dusty Ranch',
    region: 'farming',
    description: 'Cattle country with leather and livestock',
    produces: ['leather'],
    needs: ['grain', 'fuel'],
    connections: ['farmtown', 'orchards'],
    travelCost: 30,
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

export const getRegion = (id: RegionId): Region | undefined => {
  return regions.find((r) => r.id === id);
};

export const getLocationsByRegion = (regionId: RegionId): Location[] => {
  return locations.filter((l) => l.region === regionId);
};
