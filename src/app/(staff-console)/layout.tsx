import { StaffSidebar } from "@/components/staff/staff-sidebar";
import { StaffTopBar } from "@/components/staff/staff-top-bar";
import { getStaffSession } from "@/lib/auth";
import type { StaffRole } from "@/lib/types/order";

export default async function StaffConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getStaffSession();

  return (
    <div data-theme="staff" className="flex min-h-screen bg-zinc-950 text-zinc-100">
      <StaffSidebar role={(session?.role as StaffRole) ?? null} />
      <div className="flex flex-1 flex-col">
        <StaffTopBar />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
