"use client";

import { Embed } from "../iframe";
import { buttonVariants } from "../ui/button";

export function QuizletEmbed({
  embedId,
  password,
}: {
  embedId: string | null;
  password: string | null;
}) {
  if (!embedId) {
    return <div>Invalid Quizlet Embed</div>;
  }

  const url = embedId;

  return (
    <div className="flex h-screen flex-col">
      <div className="flex flex-row items-center justify-between p-4">
        <h3 className="font-bold text-3xl">Quizlet (Flashcards)</h3>
        <a
          className={buttonVariants({
            variant: "default",
          })}
          href={embedId}
          rel="noopener noreferrer"
          target="_blank"
        >
          Open in new tab
        </a>
        {password ? (
          <p className="ml-4 text-gray-600">Password: {password}</p>
        ) : null}
      </div>
      <div className="grow">
        <Embed className="h-full w-full border-0" src={url} />
      </div>
    </div>
  );
}
