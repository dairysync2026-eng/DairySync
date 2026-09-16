# DairySync System Guide

## A Cloud-Based Inventory and Production Management System for PCC-MMSU

**Institution:** Philippine Carabao Center at Mariano Marcos State University (PCC-MMSU), Batac City, Ilocos Norte  
**Application:** DairySync Cloud Inventory and Production Management System  
**Guide version:** Source-verified September 16, 2026  
**Deployment:** Firebase Hosting at https://dairysync-pcc-94978.web.app  
**Repository:** https://github.com/dairysync2026-eng/DairySync

---

## 1. System Overview

DairySync is a role-based web application for managing dairy ingredients, production batches, finished goods, institutional commitments, retail sales, alerts, audit records, reports, and offline inventory continuity.

The application is designed around the PCC-MMSU workflow:

1. Receive and monitor raw ingredients and packaging materials.
2. Plan and create production batches using recipes and required quantities.
3. Track work-in-progress production steps.
4. Transfer completed production into finished-goods cold storage.
5. Allocate finished goods between school feeding and Dairy Box retail demand.
6. Process retail sales and deduct inventory.
7. Monitor reorder points, safety stock, overstock, expiry, and audit activity.
8. Produce printable and downloadable reports.

### Source-verified storage note

The current application stores its operational state in browser `localStorage` and caches critical inventory in IndexedDB for offline use. Firebase is configured for the web application and Firebase Hosting/Analytics, but the current code does not yet use Firestore or Cloud SQL as the primary operational database. A centralized cloud database would require a subsequent data-service migration.

---

## 2. User Roles and Access Control

| Role | Authorized areas |
|---|---|
| Developer / Super Administrator | All dashboards, inventory, WIP, cold storage, supply-demand, procurement, POS, audit, user administration, reset, and system tools |
| Director / PMO Supervisor | All operational and oversight areas |
| Administrative Assistant IV / Procurement | Dashboard, ROP Procurement, Raw Ingredients |
| Internal Custodian / Plant Manager | Dashboard, Cold Storage, WIP, Raw Ingredients, Procurement |
| Production Staff | Dashboard, WIP, Raw Ingredients |
| Store Outlet / Dairy Box | Dashboard, Dairy Box POS, Cold Storage |

### Authentication functions

- Login by email, username, user ID, or role keyword.
- Password validation when a password is configured.
- Login handshake animation with success and error states.
- Logout.
- Login page on every application startup.
- Developer session switching between role accounts.
- Return to the developer account.
- Role-based tab access enforcement.
- Automatic return to the dashboard when a selected tab becomes unauthorized.
- Profile editing with username and email conflict checks.
- Password verification.

### Security behavior

The interface hides unauthorized tabs and displays an access-restricted view when a role attempts to reach a protected subsystem. Audit entries record security-related operations, profile updates, cloud sync activity, and reset actions.

---

## 3. Main Application Shell

The main layout provides:

- Sticky header and institutional branding.
- Current user and role context.
- Online/offline status indicator.
- Notification drawer.
- ISO 25010 evaluation access.
- Official reports access.
- Profile and role controls.
- Responsive horizontal subsystem navigation.
- Mobile-safe layout with table swipe scrolling.
- Quick Actions floating action button.
- PWA installation support.
- Footer with PCC-MMSU attribution and build information.

### Main navigation tabs

1. Command Center
2. Raw Ingredients
3. WIP Batches
4. Cold Storage
5. Supply and Demand
6. ROP Procurement
7. Dairy Box POS
8. Audit Trail

---

## 4. Command Center Dashboards

The Command Center selects a role-specific dashboard.

### Developer Dashboard

Provides lead developer and system administrator oversight, including:

- System subsystem status.
- User and role coverage.
- POS activity count.
- Procurement alerts.
- Offline and cloud status.
- Audit and control access.
- Developer-only account switching.

### Director Dashboard

Provides executive operational oversight, including:

- Enterprise inventory valuation.
- Production and WIP overview.
- Cold-storage utilization.
- Institutional commitments.
- Retail and feeding allocations.
- High-level alerts and navigation.

### Procurement Dashboard

Provides procurement-focused metrics, including:

- Critical reorder-point items.
- Raw milk inventory.
- Packaging buffer status.
- Raw material valuation.
- Recent restock transactions.
- Procurement navigation.

### Plant Manager Dashboard

Provides plant custody and cold-chain oversight, including:

- Production status.
- Cold storage status.
- Ingredient availability.
- WIP batches.
- Facility and inventory navigation.

### Production Staff Dashboard

Provides production-floor operations, including:

- Active WIP batches.
- Milk currently in processing.
- Target finished units.
- Cold chiller status.
- Batch step progression.
- Navigation to the complete WIP board.

### Store Outlet Dashboard

Provides Dairy Box retail operations, including:

- Retail-ready stock.
- POS sales and revenue calculations.
- School feeding reserve visibility.
- Finished-goods valuation.
- Navigation to POS and Cold Storage.

---

## 5. Raw Ingredients and Packaging Subsystem

The Raw Ingredients module manages materials needed for dairy production.

### Supported data

- SKU and material name.
- Category: milk, sweetener, flavoring, packaging, additive, or custom category.
- Current stock and unit.
- Reorder point.
- Safety stock.
- Maximum stock.
- Average daily consumption.
- Lead time.
- Unit cost.
- Supplier.
- Last restocked timestamp.
- Location.
- Expiry date.

### Functions

- View materials in table or grid mode.
- Search by SKU, name, supplier, or location.
- Filter by category.
- Filter by low stock.
- Filter by expiry condition.
- View expiry and FEFO-related indicators.
- Add new material.
- Edit material details.
- Adjust stock.
- Set expiry date.
- Update safety stock.
- Bulk update stock.
- Bulk delete materials.
- Register supplier arrivals from Quick Actions.
- Generate physical inventory hard-copy preview.
- Print the inventory audit sheet.
- Export inventory data as Excel/CSV.
- View valuation and reorder metrics.

### Automated behavior

When stock reaches or falls below the reorder point, the system creates a reorder-point alert. When stock reaches safety stock, the alert severity can become critical. Inventory adjustments create stock transactions and audit records.

---

## 6. Finished Goods and Cold Storage Subsystem

The Cold Storage module tracks processed dairy goods that are ready for distribution or sale.

### Supported data

- SKU and product name.
- Product category.
- Current stock and unit.
- Cold-storage capacity.
- Maximum threshold.
- Safety stock.
- Retail unit price.
- Feeding-program allocation.
- Dairy Box retail allocation.
- Bill of materials recipe.
- Batch output quantity.
- Shelf-life days.
- Storage location.

### Functions

- View products in grid or table mode.
- Search products and locations.
- Filter by category.
- Filter by stock condition.
- Filter below safety stock.
- Filter overstock.
- Add new product.
- Edit product details.
- Adjust finished-goods stock.
- Update finished-goods safety stock.
- View cold-storage capacity and valuation.
- View feeding and retail allocations.
- Generate physical cold-storage audit sheet.
- Print the cold-storage report.
- Export finished goods as Excel/CSV.
- Navigate to POS and production workflows.

### Automated behavior

Finished goods below safety stock generate low-stock warnings. Finished goods above maximum threshold generate overstock flags. Completed WIP batches add their target quantity to the corresponding finished good.

---

## 7. Work-in-Progress Production Subsystem

The WIP module manages the production lifecycle from scheduling to completion or cancellation.

### Production steps

1. Scheduled
2. Pasteurization
3. Homogenization
4. Cooling and bottling
5. Completed
6. Cancelled

### Functions

- Create a WIP batch.
- Select a finished product.
- Specify target quantity.
- Specify raw milk volume.
- Specify assigned staff.
- Record notes.
- Automatically calculate required recipe ingredients.
- Deduct required ingredients and raw milk when a batch is created.
- Advance a batch to the next production step.
- Complete a batch and transfer output to Cold Storage.
- Cancel a scheduled batch.
- Restore deducted recipe ingredients when a scheduled batch is cancelled.
- View active production lines.
- View historical completed and cancelled batches.
- Search historical batches.
- Filter historical batches by completed or cancelled status.
- Export historical batch records as Excel/CSV.
- Review yield and production success metrics.

### Production integrity

Each WIP creation, step advance, completion, cancellation, ingredient deduction, restoration, and finished-goods transfer creates corresponding transaction and audit information.

---

## 8. Supply and Demand Synchronization Subsystem

This module aligns available resources with institutional and retail commitments.

### Commitment types

- School feeding.
- Cooperative collection.
- Dairy Box retail.
- Custom commitment types.

### Functions

- Add a delivery or supply commitment.
- Record partner name and contact person.
- Set scheduled date.
- Specify item or milk resource.
- Set target quantity and unit.
- Track fulfilled quantity.
- Set status: pending, in progress, fulfilled, delayed, or cancelled.
- Set priority: high, medium, or low.
- Update fulfillment status.
- Update priority.
- Cancel a commitment with a reason.
- Review upcoming and delayed commitments.
- Compare demand against finished-goods allocation.
- Record commitment changes in the audit trail.

---

## 9. ROP Procurement Subsystem

The procurement module supports reorder-point-based purchasing decisions.

### Functions

- View ingredients below reorder point.
- Review supplier and lead-time information.
- Review safety stock and maximum stock.
- Calculate inventory valuation.
- Identify packaging shortages.
- Review recent restock transactions.
- Register ingredient arrivals.
- Update stock after receiving materials.
- Record supplier receipts or waybills.
- Add procurement notes.
- Generate procurement and inventory reports.
- Record procurement actions in the audit trail.

### Reorder logic

The system compares current stock with the configured reorder point and safety stock. This produces low-stock and critical alerts for procurement and authorized management roles.

---

## 10. Dairy Box POS Subsystem

The POS module processes walk-in Dairy Box retail sales.

### Functions

- View retail products and available stock.
- Add a product to the cart.
- Increase or decrease quantity.
- Remove a product from the cart.
- Prevent checkout when stock is insufficient.
- Calculate line subtotals.
- Calculate total sale amount.
- Process the retail transaction.
- Deduct finished-goods stock.
- Deduct Dairy Box retail allocation.
- Generate a receipt number.
- Display a digital receipt preview.
- Create a POS stock transaction.
- Create a sales audit record.
- Synchronize or cache the updated inventory state.

---

## 11. Audit Trail and Compliance Subsystem

The Audit Trail records operational provenance across the application.

### Audit categories

- Inventory.
- Production.
- Cold storage.
- Procurement.
- Sales.
- Commitments.
- Security.

### Functions

- View audit records.
- Search audit records.
- Filter by category.
- Filter by severity.
- Filter by date.
- Inspect full audit details.
- Record a manual verification.
- Export audit records as Excel/CSV.
- Generate an audit PDF report.
- Include executive summary.
- Include signatures.
- Add auditor notes.
- Print or save the audit report.
- Clear or archive audit records according to authorized controls.

Each audit record includes an ID, timestamp, category, subsystem, action, description, operator, role, station, severity, and optional detailed values.

---

## 12. Reports and Printing

### Official system report

The Reports modal summarizes:

- Raw ingredient valuation.
- Finished-product valuation.
- Total resource-pool valuation.
- Materials below ROP.
- Cold-storage overstock.
- WIP production records.
- ISO 25010 evaluation submission count.
- Prepared-by and approved-by sign-off information.

### Available output formats

- PDF through the audit PDF generator or browser print flow.
- Excel/CSV through downloadable CSV files.
- Physical hard-copy audit sheets through browser print.

### Printable inventory reports

Raw ingredient and Cold Storage print previews support:

- Filtered or all records.
- Audit checkboxes.
- Sign-off block.
- Document control number.
- Audit date and time.
- Generated role.
- Stock totals.
- Inventory valuation.
- Printable tables.

---

## 13. Alerts and Notifications

The automated alert engine checks inventory and finished goods after relevant state changes.

### Alert types

- Low stock.
- Reorder point triggered.
- Overstock.
- Temperature warning type support.
- Delivery due type support.

### Alert behavior

- Alert severity can be informational, warning, or critical.
- Alerts can target specific roles.
- Unread alerts appear in the header notification drawer.
- Users can mark individual alerts as read.
- Users can mark all alerts as read.
- Alerts are persisted locally.

---

## 14. Offline and PWA Subsystem

DairySync includes an offline continuity layer.

### IndexedDB stores

- Raw ingredients.
- Finished goods.
- WIP batches.
- Stock transactions.
- Offline synchronization queue.
- Cache metadata.

### Functions

- Open or initialize the IndexedDB database.
- Cache inventory snapshots.
- Load cached inventory snapshots.
- Enqueue offline mutations.
- Retrieve pending offline mutations.
- Clear synchronized queue records.
- Calculate local database statistics.
- Monitor online and offline browser events.
- Display offline status.
- Display cached record counts.
- Force a cache refresh.
- Force cloud/cache synchronization behavior.
- Install DairySync as a PWA.
- Display an iOS installation guide.
- Use a service worker and Workbox-generated cache.

### Important limitation

The offline queue currently records and clears local offline actions and caches browser state. It is not yet connected to a persistent centralized Firestore or MySQL API.

---

## 15. Firebase and Deployment

### Current Firebase integration

- Firebase Web SDK is initialized from Vite environment variables.
- Firebase Analytics is initialized in the browser.
- Firebase project: `dairysync-pcc-94978`.
- Firebase Hosting serves the Vite `dist` build.
- SPA rewrites route requests to `index.html`.
- Firebase Hosting deployment URL: https://dairysync-pcc-94978.web.app

### Deployment commands

```powershell
npm run lint
npm run build
firebase.cmd deploy --only hosting --project dairysync-pcc-94978
git add .
git commit -m "Describe the update"
git push origin main
```

### Environment configuration

The repository includes `.env.example`. The actual `.env.local` file is intentionally ignored and must not be committed. Firebase values include:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`

---

## 16. Data Model Summary

### UserProfile

Stores identity, role, title, department, avatar, email, username, nickname, and password data used by the current local role system.

### RawIngredient

Stores raw material stock, reorder controls, consumption metrics, supplier, cost, location, and expiry information.

### FinishedGood

Stores processed product stock, capacity, allocation, price, recipe, batch quantity, shelf life, and location.

### WipBatch

Stores batch identity, product, target quantity, raw milk, recipe deductions, production status, assigned staff, dates, notes, and temperature.

### SupplyDemandCommitment

Stores partner demand, schedules, target and fulfilled quantities, unit, priority, status, and cancellation information.

### StockTransaction

Stores inventory movement, action type, previous stock, new stock, quantity, unit, reference, operator, and notes.

### SystemAlert

Stores alert type, message, severity, read state, timestamp, and target roles.

### AuditLogEntry

Stores immutable-style operational provenance and user action details for review and reporting.

### IsoEvaluationRating

Stores the nine evaluation dimensions used for ISO/IEC 25010 assessment, comments, evaluator role, and date.

### BatchExpiryAlert

Stores cross-referenced expiry status for cold-storage items and WIP-related records.

---

## 17. ISO/IEC 25010 Evaluation Areas

The system includes an ISO evaluation form covering:

1. Functional suitability.
2. Performance efficiency.
3. Compatibility.
4. Interaction capability.
5. Reliability.
6. Security.
7. Maintainability.
8. Flexibility.
9. Safety.

Ratings are stored with the evaluator role, comments, and date. The Reports modal summarizes evaluation submissions.

---

## 18. Source-to-Feature Verification Matrix

| Thesis or requested capability | Current implementation status |
|---|---|
| Secure role-based login | Implemented in local application state |
| Real-time inventory dashboard | Implemented for current browser session and local persistence |
| Automated stock tracking | Implemented through context actions and stock transactions |
| Predictive reorder triggers | Implemented as reorder-point and safety-stock checks; not machine-learning prediction |
| Low-stock alerts | Implemented |
| Overstock flags | Implemented |
| Safety-stock management | Implemented |
| Production planning | Implemented through WIP creation and supply-demand commitments |
| Raw ingredient management | Implemented |
| WIP monitoring | Implemented |
| Reporting and analytics | Implemented through dashboards, reports, PDF, and CSV exports |
| Multi-user role management | Implemented as local role and user management |
| Supply-demand synchronization | Implemented as local commitments and allocation tracking |
| Cloud Hosting | Implemented with Firebase Hosting |
| Central cloud operational database | Not yet implemented; current state is localStorage and IndexedDB |
| Offline sync queue | Implemented locally; server reconciliation is not yet connected to a central API |
| Push notifications to mobile devices | UI alert system exists; native push delivery is not currently implemented |
| Biological carabao health monitoring | Not implemented and outside system scope |
| Chemical milk composition testing | Not implemented and outside system scope |
| Cloud SQL MySQL / DBeaver integration | Not implemented; requires backend API and Cloud SQL instance |

---

## 19. Known Limitations and Recommended Next Phase

1. Move operational state from localStorage to a centralized cloud database.
2. Choose Firestore for direct Firebase integration or Cloud SQL MySQL for DBeaver compatibility.
3. Add a secure backend API if Cloud SQL is selected.
4. Replace local password handling with Firebase Authentication or server-side authentication.
5. Implement true multi-device synchronization.
6. Implement Firebase Cloud Messaging if push notifications are required.
7. Add automated database backups and migration scripts.
8. Add server-side audit immutability and permission enforcement.
9. Add automated end-to-end tests for login, WIP completion, POS sales, and offline recovery.
10. Add database-level validation and concurrency protection for stock deductions.

---

## 20. End-User Workflow Summary

### Procurement staff

1. Log in as Procurement.
2. Open ROP Procurement or Raw Ingredients.
3. Review low-stock and safety-stock alerts.
4. Register arrivals and receipts.
5. Confirm updated stock and transaction records.
6. Export or print an inventory report.

### Production staff

1. Log in as Production Staff.
2. Open WIP Batches.
3. Create a batch using the selected product recipe.
4. Confirm automatic BOM and raw-milk deductions.
5. Advance the batch through each production step.
6. Complete the batch to transfer units into Cold Storage.
7. Review audit and transaction records.

### Store outlet staff

1. Log in as Store Outlet.
2. Open Dairy Box POS.
3. Add available products to the cart.
4. Adjust quantities or remove items.
5. Complete the sale.
6. Confirm receipt and stock deduction.

### Management

1. Log in as Director, Plant Manager, or Developer.
2. Review the role-specific Command Center.
3. Inspect commitments, inventory, WIP, alerts, and valuations.
4. Review Audit Trail and reports.
5. Use ISO evaluation and compliance outputs as needed.

---

## 21. Conclusion

DairySync provides a unified operational interface for PCC-MMSU dairy inventory and production workflows. Its implemented capabilities cover authentication, role-based access, raw material management, cold storage, WIP production, procurement, supply-demand commitments, POS sales, alerts, auditing, reporting, offline caching, PWA installation, and Firebase Hosting.

The current system is production-deployed as a responsive web application. Its next major architectural step is replacing browser-local operational persistence with a centralized cloud database and secure server API for true multi-user, multi-device synchronization.
