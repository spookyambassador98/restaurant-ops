"use client";

import Link from "next/link";
import { ArrowRight, Clock, MapPin } from "lucide-react";

export function LandingHero() {
  return (
    <section className="relative overflow-hidden border-b border-stone-200 bg-[#f7f4ee]">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-amber-800">
          Dark kitchen · Бауманская
        </p>
        <h1 className="mt-4 max-w-2xl font-[family-name:var(--font-display)] text-4xl leading-tight text-stone-900 sm:text-6xl">
          Боулы и smash. Без очереди у кассы.
        </h1>
        <p className="mt-5 max-w-xl text-lg text-stone-600">
          Заказ на самовывоз, тикет на кухню, код на выдаче. Оплата при получении.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 bg-stone-900 px-6 py-3 font-medium text-white hover:bg-stone-800"
          >
            Смотреть меню
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/track"
            className="inline-flex items-center border border-stone-300 px-6 py-3 font-medium text-stone-700 hover:bg-white"
          >
            Код заказа
          </Link>
        </div>
        <div className="mt-10 flex flex-wrap gap-6 text-sm text-stone-600">
          <span className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-800" />
            11:00 – 23:00
          </span>
          <span className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-amber-800" />
            Электрозаводская, 21
          </span>
        </div>
      </div>
    </section>
  );
}
