import { SignInButton, useUser } from "@clerk/clerk-react";
import { api } from "@ocw-convex/backend/convex/_generated/api";
import type { Id } from "@ocw-convex/backend/convex/_generated/dataModel";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Authenticated,
  AuthLoading,
  Unauthenticated,
  useMutation,
  useQuery,
} from "convex/react";
import { useCallback, useEffect, useState } from "react";
import { CreateUnitDialog } from "@/components/dashboard/create-unit";
import { UnitsTable } from "@/components/dashboard/units-table";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export const Route = createFileRoute("/course/$id/dashboard/")({
  component: RouteComponent,
});

const DASHBOARD_SPINNER_SIZE = 32 as const;

function Content() {
  const params = Route.useParams();
  const courseId = params.id as Id<"courses">;

  const user = useUser();
  const roleFromClerk = user.user?.publicMetadata?.role;
  const userRole =
    typeof roleFromClerk === "string" ? roleFromClerk : undefined;

  const membership = useQuery(api.courseUsers.getMyMembership, {
    courseId,
  });

  const dashboard = useQuery(api.courses.getDashboardSummary, {
    courseId,
    userRole,
  });

  const units = useQuery(api.units.getTableData, { courseId });

  const updateUnit = useMutation(api.units.update);
  const reorderUnits = useMutation(api.units.reorder);
  const removeUnit = useMutation(api.units.remove);

  const createLesson = useMutation(api.lesson.create);
  const updateLesson = useMutation(api.lesson.update);
  const reorderLesson = useMutation(api.lesson.reorder);
  const removeLesson = useMutation(api.lesson.remove);
  const updateEmbed = useMutation(api.lesson.createOrUpdateEmbed);

  const isAuthorized =
    membership?.role === "admin" ||
    membership?.role === "editor" ||
    userRole === "admin";

  const [selectedUnitId, setSelectedUnitId] = useState<null | Id<"units">>(
    null
  );

  const unitList = units ?? [];

  // When units load set a default selection.
  useEffect(() => {
    if (!selectedUnitId && unitList[0]) {
      setSelectedUnitId(unitList[0].id as Id<"units">);
    }
  }, [selectedUnitId, unitList]);

  const handleUpdateUnit = useCallback(
    async (payload: {
      id: Id<"units">;
      data: Partial<{ isPublished: boolean }>;
    }) => {
      await updateUnit({
        courseId,
        data: { id: payload.id, ...payload.data },
      });
    },
    [updateUnit, courseId]
  );

  const handleRemoveUnit = useCallback(
    async (id: Id<"units">) => {
      await removeUnit({ courseId, id });
      // if we deleted the selected unit, pick the first one next render
      setSelectedUnitId((prev) => (prev === id ? null : prev));
    },
    [removeUnit, courseId]
  );

  const handleReorderUnits = useCallback(
    async (data: { id: Id<"units">; position: number }[]) => {
      await reorderUnits({ courseId, data });
    },
    [reorderUnits, courseId]
  );

  const isLoadingData = dashboard === undefined || units === undefined;

  if (!user.isLoaded) {
    return null;
  }
  if (!isAuthorized) {
    return (
      <div className="mx-auto max-w-xl text-center">
        <h1 className="mb-2 font-semibold text-2xl">Access denied</h1>
        <p className="text-muted-foreground">
          You do not have permission to view this course dashboard.
        </p>
        <div className="mt-4">
          <Link
            className="text-primary underline"
            params={{ id: courseId }}
            to="/course/$id"
          >
            Back to course
          </Link>
        </div>
      </div>
    );
  }
  if (isLoadingData) {
    return (
      <div className="flex h-40 items-center justify-center">
        <LoadingSpinner size={DASHBOARD_SPINNER_SIZE} />
      </div>
    );
  }
  if (!dashboard) {
    return (
      <div className="mx-auto max-w-xl text-center">
        <h1 className="mb-2 font-semibold text-2xl">No data</h1>
        <p className="text-muted-foreground">Dashboard could not be loaded.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-bold text-2xl">{dashboard.course.name}</h1>
          <p className="text-muted-foreground text-sm">Manage units</p>
        </div>
        <div className="flex items-center justify-evenly gap-3">
          <Link
            className="inline-flex"
            params={{ id: courseId }}
            to="/course/$id"
          >
            <Button type="button" variant="secondary">
              View course
            </Button>
          </Link>
          <CreateUnitDialog />
        </div>
      </div>

      <UnitsTable
        courseId={courseId}
        onRemoveUnit={handleRemoveUnit}
        onReorder={handleReorderUnits}
        onUpdateUnit={handleUpdateUnit}
        units={unitList}
      />
    </div>
  );
}

function RouteComponent() {
  return (
    <div className="mx-auto w-full max-w-7xl p-4 sm:p-6">
      <Authenticated>
      <Content />
     </Authenticated>

      <Unauthenticated>
        <div className="mx-auto max-w-xl text-center">
          <h1 className="mb-2 font-semibold text-2xl">Sign in required</h1>
          <p className="text-muted-foreground">Sign in to access dashboards.</p>
          <div className="mt-4 inline-flex">
            <SignInButton />
          </div>
        </div>
      </Unauthenticated>

      <AuthLoading>
        <div className="flex h-40 items-center justify-center">
          <LoadingSpinner size={DASHBOARD_SPINNER_SIZE} />
        </div>
      </AuthLoading>
    </div>
  );
}
