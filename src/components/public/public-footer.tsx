import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="border-t border-stone-200 bg-[#f7f4ee]">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-stone-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="font-[family-name:var(--font-display)] text-lg text-stone-800">
            Ember Kitchen
          </p>
          <p>Электрозаводская, 21 · 11:00–23:00</p>
        </div>
        <Link href="/track" className="text-amber-800 hover:text-amber-700">
          Отследить заказ
        </Link>
      </div>
    </footer>
  );
}
