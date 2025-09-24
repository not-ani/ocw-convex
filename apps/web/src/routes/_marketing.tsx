import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Header1 } from "@/components/navbar";

export const Route = createFileRoute("/_marketing")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <Header1 />
      <Outlet />
    </div>
  );
}
