import { api } from "@ocw-convex/backend/convex/_generated/api";
import type { Id } from "@ocw-convex/backend/convex/_generated/dataModel";
import { getRouteApi } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import {
  SidebarContent,
  SidebarHeader,
  SidebarSeparator,
} from "@/components/ui/sidebar"; // Import separator
import { UnitLessonNavigation } from "./client"; // Renamed client component
import { CourseHeader } from "./header"; // Renamed header component

const routeApi = getRouteApi("/course/$id/$unitId/$lessonId/");

export const LessonSidebarContent = () => {
  // Resolve params once
  const resolvedParams = routeApi.useParams();
  const { id: courseId, unitId, lessonId } = resolvedParams;

  // Fetch data
  const data = useQuery(api.courses.getSidebarData, {
    courseId: courseId as Id<"courses">,
  });

  if (!data || data.length === 0) {
    // Handle case where data is not found or empty
    return (
      <>
        <SidebarHeader className="p-4">Course Info</SidebarHeader>
        <SidebarSeparator />
        <SidebarContent className="p-4">No units found.</SidebarContent>
      </>
    );
  }

  // Pass resolved params and data
  return (
    <>
      <CourseHeader data={data} />
      <SidebarSeparator />
      <SidebarContent>
        {/* Pass resolved params and data to the client component */}
        <UnitLessonNavigation
          courseId={courseId}
          data={data}
          initialLessonId={lessonId}
          initialUnitId={unitId}
        />
      </SidebarContent>
    </>
  );
};
