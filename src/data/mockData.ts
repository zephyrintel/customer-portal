import { Asset } from '../types/Asset';

export const mockAssets: Asset[] = [
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
    
    // Wear Components (designated by distributor from BOM)
    wearComponents: [
      {
        partNumber: "55916",
        description: "SHIM FASTENAL NUMBER 7041808",
        recommendedReplacementInterval: "6 months",
        lastReplaced: "2025-03-15"
      },
      {
        partNumber: "4090064020",
        description: "CUP - RACE",
        recommendedReplacementInterval: "12 months",
        lastReplaced: null
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
    
    wearComponents: [
      {
        partNumber: "AC-FILTER-001",
        description: "Air Filter Element",
        recommendedReplacementInterval: "3 months",
        lastReplaced: "2024-05-15"
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
    
    wearComponents: [],
    documentation: [],
    billOfMaterials: [],
    
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
    
    wearComponents: [
      {
        partNumber: "AL-GASKET-001",
        description: "Heat Exchanger Gasket Set",
        recommendedReplacementInterval: "18 months",
        lastReplaced: "2024-06-20"
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
    
    wearComponents: [],
    documentation: [],
    billOfMaterials: [],
    
    imageUrl: null,
    notes: [
      {
        date: "2024-07-01",
        text: "Motor delivered and staged for installation"
      }
    ]
  }
];