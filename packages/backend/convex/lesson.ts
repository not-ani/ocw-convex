import { v } from "convex/values";
import { query } from "./_generated/server";

export const getLessonById = query({
  args: {
    id: v.id("lessons"),
  },
  handler: async (ctx, args) => {
    const lesson = await ctx.db.get(args.id);

    const lessonEmbed = await ctx.db
      .query("lessonEmbeds")
      .withIndex("by_lesson_id", (q) => q.eq("lessonId", args.id))
      .first();

    return {
      lesson: {
        ...lesson,
      },
      embed: {
        ...lessonEmbed,
      },
    };
  },
});
