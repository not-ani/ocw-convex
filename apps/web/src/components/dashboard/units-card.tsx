import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Id } from "@ocw-convex/backend/convex/_generated/dataModel";
import type { ColumnDef, Row } from "@tanstack/react-table";
import { Eye, EyeOff, GripVertical, MoreVertical, Trash2 } from "lucide-react";
import type React from "react";
import { useCallback, useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
/* shadcn-like menu + dialog primitives. Adjust paths for your project */
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type {
  TableRowProps as KiboTableRowProps,
  TableBodyProps,
  TableCellProps,
  TableColumnHeaderProps,
  TableHeaderGroupProps,
  TableHeaderProps,
  TableHeadProps,
  TableProviderProps,
} from "@/components/ui/kibo-ui/table";
import {
  TableBody,
  TableCell,
  TableColumnHeader,
  TableHead,
  TableHeader,
  TableHeaderGroup,
  TableProvider,
  TableRow,
} from "@/components/ui/kibo-ui/table";

type Unit = { id: Id<"units"> | string; name: string; isPublished: boolean };

type UnitsCardProps = {
  units: Unit[];
  selectedUnitId: Id<"units"> | null;
  onSelectUnit: (id: Id<"units">) => void;
  onTogglePublish: (payload: {
    id: Id<"units">;
    data: { isPublished: boolean };
  }) => Promise<void>;
  onDeleteUnit: (id: Id<"units">) => Promise<void>;
  onReorder: (data: { id: Id<"units">; position: number }[]) => Promise<void>;
};

export function UnitsCard({
  units,
  selectedUnitId,
  onSelectUnit,
  onTogglePublish,
  onDeleteUnit,
  onReorder,
}: UnitsCardProps) {
  const unitIds = useMemo<string[]>(
    () => units.map((u) => String(u.id)),
    [units]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = unitIds.indexOf(String(active.id));
      const newIndex = unitIds.indexOf(String(over.id));
      if (oldIndex === -1 || newIndex === -1) return;

      const newOrder = arrayMove(unitIds, oldIndex, newIndex);
      const payload = newOrder.map((id, idx) => ({
        id: id as Id<"units">,
        position: idx,
      }));
      void onReorder(payload);
    },
    [unitIds, onReorder]
  );

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-base">Units</CardTitle>
          <CardDescription>
            Drag to reorder. Open the menu for actions (publish/unpublish,
            delete).
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <DndContext onDragEnd={handleDragEnd}>
          <SortableContext
            items={unitIds}
            strategy={verticalListSortingStrategy}
          >
            <UnitsTable
              onDeleteUnit={onDeleteUnit}
              onSelectUnit={onSelectUnit}
              onTogglePublish={onTogglePublish}
              selectedUnitId={selectedUnitId}
              units={units}
            />
          </SortableContext>
        </DndContext>
      </CardContent>
    </Card>
  );
}

/* UnitsTable: builds TanStack column defs and renders rows via Kibo table */
function UnitsTable({
  units,
  selectedUnitId,
  onSelectUnit,
  onTogglePublish,
  onDeleteUnit,
}: {
  units: Unit[];
  selectedUnitId: Id<"units"> | null;
  onSelectUnit: (id: Id<"units">) => void;
  onTogglePublish: (payload: {
    id: Id<"units">;
    data: { isPublished: boolean };
  }) => Promise<void>;
  onDeleteUnit: (id: Id<"units">) => Promise<void>;
}) {
  const columns = useMemo<ColumnDef<Unit, any>[]>(
    () => [
      {
        id: "drag",
        accessorFn: (row) => String(row.id),
        header: ({ column }) => (
          <TableColumnHeader
            column={column as unknown as TableColumnHeaderProps<any>}
            title=""
          />
        ),
        cell: ({ row }) => (
          <div className="flex w-10 items-center justify-center">
            <DragHandle rowId={String(row.original.id)} />
          </div>
        ),
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <TableColumnHeader
            column={column as unknown as TableColumnHeaderProps<Unit>}
            title="Name"
          />
        ),
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar className="size-6">
              <AvatarImage src={getAvatarUrl(row.original.name)} />
              <AvatarFallback>{row.original.name.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{row.original.name}</div>
              <div className="text-muted-foreground text-xs">
                {row.original.isPublished ? "Published" : "Draft"}
              </div>
            </div>
          </div>
        ),
      },
      {
        id: "actions",
        accessorFn: (row) => String(row.id),
        header: ({ column }) => (
          <TableColumnHeader
            column={column as unknown as TableColumnHeaderProps<Unit>}
            title="Actions"
          />
        ),
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-2">
            <ActionsMenu
              isSelected={String(selectedUnitId) === String(row.original.id)}
              onDelete={() => onDeleteUnit(row.original.id as Id<"units">)}
              onSelect={() => onSelectUnit(row.original.id as Id<"units">)}
              onTogglePublish={() =>
                onTogglePublish({
                  id: row.original.id as Id<"units">,
                  data: { isPublished: !row.original.isPublished },
                })
              }
              unit={row.original}
            />
          </div>
        ),
      },
    ],
    [onDeleteUnit, onSelectUnit, onTogglePublish, selectedUnitId]
  );

  // TableProvider props typing may vary; use inference from your TableProvider.
  return (
    <TableProvider columns={columns} data={units as Unit[]}>
      <TableHeader>
        {({ headerGroup }) => (
          <TableHeaderGroup
            headerGroup={headerGroup as unknown as TableHeaderGroupProps<any>}
            key={String((headerGroup as { id?: string }).id ?? "")}
          >
            {({ header }) => (
              <TableHead
                header={header as unknown as TableHeadProps<any>}
                key={String((header as { id?: string }).id ?? "")}
              />
            )}
          </TableHeaderGroup>
        )}
      </TableHeader>

      <TableBody>
        {({ row: rowProp }) => {
          const row = rowProp as Row<Unit>;
          return (
            <SortableRow
              isSelected={String(selectedUnitId) === String(row.original.id)}
              key={String(row.id)}
              onSelect={() => onSelectUnit(row.original.id as Id<"units">)}
              row={row}
            >
              {({ cell }) => (
                <TableCell
                  cell={cell as unknown as TableCellProps<any>}
                  key={String((cell as { id?: string }).id ?? "")}
                />
              )}
            </SortableRow>
          );
        }}
      </TableBody>
    </TableProvider>
  );
}

/* SortableRow wraps the Kibo TableRow and wires useSortable for drag transforms.
   It accepts a TanStack Row<Unit> to keep typings pure. */
function SortableRow({
  row,
  isSelected,
  onSelect,
  children,
}: {
  row: Row<Unit>;
  isSelected: boolean;
  onSelect: () => void;
  children: (props: { cell: React.ReactElement }) => React.ReactElement;
}) {
  const {
    attributes,
    listeners,
    setActivatorNodeRef,
    transform,
    transition,
    setNodeRef,
    isDragging,
  } = useSortable({ id: String(row.id) });

  const style = useMemo(
    () =>
      ({
        transform: CSS.Transform.toString(transform),
        transition,
      }) as React.CSSProperties,
    [transform, transition]
  );

  // TableRow from Kibo UI in your example accepts a prop "row" (the TanStack Row<T>).
  // If your TableRow forwards refs, this will attach correctly.
  return (
    <TableRow
      aria-pressed={isSelected}
      className={isDragging ? "opacity-80" : ""}
      onClick={onSelect}
      ref={setNodeRef}
      row={row}
      style={style}
    >
      {children({
        cell: row.getVisibleCells()[0].column ? (
          (row.getVisibleCells()[0] as unknown as React.ReactElement)
        ) : (
          <></>
        ),
      })}
    </TableRow>
  );
}

/* DragHandle: uses the activator node ref provided by useSortable in the row.
   To keep the activator tied to the same sortable hook, we use a tiny hook that
   re-derives the same sortable instance for the id, but only reads attributes/listeners.
   This avoids any use of `any`. */
function DragHandle({ rowId }: { rowId: string }) {
  const { attributes, listeners, setActivatorNodeRef } = useSortable({
    id: rowId,
  });

  return (
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
  );
}

/* ActionsMenu: shadcn DropdownMenu with confirmation dialogs for Delete and Unpublish */
function ActionsMenu({
  unit,
  isSelected,
  onSelect,
  onTogglePublish,
  onDelete,
}: {
  unit: Unit;
  isSelected: boolean;
  onSelect: () => void;
  onTogglePublish: () => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [openUnpublishConfirm, setOpenUnpublishConfirm] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label="Open actions"
            onClick={(e) => {
              e.stopPropagation();
            }}
            size="sm"
            title="Actions"
            variant="ghost"
          >
            <MoreVertical size={16} />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
          >
            Select
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              if (unit.isPublished) {
                setOpenUnpublishConfirm(true);
              } else {
                void onTogglePublish();
              }
            }}
          >
            {unit.isPublished ? "Unpublish" : "Publish"}
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setOpenDeleteConfirm(true);
            }}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog onOpenChange={setOpenDeleteConfirm} open={openDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete unit</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{unit.name}&quot;? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => setOpenDeleteConfirm(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                await onDelete();
                setOpenDeleteConfirm(false);
              }}
              variant="destructive"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        onOpenChange={setOpenUnpublishConfirm}
        open={openUnpublishConfirm}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unpublish unit</DialogTitle>
            <DialogDescription>
              Are you sure you want to unpublish &quot;{unit.name}&quot;?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => setOpenUnpublishConfirm(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                await onTogglePublish();
                setOpenUnpublishConfirm(false);
              }}
              variant="primary"
            >
              Unpublish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* Simple avatar helper */
function getAvatarUrl(name: string): string {
  const seed = encodeURIComponent(name);
  return `https://api.dicebear.com/8.x/initials/svg?seed=${seed}`;
}
