import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/course/$id/$unitId/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>hi</div>;
}
