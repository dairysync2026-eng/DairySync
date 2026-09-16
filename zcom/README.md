# DairySync on Z.com Starter

This folder prepares DairySync for a PHP/MySQL hosting plan such as Z.com Starter.

## What is included

- `schema.sql`: MySQL schema for DBeaver import.
- `api/index.php`: PHP API entry point with health and inventory-summary checks.
- `api/config.php.example`: Safe configuration template.
- `api/.htaccess`: Apache routing and config protection.

The React application still uses its browser persistence layer until the Z.com database credentials are available and the full CRUD migration is completed. Do not claim the app is database-connected until the API health check and data migration pass.

## Deployment steps

1. In Z.com, create a MySQL database named `dairysync` and a restricted database user.
2. In DBeaver, connect to the Z.com MySQL host and import `schema.sql`.
3. Copy `api/config.php.example` to `api/config.php` on the server.
4. Replace the placeholder database values in `config.php`.
5. Upload the `api` folder to a PHP-enabled location, for example `public_html/api`.
6. Open `/api/health` in a browser. A successful response contains `status: ok` and `database: mysql`.
7. Open `/api/inventory/summary` to verify the schema tables are accessible.
8. Configure the frontend API base URL only after the API health check succeeds.
9. Migrate the context actions from `localStorage` to API requests, retaining IndexedDB as the offline cache.
10. Back up the Z.com database before importing live browser data.

## Security rules

- Never commit `api/config.php`.
- Never put MySQL credentials in React or `VITE_*` variables.
- Use HTTPS for the website and API.
- Restrict CORS to the actual frontend domain.
- Keep the database user limited to the DairySync database.
- Use server-side authentication and role checks before enabling write endpoints.
- Use prepared statements for every query.
