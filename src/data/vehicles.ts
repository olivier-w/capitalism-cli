export interface Vehicle {
  id: string;
  name: string;
  capacity: number;
  cost: number;
  energyMultiplier: number; // Lower = more efficient
  description: string;
}

export const vehicles: Vehicle[] = [
  {
    id: 'bicycle',
    name: 'Bicycle',
    capacity: 20,
    cost: 0,
    energyMultiplier: 1.5,
    description: 'Slow but free. Every empire starts somewhere.',
  },
  {
    id: 'car',
    name: 'Car',
    capacity: 50,
    cost: 500,
    energyMultiplier: 1.0,
    description: 'Faster travel and more cargo space.',
  },
  {
    id: 'truck',
    name: 'Truck',
    capacity: 150,
    cost: 2000,
    energyMultiplier: 0.8,
    description: 'Serious hauling capacity for serious traders.',
  },
  {
    id: 'plane',
    name: 'Cargo Plane',
    capacity: 100,
    cost: 10000,
    energyMultiplier: 0.5,
    description: 'Skip the roads entirely. Time is money.',
  },
  {
    id: 'ship',
    name: 'Cargo Ship',
    capacity: 500,
    cost: 25000,
    energyMultiplier: 0.3,
    description: 'Massive capacity for the true trade baron.',
  },
];

export const getVehicle = (id: string): Vehicle | undefined => {
  return vehicles.find((v) => v.id === id);
};

export const getAffordableVehicles = (money: number, currentVehicleId: string): Vehicle[] => {
  return vehicles.filter((v) => v.cost <= money && v.id !== currentVehicleId);
};
