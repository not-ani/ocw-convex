import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from "@tanstack/react-router";
import { api } from "@ocw-convex/backend/convex/_generated/api";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import type { Id } from "@ocw-convex/backend/convex/_generated/dataModel";

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
          <div className="bg-background w-96 border-r p-6">
            <div className="mb-6">
              <Skeleton className="h-16 w-full rounded-lg" />
            </div>
            <div className="space-y-4">
              {Array.from({ length: 10 }).map((_, index) => (
                <div key={index} className="space-y-2">
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
                <div key={index} className="rounded-lg border p-4">
                  <div className="mb-4 flex items-center gap-4">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                  </div>
                  <div className="space-y-3 pl-12">
                    {Array.from({ length: 5 }).map((_, subIndex) => (
                      <Skeleton key={subIndex} className="h-4 w-full" />
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
    <div className="flex flex-1">
      {/* Sidebar */}
      <div className="bg-background hidden border-r p-6 lg:block lg:w-96">
        <div className="bg-primary/10 mb-6 rounded-lg p-4">
          <h2 className="text-primary/80 text-xl font-bold">{course.name}</h2>
          <p className="text-primary/60 mt-1 text-sm">
            {course.units.length} UNITS
          </p>
        </div>
        <div className="ml-4 max-w-[calc(100%-2rem)] space-y-4">
          {course.units.map((unit, index) => (
            <div key={index} className="text-sm">
              <div className="text-foreground mb-1">UNIT {index + 1}</div>
              <Link
                to={`/course/$id/$unitId`}
                params={{
                  id: course._id,
                  unitId: unit.id,
                }}
                className="text-foreground/80 break-words hover:underline"
              >
                {unit.name}
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 pt-8">
        <h1 className="text-foreground mb-6 text-3xl font-bold">
          {course.name}
        </h1>
        <div className="gap-10">
          {course.units.map((unit) => (
            <div key={unit.id} className="py-1">
              <Accordion type="single" collapsible>
                <AccordionItem value="unit-1" className="rounded-lg border">
                  <AccordionTrigger className="px-4 hover:no-underline">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-full text-white">
                        {course.units.indexOf(unit) + 1}
                      </div>
                      <div className="text-left">
                        <div className="font-semibold">{unit.name}</div>
                        <div className="text-sm text-gray-500"></div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-16">
                    <div className="space-y-3 py-2">
                      {unit.lessons.map((lesson, index) => (
                        <Link
                          key={index}
                          to={`/course/$id/$unitId/$lessonId`}
                          params={{
                            id: course.id,
                            unitId: unit.id,
                            lessonId: lesson.id,
                          }}
                          className="text-foreground block hover:underline"
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
  );
}
