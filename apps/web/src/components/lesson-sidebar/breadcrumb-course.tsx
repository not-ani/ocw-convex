import { api } from "@ocw-convex/backend/convex/_generated/api";
import type { Id } from "@ocw-convex/backend/convex/_generated/dataModel";
import { getRouteApi } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { cache } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import type { SidebarData } from "./types";

const getCurrentLesson = cache((data: SidebarData, lessonId: string) => {
  return data.flatMap((unit) =>
    unit.lessons.filter((lesson) => lesson.id === lessonId)
  )[0]?.name;
});

const route = getRouteApi("/course/$id/$unitId/$lessonId/");

export const BreadcrumbCourse = () => {
  const { id: courseId, lessonId } = route.useParams();

  const data = useQuery(api.courses.getSidebarData, {
    courseId: courseId as Id<"courses">,
  });

  if (!data) {
    return <div>loading...</div>;
  }

  const currentLesson = getCurrentLesson(data, lessonId);

  return (
    <div>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className="hidden md:flex">
            <BreadcrumbLink className="hidden md:flex" href="/courses">
              Courses
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:flex" />
          <BreadcrumbItem className="hidden md:flex">
            <BreadcrumbLink
              className="hidden md:flex"
              href={`/course/${data[0]?.courseId}`}
            >
              {data[0]?.course.name ?? "Unknown Course"}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:flex" />
          <BreadcrumbItem className="hidden md:flex">
            <BreadcrumbLink
              href={`/course/${data[0]?.courseId}/${data[0]?.id}`}
            >
              {data[0]?.name ?? "Unknown Unit"}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden md:flex" />
          <BreadcrumbItem>
            <BreadcrumbPage>{currentLesson ?? "Unknown Lesson"}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};
