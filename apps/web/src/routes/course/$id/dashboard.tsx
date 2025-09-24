import { SignInButton, useUser } from "@clerk/clerk-react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
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
import { LessonsCard } from "@/components/dashboard/lesson-card";

import { UnitsCard } from "@/components/dashboard/units-card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export const Route = createFileRoute("/course/$id/dashboard")({
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

  const createUnit = useMutation(api.units.create);
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

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor)
  );

  const [selectedUnitId, setSelectedUnitId] = useState<null | Id<"units">>(
    null
  );

  const unitList = units ?? [];
  const [localUnits, setLocalUnits] = useState(unitList);

  // Keep local copy in sync with server updates
  useEffect(() => {
    setLocalUnits(unitList);
  }, [unitList]);

  // When units load set a default selection.
  useEffect(() => {
    if (!selectedUnitId && localUnits[0]) {
      setSelectedUnitId(localUnits[0].id as Id<"units">);
    }
  }, [selectedUnitId, localUnits]);

  const handleCreateUnit = useCallback(
    async (name: string) => {
      if (!name.trim()) {
        return;
      }
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
      if (!raw.trim()) {
        return;
      }
      await updateEmbed({ lessonId, raw: raw.trim() });
    },
    [updateEmbed]
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
        <Link
          className="inline-flex"
          params={{ id: courseId }}
          to="/course/$id"
        >
          <Button type="button" variant="secondary">
            View course
          </Button>
        </Link>
      </div>

      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={({ active, over }) => {
          if (!over || active.id === over.id) {
            return;
          }
          const oldIndex = localUnits.findIndex(
            (u) => String(u.id) === String(active.id)
          );
          const newIndex = localUnits.findIndex(
            (u) => String(u.id) === String(over.id)
          );
          if (oldIndex === -1 || newIndex === -1) {
            return;
          }
          const prev = localUnits;
          const reordered = arrayMove(localUnits, oldIndex, newIndex);
          // Optimistically update UI
          setLocalUnits(reordered);
          const data = reordered.map((u, index) => ({
            id: u.id as Id<"units">,
            position: index,
          }));
          handleReorderUnits(data).catch(() => setLocalUnits(prev));
        }}
        sensors={sensors}
      >
        <UnitsCard
          onCreateUnit={handleCreateUnit}
          onDeleteUnit={handleRemoveUnit}
          onReorder={handleReorderUnits}
          onSelectUnit={setSelectedUnitId}
          onTogglePublish={handleUpdateUnit}
          selectedUnitId={selectedUnitId}
          units={localUnits}
        />
      </DndContext>

      <LessonsCard
        courseId={courseId}
        onCreateLesson={handleCreateLesson}
        onDeleteLesson={handleRemoveLesson}
        onReorderLesson={handleReorderLesson}
        onTogglePublish={handleUpdateLesson}
        onUpdateEmbed={handleUpdateEmbed}
        selectedUnitId={selectedUnitId}
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
