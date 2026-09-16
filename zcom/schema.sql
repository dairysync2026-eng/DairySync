-- DairySync MySQL schema for Z.com Starter hosting.
-- Import this file into the empty `dairysync` database using DBeaver.

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(80) PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  role VARCHAR(40) NOT NULL,
  title VARCHAR(160) NOT NULL,
  department VARCHAR(160) NOT NULL,
  avatar TEXT,
  email VARCHAR(190) NOT NULL UNIQUE,
  username VARCHAR(80) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  nickname VARCHAR(120),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS raw_ingredients (
  id VARCHAR(80) PRIMARY KEY,
  sku VARCHAR(80) NOT NULL UNIQUE,
  name VARCHAR(180) NOT NULL,
  category VARCHAR(80) NOT NULL,
  current_stock DECIMAL(12,3) NOT NULL DEFAULT 0,
  unit VARCHAR(40) NOT NULL,
  reorder_point DECIMAL(12,3) NOT NULL DEFAULT 0,
  safety_stock DECIMAL(12,3) NOT NULL DEFAULT 0,
  max_stock DECIMAL(12,3) NOT NULL DEFAULT 0,
  avg_daily_consumption DECIMAL(12,3) NOT NULL DEFAULT 0,
  lead_time_days INT NOT NULL DEFAULT 0,
  cost_per_unit DECIMAL(12,2) NOT NULL DEFAULT 0,
  supplier VARCHAR(180) NOT NULL,
  last_restocked VARCHAR(80) NOT NULL,
  location VARCHAR(180) NOT NULL,
  expiry_date DATE NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_ingredients_category (category),
  INDEX idx_ingredients_stock (current_stock, reorder_point)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS finished_goods (
  id VARCHAR(80) PRIMARY KEY,
  sku VARCHAR(80) NOT NULL UNIQUE,
  name VARCHAR(180) NOT NULL,
  category VARCHAR(80) NOT NULL,
  current_stock DECIMAL(12,3) NOT NULL DEFAULT 0,
  unit VARCHAR(40) NOT NULL,
  cold_storage_capacity DECIMAL(12,3) NOT NULL DEFAULT 0,
  max_threshold DECIMAL(12,3) NOT NULL DEFAULT 0,
  safety_stock DECIMAL(12,3) NOT NULL DEFAULT 0,
  unit_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  allocated_feeding_program DECIMAL(12,3) NOT NULL DEFAULT 0,
  allocated_retail DECIMAL(12,3) NOT NULL DEFAULT 0,
  recipe_json JSON NOT NULL,
  batch_unit_quantity DECIMAL(12,3) NOT NULL DEFAULT 0,
  shelf_life_days INT NOT NULL DEFAULT 0,
  location VARCHAR(180) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_finished_goods_category (category),
  INDEX idx_finished_goods_stock (current_stock, max_threshold)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS wip_batches (
  id VARCHAR(80) PRIMARY KEY,
  batch_number VARCHAR(100) NOT NULL UNIQUE,
  product_id VARCHAR(80) NOT NULL,
  product_name VARCHAR(180) NOT NULL,
  target_quantity DECIMAL(12,3) NOT NULL DEFAULT 0,
  raw_milk_volume_used DECIMAL(12,3) NOT NULL DEFAULT 0,
  ingredients_used_json JSON NOT NULL,
  status VARCHAR(40) NOT NULL,
  assigned_staff VARCHAR(180) NOT NULL,
  start_date VARCHAR(80) NOT NULL,
  estimated_completion VARCHAR(80) NOT NULL,
  completed_at VARCHAR(80),
  cancellation_reason TEXT,
  cancelled_at VARCHAR(80),
  notes TEXT,
  cold_storage_temp VARCHAR(40) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_wip_status (status),
  INDEX idx_wip_product (product_id),
  CONSTRAINT fk_wip_product FOREIGN KEY (product_id) REFERENCES finished_goods(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS supply_demand_commitments (
  id VARCHAR(80) PRIMARY KEY,
  type VARCHAR(60) NOT NULL,
  partner_name VARCHAR(180) NOT NULL,
  contact_person VARCHAR(180),
  scheduled_date DATE NOT NULL,
  item_or_milk VARCHAR(180) NOT NULL,
  target_quantity DECIMAL(12,3) NOT NULL DEFAULT 0,
  fulfilled_quantity DECIMAL(12,3) NOT NULL DEFAULT 0,
  unit VARCHAR(40) NOT NULL,
  status VARCHAR(40) NOT NULL,
  priority VARCHAR(20) NOT NULL,
  cancellation_reason TEXT,
  cancelled_at VARCHAR(80),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_commitments_status (status),
  INDEX idx_commitments_date (scheduled_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS stock_transactions (
  id VARCHAR(100) PRIMARY KEY,
  timestamp VARCHAR(80) NOT NULL,
  item_id VARCHAR(80) NOT NULL,
  item_name VARCHAR(180) NOT NULL,
  item_type VARCHAR(40) NOT NULL,
  action VARCHAR(40) NOT NULL,
  quantity DECIMAL(12,3) NOT NULL DEFAULT 0,
  unit VARCHAR(40) NOT NULL,
  previous_stock DECIMAL(12,3) NOT NULL DEFAULT 0,
  new_stock DECIMAL(12,3) NOT NULL DEFAULT 0,
  reference_id VARCHAR(120),
  performed_by VARCHAR(180) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_transactions_item (item_id),
  INDEX idx_transactions_action (action),
  INDEX idx_transactions_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS system_alerts (
  id VARCHAR(100) PRIMARY KEY,
  timestamp VARCHAR(80) NOT NULL,
  type VARCHAR(40) NOT NULL,
  title VARCHAR(180) NOT NULL,
  message TEXT NOT NULL,
  severity VARCHAR(20) NOT NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  target_roles_json JSON,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_alerts_read (is_read),
  INDEX idx_alerts_severity (severity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(100) PRIMARY KEY,
  timestamp VARCHAR(80) NOT NULL,
  category VARCHAR(40) NOT NULL,
  subsystem VARCHAR(100) NOT NULL,
  action VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  details_json JSON,
  user_id VARCHAR(80) NOT NULL,
  user_name VARCHAR(180) NOT NULL,
  user_role VARCHAR(40) NOT NULL,
  user_title VARCHAR(180) NOT NULL,
  terminal_or_station VARCHAR(180),
  severity VARCHAR(20) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_category (category),
  INDEX idx_audit_timestamp (created_at),
  INDEX idx_audit_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS iso_ratings (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  functional_suitability DECIMAL(3,2) NOT NULL,
  performance_efficiency DECIMAL(3,2) NOT NULL,
  compatibility DECIMAL(3,2) NOT NULL,
  interaction_capability DECIMAL(3,2) NOT NULL,
  reliability DECIMAL(3,2) NOT NULL,
  security DECIMAL(3,2) NOT NULL,
  maintainability DECIMAL(3,2) NOT NULL,
  flexibility DECIMAL(3,2) NOT NULL,
  safety DECIMAL(3,2) NOT NULL,
  evaluator_role VARCHAR(40) NOT NULL,
  comments TEXT NOT NULL,
  evaluation_date DATE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS offline_sync_queue (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  action VARCHAR(100) NOT NULL,
  entity VARCHAR(60) NOT NULL,
  payload_json JSON NOT NULL,
  user_email VARCHAR(190),
  synced TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  synced_at TIMESTAMP NULL,
  INDEX idx_queue_sync (synced, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
