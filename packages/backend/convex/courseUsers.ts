import { v } from "convex/values";
import { query } from "./_generated/server";

export const getMyMembership = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const membership = await ctx.db
      .query("courseUsers")
      .withIndex("by_course_and_user", (q) =>
        q.eq("courseId", args.courseId).eq("userId", identity.tokenIdentifier)
      )
      .unique();


    if (!membership) return null;

    return {
      role: membership.role,
      permissions: membership.permissions ?? [],
    } as const;
  },
});

export const countMembersByRole = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const requester = await ctx.db
      .query("courseUsers")
      .withIndex("by_course_and_user", (q) =>
        q.eq("courseId", args.courseId).eq("userId", identity.tokenIdentifier)
      )
      .unique();

    if (!(requester && (requester.role === "admin" || requester.role === "editor"))) {
      return null;
    }

    const members = await ctx.db
      .query("courseUsers")
      .withIndex("by_course_id", (q) => q.eq("courseId", args.courseId))
      .collect();

    const counts = members.reduce(
      (acc, m) => {
        acc[m.role] += 1;
        return acc;
      },
      { admin: 0, editor: 0, user: 0 } as { admin: number; editor: number; user: number }
    );

    return counts;
  },
});


