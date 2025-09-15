import { UserButton } from "@clerk/clerk-react";
import { Suspense } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { LessonSidebarContent } from "./content";

// Assuming SidebarProvider is wrapping the layout higher up
export const LessonSidebarContainer = () => {
  return (
    // Removed the outer div
    <Sidebar
      // Use library variants/props as needed
      className="border-sidebar border-none"
      collapsible="offcanvas"
      side="left"
      variant="floating" // Example: Use standard border or library's --sidebar-border
    >
      {/* Content is now rendered within Sidebar */}
      <Suspense fallback={<SidebarContent>Loading Course...</SidebarContent>}>
        {/* Pass params down */}
        <LessonSidebarContent />
      </Suspense>
      <SidebarFooter>
        <Suspense fallback={<div>Loading User...</div>}>
          <UserButton />
        </Suspense>
      </SidebarFooter>
    </Sidebar>
  );
};
