# DairySync ER and Activity Diagrams

These diagrams describe DairySync, not the separate “Local Bites” system depicted in the supplied activity-diagram PDFs. The PDFs are used as references for swimlanes, decision points, and role-based flows. Entity names and workflows below are based on DairySync's Data Connect schema and application behavior.

## Entity-Relationship Diagram

DairySync | Core directory ERD
Firestore/Data Connect logical model - exact field names, document keys, and application references

This version follows the same ERD structure used in the Local Bites PDF reference: each entity is listed with its logical key, key type, and important application references. The DairySync model uses Firebase Auth + Data Connect tables instead of Firestore collections, but the organization of PK, REF, and logical relationships follows the same pattern.

Auth + identity
- AUTH_USERS [reference]
  - users/{uid}
  - PK, REF
  - {uid} string
  - Current Firebase Authentication user identity

- USER_PROFILES
  - user_profiles/{id}
  - PK
  - {id} string
  - REF: auth uid or identifier
  - name, role, title, department, avatar, email, username, nickname, updatedAt, updatedBy

Inventory and production
- RAW_INGREDIENTS
  - raw_ingredients/{id}
  - PK
  - {id} string
  - REF: supplier, location
  - sku, name, category, currentStock, unit, reorderPoint, safetyStock, maxStock, avgDailyConsumption, leadTimeDays, costPerUnit, supplier, lastRestocked, location, expiryDate, updatedAt, updatedBy

- FINISHED_GOODS
  - finished_goods/{id}
  - PK
  - {id} string
  - REF: product recipe is embedded in JSON; WIP batches reference productId
  - sku, name, category, currentStock, unit, coldStorageCapacity, maxThreshold, safetyStock, unitPrice, allocatedFeedingProgram, allocatedRetail, recipe, batchUnitQuantity, shelfLifeDays, location, updatedAt, updatedBy

- WIP_BATCHES
  - wip_batches/{id}
  - PK
  - {id} string
  - REF: productId -> finished_goods.id
  - batchNumber, productId, productName, targetQuantity, rawMilkVolumeUsed, ingredientsUsed, status, assignedStaff, startDate, estimatedCompletion, completedAt, cancellationReason, cancelledAt, notes, coldStorageTemp, updatedAt, updatedBy

- SUPPLY_DEMAND_COMMITMENTS
  - supply_demand_commitments/{id}
  - PK
  - {id} string
  - REF: itemOrMilk may correspond to product or raw material reference
  - type, partnerName, contactPerson, scheduledDate, itemOrMilk, targetQuantity, fulfilledQuantity, unit, status, priority, cancellationReason, cancelledAt, updatedAt, updatedBy

- SYSTEM_ALERTS
  - system_alerts/{id}
  - PK
  - {id} string
  - type, timestamp, title, message, severity, read, targetRole

Transaction and audit layer
- STOCK_TRANSACTIONS
  - stock_transactions/{id}
  - PK
  - {id} string
  - REF: itemId, referenceId, performedBy
  - timestamp, itemId, itemName, itemType, action, quantity, unit, previousStock, newStock, referenceId, unitPrice, notes

- PMO_INVENTORY_PERIODS
  - pmo_inventory_periods/{id}
  - PK
  - {id} string
  - REF: linked material identifiers inside JSON lines
  - title, sourceFileName, lines, createdAt, createdBy, status, postedAt, postedBy, updatedAt, updatedBy

- ISO_EVALUATION_RATINGS
  - iso_evaluation_ratings/{id}
  - PK
  - {id} string
  - REF: evaluatorUid -> auth uid
  - functionalSuitability, performanceEfficiency, compatibility, interactionCapability, reliability, security, maintainability, flexibility, safety, evaluatorRole, comments, date, evaluatorUid

- AUDIT_LOG_ENTRIES
  - audit_log_entries/{id}
  - PK
  - {id} string
  - REF: userId -> auth uid; item references inside details JSON
  - timestamp, category, subsystem, action, description, details, userId, userName, userRole, userTitle, terminalOrStation, severity

Logical ER diagram

```mermaid
erDiagram
    AUTH_USERS {
        string uid PK
        string email
    }

    USER_PROFILES {
        string id PK
        string name
        string role
        string title
        string department
        string avatar
        string email
        string username
        string nickname
        timestamp updatedAt
        string updatedBy
    }

    RAW_INGREDIENTS {
        string id PK
        string sku
        string name
        string category
        float currentStock
        string unit
        float reorderPoint
        float safetyStock
        float maxStock
        float avgDailyConsumption
        int leadTimeDays
        float costPerUnit
        string supplier
        string lastRestocked
        string location
        date expiryDate
        timestamp updatedAt
        string updatedBy
    }

    FINISHED_GOODS {
        string id PK
        string sku
        string name
        string category
        float currentStock
        string unit
        float coldStorageCapacity
        float maxThreshold
        float safetyStock
        float unitPrice
        float allocatedFeedingProgram
        float allocatedRetail
        JSON recipe
        float batchUnitQuantity
        int shelfLifeDays
        string location
        timestamp updatedAt
        string updatedBy
    }

    WIP_BATCHES {
        string id PK
        string batchNumber
        string productId
        string productName
        float targetQuantity
        float rawMilkVolumeUsed
        JSON ingredientsUsed
        string status
        string assignedStaff
        string startDate
        string estimatedCompletion
        string completedAt
        string cancellationReason
        string cancelledAt
        string notes
        string coldStorageTemp
        timestamp updatedAt
        string updatedBy
    }

    SUPPLY_DEMAND_COMMITMENTS {
        string id PK
        string type
        string partnerName
        string contactPerson
        string scheduledDate
        string itemOrMilk
        float targetQuantity
        float fulfilledQuantity
        string unit
        string status
        string priority
        string cancellationReason
        string cancelledAt
        timestamp updatedAt
        string updatedBy
    }

    SYSTEM_ALERTS {
        string id PK
        timestamp timestamp
        string type
        string title
        string message
        string severity
        boolean read
        JSON targetRole
    }

    STOCK_TRANSACTIONS {
        string id PK
        timestamp timestamp
        string itemId
        string itemName
        string itemType
        string action
        float quantity
        string unit
        float previousStock
        float newStock
        string referenceId
        float unitPrice
        string performedBy
        string notes
    }

    PMO_INVENTORY_PERIODS {
        string id PK
        string title
        string sourceFileName
        JSON lines
        string createdAt
        string createdBy
        string status
        string postedAt
        string postedBy
        timestamp updatedAt
        string updatedBy
    }

    ISO_EVALUATION_RATINGS {
        string id PK
        float functionalSuitability
        float performanceEfficiency
        float compatibility
        float interactionCapability
        float reliability
        float security
        float maintainability
        float flexibility
        float safety
        string evaluatorRole
        string comments
        string date
        string evaluatorUid
    }

    AUDIT_LOG_ENTRIES {
        string id PK
        timestamp timestamp
        string category
        string subsystem
        string action
        string description
        JSON details
        string userId
        string userName
        string userRole
        string userTitle
        string terminalOrStation
        string severity
    }

    AUTH_USERS ||--o| USER_PROFILES : "auth uid -> profile id *"
    AUTH_USERS ||--o{ AUDIT_LOG_ENTRIES : "auth uid -> userId *"
    AUTH_USERS ||--o{ ISO_EVALUATION_RATINGS : "auth uid -> evaluatorUid *"

    FINISHED_GOODS ||--o{ WIP_BATCHES : "productId *"
    RAW_INGREDIENTS }o--o{ FINISHED_GOODS : "recipe ingredientId in JSON *"
    RAW_INGREDIENTS }o--o{ WIP_BATCHES : "ingredientsUsed ingredientId in JSON *"
    RAW_INGREDIENTS ||--o{ STOCK_TRANSACTIONS : "itemId when itemType = ingredient *"
    FINISHED_GOODS ||--o{ STOCK_TRANSACTIONS : "itemId when itemType = finished_good *"
    WIP_BATCHES ||--o{ STOCK_TRANSACTIONS : "referenceId batchNumber *"
    PMO_INVENTORY_PERIODS ||--o{ STOCK_TRANSACTIONS : "referenceId period id *"
```

Notes
- `AUTH_USERS` is part of Firebase Authentication and is not a Data Connect table; it is included as the external identity reference.
- `STOCK_TRANSACTIONS.itemId` and `referenceId` are logical application references, not enforced database foreign keys.
- `recipe`, `ingredientsUsed`, and `lines` are embedded JSON payloads rather than child tables.

## Activity Diagram

This diagram follows DairySync's staff login, role-specific navigation, and the actual operational flows for procurement, raw ingredients, PMO reconciliation, WIP production, cold storage, commitments, and Dairy Box POS. Role lanes reflect the access documented in the system guide; Director access is read-only except for recipe management.

```mermaid
flowchart TD
    start((Start)) --> openApp["Open DairySync"]
    openApp --> session{"Valid Firebase session restored?"}
    session -- No --> signIn["Enter registered email or username and password"]
    signIn --> firebaseAuth["Firebase Authentication verifies credentials"]
    firebaseAuth --> authOk{"Authentication successful?"}
    authOk -- No --> signInError["Show sign-in error; allow retry or password reset"]
    signInError --> signIn
    authOk -- Yes --> roleClaim["Read trusted Firebase role claim"]
    session -- Yes --> roleClaim
    roleClaim --> role{"Route to authorized DairySync modules"}

    subgraph developer["Developer / Super Administrator"]
        devRoute["Access all dashboards, inventory, production, POS, audit, users, and system tools"]
        devTask{"Choose operational task"}
        devDone["Complete authorized developer task"]
    end

    subgraph director["Director / PMO Supervisor"]
        directorRoute["Review dashboards, reports, inventory, WIP, cold storage, procurement, and PMO periods"]
        directorChoice{"Choose allowed action"}
        recipeEdit["Manage product recipe and batch output quantity"]
        directorRead["View inventory and sales history; operational records remain read-only"]
    end

    subgraph procurement["Procurement"]
        procurementRoute["Open ROP Procurement and Raw Ingredients"]
        procurementChoice{"Choose procurement task"}
        ropCheck["Review materials at or below reorder point, supplier, lead time, and safety stock"]
        ropDecision{"Any material needs replenishment?"}
        issuePo["Issue restock purchase order"]
        receiveMaterials["Register received quantity and update raw ingredient stock"]
        procurementRecords["Record restock StockTransaction and inventory audit; refresh stock alerts"]
        procurementPmo["Manage PMO inventory period"]
        procurementAdjust["Register or adjust a raw ingredient"]
    end

    subgraph plant["Plant Manager"]
        plantRoute["Open dashboard, Raw Ingredients, Procurement, PMO, Recipes, WIP, and Cold Storage"]
        plantChoice{"Choose production or inventory task"}
        plantReceive["Register supplier arrival or adjust raw material stock"]
        plantPeriod["Create or edit PMO draft; link counted items to Raw Ingredients"]
        plantDraft{"Is the PMO period still a draft?"}
        postedLock["Posted period is locked; do not apply another reconciliation"]
        plantCount["Review ledger-based expected closing balance against physical count"]
        plantPost{"Physical count and period data ready to post?"}
        correctCount["Correct the draft count or period data"]
        plantReconcile["Post once; reconcile stock to physical count"]
        plantCold["Review finished-good stock, allocations, capacity, and safety-stock alerts"]
    end

    subgraph production["Production Staff"]
        productionRoute["Open WIP Batches and view Raw Ingredients"]
        selectProduct["Select finished product and enter target batch quantity"]
        recipeCheck["Scale product recipe to target quantity; check available ingredients"]
        materialsReady{"Recipe configured and all required stock available?"}
        correctRecipe["Configure recipe or replenish missing ingredient"]
        createBatch["Create scheduled WipBatch; deduct recipe ingredients and record WIP transactions"]
        batchChoice{"Cancel scheduled batch or continue production?"}
        restoreIngredients["Cancel before processing; restore ingredients and record WIP restore transactions"]
        nextStep["Advance batch: Pasteurization / Cooking"]
        coolStep["Advance batch: Cooling"]
        packageStep["Advance batch: Bottling & Packaging"]
        completion["Complete batch; add target quantity to finished-good stock"]
    end

    subgraph outlet["Store Outlet / Dairy Box"]
        outletRoute["Open Dairy Box POS and Cold Storage"]
        outletChoice{"Choose POS or stock view"}
        buildCart["Select finished goods and quantities; review cart total"]
        saleStock{"Enough finished-good stock for every cart item?"}
        adjustCart["Show stock deficit; change or remove cart quantity"]
        checkout["Complete sale; deduct stock and retail allocation"]
        saleRecords["Create receipt reference, sale StockTransactions, and sales audit entry"]
        outletView["Review sales history and available cold-storage stock"]
    end

    subgraph shared["Shared DairySync services"]
        auditInventory["Record inventory or reconciliation AuditLogEntry"]
        commitment["Create or update school-feeding, cooperative, or retail commitment"]
        fulfillment["Update commitment status and fulfilled quantity"]
        cloudChoice{"Online and cloud backend configured?"}
        cloudSave["Sync authorized records through Firebase Data Connect when enabled"]
        localSave["Update local cache; queue supported offline changes for sync"]
        retrySync["Retry queued sync when connectivity returns"]
        finish((Return to role dashboard))
    end

    role -- Developer --> devRoute --> devTask
    devTask -- Raw ingredients --> plantReceive
    devTask -- Procurement --> ropCheck
    devTask -- PMO inventory --> plantPeriod
    devTask -- Product recipes --> recipeEdit
    devTask -- Production --> selectProduct
    devTask -- Dairy Box POS --> buildCart
    devTask -- Other admin or reports --> devDone --> finish

    role -- Director / PMO Supervisor --> directorRoute --> directorChoice
    directorChoice -- Edit recipe --> recipeEdit --> cloudChoice
    directorChoice -- View or report --> directorRead --> finish

    role -- Procurement --> procurementRoute --> procurementChoice
    procurementChoice -- ROP review --> ropCheck --> ropDecision
    ropDecision -- No --> finish
    procurementChoice -- Raw Ingredients --> procurementAdjust --> auditInventory
    procurementChoice -- PMO inventory --> procurementPmo --> finish
    ropDecision -- Yes --> issuePo --> receiveMaterials --> procurementRecords --> cloudChoice

    role -- Plant Manager --> plantRoute --> plantChoice
    plantChoice -- Receive or adjust materials --> plantReceive --> auditInventory --> cloudChoice
    plantChoice -- Procurement --> ropCheck
    plantChoice -- PMO reconciliation --> plantPeriod --> plantDraft
    plantDraft -- No --> postedLock --> finish
    plantDraft -- Yes --> plantCount --> plantPost
    plantPost -- No --> correctCount --> plantCount
    plantPost -- Yes --> plantReconcile --> auditInventory
    plantChoice -- Recipes --> recipeEdit --> cloudChoice
    plantChoice -- WIP production --> selectProduct
    plantChoice -- Cold Storage --> plantCold --> finish
    plantChoice -- Supply and Demand --> commitment

    role -- Production Staff --> productionRoute --> selectProduct
    selectProduct --> recipeCheck --> materialsReady
    materialsReady -- No --> correctRecipe --> recipeCheck
    materialsReady -- Yes --> createBatch --> batchChoice
    batchChoice -- Cancel while scheduled --> restoreIngredients --> cloudChoice
    batchChoice -- Continue --> nextStep --> coolStep --> packageStep --> completion --> cloudChoice

    role -- Store Outlet --> outletRoute --> outletChoice
    outletChoice -- POS sale --> buildCart --> saleStock
    saleStock -- No --> adjustCart --> buildCart
    saleStock -- Yes --> checkout --> saleRecords --> cloudChoice
    outletChoice -- Cold Storage --> outletView --> finish

    auditInventory --> cloudChoice
    commitment --> fulfillment --> cloudChoice
    procurementRecords --> cloudChoice
    devTask -- Commitments --> commitment
    devTask -- Cold Storage --> plantCold

    cloudChoice -- Yes --> cloudSave --> finish
    cloudChoice -- No --> localSave --> retrySync --> cloudSave
```

WIP cancellation restores materials only while a batch is still scheduled. PMO posting is one-time and locked afterward. Raw ingredient and finished-good transaction references are logical links as described in the ER diagram. Local caching and the offline queue are implementation details, not additional Data Connect entities.
