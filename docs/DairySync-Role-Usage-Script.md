# DairySync Role-by-Role Voice-Over Script

This narration follows each role from the login page through its authorized DairySync subsystems. Read the voice-over paragraphs while showing the corresponding screen. Use an authorized demonstration account and safe sample records; do not read passwords aloud or make unapproved changes to live data.

## Shared opening: login page to Command Center

**On screen:** Open the DairySync System Login page. Sign in with an authorized account's registered email address or username and password. When authentication completes, point out the signed-in name, role and available navigation tabs.

**Voice-over**

> DairySync starts at a secure sign-in page. Each staff member uses their own account, with a registered email address or username and password. After sign-in, the Command Center opens with a dashboard tailored to the user's role. The tabs and actions shown are the areas authorized for that account.

> If sign-in does not work, check the account details. To reset a password, enter the registered email address and use the password-reset option. Contact the system administrator if you still cannot access your account.

## 1. Lead Developer (Developer / Super Administrator)

**On screen:** Sign in with a Lead Developer account. Show the Developer Command Center, then open the subsystems as they are discussed. For a smaller screen, scroll the navigation strip to reveal additional tabs.

**Voice-over**

> The Lead Developer Command Center gives a broad view of DairySync operations and shortcuts to every authorized work area. From here, the Lead Developer can open Raw Ingredients, PMO Inventory, WIP Batches, WIP Inventory, Finished Goods, Product Recipes, Supply and demand, ROP Procurement, Dairy Box POS, Audit Trail, User Manual, and System Administration. A dashboard preview does not sign in as another staff member; always use that staff member's own account when demonstrating their role.

> Raw Ingredients is the material register. Search or filter ingredients by category, location, stock, or expiry, then review quantities, suppliers, reorder points, safety stock, and warnings. Authorized users can maintain material details and record verified stock counts or adjustments. Filtered information can also be exported or printed for reporting.

> PMO Inventory is the physical-count and reconciliation register for raw ingredients and finished goods. Create a count period, compare the physical ending quantity with the expected ledger balance, and record supported purchases, losses, returns, or other movements. Save and review the draft, check every variance, and export the period if needed. Posting a reviewed period applies its variance to shared stock and locks the period, so do not post a demonstration count against live data.

> WIP Batches manages the production run from preparation to completion. Select a product, enter a target quantity, assigned staff, and notes, then check the scaled bill of materials, ingredient selections, substitutes, and available stock. Starting a batch deducts its recipe materials. Follow its progress through scheduled, pasteurization or cooking, cooling, bottling and packaging, and completion. Use cancellation only when permitted by the batch's current state and the site's procedure.

> WIP Inventory is the production-record register linked to each batch. Find an active, completed, or cancelled batch and record actual processing temperatures and times, package yields, best-before date, and remarks. This subsystem is available to the Lead Developer and Plant Manager.

> Finished Goods is the cold-storage register. Review product quantities, categories, storage locations, safety buffers, retail and feeding allocations, capacity, and expiry or first-expiry-first-out warnings. Authorized users can maintain product records and reconcile verified stock. Use the filters to find products, then print or export the inventory report when needed.

> Product Recipes stores the formulas used to plan production. A recipe defines its product output and base-batch quantity, ingredients and units, quantity ranges, optional materials, and approved substitutes. WIP Batches uses this bill of materials to calculate ingredient requirements and check whether there is enough stock before a batch starts.

> Supply and demand records planned supply or delivery commitments. Enter the partner, item, target quantity, scheduled date, priority, and status; then track fulfillment, or cancel the commitment with a reason when plans change. A commitment is a plan and status record; it does not, by itself, move or deduct inventory.

> ROP Procurement highlights materials at or below their reorder thresholds and displays recommended order quantities, supplier, lead time, usage, and estimated costs. In the current system, choosing Issue Restock Purchase Order immediately updates the app's ingredient stock; it is not just a draft purchase order waiting for receipt. Use this action only when the corresponding restock is verified and authorized.

> Dairy Box POS is the retail checkout register. Select available products, adjust the cart, review the total, complete the sale, and confirm the receipt and resulting stock deduction. Sales History can be searched and filtered to review receipts and sales by period. Deleting a history record does not restore sold stock, and that maintenance action is restricted to the active Lead Developer account.

> Audit Trail records operational activity. Search and filter records by user, keyword, category, severity, action, or date, then open a record for details or export a CSV or PDF report. Authorized oversight roles have additional controls for manual verification notes or clearing history. Individual audit-record deletion is a Lead Developer-only maintenance action.

> User Manual opens the DairySync guide for task instructions and reference. System Administration is where authorized staff accounts and shared app branding are managed: review the account directory, create accounts, update profiles and permitted roles, send password-reset emails, and disable or reactivate access. System Administrators can manage operational access, but only the Lead Developer can grant or modify Developer or System Administrator privileges.

> The Lead Developer has the broadest access, but every change should still follow the operational procedure. In particular, starting a batch deducts materials, posting a PMO count changes shared stock, and the ROP restock action updates ingredient stock immediately.

## 2. System Administrator

**On screen:** Sign in as a System Administrator. Show the Administrator Overview, System Administration, Audit Trail, and User Manual.

**Voice-over**

> The System Administrator's Command Center is the Administrator Overview. It summarizes staff accounts and shows network and cloud synchronization status. Select System Administration to refresh and review the staff account directory. To create an account, enter the staff member's name, email, username, title, department, and operational role, then create the account and send its setup email.

> The account directory also supports authorized profile updates, changes to permitted operational roles, password-reset emails, and disabling or reactivating accounts. These actions change access, so confirm the correct staff member and role before saving. The shared app logo can also be changed or restored while online; branding changes are recorded for audit review.

> Open Audit Trail to search and filter system activity, inspect individual records, and use the available review and reporting controls. In the System Administrator role, the audit view is for review: it does not provide the controls for adding or clearing audit records. Open the User Manual for staff instructions and guidance.

> This role manages accounts and shared branding, not inventory or production. System Administrators cannot grant or modify Developer or System Administrator privileges, and cannot change their own protected role or disable their own account. The Lead Developer is responsible for privileged access.

## 3. Director / PMO Supervisor

**On screen:** Sign in as a Director / PMO Supervisor. Show the executive Command Center, then visit each available subsystem. Point out read-only labels where shown.

**Voice-over**

> The Director / PMO Supervisor Command Center brings together executive indicators such as inventory valuation, cold-storage occupancy, commitments, and operational shortcuts. It is an oversight view for understanding performance and directing planning.

> In Raw Ingredients, review material quantities, valuation, suppliers, reorder levels, expiry information, and warnings. Search and filter the register or use its available reports, but remember that this Director view is read-only: it does not allow material or stock changes. PMO Inventory provides the same kind of oversight for count periods. Compare the physical and expected balances, review variances, and inspect posted-period history; this role cannot edit or post the period.

> WIP Batches shows production products, assigned staff, ingredients, current status, and progress through the production stages. Finished Goods, also labeled Cold Storage, shows product availability, allocations, capacity, safety buffers, and expiry warnings. Both are review-only for the Director, so batch changes and stock adjustments must be handled by the responsible operational staff.

> Product Recipes supports production planning by showing and, when authorized, maintaining the recipe, ingredient quantities and units, optional ingredients, approved substitutes, and base output settings. Saving a recipe change requires the appropriate authorization and may require a recent sign-in; deleting a recipe is restricted to the Lead Developer.

> Supply and demand is where authorized planning staff can record a partner commitment, item, target quantity, schedule, priority, and status, then update fulfillment or cancel with a reason. These changes require a recent sign-in. A commitment tracks a plan and does not itself deduct inventory.

> ROP Procurement provides a read-only view of low-stock items, reorder thresholds, recommended quantities, suppliers, lead times, and estimated costs. The Director can review these purchasing signals but cannot issue a restock from this screen. Sales History shows Dairy Box receipts and sales for review; it is not the cashier register and does not provide checkout controls.

> Audit Trail helps the Director review and report operational records by searching, filtering, and opening record details. Authorized Director controls include manual-verification notes and audit clearing, so use them only under the oversight policy and after any required re-authentication.

> The Director's role connects operational visibility with planning. Use the read-only inventory, production, procurement, and sales views to understand status, then coordinate any changes with the staff responsible for those operations.

## 4. Procurement

**On screen:** Sign in as Procurement. Show the Procurement Command Center, then open ROP Procurement, Raw Ingredients, and PMO Inventory.

**Voice-over**

> The Procurement Command Center summarizes raw-material stock and reorder concerns. Start in ROP Procurement, where DairySync identifies materials at or below their reorder thresholds. Review each item's current stock, reorder point, safety stock, supplier, lead time, usage, recommended order quantity, and estimated cost to help prioritize purchasing.

> Be aware of what the restock control does: Issue Restock Purchase Order immediately adds the recommended quantity to the app's ingredient stock. It is not a separate approval or receiving workflow. Only use it when the corresponding restock has been confirmed under local procedure, and verify the resulting stock and transaction history.

> Raw Ingredients is the detailed material register. Search and filter items to review quantity, location, supplier, expiry, reorder information, and stock warnings. Authorized staff can maintain ingredient details and record verified material movements. Use the available export or report controls to share the required inventory information.

> PMO Inventory supports physical counts and period reconciliation for raw ingredients or finished goods. Create a draft period, enter and compare the physical ending quantities with the expected ledger balances, and record supported movements. Review every variance before posting. Posting applies the difference to shared stock and locks the period, so count carefully and post only when authorized.

> Procurement's tabs focus on purchasing and stock control. WIP production, finished goods, retail sales, and account administration are not part of this role's navigation.

## 5. Plant Manager

**On screen:** Sign in as a Plant Manager. Show the plant Command Center, including production, cold-storage, reorder, and Dairy Box request summaries. Visit each available subsystem and the dashboard stock-request panel.

**Voice-over**

> The Plant Manager Command Center brings together plant operations, including active production, cold-storage occupancy, material warnings, and Dairy Box requests. Use its shortcuts to move from planning to production, finished-goods custody, and outlet replenishment.

> Finished Goods, also called Cold Storage, is the register for manufactured products. Review quantities, storage locations, retail and feeding allocations, safety stock, capacity, and expiry or first-expiry-first-out alerts. Use the filters to find a product and the available reports to support a physical check. When a stock or product change is needed, confirm the facts and follow the authorized stock-adjustment process.

> Product Recipes defines what each product requires to manufacture. Review or configure the base batch output, ingredient quantities and units, quantity ranges, optional materials, and approved substitutes. These settings feed directly into WIP batch calculations, so confirm the recipe before production starts.

> WIP Batches is the production workflow. Select a product, enter the target output, assign staff, and add notes. DairySync scales the recipe requirements, lets the operator select approved substitutes where configured, and checks material availability. Starting a batch deducts its ingredients. Track the run from scheduled, through pasteurization or cooking, cooling, and bottling and packaging, to completion. Follow the on-screen rules if a batch must be cancelled.

> WIP Inventory contains the detailed record linked to a batch. Find the batch and enter actual processing temperatures and times, package yields, a best-before date, and remarks. The active, completed, and cancelled filters help locate the right production record.

> Raw Materials, or Raw Ingredients, shows the availability and details of milk and other inputs. Use it to check supplier, quantity, location, expiry, reorder, and safety-stock information before production. Record stock updates only when they reflect a verified event.

> PMO Inventory is used for periodic physical counts of ingredients or finished goods. Create a draft, compare the count with expected activity, enter supported movements, and review the variance. Posting changes shared stock and locks the period, so post only after the count has been checked and approved.

> ROP Procurement highlights material reorder needs and shows suppliers, lead times, recommended quantities, and cost estimates. Its restock action updates ingredient stock immediately, so use it only for a confirmed and authorized restock. Supply and demand records partner commitments, target quantities, schedules, priorities, and fulfillment status. Those commitments coordinate planned supply; they are not stock deductions by themselves.

> The Command Center also includes Dairy Box stock requests. Review the requested product and quantity, then approve or reject the request as appropriate. For an approved request, confirm available stock before fulfilling it. Submitting a request does not reserve or deduct stock; allocation happens when the Plant Manager fulfills the approved request.

> Sales History shows Dairy Box receipts for review, not checkout. Audit Trail provides search, filters, and details for operational activity. Together, these areas help the Plant Manager connect production, cold storage, and retail replenishment while keeping an accountable record of changes.

## 6. Production Staff

**On screen:** Sign in as Production Staff. Show the processing-floor Command Center, open WIP Batches, then open Raw Ingredients.

**Voice-over**

> The Production Staff Command Center is the processing-floor overview. It highlights active batch runs, planned output, and raw milk in process, with shortcuts to WIP Batches and Raw Ingredients.

> In WIP Batches, review the product, assigned staff, target quantity, ingredients, and current production step. Before an authorized batch starts, verify that a recipe is configured and the required materials are available. The production path is scheduled, pasteurization or cooking, cooling, bottling and packaging, then completion. Record a step only after that work has actually happened. Starting a batch deducts the selected recipe materials, and completing it transfers the output to Finished Goods or Cold Storage.

> Raw Ingredients lets the production team check raw milk and other materials before and during a run. Search or filter the register and review quantities, locations, suppliers, expiry dates, and reorder warnings. Make a material or stock change only when it is part of the assigned procedure and reflects a verified event.

> Production Staff do not have a separate WIP Inventory tab. Coordinate detailed processing records, recipe changes, and finished-goods release with the Plant Manager. If a batch or material is unavailable, ask the supervisor to confirm access or update the production plan rather than using another account.

## 7. Store Outlet (Dairy Box)

**On screen:** Sign in as Store Outlet. Show the retail Command Center, open Dairy Box POS, then return to the dashboard to show stock requests and open Cold Storage.

**Voice-over**

> The Store Outlet Command Center summarizes retail stock, sales, and open replenishment requests. Its shortcuts lead to the Dairy Box POS and finished-goods availability, while the dashboard request panel lets staff ask the plant for more stock.

> In Dairy Box POS, select available products, adjust quantities in the cart, and review the total before checkout. After completing a sale, confirm the receipt and stock deduction before moving to the next customer. If the screen appears slow, check whether the sale completed before trying again, so the customer is not charged twice.

> When the outlet needs more finished goods, use the dashboard stock-request panel to choose a product and quantity, submit the request, and track its status. A pending request can be cancelled if it is no longer needed. A request does not reserve or deduct inventory. The Plant Manager reviews requests and allocates stock when fulfilling an approved request.

> Cold Storage, also labeled Finished Goods, helps the outlet check product availability, location, and stock warnings. Use it to inform sales and replenishment requests. Contact the Plant Manager about discrepancies, adjustments, or fulfillment; the Store Outlet account does not include production, procurement, recipe, or PMO count tabs.

## Shared closing: sign out

**On screen:** Return to the Command Center, open the account/profile menu, and select **Sign Out / Lock System**. Confirm that DairySync returns to the login page before the next person signs in.

**Voice-over**

> When your work is complete, sign out or lock DairySync from the account menu. Before repeating an action, verify the result—especially for a sale, stock adjustment, batch start, or posted inventory count. This protects both the account and the shared operational records.
