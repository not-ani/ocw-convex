import { Button } from "@/components/ui/button";
import { api } from "@ocw-convex/backend/convex/_generated/api";
import type { Id } from "@ocw-convex/backend/convex/_generated/dataModel";
import { SignInButton, useUser } from "@clerk/clerk-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Authenticated,
  AuthLoading,
  Unauthenticated,
  useMutation,
  useQuery,
} from "convex/react";
import { useCallback, useMemo, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import { UnitsCard } from "@/components/dashboard/units-card";
import { LessonsCard } from "@/components/dashboard/lesson-card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export const Route = createFileRoute("/course/$id/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  const params = Route.useParams();
  const courseId = params.id as Id<"courses">;

  const user = useUser();

  const membership = useQuery(api.courseUsers.getMyMembership, {
    courseId,
  });

  const dashboard = useQuery(api.courses.getDashboardSummary, {
    courseId,
    userRole: user?.user?.publicMetadata.role as unknown as string | undefined,
  });

  const units = useQuery(api.units.getTableData, { courseId });

  const createUnit = useMutation(api.units.create);
  const updateUnit = useMutation(api.units.update);
  const reorderUnits = useMutation(api.units.reorder);
  const removeUnit = useMutation(api.units.remove);

  const createLesson = useMutation(api.lesson.create);
  const updateLesson = useMutation(api.lesson.update);
  const reorderLesson = useMutation(api.lesson.reorder);
  const removeLesson = useMutation(api.lesson.remove);
  const updateEmbed = useMutation(api.lesson.createOrUpdateEmbed);

  const isAuthorized = Boolean(
    (membership &&
      (membership.role === "admin" || membership.role === "editor")) ||
      user.user?.publicMetadata.role === "admin"
  );

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor)
  );

  const [selectedUnitId, setSelectedUnitId] = useState<null | Id<"units">>(
    null
  );

  const unitList = units ?? [];

  // When units load set a default selection.
  useMemo(() => {
    if (!selectedUnitId && unitList[0]) {
      setSelectedUnitId(unitList[0].id as Id<"units">);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitList]);

  const handleCreateUnit = useCallback(
    async (name: string) => {
      if (!name.trim()) return;
      await createUnit({ courseId, name: name.trim() });
    },
    [createUnit, courseId]
  );

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

  // Lesson handlers forwarded to LessonsCard
  const handleCreateLesson = useCallback(
    async (payload: {
      unitId: Id<"units">;
      name: string;
      embedRaw?: string;
    }) => {
      await createLesson({
        courseId,
        unitId: payload.unitId,
        name: payload.name,
        embedRaw: payload.embedRaw,
      });
    },
    [createLesson, courseId]
  );

  const handleUpdateLesson = useCallback(
    async (data: { id: Id<"lessons">; isPublished?: boolean }) => {
      await updateLesson({ courseId, data });
    },
    [updateLesson, courseId]
  );

  const handleRemoveLesson = useCallback(
    async (id: Id<"lessons">) => {
      await removeLesson({ courseId, id });
    },
    [removeLesson, courseId]
  );

  const handleReorderLesson = useCallback(
    async (payload: {
      unitId: Id<"units">;
      data: { id: Id<"lessons">; position: number }[];
    }) => {
      await reorderLesson({
        courseId,
        unitId: payload.unitId,
        data: payload.data,
      });
    },
    [reorderLesson, courseId]
  );

  const handleUpdateEmbed = useCallback(
    async (lessonId: Id<"lessons">, raw: string) => {
      if (!raw.trim()) return;
      await updateEmbed({ lessonId, raw: raw.trim() });
    },
    [updateEmbed]
  );

  console.log(dashboard);

  return (
    <div className="mx-auto w-full max-w-7xl p-4 sm:p-6">
      <Authenticated>
        {!user.isLoaded ? null : !isAuthorized ? (
          <div className="mx-auto max-w-xl text-center">
            <h1 className="mb-2 text-2xl font-semibold">Access denied</h1>
            <p className="text-muted-foreground">
              You do not have permission to view this course dashboard.
            </p>
            <div className="mt-4">
              <Link
                className="text-primary underline"
                to="/course/$id"
                params={{ id: courseId }}
              >
                Back to course
              </Link>
            </div>
          </div>
        ) : dashboard === undefined || units === undefined ? (
          <div className="flex h-40 items-center justify-center">
            <LoadingSpinner size={32} />
          </div>
        ) : !dashboard ? (
          <div className="mx-auto max-w-xl text-center">
            <h1 className="mb-2 text-2xl font-semibold">No data</h1>
            <p className="text-muted-foreground">
              Dashboard could not be loaded.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold">{dashboard.course.name}</h1>
                <p className="text-muted-foreground text-sm">Manage units</p>
              </div>
              <Link
                to="/course/$id"
                params={{ id: courseId }}
                className="inline-flex"
              >
                <Button type="button" variant="secondary">
                  View course
                </Button>
              </Link>
            </div>

            <DndContext collisionDetection={closestCenter} sensors={sensors}>
              <UnitsCard
                units={unitList}
                selectedUnitId={selectedUnitId}
                onSelectUnit={setSelectedUnitId}
                onCreateUnit={handleCreateUnit}
                onTogglePublish={handleUpdateUnit}
                onDeleteUnit={handleRemoveUnit}
                onReorder={handleReorderUnits}
              />
            </DndContext>

            <LessonsCard
              courseId={courseId}
              selectedUnitId={selectedUnitId}
              onCreateLesson={handleCreateLesson}
              onTogglePublish={handleUpdateLesson}
              onDeleteLesson={handleRemoveLesson}
              onReorderLesson={handleReorderLesson}
              onUpdateEmbed={handleUpdateEmbed}
            />
          </div>
        )}
      </Authenticated>

      <Unauthenticated>
        <div className="mx-auto max-w-xl text-center">
          <h1 className="mb-2 text-2xl font-semibold">Sign in required</h1>
          <p className="text-muted-foreground">Sign in to access dashboards.</p>
          <div className="mt-4 inline-flex">
            <SignInButton />
          </div>
        </div>
      </Unauthenticated>

      <AuthLoading>
        <div className="flex h-40 items-center justify-center">
          <LoadingSpinner size={32} />
        </div>
      </AuthLoading>
    </div>
  );
}
