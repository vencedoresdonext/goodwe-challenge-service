export type CreateVehicleDTO = {
  userId: string;
  plate: string;
  brand: string;
  model: string;
  icon?: string;
  isActive?: boolean;
};
