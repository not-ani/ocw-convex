import { api } from "@ocw-convex/backend/convex/_generated/api";
import type { Id } from "@ocw-convex/backend/convex/_generated/dataModel";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { GoogleDocsEmbed } from "@/components/render/google-docs";
import { QuizletEmbed } from "@/components/render/quizlet";

export const Route = createFileRoute("/course/$id/$unitId/$lessonId/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { lessonId } = Route.useParams();

  const lesson = useQuery(api.lesson.getLessonById, {
    id: lessonId as Id<"lessons">,
  });

  console.error(lesson);

  if (!lesson) {
    return <div>Loading...</div>;
  }

  return (
    <main className="h-min-screen w-full">
      <LessonEmbed
        contentType={lesson.lesson.contentType}
        embedId={lesson.embed.embedId ?? null}
        password={lesson.embed.quizletPassword ?? null}
      />
      <code className="bg-white text-3xl">
        {JSON.stringify(lesson, null, 2)}
      </code>
    </main>
  );
}

function LessonEmbed({
  contentType,
  embedId,
  password,
}: {
  contentType:
    | "quizlet"
    | "google_docs"
    | "notion"
    | "tiptap"
    | "flashcard"
    | undefined;
  embedId: string | null;
  password: string | null;
}) {
  switch (contentType) {
    case "quizlet":
      return (
        <QuizletEmbed embedId={embedId ?? null} password={password ?? null} />
      );
    case "google_docs":
      return <GoogleDocsEmbed embedId={embedId ?? null} />;
  }
}
