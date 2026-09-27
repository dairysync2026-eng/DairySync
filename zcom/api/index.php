<?php
declare(strict_types=1);

$configPath = __DIR__ . '/config.php';
if (!is_file($configPath)) {
    http_response_code(503);
    header('Content-Type: application/json');
    echo json_encode([
        'status' => 'not_configured',
        'message' => 'Copy config.php.example to config.php and add the Z.com database credentials.'
    ]);
    exit;
}

$config = require $configPath;
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin === ($config['allowed_origin'] ?? '')) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
}
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: GET, POST, PATCH, OPTIONS');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

function respond(array $payload, int $status = 200): never {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_SLASHES);
    exit;
}

try {
    $dsn = sprintf(
        'mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4',
        $config['db_host'],
        $config['db_port'],
        $config['db_name']
    );
    $pdo = new PDO($dsn, $config['db_user'], $config['db_password'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
} catch (Throwable $error) {
    error_log('DairySync MySQL connection failed: ' . $error->getMessage());
    respond(['status' => 'database_unavailable'], 503);
}

$method = $_SERVER['REQUEST_METHOD'];
$path = trim(parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH), '/');
$route = preg_replace('#^.*?/api/?#', '', $path);

if ($method === 'GET' && $route === 'health') {
    respond([
        'status' => 'ok',
        'service' => 'DairySync Z.com PHP API',
        'database' => 'mysql',
        'timestamp' => gmdate('c'),
    ]);
}

if ($method === 'GET' && $route === 'inventory/summary') {
    $summary = [
        'ingredients' => (int) $pdo->query('SELECT COUNT(*) FROM raw_ingredients')->fetchColumn(),
        'finished_goods' => (int) $pdo->query('SELECT COUNT(*) FROM finished_goods')->fetchColumn(),
        'wip_batches' => (int) $pdo->query('SELECT COUNT(*) FROM wip_batches')->fetchColumn(),
        'transactions' => (int) $pdo->query('SELECT COUNT(*) FROM stock_transactions')->fetchColumn(),
    ];
    respond(['status' => 'ok', 'data' => $summary]);
}

respond([
    'status' => 'not_found',
    'message' => 'This API scaffold currently exposes health and inventory summary. CRUD migration follows after database credentials are configured.'
], 404);
