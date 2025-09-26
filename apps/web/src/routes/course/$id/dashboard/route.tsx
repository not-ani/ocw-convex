import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppSidebar } from "@/components/dashboard/sidebar/app-sidebar";
import { SiteHeader } from "@/components/dashboard/sidebar/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export const Route = createFileRoute("/course/$id/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="w-full [--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset>
            <Outlet />
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}
