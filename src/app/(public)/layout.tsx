import { CartProvider } from "@/components/public/cart-provider";
import { CartFab } from "@/components/public/cart-fab";
import { PublicFooter } from "@/components/public/public-footer";
import { PublicHeader } from "@/components/public/public-header";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col bg-stone-50 text-stone-900">
        <PublicHeader />
        <main className="flex-1">{children}</main>
        <PublicFooter />
        <CartFab />
      </div>
    </CartProvider>
  );
}
