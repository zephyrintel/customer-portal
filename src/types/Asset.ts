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

export type DocumentType = 
  | "Operating Manual"
  | "Maintenance Guide" 
  | "Safety Instructions"
  | "Installation Manual"
  | "Parts Catalog"
  | "Technical Data" 
  | "BOM"
  | "Other";

export interface WearComponent {
  partNumber: string;
  description: string;
  recommendedReplacementInterval: string | null;
  lastReplaced: string | null;
  stockInfo?: {
    quantityOnHand: number;
    quantityAvailable: number;
    reorderPoint: number;
    lastUpdated: string;
    source: 'netsuite' | 'manual' | 'estimated';
  };
}

export interface Documentation {
  id: string;
  title: string;
  type: DocumentType;
  url: string;
  uploadDate: string;
  fileSize?: number;
  tags?: string[];
  assignedAssets?: string[]; // Asset IDs this document is assigned to
}

export interface TechnicalBulletin {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'equipment_change' | 'safety_update' | 'maintenance_alert' | 'recall' | 'general';
  publishDate: string;
  expiryDate?: string;
  isRead: boolean;
  affectedAssets?: string[]; // Asset IDs or asset types affected
  affectedEquipmentTypes?: EquipmentType[];
  vendorInfo: {
    company: string;
    contactEmail?: string;
    contactPhone?: string;
  };
  attachments?: {
    id: string;
    name: string;
    url: string;
    fileSize?: number;
  }[];
  tags?: string[];
}

export interface BillOfMaterialsItem {
  partNumber: string;
  description: string;
  quantity: number;
  isWearItem: boolean;
}

export interface OrderItem {
  partNumber: string;
  description: string;
  quantity: number;
  unitPrice: number;
  isWearItem?: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  assetId: string; // Links order to specific asset
  type: 'parts' | 'maintenance' | 'emergency';
  status: 'pending' | 'approved' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: string;
  expectedDelivery?: string;
  deliveredDate?: string;
  totalAmount: number;
  items: OrderItem[];
  vendor: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  isManualEntry?: boolean;
  hasApiIntegration?: boolean;
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
  
  // Design Conditions (manufacturer specifications)
  designConditions: {
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
    id?: string;
    date: string;
    text: string;
    type?: 'maintenance' | 'general' | 'system';
    source?: 'user' | 'system' | 'calendar';
  }>;
}