import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useCallback } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export function LessonRow({
  lesson,
  onTogglePublish,
  onDelete,
  onUpdateEmbed,
}: {
  lesson: {
    id: string | number;
    name: string;
    contentType?: string;
    isPublished?: boolean;
  };
  onTogglePublish: () => void;
  onDelete: () => void;
  onUpdateEmbed: (raw: string) => void;
}) {
  const [draft, setDraft] = useState("");
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: String(lesson.id),
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  } as React.CSSProperties;

  const handleBlur = useCallback(() => {
    const raw = draft.trim();
    if (!raw) return;
    onUpdateEmbed(raw);
    setDraft("");
  }, [draft, onUpdateEmbed]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between gap-2 py-1 ${
        isDragging ? "opacity-80" : ""
      }`}
    >
      <div className="flex items-center gap-3 py-2">
        <div className="size-2 rounded-full bg-muted" />
        <div>
          <div className="font-medium">{lesson.name}</div>
          <div className="text-muted-foreground text-xs capitalize">
            {String(lesson.contentType ?? "").replace("_", " ")}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Input
          placeholder="Paste iframe or URL"
          className="w-72"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={handleBlur}
        />
        <Button
          type="button"
          variant={lesson.isPublished ? "secondary" : "outline"}
          onClick={onTogglePublish}
        >
          {lesson.isPublished ? "Unpublish" : "Publish"}
        </Button>

        <Button type="button" variant="destructive" onClick={onDelete}>
          Delete
        </Button>
      </div>
    </div>
  );
}
