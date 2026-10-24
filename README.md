# DairySync

DairySync is a cloud-enabled inventory, production, supply-demand, and retail management system designed for dairy operations at the Philippine Carabao Center (PCC) in partnership with Mariano Marcos State University (MMSU). The system helps teams monitor raw ingredients, production batches, finished goods, procurement, sales, and compliance workflows from a single dashboard.

## Overview

This project was developed to support operational planning and monitoring across the full dairy value chain:

- Raw ingredient tracking and reorder point management
- PMO inventory monitoring and live inventory adjustments
- WIP production workflow and batch progression
- Cold storage and finished goods management
- Product recipe and BOM configuration
- Supply and demand commitment planning
- Procurement and stock replenishment workflows
- Dairy Box POS and sales history tracking
- Audit trail and operational accountability
- Role-based access control and ISO 25010 evaluation support

## Key Features

### Inventory and warehouse management
- Track raw ingredients by stock level, reorder point, safety stock, lead time, and supplier
- Monitor expiry dates, low-stock thresholds, and replenishment needs
- Manage warehouse stock movements and stock adjustments
- Handle PMO inventory periods and posted inventory activity records

### Production operations
- Create and manage WIP batches from production planning to completion
- Track product production flow through scheduled, pasteurization, cooling, and packaging stages
- Record assigned staff, raw milk usage, notes, and completion timelines
- Support batch cancellation, completion, and production adjustments

### Finished goods and cold storage
- Track product stock, safety buffers, retail allocation, and feeding program allocation
- Manage cold storage capacity and overstock warnings
- Maintain product recipes and batch unit quantities for manufacturing

### Procurement and supply planning
- Monitor inventory demand commitments with status and priority tracking
- Support procurement planning with reorder-point logic and delivery monitoring
- Manage supplier-driven replenishment decisions and operational alerts

### Sales and retail operations
- Process Dairy Box sales and maintain transaction history
- Review sales performance and product movement across retail channels
- Map retail activity to stock deductions and inventory updates

### Governance and reporting
- Maintain a full audit trail of operational actions
- Provide role-based access to each system tab and feature set
- Support system documentation and ISO 25010 evaluation workflows
- Generate reports and operational summaries for management review

## User roles

The application includes role-aware access for the following user types:

- Developer / Super Administrator
- Director / PMO Supervisor
- Procurement
- Plant Manager
- Production Staff
- Store Outlet

These roles determine which dashboard tabs and actions are available to each user.

## Technology stack

- React + TypeScript + Vite
- Firebase Authentication and cloud services
- Express server for local app runtime
- Data Connect / Firebase-backed data sync workflows
- IndexedDB for offline queue support
- Recharts, motion, and Tailwind UI components

## Project structure

- `src/` — application logic, UI, modules, and context providers
- `src/components/` — dashboards and functional modules for each operational area
- `src/context/` — global state and role/auth handling
- `src/data/` — seeded default inventory and operational records
- `src/services/` — Firebase, cloud sync, and storage logic
- `src/utils/` — inventory, reporting, and business rule utilities
- `dataconnect/` — schema and connector configuration
- `public/` and `dist/` — static assets and build output

## Getting started

### Prerequisites

- Node.js 18+
- npm
- Firebase project configuration

### Install dependencies

```bash
npm install
```

### Configure environment variables

Create a `.env.local` file using the values in `.env.example` and provide your own credentials:

```bash
cp .env.example .env.local
```

Required configuration includes:

- Firebase web app values (`VITE_FIREBASE_*`)
- Optional app URL configuration (`APP_URL`)

### Run locally

```bash
npm run dev
```

This starts the app in development mode and serves the DairySync dashboard locally.

### Production build

```bash
npm run build
npm run start
```

## Useful scripts

```bash
npm run dev         # start local development server
npm run build       # build production assets
npm run start       # run the built app
npm run lint        # TypeScript validation
npm run sqlconnect:generate   # generate Data Connect SDK
npm run sqlconnect:emulator   # run Firebase Data Connect emulator
npm run sqlconnect:deploy     # deploy Data Connect configuration
```

## Institutional context

This system was developed for the Philippine Carabao Center at Mariano Marcos State University (PCC-MMSU), Batac City, Philippines, and is intended to support operational visibility for dairy production and distribution workflows.

## Contributors

- Domingo, Edward T.
- Martinez, Selwyn Dominic B.
- Silva, Shyna Jee P.
- Yasay, Jerwin Jake O.

## License

This project is intended for internal academic and operational use within the associated institutional environment.
