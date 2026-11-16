# DairySync Role-by-Role System Walkthrough Script

This script is for a live demonstration, orientation, or training recording. It follows the application from the login page to the subsystems available to each role.

## Before the demonstration

- Use an authorized demonstration account for each role. Do not display or read passwords aloud.
- Use sample or approved demonstration records. Avoid posting real inventory adjustments, receipts, production batches, sales, or reconciliations during a recording.
- The tabs shown after sign-in depend on the account's role. If a tab is missing or marked as restricted, do not try to bypass it; ask an administrator to confirm the assigned access.
- Sign out between role demonstrations and sign in with the next role's own account. A Developer dashboard preview is not a substitute for signing in as that staff member.

## Shared opening: login page to Command Center

**On screen**

1. Open the DairySync web app and show the System Login page.
2. Enter the demonstration account's registered email address or username and password.
3. Select **Sign In** and wait for the authentication check to finish.
4. Point out the signed-in name and role in the header and role banner, then show the **Command Center**.
5. Briefly show the navigation tabs available to this account. On a narrow screen, scroll the tab strip to reveal additional tabs.

**Presenter**

> “DairySync starts at a secure sign-in page. Each staff member uses their own account, with an email address or username and password. After authentication, the Command Center opens with a dashboard and navigation tailored to that account's role. Only authorized areas are available.”

**If sign-in is unsuccessful**

> “Please check the account details and try again. If the password needs to be reset, enter the registered email address and use the password-reset option. If access is still unavailable, contact the system administrator.”

## 1. Lead Developer (Developer / Super Administrator)

**On screen**

1. Sign in with an authorized Lead Developer account.
2. Show the Developer Command Center and the broad operational navigation.
3. Open representative areas: **Raw Ingredients**, **PMO Inventory**, **WIP Batches**, **WIP Inventory**, **Finished Goods**, **Product Recipes**, **Supply and demand**, **ROP Procurement**, **Dairy Box POS**, **Audit Trail**, **User Manual**, and **System Administration**.
4. Show how to use the dashboard shortcuts and the role badge. Do not use dashboard role preview as another user's authenticated session.
5. Return to the Command Center.

**Presenter**

> “The Lead Developer has access to the full DairySync workspace: inventory, production, finished goods, recipes, planning, procurement, retail, audit, documentation, and administration. This account supports system operations and troubleshooting. Changes to live records should only be made when specifically authorized.”

## 2. System Administrator

**On screen**

1. Sign in with a System Administrator account.
2. Show the **Administrator Overview**, including staff profile totals and the network and cloud synchronization status.
3. Select **System Administration**. Demonstrate the staff directory and, using a safe demo record if authorized, how to create an operational staff account and send its setup email.
4. Point out that the directory also supports permitted profile and operational-role updates, password reset requests, and account disable/reactivate actions.
5. Open **Audit Trail** and show how to search or filter records. Explain that this role's audit access is for review.
6. Point out the **User Manual** tab, then return to the Command Center.

**Presenter**

> “The System Administrator manages operational staff accounts and shared app branding, and can review system activity. This role does not provide access to inventory or production records. Privileged Developer and System Administrator access is protected and must be provisioned by the Lead Developer.”

**On-screen note:** System Administrators cannot change their own role or disable their own account. Follow the safeguards shown in the app.

## 3. Director / PMO Supervisor

**On screen**

1. Sign in with a Director / PMO Supervisor account.
2. Show the executive Command Center and its operational summaries.
3. Open **Raw Ingredients**, **PMO Inventory**, **WIP Batches**, and **Cold Storage** to review operational status.
4. Open **Product Recipes**, **Supply and demand**, and **ROP Procurement** to review production inputs, commitments, and replenishment.
5. Open **Sales History** to review Dairy Box transactions, then **Audit Trail** for recorded activity.
6. Return to the Command Center.

**Presenter**

> “The Director / PMO Supervisor uses DairySync for operational oversight. The Command Center brings key indicators together, while the inventory, production, and cold-storage areas support review. Supply and demand, procurement, recipes, sales history, and audit records provide additional context for planning and management.”

**On-screen note:** The Director's POS view is **Sales History**, not the checkout register. Follow the read-only access guidance for oversight screens; ask the responsible operator to make operational changes.

## 4. Procurement

**On screen**

1. Sign in with a Procurement account.
2. Show the Command Center's reorder and raw-material indicators.
3. Open **ROP Procurement**. Review items at or below reorder/safety-stock thresholds, then check supplier, lead time, maximum stock, and recent receipt information.
4. Demonstrate how to record an arrival only after verifying the physical delivery. Use sample data and verify the resulting stock and transaction history.
5. Open **Raw Ingredients** to review material levels and warnings.
6. Open **PMO Inventory** to explain period reconciliation, if that task is assigned to the operator.
7. Return to the Command Center.

**Presenter**

> “Procurement uses the Command Center and ROP Procurement to identify replenishment needs. Before recording a receipt, confirm the supplier delivery and quantities. Then verify that ingredient stock and transaction history reflect the receipt. Raw Ingredients and PMO Inventory provide supporting stock information and reconciliation tools.”

## 5. Plant Manager

**On screen**

1. Sign in with a Plant Manager account.
2. Show the plant Command Center, including production, cold-storage, and stock-request summaries.
3. Open **WIP Batches** to review active batches and production progress. Show **WIP Inventory** for the associated production records.
4. Open **Product Recipes** and **Raw Materials** to review recipes and production inputs.
5. Open **Finished Goods** to review stock, capacity, and allocation.
6. From the dashboard, show the Dairy Box stock-request panel. Review a request, then explain approval/rejection and fulfillment. If using a live environment, fulfill only an approved request and confirm available stock first.
7. Open **ROP Procurement**, **Supply and demand**, **PMO Inventory**, and **Audit Trail** as applicable to the plant workflow.
8. Open **Sales History** for retail activity, then return to the Command Center.

**Presenter**

> “The Plant Manager coordinates production and finished-goods availability. The WIP areas track batches and production records; recipes and raw materials support production planning; and Finished Goods tracks cold storage and allocation. The Plant Manager also reviews Dairy Box stock requests. A request does not reserve stock: stock changes when an approved request is fulfilled.”

## 6. Production Staff

**On screen**

1. Sign in with a Production Staff account.
2. Show the processing-floor Command Center and active batch summary.
3. Open **WIP Batches** and review the assigned batch, its current status, and next production step.
4. Explain the batch progression: **Scheduled → Pasteurization / Cooking → Cooling → Bottling & Packaging → Completed**.
5. Demonstrate updating an assigned batch only when that step has actually been completed and the operator is authorized to record it.
6. Open **Raw Ingredients** to check raw milk and other required materials, then return to the Command Center.

**Presenter**

> “Production Staff use the Command Center to see active floor work and open WIP Batches to follow production progress. Record each step when the work is actually done. Raw Ingredients provides visibility into materials needed for production. If a batch, material, or action is unavailable, coordinate with the Plant Manager rather than using another account.”

## 7. Store Outlet (Dairy Box)

**On screen**

1. Sign in with a Store Outlet account.
2. Show the retail Command Center, sales and stock overview, and Dairy Box stock-request panel.
3. Open **Dairy Box POS**. Select available products, review quantities and the total, complete a demonstration sale only if authorized, and confirm the receipt and resulting stock deduction.
4. Return to the Command Center and show how to submit a finished-goods stock request and track its status.
5. Open **Cold Storage** to review finished-goods availability, then return to the Command Center.

**Presenter**

> “Store Outlet staff use the Dairy Box POS to process sales and confirm the receipt and stock update after checkout. The Command Center also provides the stock-request panel for requesting finished goods from the plant. Requests can be tracked there; they do not deduct or reserve inventory until the Plant Manager fulfills an approved request. Cold Storage lets the outlet review finished-goods availability.”

## Shared closing: finish and sign out

**On screen**

1. Return to the Command Center.
2. Open the account/profile menu in the header and select **Sign Out / Lock System**.
3. Confirm that DairySync returns to the login page before switching to another demonstration account.

**Presenter**

> “When work is complete, return to the account menu and sign out or lock the system. Always sign out before another person uses the workstation, and verify any important stock or transaction update before repeating an action.”

## Quick role-to-subsystem reference

| Role | Main entry point | Available work areas |
|---|---|---|
| Lead Developer | Command Center | All operational modules, Audit Trail, User Manual, System Administration |
| System Administrator | Administrator Overview | System Administration, Audit Trail, User Manual |
| Director / PMO Supervisor | Executive Command Center | Raw Ingredients, PMO Inventory, WIP Batches, Cold Storage, Product Recipes, Supply and demand, ROP Procurement, Sales History, Audit Trail |
| Procurement | Procurement Command Center | ROP Procurement, Raw Ingredients, PMO Inventory |
| Plant Manager | Plant Command Center | Finished Goods, Product Recipes, WIP Batches, WIP Inventory, Raw Materials, PMO Inventory, ROP Procurement, Supply and demand, Sales History, Audit Trail; dashboard stock-request review |
| Production Staff | Processing Floor Command Center | WIP Batches, Raw Ingredients |
| Store Outlet | Retail Command Center | Dairy Box POS, Cold Storage; dashboard stock requests |

Tab wording may vary slightly by role (for example, **Raw Materials** vs. **Raw Ingredients**, and **Finished Goods** vs. **Cold Storage**). The account's visible tabs and available actions determine what the user can do.
