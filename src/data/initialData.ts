import { 
  RawIngredient, 
  FinishedGood, 
  WipBatch, 
  SupplyDemandCommitment, 
  SystemAlert, 
  UserProfile,
  StockTransaction,
  AuditLogEntry
} from '../types';

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'usr-dev',
    name: 'Engr. Alexis Vance',
    role: 'developer',
    title: 'Lead Software Engineer & System Developer',
    department: 'Information Systems & Software Engineering Unit',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
    email: 'developer@pcc-mmsu.gov.ph',
    username: 'developer',
    nickname: 'Lead Developer',
    password: 'dev2026'
  },
  {
    id: 'usr-1',
    name: 'Dr. Edward Domingo',
    role: 'director',
    title: 'Center Director / PMO Supervisor',
    department: 'PCC-MMSU Executive Office',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    email: 'dr.domingo@pcc-mmsu.gov.ph',
    username: 'director',
    password: 'pcc2026'
  },
  {
    id: 'usr-2',
    name: 'Selwyn Dominic Martinez',
    role: 'procurement',
    title: 'Administrative Assistant IV (Procurement)',
    department: 'Supply & Procurement Unit',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    email: 'procurement@pcc-mmsu.gov.ph',
    username: 'procurement',
    password: 'procure2026'
  },
  {
    id: 'usr-3',
    name: 'Shyna Jee Silva',
    role: 'plant_manager',
    title: 'Plant Manager / Internal Custodian',
    department: 'Dairy Processing Facility',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150',
    email: 'plant.manager@pcc-mmsu.gov.ph',
    username: 'plantmanager',
    password: 'plant2026'
  },
  {
    id: 'usr-4',
    name: 'Jerwin Jake Yasay',
    role: 'production_staff',
    title: 'Senior Dairy Production Specialist',
    department: 'Processing Plant Operations',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
    email: 'production@pcc-mmsu.gov.ph',
    username: 'production',
    password: 'dairy2026'
  },
  {
    id: 'usr-5',
    name: 'Dairy Box Batac Outlet Staff',
    role: 'store_outlet',
    title: 'Retail Store Lead Specialist',
    department: 'MMSU Dairy Box Retail Outlet',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150',
    email: 'dairybox@pcc-mmsu.gov.ph',
    username: 'dairybox',
    password: 'store2026'
  }
];

const getFutureIsoDate = (daysAhead: number) => 
  new Date(Date.now() + daysAhead * 86400000).toISOString().split('T')[0];

export const INITIAL_INGREDIENTS: RawIngredient[] = [
  {
    id: 'ing-1',
    sku: 'ING-MILK-RAW',
    name: 'Raw Carabao Milk',
    category: 'milk',
    currentStock: 420,
    unit: 'L',
    reorderPoint: 350,
    safetyStock: 150,
    maxStock: 1200,
    avgDailyConsumption: 120,
    leadTimeDays: 1,
    costPerUnit: 65,
    supplier: 'Dingras & Batac Dairy Cooperatives',
    lastRestocked: '2026-08-08 07:30 PST',
    location: 'Chiller Tank A (4°C)',
    expiryDate: getFutureIsoDate(3) // 🚨 Expiring in 3 days (Perishable)
  },
  {
    id: 'ing-2',
    sku: 'ING-SUG-01',
    name: 'Refined White Sugar (Premium Grade)',
    category: 'sweetener',
    currentStock: 85,
    unit: 'kg',
    reorderPoint: 50,
    safetyStock: 25,
    maxStock: 250,
    avgDailyConsumption: 10,
    leadTimeDays: 2,
    costPerUnit: 82,
    supplier: 'Ilocos Norte Agro-Supply',
    lastRestocked: '2026-08-04 10:00 PST',
    location: 'Dry Storage Bay 1',
    expiryDate: getFutureIsoDate(180) // 180 days shelf life
  },
  {
    id: 'ing-3',
    sku: 'ING-CHO-01',
    name: 'Dutch Processed Cocoa Powder',
    category: 'flavoring',
    currentStock: 12,
    unit: 'kg',
    reorderPoint: 18, // ROP triggered!
    safetyStock: 10,
    maxStock: 80,
    avgDailyConsumption: 3.5,
    leadTimeDays: 3,
    costPerUnit: 340,
    supplier: 'Luzon Flavoring & Cocoa Corp',
    lastRestocked: '2026-07-28 14:15 PST',
    location: 'Dry Storage Bay 2',
    expiryDate: getFutureIsoDate(5) // ⚠️ Expiring in 5 days (< 7 days)
  },
  {
    id: 'ing-4',
    sku: 'ING-BOT-330',
    name: 'Food-Grade PET Bottles 330ml',
    category: 'packaging',
    currentStock: 1150,
    unit: 'pieces',
    reorderPoint: 600,
    safetyStock: 300,
    maxStock: 5000,
    avgDailyConsumption: 250,
    leadTimeDays: 4,
    costPerUnit: 4.80,
    supplier: 'Batac Container Solutions',
    lastRestocked: '2026-08-02 09:00 PST',
    location: 'Packaging Depot Room B'
    // Non-perishable packaging
  },
  {
    id: 'ing-5',
    sku: 'ING-BOT-1000',
    name: 'HDPE Milk Bottles 1000ml (1L)',
    category: 'packaging',
    currentStock: 210,
    unit: 'pieces',
    reorderPoint: 300, // ROP triggered!
    safetyStock: 150,
    maxStock: 2000,
    avgDailyConsumption: 80,
    leadTimeDays: 4,
    costPerUnit: 8.50,
    supplier: 'Batac Container Solutions',
    lastRestocked: '2026-07-30 11:30 PST',
    location: 'Packaging Depot Room B'
    // Non-perishable packaging
  },
  {
    id: 'ing-6',
    sku: 'ING-CAP-RED',
    name: 'Tamper-Evident Bottle Caps (Red)',
    category: 'packaging',
    currentStock: 1800,
    unit: 'pieces',
    reorderPoint: 800,
    safetyStock: 400,
    maxStock: 6000,
    avgDailyConsumption: 300,
    leadTimeDays: 3,
    costPerUnit: 1.20,
    supplier: 'Batac Container Solutions',
    lastRestocked: '2026-08-02 09:00 PST',
    location: 'Packaging Depot Bin 4'
    // Non-perishable packaging
  },
  {
    id: 'ing-7',
    sku: 'ING-LBL-CHO',
    name: 'Choco Milk Vinyl Sticker Labels',
    category: 'packaging',
    currentStock: 380,
    unit: 'pieces',
    reorderPoint: 500, // ROP triggered!
    safetyStock: 200,
    maxStock: 3000,
    avgDailyConsumption: 120,
    leadTimeDays: 3,
    costPerUnit: 1.50,
    supplier: 'Laoag Graphics & Printing',
    lastRestocked: '2026-07-25 16:00 PST',
    location: 'Packaging Depot Bin 1'
    // Non-perishable packaging
  },
  {
    id: 'ing-8',
    sku: 'ING-STAB-01',
    name: 'Food Grade Dairy Stabilizer & Emulsifier',
    category: 'additive',
    currentStock: 8.5,
    unit: 'kg',
    reorderPoint: 5.0,
    safetyStock: 2.5,
    maxStock: 30,
    avgDailyConsumption: 0.8,
    leadTimeDays: 5,
    costPerUnit: 450,
    supplier: 'Food Tech Ingredients Inc',
    lastRestocked: '2026-07-20 13:00 PST',
    location: 'Chemical Safe Cabinet',
    expiryDate: getFutureIsoDate(40) // 40 days shelf life
  }
];

export const INITIAL_FINISHED_GOODS: FinishedGood[] = [
  {
    id: 'fg-1',
    sku: 'FG-CHO-330',
    name: 'Carabao Choco Milk Drink 330ml',
    category: 'flavored_milk',
    currentStock: 860,
    unit: 'bottles',
    coldStorageCapacity: 900,
    maxThreshold: 800, // Overstock flag active! (>800)
    safetyStock: 150,
    unitPrice: 45,
    allocatedFeedingProgram: 300,
    allocatedRetail: 560,
    batchUnitQuantity: 100,
    shelfLifeDays: 14,
    location: 'Cold Storage Room 1 - Rack B',
    recipe: [
      { ingredientId: 'ing-1', ingredientName: 'Raw Carabao Milk', quantityRequired: 30, unit: 'L' },
      { ingredientId: 'ing-2', ingredientName: 'Refined White Sugar', quantityRequired: 3.5, unit: 'kg' },
      { ingredientId: 'ing-3', ingredientName: 'Dutch Processed Cocoa Powder', quantityRequired: 1.2, unit: 'kg' },
      { ingredientId: 'ing-4', ingredientName: 'PET Bottles 330ml', quantityRequired: 100, unit: 'pieces' },
      { ingredientId: 'ing-6', ingredientName: 'Bottle Caps (Red)', quantityRequired: 100, unit: 'pieces' },
      { ingredientId: 'ing-7', ingredientName: 'Choco Milk Sticker Labels', quantityRequired: 100, unit: 'pieces' }
    ]
  },
  {
    id: 'fg-2',
    sku: 'FG-MILK-1000',
    name: 'Pasteurized Fresh Carabao Milk 1L',
    category: 'fresh_milk',
    currentStock: 140,
    unit: 'bottles',
    coldStorageCapacity: 500,
    maxThreshold: 450,
    safetyStock: 150, // Below safety stock (140 < 150)! Alert triggered
    unitPrice: 110,
    allocatedFeedingProgram: 120, // Feeding commitment is 300! Understock risk
    allocatedRetail: 20,
    batchUnitQuantity: 50,
    shelfLifeDays: 10,
    location: 'Cold Storage Room 1 - Rack A',
    recipe: [
      { ingredientId: 'ing-1', ingredientName: 'Raw Carabao Milk', quantityRequired: 52, unit: 'L' },
      { ingredientId: 'ing-5', ingredientName: 'HDPE Milk Bottles 1000ml', quantityRequired: 50, unit: 'pieces' },
      { ingredientId: 'ing-6', ingredientName: 'Bottle Caps (Red)', quantityRequired: 50, unit: 'pieces' }
    ]
  },
  {
    id: 'fg-3',
    sku: 'FG-YOG-330',
    name: 'Carabao Milk Yogurt Drink 330ml (Mango)',
    category: 'cultured',
    currentStock: 220,
    unit: 'bottles',
    coldStorageCapacity: 400,
    maxThreshold: 350,
    safetyStock: 80,
    unitPrice: 50,
    allocatedFeedingProgram: 50,
    allocatedRetail: 170,
    batchUnitQuantity: 100,
    shelfLifeDays: 21,
    location: 'Cold Storage Room 2 - Rack A',
    recipe: [
      { ingredientId: 'ing-1', ingredientName: 'Raw Carabao Milk', quantityRequired: 32, unit: 'L' },
      { ingredientId: 'ing-2', ingredientName: 'Refined White Sugar', quantityRequired: 4.0, unit: 'kg' },
      { ingredientId: 'ing-4', ingredientName: 'PET Bottles 330ml', quantityRequired: 100, unit: 'pieces' },
      { ingredientId: 'ing-6', ingredientName: 'Bottle Caps (Red)', quantityRequired: 100, unit: 'pieces' }
    ]
  },
  {
    id: 'fg-4',
    sku: 'FG-PAS-200',
    name: 'Special Pastillas de Leche (200g Pack)',
    category: 'confectionery',
    currentStock: 95,
    unit: 'packs',
    coldStorageCapacity: 300,
    maxThreshold: 250,
    safetyStock: 40,
    unitPrice: 120,
    allocatedFeedingProgram: 0,
    allocatedRetail: 95,
    batchUnitQuantity: 30,
    shelfLifeDays: 30,
    location: 'Confectionery Storage Bay',
    recipe: [
      { ingredientId: 'ing-1', ingredientName: 'Raw Carabao Milk', quantityRequired: 15, unit: 'L' },
      { ingredientId: 'ing-2', ingredientName: 'Refined White Sugar', quantityRequired: 5.0, unit: 'kg' }
    ]
  },
  {
    id: 'fg-5',
    sku: 'FG-CHE-250',
    name: 'Kesong Putijo (Native Fresh Cheese 250g)',
    category: 'cheese',
    currentStock: 42,
    unit: 'blocks',
    coldStorageCapacity: 150,
    maxThreshold: 120,
    safetyStock: 30,
    unitPrice: 150,
    allocatedFeedingProgram: 0,
    allocatedRetail: 42,
    batchUnitQuantity: 20,
    shelfLifeDays: 12,
    location: 'Cold Storage Room 2 - Rack C',
    recipe: [
      { ingredientId: 'ing-1', ingredientName: 'Raw Carabao Milk', quantityRequired: 20, unit: 'L' }
    ]
  }
];

export const INITIAL_WIP_BATCHES: WipBatch[] = [
  {
    id: 'wip-101',
    batchNumber: 'BATCH-2026-089',
    productId: 'fg-1',
    productName: 'Carabao Choco Milk Drink 330ml',
    targetQuantity: 300,
    rawMilkVolumeUsed: 90,
    ingredientsUsed: [
      { ingredientId: 'ing-1', ingredientName: 'Raw Carabao Milk', quantity: 90, unit: 'L' },
      { ingredientId: 'ing-2', ingredientName: 'Refined White Sugar', quantity: 10.5, unit: 'kg' },
      { ingredientId: 'ing-3', ingredientName: 'Dutch Processed Cocoa Powder', quantity: 3.6, unit: 'kg' },
      { ingredientId: 'ing-4', ingredientName: 'PET Bottles 330ml', quantity: 300, unit: 'pieces' }
    ],
    status: 'pasteurization',
    assignedStaff: 'Jerwin Jake Yasay',
    startDate: '2026-08-09 08:00 PST',
    estimatedCompletion: '2026-08-09 14:30 PST',
    notes: 'Batch in pasteurization tank #2 (72°C for 15 seconds holding time).',
    coldStorageTemp: '3.8°C'
  },
  {
    id: 'wip-102',
    batchNumber: 'BATCH-2026-090',
    productId: 'fg-2',
    productName: 'Pasteurized Fresh Carabao Milk 1L',
    targetQuantity: 200,
    rawMilkVolumeUsed: 208,
    ingredientsUsed: [
      { ingredientId: 'ing-1', ingredientName: 'Raw Carabao Milk', quantity: 208, unit: 'L' },
      { ingredientId: 'ing-5', ingredientName: 'HDPE Milk Bottles 1000ml', quantity: 200, unit: 'pieces' }
    ],
    status: 'scheduled',
    assignedStaff: 'Shyna Jee Silva',
    startDate: '2026-08-09 13:00 PST',
    estimatedCompletion: '2026-08-09 17:00 PST',
    notes: 'Scheduled to fulfill DepEd School Feeding Program commitment.',
    coldStorageTemp: '4.0°C'
  },
  {
    id: 'wip-100',
    batchNumber: 'BATCH-2026-088',
    productId: 'fg-1',
    productName: 'Carabao Choco Milk Drink 330ml',
    targetQuantity: 500,
    rawMilkVolumeUsed: 150,
    ingredientsUsed: [
      { ingredientId: 'ing-1', ingredientName: 'Raw Carabao Milk', quantity: 150, unit: 'L' },
      { ingredientId: 'ing-2', ingredientName: 'Refined White Sugar', quantity: 17.5, unit: 'kg' },
      { ingredientId: 'ing-3', ingredientName: 'Dutch Processed Cocoa Powder', quantity: 6.0, unit: 'kg' },
      { ingredientId: 'ing-4', ingredientName: 'PET Bottles 330ml', quantity: 500, unit: 'pieces' }
    ],
    status: 'completed',
    assignedStaff: 'Jerwin Jake Yasay',
    startDate: '2026-08-08 07:30 PST',
    estimatedCompletion: '2026-08-08 14:00 PST',
    completedAt: '2026-08-08 14:15 PST',
    notes: 'Released to Cold Storage Room 1. High yield test passed. Lab bacteriological standard cleared.',
    coldStorageTemp: '3.7°C'
  },
  {
    id: 'wip-099',
    batchNumber: 'BATCH-2026-087',
    productId: 'fg-2',
    productName: 'Pasteurized Fresh Carabao Milk 1L',
    targetQuantity: 250,
    rawMilkVolumeUsed: 260,
    ingredientsUsed: [
      { ingredientId: 'ing-1', ingredientName: 'Raw Carabao Milk', quantity: 260, unit: 'L' },
      { ingredientId: 'ing-5', ingredientName: 'HDPE Milk Bottles 1000ml', quantity: 250, unit: 'pieces' }
    ],
    status: 'completed',
    assignedStaff: 'Shyna Jee Silva',
    startDate: '2026-08-07 08:15 PST',
    estimatedCompletion: '2026-08-07 13:00 PST',
    completedAt: '2026-08-07 13:20 PST',
    notes: 'School Feeding Program reserve stock. Tamper seal verified.',
    coldStorageTemp: '3.9°C'
  },
  {
    id: 'wip-098',
    batchNumber: 'BATCH-2026-086',
    productId: 'fg-4',
    productName: 'Special Pastillas de Leche (200g Pack)',
    targetQuantity: 100,
    rawMilkVolumeUsed: 50,
    ingredientsUsed: [
      { ingredientId: 'ing-1', ingredientName: 'Raw Carabao Milk', quantity: 50, unit: 'L' },
      { ingredientId: 'ing-2', ingredientName: 'Refined White Sugar', quantity: 16.5, unit: 'kg' }
    ],
    status: 'cancelled',
    assignedStaff: 'Jerwin Jake Yasay',
    startDate: '2026-08-06 09:00 PST',
    estimatedCompletion: '2026-08-06 15:00 PST',
    cancelledAt: '2026-08-06 09:40 PST',
    cancellationReason: 'Cancelled prior to heating due to packaging wrapper supplier delay; raw carabao milk 100% restored to Chiller Tank A.',
    notes: 'Zero wastage safeguard triggered. Inventory refunded.',
    coldStorageTemp: '4.2°C'
  }
];

export const INITIAL_COMMITMENTS: SupplyDemandCommitment[] = [
  {
    id: 'com-1',
    type: 'school_feeding',
    partnerName: 'DepEd Batac City - National School Feeding Program',
    contactPerson: 'Supervisor Maria Santos',
    scheduledDate: '2026-08-12',
    itemOrMilk: 'Pasteurized Fresh Carabao Milk 1L',
    targetQuantity: 300,
    fulfilledQuantity: 120,
    unit: 'bottles',
    status: 'in_progress',
    priority: 'high'
  },
  {
    id: 'com-2',
    type: 'coop_collection',
    partnerName: 'Dingras Dairy Farmers Cooperative',
    contactPerson: 'Mr. Ramon Marcos',
    scheduledDate: '2026-08-10',
    itemOrMilk: 'Raw Carabao Milk Intake',
    targetQuantity: 500,
    fulfilledQuantity: 0,
    unit: 'L',
    status: 'pending',
    priority: 'high'
  },
  {
    id: 'com-3',
    type: 'dairy_box_retail',
    partnerName: 'MMSU Dairy Box Retail Outlet',
    contactPerson: 'Store Supervisor',
    scheduledDate: '2026-08-09',
    itemOrMilk: 'Choco Milk & Fresh Milk Daily Stocks',
    targetQuantity: 150,
    fulfilledQuantity: 150,
    unit: 'bottles',
    status: 'fulfilled',
    priority: 'medium'
  }
];

export const INITIAL_ALERTS: SystemAlert[] = [
  {
    id: 'overstock-fg-1',
    timestamp: '2026-08-09 08:15 PST',
    type: 'overstock',
    title: 'OVERSTOCK FLAG: Carabao Choco Milk 330ml',
    message: 'Finished goods stock (860 bottles) exceeds cold-storage allocation threshold (800). Pause new batch manufacturing to avoid cold storage overcrowding.',
    severity: 'warning',
    read: false,
    targetRole: ['director', 'plant_manager', 'production_staff']
  },
  {
    id: 'rop-ing-3',
    timestamp: '2026-08-09 07:30 PST',
    type: 'rop_triggered',
    title: 'REORDER POINT ALERT: Dutch Processed Cocoa Powder',
    message: 'Current stock (12.0 kg) is below Reorder Point (18.0 kg). Lead time is 3 days. Generate procurement order immediately.',
    severity: 'critical',
    read: false,
    targetRole: ['procurement', 'plant_manager', 'director']
  },
  {
    id: 'rop-ing-7',
    timestamp: '2026-08-09 07:00 PST',
    type: 'rop_triggered',
    title: 'LOW STOCK ALERT: Choco Milk Vinyl Sticker Labels',
    message: 'Stock at 380 pcs (ROP threshold 500 pcs). Immediate reorder required.',
    severity: 'critical',
    read: false,
    targetRole: ['procurement', 'plant_manager']
  },
  {
    id: 'alt-4',
    timestamp: '2026-08-08 16:45 PST',
    type: 'temp_warning',
    title: 'COLD STORAGE MONITOR: Chiller Unit #1 Normal',
    message: 'Temperature stable at 3.8°C (Optimal range 2.0°C - 4.5°C).',
    severity: 'info',
    read: true
  }
];

export const INITIAL_TRANSACTIONS: StockTransaction[] = [
  {
    id: 'tx-101',
    timestamp: '2026-08-09 08:00 PST',
    itemId: 'ing-1',
    itemName: 'Raw Carabao Milk',
    itemType: 'ingredient',
    action: 'wip_deduct',
    quantity: 90,
    unit: 'L',
    previousStock: 510,
    newStock: 420,
    referenceId: 'BATCH-2026-089',
    performedBy: 'Jerwin Jake Yasay',
    notes: 'Deducted for Choco Milk Batch #BATCH-2026-089'
  },
  {
    id: 'tx-100',
    timestamp: '2026-08-08 17:30 PST',
    itemId: 'fg-1',
    itemName: 'Carabao Choco Milk Drink 330ml',
    itemType: 'finished_good',
    action: 'out_sale',
    quantity: 40,
    unit: 'bottles',
    previousStock: 900,
    newStock: 860,
    referenceId: 'POS-REC-9081',
    performedBy: 'Dairy Box Outlet Staff',
    notes: 'Walk-in retail sales at MMSU Dairy Box'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'audit-001',
    timestamp: '2026-08-09 08:35 PST',
    category: 'production',
    subsystem: 'WIP Production',
    action: 'BATCH_ADVANCED',
    description: 'Advanced Batch #BATCH-2026-089 from Pasteurization to Homogenization & Aging at 4°C',
    details: {
      itemOrBatch: 'BATCH-2026-089',
      previousValue: 'Pasteurizing (72°C/15s)',
      newValue: 'Homogenizing & Aging (4°C)',
      quantity: 300,
      unit: 'bottles',
      referenceId: 'BATCH-2026-089',
      reason: 'Pasteurization temperature profile verified at 73.2°C holding time 15 seconds'
    },
    userId: 'usr-4',
    userName: 'Jerwin Jake Yasay',
    userRole: 'production_staff',
    userTitle: 'Lead Dairy Plant Operator',
    terminalOrStation: 'Processing Floor Terminal #2',
    severity: 'info'
  },
  {
    id: 'audit-002',
    timestamp: '2026-08-09 08:00 PST',
    category: 'inventory',
    subsystem: 'Raw Ingredients',
    action: 'STOCK_DEDUCTED_BOM',
    description: 'Deducted 90.0 L Raw Carabao Milk and 18.0 kg Choco Powder for Batch #BATCH-2026-089',
    details: {
      itemOrBatch: 'Raw Carabao Milk (ing-1)',
      previousValue: 510,
      newValue: 420,
      quantity: 90,
      unit: 'L',
      referenceId: 'BATCH-2026-089',
      reason: 'Automated BOM deduction upon batch formulation'
    },
    userId: 'usr-4',
    userName: 'Jerwin Jake Yasay',
    userRole: 'production_staff',
    userTitle: 'Lead Dairy Plant Operator',
    terminalOrStation: 'Processing Floor Terminal #2',
    severity: 'info'
  },
  {
    id: 'audit-003',
    timestamp: '2026-08-09 07:15 PST',
    category: 'procurement',
    subsystem: 'ROP Procurement',
    action: 'ROP_PO_GENERATED',
    description: 'Auto-generated Reorder Purchase Order #PO-2026-044 for Choco Milk Vinyl Sticker Labels',
    details: {
      itemOrBatch: 'Choco Milk Vinyl Sticker Labels 330ml',
      previousValue: 380,
      newValue: 'PO Pending (1,500 pcs)',
      quantity: 1500,
      unit: 'pcs',
      referenceId: 'PO-2026-044',
      costOrTotal: 2775,
      reason: 'Current stock 380 pcs dropped below ROP threshold of 500 pcs'
    },
    userId: 'usr-2',
    userName: 'Sean Dave Martinez',
    userRole: 'procurement',
    userTitle: 'Admin Asst IV / Procurement Officer',
    terminalOrStation: 'Procurement Workstation #1',
    severity: 'warning'
  },
  {
    id: 'audit-004',
    timestamp: '2026-08-08 17:30 PST',
    category: 'sales',
    subsystem: 'Dairy Box POS',
    action: 'RETAIL_SALE_COMPLETED',
    description: 'Completed POS Transaction #POS-REC-9081 for 40 bottles Carabao Choco Milk Drink',
    details: {
      itemOrBatch: 'Carabao Choco Milk Drink 330ml',
      previousValue: 900,
      newValue: 860,
      quantity: 40,
      unit: 'bottles',
      referenceId: 'POS-REC-9081',
      costOrTotal: 1800,
      reason: 'Walk-in cash retail customer checkout'
    },
    userId: 'usr-5',
    userName: 'Dairy Box Outlet Staff',
    userRole: 'store_outlet',
    userTitle: 'Retail Sales Custodian',
    terminalOrStation: 'Dairy Box MMSU POS Register #1',
    severity: 'success'
  },
  {
    id: 'audit-005',
    timestamp: '2026-08-08 16:45 PST',
    category: 'cold_storage',
    subsystem: 'Cold Storage',
    action: 'SAFETY_STOCK_UPDATED',
    description: 'Updated safety buffer for Pastillas de Leche (20s) from 40 to 60 packs',
    details: {
      itemOrBatch: 'Pastillas de Leche (20s pack)',
      previousValue: 40,
      newValue: 60,
      quantity: 20,
      unit: 'packs',
      referenceId: 'fg-2',
      reason: 'Anticipating MMSU Foundation Week gift shop retail surge'
    },
    userId: 'usr-3',
    userName: 'Sander James Silva',
    userRole: 'plant_manager',
    userTitle: 'Plant Manager & Internal Custodian',
    terminalOrStation: 'Plant Management Office',
    severity: 'info'
  },
  {
    id: 'audit-006',
    timestamp: '2026-08-08 14:10 PST',
    category: 'commitments',
    subsystem: 'Supply & Demand',
    action: 'COMMITMENT_STATUS_CHANGED',
    description: 'Marked DepEd Batac South Central Elementary School milk feeding delivery as Partially Fulfilled',
    details: {
      itemOrBatch: 'COM-2026-081',
      previousValue: 'scheduled',
      newValue: 'partially_fulfilled',
      quantity: 450,
      unit: 'pouches',
      referenceId: 'COM-2026-081',
      reason: 'Batch 1 dispatch delivered via refrigerated van (Van #PCC-02)'
    },
    userId: 'usr-1',
    userName: 'Ernesto T. Domingo',
    userRole: 'director',
    userTitle: 'Center Director / PMO Supervisor',
    terminalOrStation: 'Executive Director Console',
    severity: 'info'
  },
  {
    id: 'audit-007',
    timestamp: '2026-08-08 09:20 PST',
    category: 'security',
    subsystem: 'User Security',
    action: 'PROFILE_UPDATED',
    description: 'Updated contact details and role assignment for Lead Plant Operator',
    details: {
      itemOrBatch: 'usr-4',
      previousValue: 'Operator',
      newValue: 'Lead Dairy Plant Operator',
      reason: 'Annual plant organizational reassignment'
    },
    userId: 'usr-dev',
    userName: 'Engr. Alexis Vance',
    userRole: 'developer',
    userTitle: 'Lead Software Engineer & System Developer',
    terminalOrStation: 'Admin Workstation Batac IT Unit',
    severity: 'info'
  }
];
