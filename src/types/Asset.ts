export type EquipmentStatus = 
  | "In Operation" 
  | "Intermittent Operation" 
  | "Not Commissioned" 
  | "Not In Use" 
  | "Unknown";

export type EquipmentType = 
  | "Pump" 
  | "Compressor" 
  | "Valve" 
  | "Motor" 
  | "Heat Exchanger"
  | "Tank"
  | "Other";

export type FluidType = 
  | "Water" 
  | "Oil" 
  | "Chemical" 
  | "Steam" 
  | "Air" 
  | "Gas"
  | "Other";

export type CriticalityLevel = 
  | "Critical" 
  | "High" 
  | "Medium" 
  | "Low";

export interface WearComponent {
  partNumber: string;
  description: string;
  recommendedReplacementInterval: string | null;
  lastReplaced: string | null;
}

export interface Documentation {
  id: string;
  title: string;
  type: "Manual" | "BOM" | "Technical Data" | "Service Bulletin" | "Other";
  url: string;
  uploadDate: string;
}

export interface BillOfMaterialsItem {
  partNumber: string;
  description: string;
  quantity: number;
  isWearItem: boolean;
}

export interface Asset {
  id: string;
  serialNumber: string;
  name: string;
  
  // Equipment Details
  brand: string;
  modelCode: string;
  equipmentType: EquipmentType;
  currentStatus: EquipmentStatus;
  criticalityLevel: CriticalityLevel;
  
  // Dates
  installDate: string | null;
  lastMaintenance: string | null;
  
  // Location
  location: {
    facility: string;
    area: string;
  };
  
  // Operating Conditions
  operatingConditions: {
    flowRate: string;
    pressure: string;
    temperature: string;
    fluidType: FluidType;
  };
  
  // Wear Components (subset of BOM marked by distributor)
  wearComponents: WearComponent[];
  
  // Documentation (managed by distributor)
  documentation: Documentation[];
  
  // Full Bill of Materials
  billOfMaterials: BillOfMaterialsItem[];
  
  // Additional
  imageUrl: string | null;
  notes: Array<{
    date: string;
    text: string;
  }>;
}