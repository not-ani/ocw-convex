import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/course/$id/_components/course-units')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/course/$id/_components/course-units"!</div>
}
