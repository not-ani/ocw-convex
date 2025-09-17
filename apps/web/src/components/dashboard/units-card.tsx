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
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useCallback, useMemo, useState } from "react";
import type { Id } from "@ocw-convex/backend/convex/_generated/dataModel";

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
    if (!name) return;
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
            placeholder="New unit name"
            value={newUnitName}
            onChange={(e) => setNewUnitName(e.target.value)}
            className="w-56"
          />
          <Button type="button" onClick={handleAdd}>
            Add unit
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <SortableContext items={unitIds} strategy={verticalListSortingStrategy}>
          <div className="divide-border divide-y">
            {units.map((u, i) => (
              <UnitItem
                key={String(u.id)}
                unit={u}
                isSelected={String(selectedUnitId) === String(u.id)}
                onSelect={() => onSelectUnit(u.id as Id<"units">)}
                onTogglePublish={() =>
                  onTogglePublish({
                    id: u.id as Id<"units">,
                    data: { isPublished: !u.isPublished },
                  })
                }
                onDelete={() => onDeleteUnit(u.id as Id<"units">)}
              />
            ))}
          </div>
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
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: String(unit.id),
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  } as React.CSSProperties;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between py-2 ${
        isDragging ? "opacity-80" : ""
      }`}
      role="listitem"
      aria-selected={isSelected}
      onClick={onSelect}
    >
      <div className="flex items-center gap-3">
        <div className="size-2 rounded-full bg-muted" />
        <div className="flex-1">
          <div className="font-medium">{unit.name}</div>
          <div className="text-muted-foreground text-xs">
            {unit.isPublished ? "Published" : "Draft"}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant={unit.isPublished ? "secondary" : "outline"}
          onClick={(e) => {
            e.stopPropagation();
            onTogglePublish();
          }}
        >
          {unit.isPublished ? "Unpublish" : "Publish"}
        </Button>

        <Button
          type="button"
          variant="destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}
