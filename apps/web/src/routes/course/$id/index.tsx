import { api } from "@ocw-convex/backend/convex/_generated/api";
import type { Id } from "@ocw-convex/backend/convex/_generated/dataModel";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { Header1 } from "@/components/navbar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/course/$id/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const course = useQuery(api.courses.getCourseWithUnitsAndLessons, {
    id: id as Id<"courses">,
  });

  if (!course) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="flex flex-1">
          {/* Sidebar Skeleton */}
          <div className="w-96 border-r bg-background p-6">
            <div className="mb-6">
              <Skeleton className="h-16 w-full rounded-lg" />
            </div>
            <div className="space-y-4">
              {Array.from({ length: 10 }).map((_, index) => (
                <div className="space-y-2" key={index}>
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-6 w-full" />
                </div>
              ))}
            </div>
          </div>

          {/* Main Content Area Skeleton */}
          <div className="flex-1 p-6 pt-8">
            <Skeleton className="mb-6 h-10 w-3/4" />
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <div className="rounded-lg border p-4" key={index}>
                  <div className="mb-4 flex items-center gap-4">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                  </div>
                  <div className="space-y-3 pl-12">
                    {Array.from({ length: 5 }).map((_, subIndex) => (
                      <Skeleton className="h-4 w-full" key={subIndex} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header1 />
      <div className="flex h-screen flex-1 border-t-1">
        {/* Sidebar */}
        <div className="hidden border-r bg-background p-6 lg:block lg:w-96">
          <div className="mb-6 rounded-lg bg-primary/10 p-4">
            <h2 className="font-bold text-primary/80 text-xl">{course.name}</h2>
            <p className="mt-1 text-primary/60 text-sm">
              {course.units.length} UNITS
            </p>
          </div>
          <div className="ml-4 max-w-[calc(100%-2rem)] space-y-4">
            {course.units.map((unit, index) => (
              <div className="text-sm" key={index}>
                <div className="mb-1 text-foreground">UNIT {index + 1}</div>
                <Link
                  className="break-words text-foreground/80 hover:underline"
                  params={{
                    id,
                    unitId: unit.id,
                  }}
                  to={"/course/$id/$unitId"}
                >
                  {unit.name}
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-6 pt-8">
          <h1 className="mb-6 font-bold text-3xl text-foreground">
            {course.name}
          </h1>
          <div className="gap-10">
            {course.units.map((unit) => (
              <div className="py-1" key={unit.id}>
                <Accordion collapsible type="single">
                  <AccordionItem className="rounded-lg border" value="unit-1">
                    <AccordionTrigger className="px-4 hover:no-underline">
                      <div className="flex items-center gap-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
                          {course.units.indexOf(unit) + 1}
                        </div>
                        <div className="text-left">
                          <div className="font-semibold">{unit.name}</div>
                          <div className="text-gray-500 text-sm" />
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-16">
                      <div className="space-y-3 py-2">
                        {unit.lessons.map((lesson) => (
                          <Link
                            className="block text-foreground hover:underline"
                            key={lesson.id}
                            params={{
                              id: course._id,
                              unitId: unit.id,
                              lessonId: lesson.id,
                            }}
                            to={"/course/$id/$unitId/$lessonId"}
                          >
                            {lesson.name}
                          </Link>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
