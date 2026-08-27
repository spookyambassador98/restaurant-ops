# Ember Kitchen — restaurant ops

Dark kitchen: гость заказывает с витрины, кухня видит тикет, менеджер выдаёт. Оплата при получении.

**Live:** [restaurant-ops-portal.vercel.app](https://restaurant-ops-portal.vercel.app)  
Если алиас ещё не подхватился: [ok-oe0glqgw0-memyself2.vercel.app](https://ok-oe0glqgw0-memyself2.vercel.app)

## Счастливый путь

1. Гость: `/menu` → корзина → чекаут (самовывоз).
2. Код заказа на `/order/{CODE}/track`.
3. Менеджер принимает NEW.
4. Кухня: Start → Bump ready. Таймер SLA, 12 мин = late.
5. Менеджер отмечает выдачу. Гость видит полный экран «можно забирать».

## Роли

| Роль | Вход | Контур |
|---|---|---|
| Менеджер | `manager@ember.local` / `1234` | смена, принять/выдать, 86, аналитика, Z-отчёт |
| Кухня | `kitchen@ember.local` / `5678` | KDS + 86 |
| Админ | `admin@ember.local` / `9999` | меню, сотрудники, печать смен |

86: тап по блюду на доске — на витрине гостя оно гаснет без F5 (пульс 1.2 с).

## Стек

Next.js 16 · Prisma · Neon Postgres · Vercel.

Пульс `/api/public/pulse` и `/api/staff/pulse` — источник правды для живой витрины и KDS. SSE оставлен как запасной канал, на serverless без шины не опираемся.

## Локально

```bash
cp .env.example .env
npm install
npx tsx scripts/apply-neon-schema.ts
npm run db:seed
npm run dev
```
