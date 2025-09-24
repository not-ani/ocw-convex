import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Id } from "@ocw-convex/backend/convex/_generated/dataModel";
import { GripVertical } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Unit = { id: Id<"units"> | string; name: string; isPublished: boolean };

export function UnitsCard({
  units,
  selectedUnitId,
  onSelectUnit,
  onCreateUnit,
  onTogglePublish,
  onDeleteUnit,
}: {
  units: Unit[];
  selectedUnitId: Id<"units"> | null;
  onSelectUnit: (id: Id<"units">) => void;
  onCreateUnit: (name: string) => Promise<void>;
  onTogglePublish: (payload: {
    id: Id<"units">;
    data: { isPublished: boolean };
  }) => Promise<void>;
  onDeleteUnit: (id: Id<"units">) => Promise<void>;
  onReorder: (data: { id: Id<"units">; position: number }[]) => Promise<void>;
}) {
  const [newUnitName, setNewUnitName] = useState("");
  const unitIds = useMemo(() => units.map((u) => String(u.id)), [units]);

  const handleAdd = useCallback(async () => {
    const name = newUnitName.trim();
    if (!name) {
      return;
    }
    await onCreateUnit(name);
    setNewUnitName("");
  }, [newUnitName, onCreateUnit]);

  return (
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
            className="w-56"
            onChange={(e) => setNewUnitName(e.target.value)}
            placeholder="New unit name"
            value={newUnitName}
          />
          <Button onClick={handleAdd} type="button">
            Add unit
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <SortableContext items={unitIds} strategy={verticalListSortingStrategy}>
          <ul className="divide-y divide-border">
            {units.map((u) => (
              <UnitItem
                isSelected={String(selectedUnitId) === String(u.id)}
                key={String(u.id)}
                onDelete={() => onDeleteUnit(u.id as Id<"units">)}
                onSelect={() => onSelectUnit(u.id as Id<"units">)}
                onTogglePublish={() =>
                  onTogglePublish({
                    id: u.id as Id<"units">,
                    data: { isPublished: !u.isPublished },
                  })
                }
                unit={u}
              />
            ))}
          </ul>
        </SortableContext>
      </CardContent>
    </Card>
  );
}

function UnitItem({
  unit,
  isSelected,
  onSelect,
  onTogglePublish,
  onDelete,
}: {
  unit: { id: string | Id<"units">; name: string; isPublished: boolean };
  isSelected: boolean;
  onSelect: () => void;
  onTogglePublish: () => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setActivatorNodeRef,
    transform,
    transition,
    setNodeRef,
    isDragging,
  } = useSortable({
    id: String(unit.id),
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  } as React.CSSProperties;

  return (
    <li
      className={`flex items-center justify-between py-2 ${
        isDragging ? "opacity-80" : ""
      }`}
      ref={setNodeRef}
      style={style}
    >
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            aria-label="Drag to reorder unit"
            className="inline-flex h-8 w-8 cursor-grab items-center justify-center rounded-md hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 active:cursor-grabbing"
            onClick={(e) => e.stopPropagation()}
            ref={setActivatorNodeRef}
            type="button"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </button>
          <div className="size-2 rounded-full bg-muted" />
          <button
            aria-pressed={isSelected}
            className="flex-1 text-left"
            onClick={onSelect}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect();
              }
            }}
            type="button"
          >
            <div className="font-medium">{unit.name}</div>
            <div className="text-muted-foreground text-xs">
              {unit.isPublished ? "Published" : "Draft"}
            </div>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onTogglePublish();
            }}
            type="button"
            variant={unit.isPublished ? "secondary" : "outline"}
          >
            {unit.isPublished ? "Unpublish" : "Publish"}
          </Button>

          <Button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            type="button"
            variant="destructive"
          >
            Delete
          </Button>
        </div>
      </div>
    </li>
  );
}
