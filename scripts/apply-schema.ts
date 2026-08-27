import "dotenv/config";
import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "prisma", "dev.db");
const db = new Database(dbPath);

db.exec(`
PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS OrderEvent;
DROP TABLE IF EXISTS OrderItem;
DROP TABLE IF EXISTS "Order";
DROP TABLE IF EXISTS MenuItem;
DROP TABLE IF EXISTS MenuCategory;
DROP TABLE IF EXISTS Shift;
DROP TABLE IF EXISTS StaffUser;

CREATE TABLE StaffUser (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  pin TEXT NOT NULL,
  role TEXT NOT NULL,
  isActive INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE Shift (
  id TEXT PRIMARY KEY,
  openedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  closedAt DATETIME,
  openedByUserId TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'OPEN',
  FOREIGN KEY (openedByUserId) REFERENCES StaffUser(id)
);

CREATE TABLE MenuCategory (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  sortOrder INTEGER NOT NULL DEFAULT 0,
  isActive INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE MenuItem (
  id TEXT PRIMARY KEY,
  categoryId TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  priceCents INTEGER NOT NULL,
  imageUrl TEXT,
  isAvailable INTEGER NOT NULL DEFAULT 1,
  tags TEXT NOT NULL DEFAULT '',
  FOREIGN KEY (categoryId) REFERENCES MenuCategory(id)
);

CREATE TABLE "Order" (
  id TEXT PRIMARY KEY,
  publicId TEXT NOT NULL UNIQUE,
  orderNumber INTEGER NOT NULL UNIQUE,
  shiftId TEXT,
  status TEXT NOT NULL DEFAULT 'NEW',
  customerName TEXT NOT NULL,
  customerPhone TEXT NOT NULL,
  orderType TEXT NOT NULL DEFAULT 'PICKUP',
  deliveryAddress TEXT,
  notes TEXT,
  subtotalCents INTEGER NOT NULL,
  totalCents INTEGER NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  acceptedAt DATETIME,
  cookingAt DATETIME,
  readyAt DATETIME,
  completedAt DATETIME,
  cancelledAt DATETIME,
  FOREIGN KEY (shiftId) REFERENCES Shift(id)
);

CREATE TABLE OrderItem (
  id TEXT PRIMARY KEY,
  orderId TEXT NOT NULL,
  menuItemId TEXT NOT NULL,
  nameSnapshot TEXT NOT NULL,
  priceCentsSnapshot INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  notes TEXT,
  FOREIGN KEY (orderId) REFERENCES "Order"(id) ON DELETE CASCADE,
  FOREIGN KEY (menuItemId) REFERENCES MenuItem(id)
);

CREATE TABLE OrderEvent (
  id TEXT PRIMARY KEY,
  orderId TEXT NOT NULL,
  fromStatus TEXT,
  toStatus TEXT NOT NULL,
  actorUserId TEXT,
  actorRole TEXT NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (orderId) REFERENCES "Order"(id) ON DELETE CASCADE,
  FOREIGN KEY (actorUserId) REFERENCES StaffUser(id)
);
`);

console.log("Database schema applied:", dbPath);
db.close();
