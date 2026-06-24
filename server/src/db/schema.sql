-- ═══════════════════════════════════════════════════════════════════════
-- Carsai BMS — React Rewrite — Database Schema (Phase 1)
-- Fresh schema, independent of the PHP version.
-- Monetary values stored as INTEGER cents to avoid float precision issues.
-- ═══════════════════════════════════════════════════════════════════════

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ── Users (all roles: admin, staff, customer) ─────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(120)  NOT NULL,
  email         VARCHAR(160)  NOT NULL UNIQUE,
  phone         VARCHAR(30)   NULL,
  password_hash VARCHAR(255)  NOT NULL,
  role          ENUM('admin','manager','seller','staff','customer') NOT NULL DEFAULT 'customer',
  avatar        VARCHAR(255)  NULL,
  is_active     TINYINT(1)    NOT NULL DEFAULT 1,
  last_login_at DATETIME      NULL,
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Refresh tokens (rotation + revocation) ────────────────────────────────
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  token_hash  VARCHAR(255) NOT NULL,
  expires_at  DATETIME NOT NULL,
  revoked_at  DATETIME NULL,
  user_agent  VARCHAR(255) NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_token_hash (token_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Customer profile (extends users for role='customer') ─────────────────
CREATE TABLE IF NOT EXISTS customers (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL UNIQUE,
  company     VARCHAR(160) NULL,
  nuit        VARCHAR(30)  NULL,
  address     VARCHAR(255) NULL,
  city        VARCHAR(100) NULL,
  country     VARCHAR(100) NULL DEFAULT 'Moçambique',
  notes       TEXT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Categories (products / services) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  type        ENUM('product','service') NOT NULL,
  name        VARCHAR(120) NOT NULL,
  slug        VARCHAR(140) NOT NULL,
  parent_id   INT NULL,
  sort_order  INT NOT NULL DEFAULT 0,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_type_slug (type, slug),
  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Products ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  category_id   INT NULL,
  sku           VARCHAR(60)  NULL,
  barcode       VARCHAR(64)  NULL,
  name          VARCHAR(180) NOT NULL,
  slug          VARCHAR(200) NOT NULL UNIQUE,
  description   TEXT NULL,
  short_desc    VARCHAR(255) NULL,
  price_cents   INT NOT NULL DEFAULT 0,
  cost_cents    INT NOT NULL DEFAULT 0,
  stock         DECIMAL(15,3) NOT NULL DEFAULT 0,
  min_stock     DECIMAL(15,3) NOT NULL DEFAULT 0,
  unit          VARCHAR(20)  NOT NULL DEFAULT 'un',
  image         VARCHAR(255) NULL,
  is_active     TINYINT(1)   NOT NULL DEFAULT 1,
  is_featured   TINYINT(1)   NOT NULL DEFAULT 0,
  sold_count    INT NOT NULL DEFAULT 0,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Services ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS services (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  category_id   INT NULL,
  name          VARCHAR(180) NOT NULL,
  slug          VARCHAR(200) NOT NULL UNIQUE,
  description   TEXT NULL,
  price_cents   INT NOT NULL DEFAULT 0,
  duration_min  INT NULL,
  image         VARCHAR(255) NULL,
  is_active     TINYINT(1)   NOT NULL DEFAULT 1,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Orders ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  order_number    VARCHAR(40) NOT NULL UNIQUE,
  customer_id     INT NULL,
  status          ENUM('pending','confirmed','processing','shipped','delivered','cancelled','refunded') NOT NULL DEFAULT 'pending',
  payment_status  ENUM('unpaid','processing','paid','refunded','failed') NOT NULL DEFAULT 'unpaid',
  payment_method  VARCHAR(40) NULL,
  subtotal_cents  INT NOT NULL DEFAULT 0,
  discount_cents  INT NOT NULL DEFAULT 0,
  tax_cents       INT NOT NULL DEFAULT 0,
  shipping_cents  INT NOT NULL DEFAULT 0,
  total_cents     INT NOT NULL DEFAULT 0,
  currency        VARCHAR(8) NOT NULL DEFAULT 'MZN',
  delivery_address VARCHAR(255) NULL,
  notes           TEXT NULL,
  source          VARCHAR(30) NOT NULL DEFAULT 'web',
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
  INDEX idx_customer (customer_id),
  INDEX idx_status (status),
  INDEX idx_payment_status (payment_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Order items ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  order_id      INT NOT NULL,
  product_id    INT NULL,
  name          VARCHAR(180) NOT NULL,
  quantity      DECIMAL(15,3) NOT NULL DEFAULT 1,
  unit_price_cents INT NOT NULL DEFAULT 0,
  discount_cents   INT NOT NULL DEFAULT 0,
  total_cents      INT NOT NULL DEFAULT 0,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Payments ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  order_id      INT NOT NULL,
  method        VARCHAR(40) NOT NULL,
  amount_cents  INT NOT NULL DEFAULT 0,
  reference     VARCHAR(120) NULL,
  status        ENUM('pending','paid','failed','refunded') NOT NULL DEFAULT 'pending',
  raw_response  JSON NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Payment gateways config ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payment_gateways (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  gateway     VARCHAR(40) NOT NULL UNIQUE,
  label       VARCHAR(100) NOT NULL,
  is_active   TINYINT(1) NOT NULL DEFAULT 0,
  config      JSON NULL,
  sort_order  INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Support tickets ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tickets (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  ticket_number VARCHAR(40) NOT NULL UNIQUE,
  customer_id   INT NOT NULL,
  assigned_to   INT NULL,
  subject       VARCHAR(180) NOT NULL,
  status        ENUM('open','pending','resolved','closed') NOT NULL DEFAULT 'open',
  priority      ENUM('low','medium','high') NOT NULL DEFAULT 'medium',
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Ticket messages (conversation thread) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS ticket_messages (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  ticket_id   INT NOT NULL,
  user_id     INT NOT NULL,
  body        TEXT NOT NULL,
  attachment  VARCHAR(255) NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Notifications ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  title       VARCHAR(160) NOT NULL,
  body        VARCHAR(255) NULL,
  url         VARCHAR(255) NULL,
  is_read     TINYINT(1) NOT NULL DEFAULT 0,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_unread (user_id, is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Settings (key/value store) ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS settings (
  `key`   VARCHAR(100) PRIMARY KEY,
  `value` TEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;

-- ── Seed: default payment gateways ────────────────────────────────────────
INSERT IGNORE INTO payment_gateways (gateway, label, sort_order, config) VALUES
  ('mpesa',  'M-Pesa (Moçambique)', 1, JSON_OBJECT('api_key','','public_key','','agent_id','171717','env','development')),
  ('emola',  'e-Mola',               2, JSON_OBJECT('api_key','','secret','','env','sandbox')),
  ('paypal', 'PayPal',               3, JSON_OBJECT('client_id','','secret','','env','sandbox')),
  ('stripe', 'Stripe',               4, JSON_OBJECT('publishable_key','','secret_key',''));

-- ── Seed: demo admin + customer (password = "password") ───────────────────
-- bcrypt hash for "password" (cost 10)
INSERT IGNORE INTO users (id, name, email, password_hash, role) VALUES
  (1, 'Administrador', 'admin@carsai.co.mz', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin'),
  (2, 'Cliente Demo',  'cliente@carsai.co.mz', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'customer');

INSERT IGNORE INTO customers (id, user_id, company, city, country) VALUES
  (1, 2, 'Cliente Demo Lda', 'Maputo', 'Moçambique');

-- ── Seed: demo categories + products ──────────────────────────────────────
INSERT IGNORE INTO categories (id, type, name, slug, sort_order) VALUES
  (1, 'product', 'Electrónica', 'electronica', 1),
  (2, 'product', 'Acessórios',  'acessorios', 2);

INSERT IGNORE INTO products (id, category_id, sku, barcode, name, slug, short_desc, price_cents, stock, min_stock, unit, is_active, is_featured) VALUES
  (1, 1, 'PRD-001', '7891234567890', 'Smartphone X100', 'smartphone-x100', 'Ecrã 6.5", 128GB, dual SIM', 1499900, 12, 3, 'un', 1, 1),
  (2, 2, 'PRD-002', '7891234567906', 'Capa Protectora Universal', 'capa-protectora-universal', 'Silicone resistente a quedas', 29900, 50, 10, 'un', 1, 0),
  (3, 1, 'PRD-003', '7891234567913', 'Auriculares Bluetooth', 'auriculares-bluetooth', 'Cancelamento de ruído, 20h bateria', 89900, 25, 5, 'un', 1, 1);

-- ── Seed: demo order for the demo customer ────────────────────────────────
INSERT IGNORE INTO orders (id, order_number, customer_id, status, payment_status, payment_method, subtotal_cents, discount_cents, tax_cents, total_cents, currency, source) VALUES
  (1, 'ORD-2026-0001', 1, 'confirmed', 'unpaid', 'mpesa', 1799700, 0, 0, 1799700, 'MZN', 'web');

INSERT IGNORE INTO order_items (order_id, product_id, name, quantity, unit_price_cents, total_cents) VALUES
  (1, 1, 'Smartphone X100', 1, 1499900, 1499900),
  (1, 3, 'Auriculares Bluetooth', 1, 89900, 89900),
  (1, 2, 'Capa Protectora Universal', 1, 29900, 29900);

-- ── Seed: demo ticket ───────────────────────────────────────────────────────
INSERT IGNORE INTO tickets (id, ticket_number, customer_id, subject, status, priority) VALUES
  (1, 'TKT-2026-0001', 1, 'Pergunta sobre garantia do Smartphone X100', 'open', 'medium');

INSERT IGNORE INTO ticket_messages (ticket_id, user_id, body) VALUES
  (1, 2, 'Olá, gostaria de saber qual o período de garantia do Smartphone X100. Obrigado!');

-- ── Seed: notification ─────────────────────────────────────────────────────
INSERT IGNORE INTO notifications (id, user_id, title, body, url) VALUES
  (1, 2, 'Pedido confirmado', 'O seu pedido ORD-2026-0001 foi confirmado.', '/orders/1');

-- ── Blog Posts ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS posts (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  slug          VARCHAR(220) NOT NULL UNIQUE,
  title         VARCHAR(220) NOT NULL,
  excerpt       TEXT NULL,
  body          LONGTEXT NULL,
  image         VARCHAR(255) NULL,
  author_id     INT NULL,
  is_published  TINYINT(1) NOT NULL DEFAULT 0,
  views         INT NOT NULL DEFAULT 0,
  published_at  DATETIME NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Seed demo blog post ────────────────────────────────────────────────────
INSERT IGNORE INTO posts (id, slug, title, excerpt, body, author_id, is_published, published_at) VALUES
  (1, 'bem-vindo-ao-carsai-bms',
   'Bem-vindo ao Carsai BMS',
   'O Carsai BMS é uma plataforma completa de gestão empresarial desenvolvida para o mercado moçambicano.',
   '<p>O Carsai BMS é uma plataforma completa de gestão empresarial desenvolvida especificamente para o mercado moçambicano.</p><p>Com suporte a pagamentos M-Pesa, e-Mola, PayPal e Stripe, gestão de stock, facturas PDF e muito mais.</p>',
   1, 1, NOW());

-- ── Tasks ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tasks (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(220) NOT NULL,
  description TEXT NULL,
  assigned_to INT NULL,
  status      ENUM('pending','in_progress','done') NOT NULL DEFAULT 'pending',
  is_done     TINYINT(1) NOT NULL DEFAULT 0,
  priority    ENUM('low','medium','high') NOT NULL DEFAULT 'medium',
  deadline    DATE NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Sales (POS) ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sales (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  sale_number      VARCHAR(40) NOT NULL UNIQUE,
  seller_id        INT NULL,
  subtotal_cents   INT NOT NULL DEFAULT 0,
  discount_cents   INT NOT NULL DEFAULT 0,
  total_cents      INT NOT NULL DEFAULT 0,
  payment_method   VARCHAR(40) NOT NULL DEFAULT 'cash',
  payment_status   ENUM('paid','unpaid','refunded') NOT NULL DEFAULT 'paid',
  notes            TEXT NULL,
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Sale Items ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sale_items (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  sale_id         INT NOT NULL,
  product_id      INT NULL,
  name            VARCHAR(180) NOT NULL,
  quantity        DECIMAL(15,3) NOT NULL DEFAULT 1,
  unit_price_cents INT NOT NULL DEFAULT 0,
  total_cents     INT NOT NULL DEFAULT 0,
  FOREIGN KEY (sale_id)    REFERENCES sales(id)    ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Coupons ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coupons (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  code            VARCHAR(50) NOT NULL UNIQUE,
  type            ENUM('percent','fixed') NOT NULL DEFAULT 'percent',
  value           DECIMAL(10,2) NOT NULL DEFAULT 0,
  min_order_cents INT NOT NULL DEFAULT 0,
  max_uses        INT NOT NULL DEFAULT 0,
  used_count      INT NOT NULL DEFAULT 0,
  expires_at      DATE NULL,
  is_active       TINYINT(1) NOT NULL DEFAULT 1,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Suppliers ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS suppliers (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(160) NOT NULL,
  email      VARCHAR(160) NULL,
  phone      VARCHAR(30)  NULL,
  address    VARCHAR(255) NULL,
  nuit       VARCHAR(30)  NULL,
  notes      TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Audit Logs ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NULL,
  action     VARCHAR(120) NOT NULL,
  entity     VARCHAR(60) NULL,
  entity_id  INT NULL,
  details    JSON NULL,
  ip         VARCHAR(45) NULL,
  level      VARCHAR(20) NOT NULL DEFAULT 'info',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Pages CMS ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pages (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  slug         VARCHAR(220) NOT NULL UNIQUE,
  title        VARCHAR(220) NOT NULL,
  content      LONGTEXT NULL,
  is_published TINYINT(1) NOT NULL DEFAULT 0,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Seed CMS pages ─────────────────────────────────────────────────────────
INSERT IGNORE INTO pages (slug, title, content, is_published) VALUES
  ('sobre-nos', 'Sobre Nós', '<p>Bem-vindo ao Carsai BMS — a plataforma de gestão empresarial para o mercado moçambicano.</p>', 1),
  ('termos', 'Termos e Condições', '<p>Termos e condições de utilização do Carsai BMS.</p>', 1),
  ('privacidade', 'Política de Privacidade', '<p>A sua privacidade é importante para nós.</p>', 1);

-- ── Push Notification Tokens (FCM) ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS push_tokens (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  token      VARCHAR(255) NOT NULL,
  platform   VARCHAR(20) NOT NULL DEFAULT 'android',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_token (user_id, token),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Banners ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS banners (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  title      VARCHAR(180) NOT NULL,
  subtitle   VARCHAR(255) NULL,
  image_url  VARCHAR(255) NOT NULL,
  link_url   VARCHAR(255) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_active  TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO banners (id,title,subtitle,image_url,link_url,sort_order,is_active) VALUES
  (1,'Bem-vindo ao Carsai BMS','Gestão empresarial para Moçambique','/icon-512.png','/',1,1);
