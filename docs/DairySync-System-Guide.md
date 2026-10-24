# DairySync System Guide

## A Cloud-Based Inventory and Production Management System for PCC-MMSU

**Institution:** Philippine Carabao Center at Mariano Marcos State University (PCC-MMSU), Batac City, Ilocos Norte  
**Application:** DairySync Cloud Inventory and Production Management System  
**Guide version:** Source-verified October 3, 2026
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

Authentication uses Firebase Authentication Email/Password with a trusted Firebase custom `role` claim. Each browser tab has an independent session, so different accounts and role-specific dashboards can be used in separate tabs at the same time. Operational collections are connected to Firebase SQL Connect operations, which enforce role checks server-side; localStorage and IndexedDB remain caches and offline storage. The SQL Connect service and Cloud SQL instance must still be provisioned and deployed before the hosted app uses this backend.

---

## 2. User Roles and Access Control

| Role | Authorized areas |
|---|---|
| Developer / Super Administrator | All dashboards, inventory, PMO Inventory, WIP, product recipes, cold storage, supply-demand, procurement, POS, audit, user administration, reset, and system tools |
| Director / PMO Supervisor | Oversight and reporting; Raw Ingredients, PMO Inventory, WIP, and Cold Storage are read-only; Product Recipes can be managed; POS shows Sales History only |
| Administrative Assistant IV / Procurement | Dashboard, ROP Procurement, Raw Ingredients, PMO Inventory |
| Internal Custodian / Plant Manager | Dashboard, Cold Storage, WIP, Raw Ingredients, PMO Inventory, Procurement |
| Production Staff | Dashboard, WIP, Raw Ingredients |
| Store Outlet / Dairy Box | Dashboard, Dairy Box POS, Cold Storage |

### Authentication functions

- Firebase Email/Password sign-in; usernames resolve to registered email addresses.
- User role is read from a Firebase ID token custom claim; client-selected roles do not grant access.
- Password reset email through Firebase Authentication.
- Auth state restoration through Firebase's persisted session listener.
- Role claims provisioned by a trusted Firebase Admin SDK script; public account creation is not offered.
- Login handshake animation with success and error states.
- Logout.
- Firebase session restoration on app startup; sign-in is required when no valid session exists.
- Developer session switching between role accounts.
- Return to the developer account.
- Role-based tab access enforcement.
- Audit Trail access limited to Developer and Director / PMO; System Manual access limited to Developer.
- Audit search by user ID and action type, with quick ranges and exact timestamp bounds.
- Automatic return to the dashboard when a selected tab becomes unauthorized.
- Profile display metadata editing; Firebase credentials are not stored or displayed in the client.
- Developer role simulation is a UI view switch and does not sign in as another Firebase user.

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
3. PMO Inventory
4. WIP Batches
5. Cold Storage
6. Product Recipes
7. Supply and Demand
8. ROP Procurement
9. Dairy Box POS
10. Audit Trail
11. System Manual (Developer only)

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

## 5.1 PMO Inventory and Stock Reconciliation

The PMO Inventory register records period-based physical counts against the shared Raw Ingredients ledger. For linked items in a new live-ledger period, purchases, WIP production issues/restores, losses, returns, and stock adjustments are derived from shared stock transactions rather than entered a second time. Opening balances are calculated from current shared stock and period movements, and update as cloud transactions arrive while the period remains a draft. Imported legacy reports retain their entered movement quantities.

- Create a draft period and add existing Raw Ingredients items.
- Record losses or returns with their type; each movement updates shared stock and creates a transaction used by the expected balance.
- Record an outside purchase for an item not yet in Raw Ingredients. The workflow creates the shared ingredient entry, records the purchase stock transaction, and adds the item to the period.
- Review each expected closing balance against its physical ending count.
- Post a period once. Posting applies the difference between expected close and physical count to the current shared Raw Ingredients balance, records that reconciliation as a stock transaction, and adds an audit entry. Posted periods are locked to prevent duplicate posting.
- Developers can delete a period; this removes only the period report. Shared stock movements and posted reconciliations remain in the inventory ledger and are not reversed. Deletions are recorded in the audit trail.
- WIP, Procurement, Raw Ingredients, and reports continue to use the shared ingredient records. The Director can view PMO periods but cannot edit or post them; Developers, Plant Managers, and Procurement users can manage periods.

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

Product formulas are managed separately from cold-storage inventory in the **Product Recipes** subsystem. Developers, Directors, and Plant Managers can open it from the tab bar or their dashboard and add or edit recipes. Add the required raw materials in Raw Ingredients first; recipe quantities use each material's inventory unit. The recipe and formula output quantity are saved with the product and synchronized through Data Connect. New products start with an empty recipe, and WIP creation remains blocked until a recipe is configured. Director recipe writes use a dedicated Data Connect operation that cannot modify stock or other finished-good fields.

---

## 7. Work-in-Progress Production Subsystem

The WIP module manages the production lifecycle from scheduling to completion or cancellation.

### Production steps

1. Scheduled Batch
2. Pasteurization / Cooking
3. Cooling
4. Bottling & Packaging
5. Finished Goods Release
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
- Remove an offline queue record only after its supported SQL Connect operation succeeds.
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

All operational collections use Firebase SQL Connect for shared reads and live updates: user profiles, ingredients, finished goods, WIP batches, commitments, alerts, stock transactions, ISO ratings, and audit entries. localStorage and IndexedDB remain as local caches. Pending SQL writes are tagged to the authenticated Firebase UID and acknowledged individually; older unsupported queue actions are retained rather than discarded.

Collection persistence is not the same as a business transaction. POS sales, WIP deductions/completion, and audit records are currently synchronized as separate row mutations. Add atomic SQL Connect mutations and concurrent-stock checks before treating those workflows as safe for simultaneous operators.

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

Stores a shared profile directory: name, role label, title, department, avatar, email, username, and nickname. Passwords remain exclusively in Firebase Authentication; SQL authorization uses the Firebase custom role claim, not the profile's role label.

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

Stores operational events and details for review and reporting. New records receive the actor UID and role from the authenticated Firebase token; administrative delete/import operations mean the table is not an immutable audit ledger.

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
| Secure role-based login | Firebase Authentication with custom-claim authorization in SQL Connect operations |
| Real-time inventory dashboard | Shared SQL Connect data with IndexedDB/localStorage cache |
| Automated stock tracking | Implemented through context actions and stock transactions |
| Predictive reorder triggers | Implemented as reorder-point and safety-stock checks; not machine-learning prediction |
| Low-stock alerts | Implemented |
| Overstock flags | Implemented |
| Safety-stock management | Implemented |
| Production planning | Implemented through WIP creation and supply-demand commitments |
| Raw ingredient management | Implemented |
| WIP monitoring | Implemented |
| Reporting and analytics | Implemented through dashboards, reports, PDF, and CSV exports |
| Multi-user role management | Firebase custom claims plus a shared SQL Connect profile directory |
| Supply-demand synchronization | Shared SQL Connect commitments and allocation tracking |
| Cloud Hosting | Implemented with Firebase Hosting |
| Central cloud operational database | All application data collections are connected to SQL Connect operations; service provisioning and deployment are still required |
| Offline sync queue | Collection upserts and deletes are retried per authenticated account and acknowledged after server success |
| Push notifications to mobile devices | UI alert system exists; native push delivery is not currently implemented |
| Biological carabao health monitoring | Not implemented and outside system scope |
| Chemical milk composition testing | Not implemented and outside system scope |
| Cloud SQL PostgreSQL | Configured through Firebase SQL Connect; Cloud SQL instance provisioning and deployment are still required |

---

## 19. Known Limitations and Recommended Next Phase

1. Provision the configured Cloud SQL PostgreSQL instance and deploy SQL Connect schemas and operations.
2. Replace first-developer browser bootstrap with a reviewed, repeatable migration and seed workflow.
3. Make POS, WIP, procurement, and other stock-changing business operations atomic across inventory, transactions, and audit records.
4. Add database-level concurrency protection for concurrent stock deductions.
5. Implement Firebase Cloud Messaging if push notifications are required.
6. Add automated database backups and migration scripts.
7. Add automated end-to-end tests for login, WIP completion, POS sales, and offline recovery.

---

## 20. End-User Workflow Summary

### Procurement staff

1. Log in as Procurement.
2. Open ROP Procurement or Raw Ingredients.
3. Review low-stock and safety-stock alerts.
4. Register arrivals and receipts.
5. Use PMO Inventory to reconcile a period or register an outside purchase not already in Raw Ingredients.
6. Confirm updated shared stock and transaction records.
7. Export or print an inventory report.

### Production staff

1. Log in as Production Staff.
2. Open WIP Batches.
3. Ask a Developer or Plant Manager to configure the finished product's recipe if it has not been set up yet.
4. Create a batch using the selected product recipe.
5. Confirm automatic BOM and raw-material deductions.
6. Advance the batch through each production step.
7. Complete the batch to transfer units into Cold Storage.
8. Review audit and transaction records.

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

The system remains production-deployed as a responsive web application. The workspace now connects all operational collections to generated, role-checked SQL Connect operations. The live site will use them only after Cloud SQL/SQL Connect provisioning and deployment of a new frontend build.
