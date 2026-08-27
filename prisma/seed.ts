import "dotenv/config";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";
import { subHours, subMinutes } from "date-fns";
import { stringifyTags } from "../src/lib/utils";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

const menuData = [
  {
    cat: "Основное",
    slug: "mains",
    items: [
      { name: "Tokyo Bowl", desc: "Рис, лосось, авокадо, эдамame, соус унаги", price: 69000, tags: ["bestseller"], img: "photo-1546069901-ba9599a7e63c" },
      { name: "Green Power Bowl", desc: "Киноа, шпинат, курица гриль, хумус", price: 59000, tags: ["vegan"], img: "photo-1512621776951-a57141f2eefd" },
      { name: "Spicy Miso Bowl", desc: "Рис, говядина, мисо-глазурь, перец чили", price: 72000, tags: ["spicy"], img: "photo-1565299624946-b28f40a0ae38" },
      { name: "Ember Smash", desc: "Двойная котлета, cheddar, карамельный лук", price: 65000, tags: ["bestseller"], img: "photo-1568901346375-23c9450c58cd" },
      { name: "Truffle Burger", desc: "Angus beef, трюфельный aioli, пармезан", price: 78000, tags: [], img: "photo-1550547630-bf8b70f63e48", soldOut: true },
      { name: "Chicken Teriyaki Bowl", desc: "Рис, курица терияки, брокколи, кунжут", price: 64000, tags: [], img: "photo-1603133872877-684fbbfbacee" },
      { name: "Vegan Ramen", desc: "Лапша, бульон мисo, тофу, грибы", price: 61000, tags: ["vegan"], img: "photo-1569718212165-3a8278d245f9" },
    ],
  },
  {
    cat: "Гарниры",
    slug: "sides",
    items: [
      { name: "Sweet Potato Fries", desc: "Chipotle aioli", price: 32000, tags: [], img: "photo-1573080496216-bf3fbb0c48a8" },
      { name: "Kimchi Slaw", desc: "Хрустящий, пикантный", price: 28000, tags: ["vegan"], img: "photo-1546069901-d5bf4e998f82" },
      { name: "Garlic Bread", desc: "С травами и маслом", price: 24000, tags: [], img: "photo-1573140401552-3fab57d237bf" },
      { name: "Edamame", desc: "С морской солью", price: 22000, tags: ["vegan"], img: "photo-1582450871972-ab5ce6268b56" },
    ],
  },
  {
    cat: "Напитки",
    slug: "drinks",
    items: [
      { name: "Matcha Latte", desc: "Овсяное молоко, матча премиум", price: 32000, tags: [], img: "photo-1541167760496-1628856ab772" },
      { name: "Cold Brew", desc: "12-часовая экстракция", price: 28000, tags: [], img: "photo-1514434755162-3368f46ef135" },
      { name: "Yuzu Sparkling", desc: "Домашний лимонад", price: 25000, tags: [], img: "photo-1622597467836-fbc7d2a30666" },
      { name: "Fresh Orange Juice", desc: "Свежевыжатый", price: 29000, tags: [], img: "photo-1621506289937-a8e4df240d0b" },
      { name: "Iced Tea", desc: "Персиковый, домашний", price: 23000, tags: [], img: "photo-1556679343-c7306c1976bc" },
    ],
  },
  {
    cat: "Десерты",
    slug: "desserts",
    items: [
      { name: "Basque Cheesecake", desc: "Ягодный coulis", price: 42000, tags: ["bestseller"], img: "photo-1524351199678-941a58a3df50" },
      { name: "Mochi Ice Cream", desc: "Матча / манго", price: 35000, tags: [], img: "photo-1563805042-7684c019e1cb" },
      { name: "Chocolate Lava Cake", desc: "Тёплый центр, ванильное мороженое", price: 45000, tags: [], img: "photo-1624353365286-3f8d62daad51" },
      { name: "Tiramisu", desc: "Классический, mascarpone", price: 39000, tags: [], img: "photo-1571877227200-a0d98ea607e9" },
    ],
  },
];

async function main() {
  await prisma.orderEvent.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.menuCategory.deleteMany();
  await prisma.shift.deleteMany();
  await prisma.staffUser.deleteMany();

  const manager = await prisma.staffUser.create({
    data: {
      name: "Алекс Менеджер",
      email: "manager@ember.local",
      pin: "1234",
      role: "MANAGER",
    },
  });

  await prisma.staffUser.create({
    data: {
      name: "Шеф кухни",
      email: "kitchen@ember.local",
      pin: "5678",
      role: "KITCHEN",
    },
  });

  await prisma.staffUser.create({
    data: {
      name: "Владелец",
      email: "admin@ember.local",
      pin: "9999",
      role: "ADMIN",
    },
  });

  const shift = await prisma.shift.create({
    data: {
      openedByUserId: manager.id,
      status: "OPEN",
      openedAt: subHours(new Date(), 4),
    },
  });

  const allItems: { id: string; name: string; priceCents: number }[] = [];

  for (const [idx, group] of menuData.entries()) {
    const cat = await prisma.menuCategory.create({
      data: { name: group.cat, slug: group.slug, sortOrder: idx + 1 },
    });
    for (const item of group.items) {
      const created = await prisma.menuItem.create({
        data: {
          categoryId: cat.id,
          name: item.name,
          description: item.desc,
          priceCents: item.price,
          tags: stringifyTags(item.tags),
          isAvailable: !("soldOut" in item && item.soldOut),
          imageUrl:
            "img" in item && item.img
              ? `https://images.unsplash.com/${item.img}?w=400&h=300&fit=crop`
              : null,
        },
      });
      allItems.push(created);
    }
  }

  let orderCounter = 1000;

  const samples: {
    publicId: string;
    name: string;
    status: "NEW" | "ACCEPTED" | "COOKING" | "READY" | "COMPLETED" | "CANCELLED";
    minutesAgo: number;
    itemIdx: number;
  }[] = [
    { publicId: "DEMO01", name: "Алексей К.", status: "COOKING", minutesAgo: 12, itemIdx: 0 },
    { publicId: "K7M2P", name: "Мария С.", status: "ACCEPTED", minutesAgo: 5, itemIdx: 3 },
    { publicId: "R4N8X", name: "Дмитрий В.", status: "READY", minutesAgo: 18, itemIdx: 1 },
    { publicId: "T9W3Q", name: "Елена П.", status: "NEW", minutesAgo: 2, itemIdx: 4 },
    { publicId: "H2B6L", name: "Игорь Н.", status: "COMPLETED", minutesAgo: 45, itemIdx: 2 },
    { publicId: "P5C1Z", name: "Ольга Т.", status: "CANCELLED", minutesAgo: 90, itemIdx: 7 },
    { publicId: "M8F4J", name: "Guest A", status: "COMPLETED", minutesAgo: 60, itemIdx: 5 },
    { publicId: "N3D7K", name: "Guest B", status: "COMPLETED", minutesAgo: 55, itemIdx: 6 },
  ];

  for (const s of samples) {
    orderCounter += 1;
    const item = allItems[s.itemIdx];
    const createdAt = subMinutes(new Date(), s.minutesAgo);

    const order = await prisma.order.create({
      data: {
        publicId: s.publicId,
        orderNumber: orderCounter,
        shiftId: shift.id,
        customerName: s.name,
        customerPhone: "+79001234567",
        orderType: "PICKUP",
        status: s.status,
        subtotalCents: item.priceCents,
        totalCents: item.priceCents,
        createdAt,
        updatedAt: createdAt,
        acceptedAt: ["ACCEPTED", "COOKING", "READY", "COMPLETED"].includes(s.status)
          ? subMinutes(createdAt, -3)
          : null,
        cookingAt: ["COOKING", "READY", "COMPLETED"].includes(s.status)
          ? subMinutes(createdAt, -8)
          : null,
        readyAt: ["READY", "COMPLETED"].includes(s.status)
          ? subMinutes(createdAt, -15)
          : null,
        completedAt: s.status === "COMPLETED" ? subMinutes(createdAt, -20) : null,
        cancelledAt: s.status === "CANCELLED" ? createdAt : null,
        items: {
          create: {
            menuItemId: item.id,
            nameSnapshot: item.name,
            priceCentsSnapshot: item.priceCents,
            quantity: 1,
          },
        },
      },
    });

    await prisma.orderEvent.create({
      data: {
        orderId: order.id,
        toStatus: "NEW",
        actorRole: "GUEST",
        createdAt,
      },
    });

    if (s.status !== "NEW") {
      const transitions: Array<{
        from: "NEW" | "ACCEPTED" | "COOKING" | "READY";
        to: typeof s.status;
        role: string;
      }> = [];
      if (["ACCEPTED", "COOKING", "READY", "COMPLETED"].includes(s.status)) {
        transitions.push({ from: "NEW", to: "ACCEPTED", role: "MANAGER" });
      }
      if (["COOKING", "READY", "COMPLETED"].includes(s.status)) {
        transitions.push({ from: "ACCEPTED", to: "COOKING", role: "KITCHEN" });
      }
      if (["READY", "COMPLETED"].includes(s.status)) {
        transitions.push({ from: "COOKING", to: "READY", role: "KITCHEN" });
      }
      if (s.status === "COMPLETED") {
        transitions.push({ from: "READY", to: "COMPLETED", role: "MANAGER" });
      }
      if (s.status === "CANCELLED") {
        transitions.push({ from: "NEW", to: "CANCELLED", role: "MANAGER" });
      }
      for (const t of transitions) {
        await prisma.orderEvent.create({
          data: {
            orderId: order.id,
            fromStatus: t.from,
            toStatus: t.to,
            actorRole: t.role,
            actorUserId: t.role === "KITCHEN" ? undefined : manager.id,
            createdAt: subMinutes(createdAt, -2),
          },
        });
      }
    }
  }

  for (let i = 0; i < 15; i++) {
    orderCounter += 1;
    const item = allItems[i % allItems.length];
    const hour = 11 + (i % 10);
    const createdAt = subHours(subHours(new Date(), 0), 24 - hour);
    const completed = i % 9 !== 0;

    await prisma.order.create({
      data: {
        publicId: `S${orderCounter}`,
        orderNumber: orderCounter,
        shiftId: shift.id,
        customerName: `Guest ${i}`,
        customerPhone: "+79000000000",
        status: completed ? "COMPLETED" : "CANCELLED",
        subtotalCents: item.priceCents,
        totalCents: item.priceCents,
        createdAt,
        acceptedAt: createdAt,
        cookingAt: createdAt,
        readyAt: completed ? subMinutes(createdAt, -12) : null,
        completedAt: completed ? subMinutes(createdAt, -18) : null,
        cancelledAt: completed ? null : createdAt,
        items: {
          create: {
            menuItemId: item.id,
            nameSnapshot: item.name,
            priceCentsSnapshot: item.priceCents,
            quantity: 1,
          },
        },
      },
    });
  }

  await prisma.shift.create({
    data: {
      openedByUserId: manager.id,
      status: "CLOSED",
      openedAt: subHours(new Date(), 28),
      closedAt: subHours(new Date(), 20),
    },
  });

  console.log("Seed OK:", {
    staff: [
      "manager@ember.local/1234",
      "kitchen@ember.local/5678",
      "admin@ember.local/9999",
    ],
    demoTrack: "/order/DEMO01/track",
    menuItems: allItems.length,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
