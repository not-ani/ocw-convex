import { createFileRoute, Link } from "@tanstack/react-router";
export const Route = createFileRoute("/course/$id/$unitId/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>hi</div>;
}
