import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { useCallback, useMemo, useState } from "react";
import type { Id } from "@ocw-convex/backend/convex/_generated/dataModel";
import { LessonRow } from "./lesson-row";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { api } from "@ocw-convex/backend/convex/_generated/api";
import { useQuery } from "convex/react";

export function LessonsCard({
  selectedUnitId,
  onCreateLesson,
  onTogglePublish,
  onDeleteLesson,
  onReorderLesson,
  onUpdateEmbed,
}: {
  courseId: Id<"courses">;
  selectedUnitId: Id<"units"> | null;
  onCreateLesson: (payload: {
    unitId: Id<"units">;
    name: string;
    embedRaw?: string;
  }) => Promise<void>;
  onTogglePublish: (data: {
    id: Id<"lessons">;
    isPublished?: boolean;
  }) => Promise<void>;
  onDeleteLesson: (id: Id<"lessons">) => Promise<void>;
  onReorderLesson: (payload: {
    unitId: Id<"units">;
    data: { id: Id<"lessons">; position: number }[];
  }) => Promise<void>;
  onUpdateEmbed: (lessonId: Id<"lessons">, raw: string) => Promise<void>;
}) {
  const [newLessonName, setNewLessonName] = useState("");
  const [newLessonEmbed, setNewLessonEmbed] = useState("");

  const lessons = useQuery(
    api.lesson.getByUnit,
    selectedUnitId
      ? ({ unitId: selectedUnitId } as { unitId: Id<"units"> })
      : ("skip" as const)
  );

  const lessonList = lessons ?? [];
  const lessonIds = useMemo(
    () => lessonList.map((l) => String(l.id)),
    [lessonList]
  );

  const handleAdd = useCallback(async () => {
    if (!selectedUnitId) return;
    const name = newLessonName.trim();
    if (!name) return;
    await onCreateLesson({
      unitId: selectedUnitId,
      name,
      embedRaw: newLessonEmbed || undefined,
    });
    setNewLessonName("");
    setNewLessonEmbed("");
  }, [newLessonName, newLessonEmbed, selectedUnitId, onCreateLesson]);

  const handleReorder = useCallback(
    async (oldIndex: number, newIndex: number) => {
      if (oldIndex < 0 || newIndex < 0 || !selectedUnitId) return;
      const next = arrayMove(lessonList, oldIndex, newIndex);
      const payload = next.map((l, index) => ({
        id: l.id as Id<"lessons">,
        position: index,
      }));
      await onReorderLesson({ unitId: selectedUnitId, data: payload });
    },
    [lessonList, onReorderLesson, selectedUnitId]
  );

  if (!selectedUnitId) {
    return (
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="text-base">Lessons</CardTitle>
            <CardDescription>
              Pick a unit to manage lessons, drag to reorder, paste embeds.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Select a unit to view lessons.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (lessons === undefined) {
    return (
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="text-base">Lessons</CardTitle>
            <CardDescription>
              Pick a unit to manage lessons, drag to reorder, paste embeds.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex h-28 items-center justify-center">
            <LoadingSpinner size={24} />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-base">Lessons</CardTitle>
          <CardDescription>
            Pick a unit to manage lessons, drag to reorder, paste embeds.
          </CardDescription>
        </div>

        <div className="flex flex-wrap items-center gap-2">
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
          <Button type="button" onClick={handleAdd}>
            Add lesson
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={(e) => {
            const { active, over } = e;
            if (!active || !over || active.id === over.id) return;
            const oldIndex = lessonIds.indexOf(String(active.id));
            const newIndex = lessonIds.indexOf(String(over.id));
            handleReorder(oldIndex, newIndex).catch(console.error);
          }}
        >
          <SortableContext
            items={lessonIds}
            strategy={verticalListSortingStrategy}
          >
            <div className="divide-border divide-y">
              {lessonList.map((l) => (
                <LessonRow
                  key={String(l.id)}
                  lesson={l}
                  onTogglePublish={() =>
                    onTogglePublish({
                      id: l.id as Id<"lessons">,
                      isPublished: !l.isPublished,
                    })
                  }
                  onDelete={() => onDeleteLesson(l.id as Id<"lessons">)}
                  onUpdateEmbed={(raw) =>
                    onUpdateEmbed(l.id as Id<"lessons">, raw)
                  }
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </CardContent>
    </Card>
  );
}
