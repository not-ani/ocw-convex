import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/course/$id/_components/courses')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/course/$id/_components/courses"!</div>
}
