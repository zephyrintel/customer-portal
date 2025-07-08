import { Asset, Order } from '../types/Asset';

// Lazy load mock data to prevent blocking initial bundle
const createMockAssets = (): Asset[] => [
  {
    id: "AST-001",
    serialNumber: "04930985-1",
    name: "Centrifugal Pump Model X",
    
    // Equipment Details
    brand: "Milton Roy",
    modelCode: "MRA",
    equipmentType: "Pump",
    currentStatus: "In Operation",
    criticalityLevel: "Critical",
    
    // Installation & Maintenance
    installDate: "2025-01-20",
    lastMaintenance: "2025-06-17",
    
    // Location
    location: {
      facility: "Plant A",
      area: "Cooling Tower 1"
    },
    
    // Operating Conditions
    operatingConditions: {
      flowRate: "500 GPM",
      pressure: "150 PSI",
      temperature: "140°F",
      fluidType: "Water"
    },
    
    // Design Conditions
    designConditions: {
      flowRate: "600 GPM",
      pressure: "175 PSI",
      temperature: "160°F",
      fluidType: "Water"
    },
    
    // Wear Components (designated by distributor from BOM)
    wearComponents: [
      {
        partNumber: "55916",
        description: "SHIM FASTENAL NUMBER 7041808",
        recommendedReplacementInterval: "6 months",
        lastReplaced: "2025-03-15",
        stockInfo: {
          quantityOnHand: 12,
          quantityAvailable: 8,
          reorderPoint: 5,
          lastUpdated: "2024-12-19T10:30:00Z",
          source: "netsuite"
        }
      },
      {
        partNumber: "4090064020",
        description: "CUP - RACE",
        recommendedReplacementInterval: "12 months",
        lastReplaced: null,
        stockInfo: {
          quantityOnHand: 3,
          quantityAvailable: 2,
          reorderPoint: 2,
          lastUpdated: "2024-12-19T10:30:00Z",
          source: "netsuite"
        }
      }
    ],
    
    // Documentation (managed by distributor)
    documentation: [
      {
        id: "DOC-001",
        title: "Mroy%20BOM.xlsx",
        type: "BOM",
        url: "/documents/mroy-bom.xlsx",
        uploadDate: "2025-01-20",
        fileSize: 156000,
        tags: ["parts", "inventory"]
      },
      {
        id: "DOC-002",
        title: "Global_mRoy_AandB_Manual.pdf",
        type: "Operating Manual",
        url: "/documents/global-mroy-manual.pdf",
        uploadDate: "2025-01-20",
        fileSize: 2400000,
        tags: ["operation", "procedures"]
      },
      {
        id: "DOC-003",
        title: "mRoy_Data_Sheet.pdf",
        type: "Technical Data",
        url: "/documents/mroy-data-sheet.pdf",
        uploadDate: "2025-01-20",
        fileSize: 1200000,
        tags: ["specifications", "performance"]
      }
    ],
    
    // Full Bill of Materials (view only in customer portal)
    billOfMaterials: [
      {
        partNumber: "55916",
        description: "SHIM FASTENAL NUMBER 7041808",
        quantity: 1,
        isWearItem: true
      },
      {
        partNumber: "028008701ON",
        description: "ACTUATOR ACC 10T EX-PROOF LT²",
        quantity: 1,
        isWearItem: false
      },
      {
        partNumber: "54002",
        description: "HOUSING MROY A SIMPLEX LG HEAD",
        quantity: 1,
        isWearItem: false
      },
      {
        partNumber: "4090064020",
        description: "CUP - RACE",
        quantity: 1,
        isWearItem: true
      },
      {
        partNumber: "2120056074",
        description: "POPPET RELIEF VALVE NYLON RA",
        quantity: 1,
        isWearItem: false
      }
    ],
    
    // Additional
    imageUrl: null,
    notes: []
  },
  
  {
    id: "AST-002",
    serialNumber: "CP-2023-0892",
    name: "Rotary Screw Compressor",
    
    brand: "Atlas Copco",
    modelCode: "GA-75VSD+",
    equipmentType: "Compressor",
    currentStatus: "Intermittent Operation",
    criticalityLevel: "High",
    
    installDate: "2023-08-20",
    lastMaintenance: "2024-05-15",
    
    location: {
      facility: "Main Plant",
      area: "Compressed Air Station"
    },
    
    operatingConditions: {
      flowRate: "450 CFM",
      pressure: "125 PSI",
      temperature: "85°F",
      fluidType: "Air"
    },
    
    designConditions: {
      flowRate: "500 CFM",
      pressure: "150 PSI",
      temperature: "100°F",
      fluidType: "Air"
    },
    
    wearComponents: [
      {
        partNumber: "AC-FILTER-001",
        description: "Air Filter Element",
        recommendedReplacementInterval: "3 months",
        lastReplaced: "2024-05-15",
        stockInfo: {
          quantityOnHand: 15,
          quantityAvailable: 15,
          reorderPoint: 8,
          lastUpdated: "2024-12-19T10:30:00Z",
          source: "netsuite"
        }
      }
    ],
    
    documentation: [
      {
        id: "DOC-004",
        title: "Atlas_Copco_Manual.pdf",
        type: "Operating Manual",
        url: "/documents/atlas-copco-manual.pdf",
        uploadDate: "2023-08-20",
        fileSize: 3200000,
        tags: ["operation", "maintenance"]
      }
    ],
    
    billOfMaterials: [
      {
        partNumber: "AC-FILTER-001",
        description: "Air Filter Element",
        quantity: 1,
        isWearItem: true
      },
      {
        partNumber: "AC-MOTOR-001",
        description: "Main Drive Motor",
        quantity: 1,
        isWearItem: false
      }
    ],
    
    imageUrl: "/assets/compressor-thumbnail.jpg",
    notes: [
      {
        date: "2024-05-15",
        text: "Replaced air filter during routine maintenance"
      }
    ]
  },
  
  {
    id: "AST-003",
    serialNumber: "VP-2024-3201",
    name: "Vertical Multistage Pump",
    
    brand: "Grundfos",
    modelCode: "CR-64-3-2",
    equipmentType: "Pump",
    currentStatus: "Not In Use",
    criticalityLevel: "Medium",
    
    installDate: "2024-03-10",
    lastMaintenance: null,
    
    location: {
      facility: "Plant B",
      area: "Boiler Feed System"
    },
    
    operatingConditions: {
      flowRate: "250 GPM",
      pressure: "350 PSI",
      temperature: "180°F",
      fluidType: "Steam"
    },
    
    designConditions: {
      flowRate: "300 GPM",
      pressure: "400 PSI",
      temperature: "200°F",
      fluidType: "Steam"
    },
    
    wearComponents: [
      {
        partNumber: "GF-IMPELLER-001",
        description: "Pump Impeller Assembly",
        recommendedReplacementInterval: "24 months",
        lastReplaced: null,
        stockInfo: {
          quantityOnHand: 0,
          quantityAvailable: 0,
          reorderPoint: 1,
          lastUpdated: "2024-12-19T10:30:00Z",
          source: "netsuite"
        }
      }
    ],
    documentation: [],
    billOfMaterials: [
      {
        partNumber: "GF-IMPELLER-001",
        description: "Pump Impeller Assembly",
        quantity: 1,
        isWearItem: true
      }
    ],
    
    imageUrl: null,
    notes: []
  },
  
  {
    id: "AST-004",
    serialNumber: "HX-2023-5678",
    name: "Shell & Tube Heat Exchanger",
    
    brand: "Alfa Laval",
    modelCode: "T20-BFG",
    equipmentType: "Heat Exchanger",
    currentStatus: "In Operation",
    criticalityLevel: "Critical",
    
    installDate: "2023-12-05",
    lastMaintenance: "2024-06-20",
    
    location: {
      facility: "Chemical Plant",
      area: "Heat Recovery Unit"
    },
    
    operatingConditions: {
      flowRate: "800 GPM",
      pressure: "200 PSI",
      temperature: "250°F",
      fluidType: "Chemical"
    },
    
    designConditions: {
      flowRate: "850 GPM",
      pressure: "225 PSI",
      temperature: "275°F",
      fluidType: "Chemical"
    },
    
    wearComponents: [
      {
        partNumber: "AL-GASKET-001",
        description: "Heat Exchanger Gasket Set",
        recommendedReplacementInterval: "18 months",
        lastReplaced: "2024-06-20",
        stockInfo: {
          quantityOnHand: 1,
          quantityAvailable: 1,
          reorderPoint: 2,
          lastUpdated: "2024-12-19T10:30:00Z",
          source: "netsuite"
        }
      }
    ],
    
    documentation: [
      {
        id: "DOC-005",
        title: "Alfa_Laval_Service_Manual.pdf",
        type: "Maintenance Guide",
        url: "/documents/alfa-laval-manual.pdf",
        uploadDate: "2023-12-05",
        fileSize: 2800000,
        tags: ["maintenance", "service", "troubleshooting"]
      }
    ],
    
    billOfMaterials: [
      {
        partNumber: "AL-GASKET-001",
        description: "Heat Exchanger Gasket Set",
        quantity: 1,
        isWearItem: true
      },
      {
        partNumber: "AL-TUBE-001",
        description: "Heat Exchanger Tube Bundle",
        quantity: 1,
        isWearItem: false
      }
    ],
    
    imageUrl: null,
    notes: [
      {
        date: "2024-06-20",
        text: "Cleaned tube bundle and replaced gaskets"
      },
      {
        date: "2024-04-15",
        text: "Pressure test completed successfully"
      }
    ]
  },
  
  {
    id: "AST-005",
    serialNumber: "MT-2024-9876",
    name: "Electric Motor Drive",
    
    brand: "ABB",
    modelCode: "M3BP-315SMB4",
    equipmentType: "Motor",
    currentStatus: "Not Commissioned",
    criticalityLevel: "Low",
    
    installDate: null,
    lastMaintenance: null,
    
    location: {
      facility: "Main Plant",
      area: "Motor Control Center"
    },
    
    operatingConditions: {
      flowRate: "N/A",
      pressure: "N/A",
      temperature: "75°F",
      fluidType: "Air"
    },
    
    designConditions: {
      flowRate: "N/A",
      pressure: "N/A",
      temperature: "104°F",
      fluidType: "Air"
    },
    
    wearComponents: [
      {
        partNumber: "ABB-BEARING-001",
        description: "Motor Bearing Set",
        recommendedReplacementInterval: "36 months",
        lastReplaced: null,
        stockInfo: {
          quantityOnHand: 6,
          quantityAvailable: 4,
          reorderPoint: 3,
          lastUpdated: "2024-12-19T10:30:00Z",
          source: "netsuite"
        }
      }
    ],
    documentation: [],
    billOfMaterials: [
      {
        partNumber: "ABB-BEARING-001",
        description: "Motor Bearing Set",
        quantity: 2,
        isWearItem: true
      }
    ],
    
    imageUrl: null,
    notes: [
      {
        date: "2024-07-01",
        text: "Motor delivered and staged for installation"
      }
    ]
  },

  // Additional assets based on Zephyr Intel Empire view screenshots
  {
    id: "AST-006",
    serialNumber: "72111438",
    name: "Sundyne LMV-322 Pump",
    
    brand: "Sundyne",
    modelCode: "LMV-322",
    equipmentType: "Pump",
    currentStatus: "Unknown",
    criticalityLevel: "Medium",
    
    installDate: "2023-05-15",
    lastMaintenance: null,
    
    location: {
      facility: "Marathon Canton",
      area: "Process Unit 1"
    },
    
    operatingConditions: {
      flowRate: "320 GPM",
      pressure: "180 PSI",
      temperature: "120°F",
      fluidType: "Oil"
    },
    
    designConditions: {
      flowRate: "350 GPM",
      pressure: "200 PSI",
      temperature: "140°F",
      fluidType: "Oil"
    },
    
    // This asset has wear components but NO parts history (no orders, no replacements)
    wearComponents: [
      {
        partNumber: "SUN-SEAL-322",
        description: "Mechanical Seal Assembly",
        recommendedReplacementInterval: "12 months",
        lastReplaced: null
      },
      {
        partNumber: "SUN-BEARING-322",
        description: "Thrust Bearing",
        recommendedReplacementInterval: "18 months",
        lastReplaced: null
      }
    ],
    
    documentation: [],
    billOfMaterials: [
      {
        partNumber: "SUN-SEAL-322",
        description: "Mechanical Seal Assembly",
        quantity: 1,
        isWearItem: true
      },
      {
        partNumber: "SUN-BEARING-322",
        description: "Thrust Bearing",
        quantity: 1,
        isWearItem: true
      },
      {
        partNumber: "SUN-IMPELLER-322",
        description: "Impeller Assembly",
        quantity: 1,
        isWearItem: false
      }
    ],
    
    imageUrl: null,
    notes: []
  },

  {
    id: "AST-007",
    serialNumber: "4055",
    name: "Sundyne LMV-322 Pump Unit 2",
    
    brand: "Sundyne",
    modelCode: "LMV-322",
    equipmentType: "Pump",
    currentStatus: "Unknown",
    criticalityLevel: "Medium",
    
    installDate: "2023-05-15",
    lastMaintenance: null,
    
    location: {
      facility: "Marathon Canton",
      area: "Process Unit 2"
    },
    
    operatingConditions: {
      flowRate: "320 GPM",
      pressure: "180 PSI",
      temperature: "120°F",
      fluidType: "Oil"
    },
    
    designConditions: {
      flowRate: "350 GPM",
      pressure: "200 PSI",
      temperature: "140°F",
      fluidType: "Oil"
    },
    
    // This asset has wear components but NO parts history
    wearComponents: [
      {
        partNumber: "SUN-SEAL-322",
        description: "Mechanical Seal Assembly",
        recommendedReplacementInterval: "12 months",
        lastReplaced: null
      }
    ],
    
    documentation: [],
    billOfMaterials: [
      {
        partNumber: "SUN-SEAL-322",
        description: "Mechanical Seal Assembly",
        quantity: 1,
        isWearItem: true
      }
    ],
    
    imageUrl: null,
    notes: []
  },

  {
    id: "AST-008",
    serialNumber: "C2068715-01",
    name: "Sundyne LMC-331F Compressor",
    
    brand: "Sundyne",
    modelCode: "LMC-331F",
    equipmentType: "Compressor",
    currentStatus: "Unknown",
    criticalityLevel: "High",
    
    installDate: "2022-11-20",
    lastMaintenance: null,
    
    location: {
      facility: "Williams Plant",
      area: "Gas Processing Unit"
    },
    
    operatingConditions: {
      flowRate: "850 CFM",
      pressure: "300 PSI",
      temperature: "95°F",
      fluidType: "Gas"
    },
    
    designConditions: {
      flowRate: "900 CFM",
      pressure: "350 PSI",
      temperature: "120°F",
      fluidType: "Gas"
    },
    
    // This asset has wear components but NO parts history
    wearComponents: [
      {
        partNumber: "SUN-SEAL-331F",
        description: "Dry Gas Seal",
        recommendedReplacementInterval: "24 months",
        lastReplaced: null
      },
      {
        partNumber: "SUN-BEARING-331F",
        description: "Magnetic Bearing Assembly",
        recommendedReplacementInterval: "36 months",
        lastReplaced: null
      }
    ],
    
    documentation: [],
    billOfMaterials: [
      {
        partNumber: "SUN-SEAL-331F",
        description: "Dry Gas Seal",
        quantity: 1,
        isWearItem: true
      },
      {
        partNumber: "SUN-BEARING-331F",
        description: "Magnetic Bearing Assembly",
        quantity: 1,
        isWearItem: true
      }
    ],
    
    imageUrl: null,
    notes: []
  },

  {
    id: "AST-009",
    serialNumber: "03232872-2",
    name: "Milton Roy MDD Pump",
    
    brand: "Milton Roy",
    modelCode: "MDD",
    equipmentType: "Pump",
    currentStatus: "Unknown",
    criticalityLevel: "Medium",
    
    installDate: "2024-01-10",
    lastMaintenance: null,
    
    location: {
      facility: "Marathon Canton",
      area: "Chemical Injection"
    },
    
    operatingConditions: {
      flowRate: "50 GPM",
      pressure: "500 PSI",
      temperature: "100°F",
      fluidType: "Chemical"
    },
    
    designConditions: {
      flowRate: "75 GPM",
      pressure: "600 PSI",
      temperature: "120°F",
      fluidType: "Chemical"
    },
    
    // This asset has wear components but NO parts history
    wearComponents: [
      {
        partNumber: "MR-DIAPHRAGM-001",
        description: "Diaphragm Assembly",
        recommendedReplacementInterval: "6 months",
        lastReplaced: null
      },
      {
        partNumber: "MR-VALVE-001",
        description: "Check Valve Set",
        recommendedReplacementInterval: "12 months",
        lastReplaced: null
      }
    ],
    
    documentation: [],
    billOfMaterials: [
      {
        partNumber: "MR-DIAPHRAGM-001",
        description: "Diaphragm Assembly",
        quantity: 1,
        isWearItem: true
      },
      {
        partNumber: "MR-VALVE-001",
        description: "Check Valve Set",
        quantity: 2,
        isWearItem: true
      }
    ],
    
    imageUrl: null,
    notes: []
  },

  {
    id: "AST-010",
    serialNumber: "4570617",
    name: "Milton Roy MRA Pump - Cenovus",
    
    brand: "Milton Roy",
    modelCode: "MRA",
    equipmentType: "Pump",
    currentStatus: "In Operation",
    criticalityLevel: "Critical",
    
    installDate: "2023-03-20",
    lastMaintenance: "2024-08-15",
    
    location: {
      facility: "Cenovus Lima Refinery",
      area: "Husky Energy Unit"
    },
    
    operatingConditions: {
      flowRate: "400 GPM",
      pressure: "200 PSI",
      temperature: "160°F",
      fluidType: "Oil"
    },
    
    designConditions: {
      flowRate: "450 GPM",
      pressure: "250 PSI",
      temperature: "180°F",
      fluidType: "Oil"
    },
    
    wearComponents: [
      {
        partNumber: "MR-SEAL-MRA",
        description: "Mechanical Seal",
        recommendedReplacementInterval: "18 months",
        lastReplaced: "2024-08-15"
      }
    ],
    
    documentation: [
      {
        id: "DOC-010",
        title: "MRA_Operating_Manual.pdf",
        type: "Operating Manual",
        url: "/documents/mra-manual.pdf",
        uploadDate: "2023-03-20",
        fileSize: 1800000,
        tags: ["operation", "maintenance"]
      }
    ],
    
    billOfMaterials: [
      {
        partNumber: "MR-SEAL-MRA",
        description: "Mechanical Seal",
        quantity: 1,
        isWearItem: true
      }
    ],
    
    imageUrl: null,
    notes: [
      {
        date: "2024-08-15",
        text: "Replaced mechanical seal during scheduled maintenance"
      }
    ]
  },

  {
    id: "AST-011",
    serialNumber: "E14147",
    name: "Micropump Precision Pump",
    
    brand: "Micropump",
    modelCode: "E14147",
    equipmentType: "Pump",
    currentStatus: "In Operation",
    criticalityLevel: "Low",
    
    installDate: "2024-02-28",
    lastMaintenance: null,
    
    location: {
      facility: "Cenovus Lima Refinery",
      area: "Husky Energy Lab"
    },
    
    operatingConditions: {
      flowRate: "5 GPM",
      pressure: "50 PSI",
      temperature: "80°F",
      fluidType: "Chemical"
    },
    
    designConditions: {
      flowRate: "10 GPM",
      pressure: "75 PSI",
      temperature: "100°F",
      fluidType: "Chemical"
    },
    
    // This asset has wear components but NO parts history
    wearComponents: [
      {
        partNumber: "MP-GEAR-001",
        description: "Gear Set",
        recommendedReplacementInterval: "24 months",
        lastReplaced: null
      }
    ],
    
    documentation: [],
    billOfMaterials: [
      {
        partNumber: "MP-GEAR-001",
        description: "Gear Set",
        quantity: 1,
        isWearItem: true
      }
    ],
    
    imageUrl: null,
    notes: []
  },

  {
    id: "AST-012",
    serialNumber: "85415694",
    name: "Sundyne LMV-311 Pump",
    
    brand: "Sundyne",
    modelCode: "LMV-311",
    equipmentType: "Pump",
    currentStatus: "Unknown",
    criticalityLevel: "Medium",
    
    installDate: "2023-09-10",
    lastMaintenance: null,
    
    location: {
      facility: "PBF Energy Toledo",
      area: "Refining Unit"
    },
    
    operatingConditions: {
      flowRate: "280 GPM",
      pressure: "160 PSI",
      temperature: "110°F",
      fluidType: "Oil"
    },
    
    designConditions: {
      flowRate: "320 GPM",
      pressure: "180 PSI",
      temperature: "130°F",
      fluidType: "Oil"
    },
    
    // This asset has wear components but NO parts history
    wearComponents: [
      {
        partNumber: "SUN-SEAL-311",
        description: "Mechanical Seal Assembly",
        recommendedReplacementInterval: "15 months",
        lastReplaced: null
      }
    ],
    
    documentation: [],
    billOfMaterials: [
      {
        partNumber: "SUN-SEAL-311",
        description: "Mechanical Seal Assembly",
        quantity: 1,
        isWearItem: true
      }
    ],
    
    imageUrl: null,
    notes: []
  }
];

// Export as a function to enable lazy loading
export const getMockAssets = (): Asset[] => {
  // Use a simple cache to avoid recreating the array
  if (typeof window !== 'undefined' && (window as any).__mockAssetsCache) {
    return (window as any).__mockAssetsCache;
  }
  
  const assets = createMockAssets();
  
  if (typeof window !== 'undefined') {
    (window as any).__mockAssetsCache = assets;
  }
  
  return assets;
};

// Keep the original export for backward compatibility but make it lazy
export const mockAssets = getMockAssets();

const createMockOrders = (): Order[] => [
  {
    id: 'ORD-001',
    orderNumber: 'PO-2024-1234',
    assetId: 'AST-001', // Centrifugal Pump Model X
    type: 'parts',
    status: 'shipped',
    orderDate: '2024-12-15',
    expectedDelivery: '2024-12-22',
    totalAmount: 1250.00,
    items: [
      {
        partNumber: '55916',
        description: 'SHIM FASTENAL NUMBER 7041808',
        quantity: 2,
        unitPrice: 45.00,
        isWearItem: true
      },
      {
        partNumber: '4090064020',
        description: 'CUP - RACE',
        quantity: 1,
        unitPrice: 1160.00,
        isWearItem: true
      }
    ],
    vendor: 'IPEC Parts Supply',
    priority: 'medium',
    hasApiIntegration: true
  },
  {
    id: 'ORD-002',
    orderNumber: 'PO-2024-1189',
    assetId: 'AST-001', // Centrifugal Pump Model X
    type: 'maintenance',
    status: 'delivered',
    orderDate: '2024-11-28',
    deliveredDate: '2024-12-05',
    totalAmount: 850.00,
    items: [
      {
        partNumber: '2120056074',
        description: 'POPPET RELIEF VALVE NYLON RA',
        quantity: 1,
        unitPrice: 850.00,
        isWearItem: false
      }
    ],
    vendor: 'Milton Roy Direct',
    priority: 'high',
    hasApiIntegration: true
  },
  {
    id: 'ORD-003',
    orderNumber: 'PO-2024-1456',
    assetId: 'AST-004', // Heat Exchanger
    type: 'emergency',
    status: 'pending',
    orderDate: '2024-12-18',
    expectedDelivery: '2024-12-20',
    totalAmount: 2100.00,
    items: [
      {
        partNumber: 'AL-GASKET-001',
        description: 'Heat Exchanger Gasket Set',
        quantity: 1,
        unitPrice: 2100.00,
        isWearItem: true
      }
    ],
    vendor: 'Alfa Laval Direct',
    priority: 'critical',
    hasApiIntegration: true
  },
  {
    id: 'ORD-004',
    orderNumber: 'MANUAL-001',
    assetId: 'AST-002', // Compressor
    type: 'parts',
    status: 'delivered',
    orderDate: '2024-12-10',
    deliveredDate: '2024-12-12',
    totalAmount: 325.00,
    items: [
      {
        partNumber: 'AC-FILTER-001',
        description: 'Air Filter Element - Local Purchase',
        quantity: 1,
        unitPrice: 325.00,
        isWearItem: true
      }
    ],
    vendor: 'Local Hardware Store',
    priority: 'medium',
    isManualEntry: true,
    hasApiIntegration: false
  },
  {
    id: 'ORD-005',
    orderNumber: 'PO-2024-1567',
    assetId: 'AST-010', // Milton Roy MRA Pump - Cenovus
    type: 'maintenance',
    status: 'delivered',
    orderDate: '2024-08-10',
    deliveredDate: '2024-08-14',
    totalAmount: 1450.00,
    items: [
      {
        partNumber: 'MR-SEAL-MRA',
        description: 'Mechanical Seal',
        quantity: 1,
        unitPrice: 1450.00,
        isWearItem: true
      }
    ],
    vendor: 'Milton Roy Direct',
    priority: 'high',
    hasApiIntegration: true
  }
];

export const getMockOrders = (): Order[] => {
  if (typeof window !== 'undefined' && (window as any).__mockOrdersCache) {
    return (window as any).__mockOrdersCache;
  }
  
  const orders = createMockOrders();
  
  if (typeof window !== 'undefined') {
    (window as any).__mockOrdersCache = orders;
  }
  
  return orders;
};

export const mockOrders = getMockOrders();