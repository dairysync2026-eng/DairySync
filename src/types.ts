export type UserRole = 
  | 'developer'           // System Developer / Super Administrator (Full Access)
  | 'director'            // Director / PMO Supervisor
  | 'procurement'         // Administrative Assistant IV (Procurement)
  | 'plant_manager'       // Internal Custodian / Plant Manager
  | 'production_staff'    // Production Staff
  | 'store_outlet';       // Store Outlet (Dairy Box)

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  title: string;
  department: string;
  avatar: string;
  email: string;
  username: string;
  nickname?: string;
  password?: string;
}

export type IngredientCategory = 'milk' | 'sweetener' | 'flavoring' | 'packaging' | 'additive' | (string & {});

export interface RawIngredient {
  id: string;
  sku: string;
  name: string;
  category: IngredientCategory;
  currentStock: number;
  unit: 'L' | 'kg' | 'pieces' | 'grams' | 'packs' | (string & {});
  reorderPoint: number; // ROP formula threshold
  safetyStock: number;  // Buffer stock
  maxStock: number;
  avgDailyConsumption: number; // in units/day
  leadTimeDays: number;       // supplier delivery time
  costPerUnit: number; // in PHP
  supplier: string;
  lastRestocked: string;
  location: string;
  expiryDate?: string; // ISO date format YYYY-MM-DD
}

export interface BomIngredientRequirement {
  ingredientId: string;
  ingredientName: string;
  quantityRequired: number;
  unit: string;
}

export type ProductCategory = 'fresh_milk' | 'flavored_milk' | 'cultured' | 'confectionery' | 'cheese';

export interface FinishedGood {
  id: string;
  sku: string;
  name: string;
  category: ProductCategory;
  currentStock: number;
  unit: 'bottles' | 'packs' | 'blocks' | 'cups';
  coldStorageCapacity: number; // Maximum allocated cold storage capacity
  maxThreshold: number;       // Overstock warning threshold
  safetyStock: number;        // Minimum safety stock buffer to prevent stockouts
  unitPrice: number;          // Retail price in PHP
  allocatedFeedingProgram: number; // Reserved stock for School Feeding Program
  allocatedRetail: number;         // Reserved stock for Dairy Box
  recipe: BomIngredientRequirement[]; // Bill of Materials required to produce 1 batch unit (e.g. 100 units)
  batchUnitQuantity: number;        // e.g. recipe produces 100 bottles
  shelfLifeDays: number;
  location: string;
}

export type WipStep = 'scheduled' | 'pasteurization' | 'homogenization' | 'cooling_bottling' | 'completed' | 'cancelled';

export interface WipBatch {
  id: string;
  batchNumber: string;
  productId: string;
  productName: string;
  targetQuantity: number;
  rawMilkVolumeUsed: number; // in Liters
  ingredientsUsed: {
    ingredientId: string;
    ingredientName: string;
    quantity: number;
    unit: string;
  }[];
  status: WipStep;
  assignedStaff: string;
  startDate: string;
  estimatedCompletion: string;
  completedAt?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  notes?: string;
  coldStorageTemp: string; // e.g. "3.8°C"
}

export type CommitmentType = 'school_feeding' | 'coop_collection' | 'dairy_box_retail' | (string & {});

export interface SupplyDemandCommitment {
  id: string;
  type: CommitmentType;
  partnerName: string; // e.g. "DepEd Batac District", "Dingras Dairy Cooperative"
  contactPerson?: string;
  scheduledDate: string;
  itemOrMilk: string;
  targetQuantity: number;
  fulfilledQuantity: number;
  unit: string;
  status: 'pending' | 'in_progress' | 'fulfilled' | 'delayed' | 'cancelled';
  priority: 'high' | 'medium' | 'low';
  cancellationReason?: string;
  cancelledAt?: string;
}

export type AlertType = 'low_stock' | 'overstock' | 'rop_triggered' | 'temp_warning' | 'delivery_due';

export interface SystemAlert {
  id: string;
  timestamp: string;
  type: AlertType;
  title: string;
  message: string;
  severity: 'critical' | 'warning' | 'info';
  read: boolean;
  targetRole?: UserRole[];
}

export interface StockTransaction {
  id: string;
  timestamp: string;
  itemId: string;
  itemName: string;
  itemType: 'ingredient' | 'finished_good';
  action: 'in_restock' | 'out_sale' | 'out_feeding' | 'wip_deduct' | 'wip_complete';
  quantity: number;
  unit: string;
  previousStock: number;
  newStock: number;
  referenceId?: string;
  performedBy: string;
  notes?: string;
}

export interface IsoEvaluationRating {
  functionalSuitability: number;  // 1.0 - 5.0
  performanceEfficiency: number;
  compatibility: number;
  interactionCapability: number;
  reliability: number;
  security: number;
  maintainability: number;
  flexibility: number;
  safety: number;
  evaluatorRole: UserRole;
  comments: string;
  date: string;
}

export type AuditCategory = 
  | 'inventory'      // Raw ingredient adjustments, restock, stocktakes
  | 'production'     // WIP batch creation, step progression, completion, cancellation
  | 'cold_storage'   // Finished goods adjustments, safety stock buffer updates
  | 'procurement'    // ROP restock purchase orders, supplier updates
  | 'sales'          // Dairy Box POS retail checkout, receipt issuance
  | 'commitments'    // DepEd feeding program fulfillment, schedule updates, cancellation
  | 'security';      // Login, logout, profile/credentials edit, password change, cloud sync, database baseline reset

export type AuditSeverity = 'info' | 'success' | 'warning' | 'critical';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  category: AuditCategory;
  subsystem: string; // e.g. "Raw Ingredients", "WIP Production", "Cold Storage", "ROP Procurement", "Dairy Box POS", "Supply & Demand", "User Security"
  action: string;    // e.g. "BATCH_CREATED", "STOCK_ADJUSTED", "ROP_PO_ISSUED", "RETAIL_SALE", "BATCH_ADVANCED", "BATCH_CANCELLED", "SAFETY_STOCK_UPDATED", "COMMITMENT_FULFILLED", "PROFILE_UPDATED"
  description: string;
  details?: {
    itemOrBatch?: string;
    previousValue?: string | number;
    newValue?: string | number;
    quantity?: number;
    unit?: string;
    reason?: string;
    referenceId?: string;
    costOrTotal?: number;
    [key: string]: any;
  };
  userId: string;
  userName: string;
  userRole: UserRole;
  userTitle: string;
  terminalOrStation?: string;
  severity: AuditSeverity;
}

export type ThemeMode = 'standard' | 'high_contrast';

export interface BatchExpiryAlert {
  id: string;
  sourceType: 'cold_storage' | 'wip_batch';
  batchOrItemNumber: string;
  name: string;
  quantity: number;
  unit: string;
  manufactureDate: string;
  expiryDate: string;
  daysRemaining: number;
  urgencyLevel: 'critical' | 'urgent' | 'warning' | 'optimal';
  location: string;
  suggestedAction: string;
}
