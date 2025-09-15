import { api } from "@ocw-convex/backend/convex/_generated/api";
import type { Id } from "@ocw-convex/backend/convex/_generated/dataModel";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { BreadcrumbCourse } from "@/components/lesson-sidebar/breadcrumb-course";
import { LessonSidebarContainer } from "@/components/lesson-sidebar/container";
import { GoogleDocsEmbed } from "@/components/render/google-docs";
import { QuizletEmbed } from "@/components/render/quizlet";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/course/$id/$unitId/$lessonId/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { lessonId } = Route.useParams();

  const lesson = useQuery(api.lesson.getLessonById, {
    id: lessonId as Id<"lessons">,
  });

  if (!lesson) {
    return <div>Loading...</div>;
  }

  return (
    <Layout>
      <main className="h-min-screen w-full">
        <LessonEmbed
          contentType={lesson.lesson.contentType}
          embedId={lesson.embed.embedUrl ?? null}
          password={lesson.embed.password ?? null}
        />
        <code className="bg-white text-3xl">
          {JSON.stringify(lesson, null, 2)}
        </code>
      </main>
    </Layout>
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
    default:
      return <div>Unsupported content type</div>;
  }
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col">
      <SidebarProvider
        style={{
          //@ts-expect-error should work according to docs
          "--sidebar-width": "21rem",
        }}
      >
        <LessonSidebarContainer />
        <SidebarInset>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <header className="flex h-16 shrink-0 items-center justify-between gap-2">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator className="mr-2 h-4" orientation="vertical" />

                <BreadcrumbCourse />
              </div>
              <div className="flex items-center gap-2 leading-none">
                <Link
                  className={cn(
                    buttonVariants({ variant: "ghost" }),
                    "p-2 font-medium text-sm"
                  )}
                  to={"/"}
                >
                  Home
                </Link>
              </div>
            </header>
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
