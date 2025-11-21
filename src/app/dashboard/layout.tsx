import { AppHeader } from "@/components/layout/header";
import { AppSidebar } from "@/components/layout/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
            <AppHeader />
            <main className="flex-1 p-4 sm:p-6 lg:p-8">
              {children}
            </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
