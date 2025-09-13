import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export const Route = createFileRoute("/course/$id/dashboard")({
  component: RouteComponent,
});

function DraggableRow({
  unit,
}: {
  unit: { id: string; name: string; isPublished: boolean };
}) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: unit.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  } as React.CSSProperties;
  return (
    <div
      ref={setNodeRef}
      style={style}
      data-dragging={isDragging}
      className="data-[dragging=true]:opacity-80"
    >
      <div className="flex items-center gap-3 py-2">
        <div className="size-2 rounded-full bg-muted" />
        <div className="flex-1">
          <div className="font-medium">{unit.name}</div>
          <div className="text-muted-foreground text-xs">
            {unit.isPublished ? "Published" : "Draft"}
          </div>
        </div>
      </div>
    </div>
  );
}

function RouteComponent() {
  const { id } = Route.useParams();
  const user = useUser();

  const membership = useQuery(api.courseUsers.getMyMembership, {
    courseId: id as Id<"courses">,
  });

  const dashboard = useQuery(api.courses.getDashboardSummary, {
    courseId: id as Id<"courses">,
  });
  const units = useQuery(api.units.getTableData, {
    courseId: id as Id<"courses">,
  });
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
    Boolean(
      membership &&
        (membership.role === "admin" || membership.role === "editor")
    ) || user.user?.publicMetadata.role === "admin";
  const [newUnitName, setNewUnitName] = useState("");
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );
  const unitIds = useMemo<string[]>(
    () => (units ?? []).map((u) => String(u.id)),
    [units]
  );
  const [selectedUnitId, setSelectedUnitId] = useState<null | Id<"units">>(
    null
  );
  useEffect(() => {
    if (!selectedUnitId && units && units[0]) {
      setSelectedUnitId(units[0].id as unknown as Id<"units">);
    }
  }, [units, selectedUnitId]);
  const lessons = useQuery(
    api.lesson.getByUnit,
    selectedUnitId
      ? ({ unitId: selectedUnitId } as { unitId: Id<"units"> })
      : ("skip" as const)
  );
  const lessonIds = useMemo<string[]>(
    () => (lessons ?? []).map((l) => String(l.id)),
    [lessons]
  );
  const [newLessonName, setNewLessonName] = useState("");
  const [newLessonEmbed, setNewLessonEmbed] = useState("");
  const [embedDrafts, setEmbedDrafts] = useState<Record<string, string>>({});

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
                params={{ id }}
              >
                Back to course
              </Link>
            </div>
          </div>
        ) : dashboard === undefined || units === undefined ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
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
              <Link to="/course/$id" params={{ id }} className="inline-flex">
                <Button type="button" variant="secondary">
                  View course
                </Button>
              </Link>
            </div>

            <Card>
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-base">Units</CardTitle>
                  <CardDescription>
                    Drag to reorder. Click to toggle publish.
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="New unit name"
                    value={newUnitName}
                    onChange={(e) => setNewUnitName(e.target.value)}
                    className="w-56"
                  />
                  <Button
                    type="button"
                    onClick={async () => {
                      const name = newUnitName.trim();
                      if (!name) return;
                      await createUnit({ courseId: id as Id<"courses">, name });
                      setNewUnitName("");
                    }}
                  >
                    Add unit
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <DndContext
                  collisionDetection={closestCenter}
                  modifiers={[restrictToVerticalAxis]}
                  sensors={sensors}
                  onDragEnd={async (e: DragEndEvent) => {
                    const { active, over } = e;
                    if (!active || !over || active.id === over.id || !units)
                      return;
                    const oldIndex = unitIds.indexOf(active.id as string);
                    const newIndex = unitIds.indexOf(over.id as string);
                    if (oldIndex < 0 || newIndex < 0) return;
                    const next = arrayMove(units, oldIndex, newIndex);
                    const payload = next.map((u, index) => ({
                      id: u.id as unknown as Id<"units">,
                      position: index,
                    }));
                    await reorderUnits({
                      courseId: id as Id<"courses">,
                      data: payload,
                    });
                  }}
                >
                  <SortableContext
                    items={unitIds}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="divide-border divide-y">
                      {(units ?? []).map((u) => (
                        <div
                          key={u.id}
                          className="flex items-center justify-between"
                        >
                          <DraggableRow unit={u} />
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant={u.isPublished ? "secondary" : "outline"}
                              onClick={() =>
                                updateUnit({
                                  courseId: id as Id<"courses">,
                                  data: {
                                    id: u.id as unknown as Id<"units">,
                                    isPublished: !u.isPublished,
                                  },
                                })
                              }
                            >
                              {u.isPublished ? "Unpublish" : "Publish"}
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              onClick={() =>
                                removeUnit({
                                  courseId: id as Id<"courses">,
                                  id: u.id as unknown as Id<"units">,
                                })
                              }
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-base">Lessons</CardTitle>
                  <CardDescription>
                    Pick a unit to manage lessons, drag to reorder, paste
                    embeds.
                  </CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="sr-only" htmlFor="unitSelect">
                    Unit
                  </label>
                  <select
                    id="unitSelect"
                    className="border-input bg-background text-foreground h-9 rounded-md border px-2 text-sm"
                    value={(selectedUnitId as unknown as string) ?? ""}
                    onChange={(e) =>
                      setSelectedUnitId(
                        e.target.value as unknown as Id<"units">
                      )
                    }
                  >
                    {(units ?? []).map((u) => (
                      <option key={u.id} value={u.id as string}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                  <Input
                    placeholder="New lesson name"
                    value={newLessonName}
                    onChange={(e) => setNewLessonName(e.target.value)}
                    className="w-56"
                  />
                  <Input
                    placeholder="Optional: iframe or URL"
                    value={newLessonEmbed}
                    onChange={(e) => setNewLessonEmbed(e.target.value)}
                    className="w-72"
                  />
                  <Button
                    type="button"
                    onClick={async () => {
                      if (!selectedUnitId) return;
                      const name = newLessonName.trim();
                      if (!name) return;
                      await createLesson({
                        courseId: id as Id<"courses">,
                        unitId: selectedUnitId,
                        name,
                        embedRaw: newLessonEmbed || undefined,
                      });
                      setNewLessonName("");
                      setNewLessonEmbed("");
                    }}
                  >
                    Add lesson
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {!selectedUnitId ? (
                  <p className="text-muted-foreground text-sm">
                    Select a unit to view lessons.
                  </p>
                ) : lessons === undefined ? (
                  <div className="flex h-28 items-center justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-primary" />
                  </div>
                ) : (
                  <DndContext
                    collisionDetection={closestCenter}
                    modifiers={[restrictToVerticalAxis]}
                    sensors={sensors}
                    onDragEnd={async (e: DragEndEvent) => {
                      const { active, over } = e;
                      if (
                        !active ||
                        !over ||
                        active.id === over.id ||
                        !lessons ||
                        !selectedUnitId
                      )
                        return;
                      const oldIndex = lessonIds.indexOf(active.id as string);
                      const newIndex = lessonIds.indexOf(over.id as string);
                      if (oldIndex < 0 || newIndex < 0) return;
                      const next = arrayMove(lessons, oldIndex, newIndex);
                      const payload = next.map((l, index) => ({
                        id: l.id as unknown as Id<"lessons">,
                        position: index,
                      }));
                      await reorderLesson({
                        courseId: id as Id<"courses">,
                        unitId: selectedUnitId,
                        data: payload,
                      });
                    }}
                  >
                    <SortableContext
                      items={lessonIds}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="divide-border divide-y">
                        {(lessons ?? []).map((l) => (
                          <div
                            key={l.id}
                            className="flex items-center justify-between gap-2 py-1"
                          >
                            <div className="flex items-center gap-3 py-2">
                              <div className="size-2 rounded-full bg-muted" />
                              <div>
                                <div className="font-medium">{l.name}</div>
                                <div className="text-muted-foreground text-xs capitalize">
                                  {String(l.contentType).replace("_", " ")}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Input
                                placeholder="Paste iframe or URL"
                                className="w-72"
                                value={embedDrafts[l.id] ?? ""}
                                onChange={(e) =>
                                  setEmbedDrafts((prev) => ({
                                    ...prev,
                                    [l.id]: e.target.value,
                                  }))
                                }
                                onBlur={async (e) => {
                                  const raw = e.target.value.trim();
                                  if (!raw) return;
                                  await updateEmbed({
                                    lessonId: l.id as unknown as Id<"lessons">,
                                    raw,
                                  });
                                  setEmbedDrafts((prev) => ({
                                    ...prev,
                                    [l.id]: "",
                                  }));
                                }}
                              />
                              <Button
                                type="button"
                                variant={
                                  l.isPublished ? "secondary" : "outline"
                                }
                                onClick={() =>
                                  updateLesson({
                                    courseId: id as Id<"courses">,
                                    data: {
                                      id: l.id as unknown as Id<"lessons">,
                                      isPublished: !l.isPublished,
                                    },
                                  })
                                }
                              >
                                {l.isPublished ? "Unpublish" : "Publish"}
                              </Button>
                              <Button
                                type="button"
                                variant="destructive"
                                onClick={() =>
                                  removeLesson({
                                    courseId: id as Id<"courses">,
                                    id: l.id as unknown as Id<"lessons">,
                                  })
                                }
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}
              </CardContent>
            </Card>
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
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
        </div>
      </AuthLoading>
    </div>
  );
}
