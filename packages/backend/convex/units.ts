import { v } from "convex/values";
import { mutation, MutationCtx, query } from "./_generated/server";

function assertEditorOrAdmin(role: string | null) {
  if (!(role === "admin" || role === "editor")) {
    throw new Error("Not authorized");
  }
}

async function getRequesterRole(
  ctx: MutationCtx,
  courseId: string,
) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  const membership = await ctx.db
    .query("courseUsers")
    .withIndex("by_course_and_user", (q) =>
      q.eq("courseId", courseId as any).eq("userId", identity.tokenIdentifier),
    )
    .unique();
  return membership?.role ?? null;
}

export const getTableData = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const units = await ctx.db
      .query("units")
      .withIndex("by_course_and_order", (q) => q.eq("courseId", args.courseId))
      .order("asc")
      .collect();

    return units.map((u) => ({
      id: u._id,
      name: u.name,
      isPublished: u.isPublished,
      courseId: u.courseId,
      order: u.order,
    }));
  },
});

export const create = mutation({
  args: {
    courseId: v.id("courses"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const role = await getRequesterRole(ctx, args.courseId);
    assertEditorOrAdmin(role);

    const count = await ctx.db
      .query("units")
      .withIndex("by_course_id", (q) => q.eq("courseId", args.courseId))
      .collect();

    const order = count.length;
    const id = await ctx.db.insert("units", {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      courseId: args.courseId,
      name: args.name,
      description: undefined,
      isPublished: false,
      order,
    });

    await ctx.db.insert("logs", {
      userId: (await ctx.auth.getUserIdentity())?.subject ?? "unknown",
      courseId: args.courseId,
      action: "CREATE_UNIT",
      timestamp: Date.now(),
    });

    return id;
  },
});

export const update = mutation({
  args: {
    courseId: v.id("courses"),
    data: v.object({
      id: v.id("units"),
      name: v.optional(v.string()),
      isPublished: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, args) => {
    const role = await getRequesterRole(ctx, args.courseId);
    assertEditorOrAdmin(role);

    const unit = await ctx.db.get(args.data.id);
    if (!(unit && unit.courseId === args.courseId)) throw new Error("Unit not found");

    await ctx.db.patch(args.data.id, {
      name: args.data.name ?? unit.name,
      isPublished: args.data.isPublished ?? unit.isPublished,
    });

    await ctx.db.insert("logs", {
      userId: (await ctx.auth.getUserIdentity())?.subject ?? "unknown",
      courseId: args.courseId,
      unitId: args.data.id,
      action: "UPDATE_UNIT",
      timestamp: Date.now(),
    });
  },
});

export const reorder = mutation({
  args: {
    courseId: v.id("courses"),
    data: v.array(
      v.object({
        id: v.id("units"),
        position: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const role = await getRequesterRole(ctx, args.courseId);
    assertEditorOrAdmin(role);

    // Update each unit order to the provided position
    for (const item of args.data) {
      const unit = await ctx.db.get(item.id);
      if (unit && unit.courseId === args.courseId && unit.order !== item.position) {
        await ctx.db.patch(item.id, { order: item.position });
      }
    }

    await ctx.db.insert("logs", {
      userId: (await ctx.auth.getUserIdentity())?.subject ?? "unknown",
      courseId: args.courseId,
      action: "REORDER_UNIT",
      timestamp: Date.now(),
    });
  },
});

export const remove = mutation({
  args: {
    courseId: v.id("courses"),
    id: v.id("units"),
  },
  handler: async (ctx, args) => {
    const role = await getRequesterRole(ctx, args.courseId);
    assertEditorOrAdmin(role);

    const unit = await ctx.db.get(args.id);
    if (!(unit && unit.courseId === args.courseId)) throw new Error("Unit not found");

    await ctx.db.delete(args.id);

    // Re-number remaining units
    const remaining = await ctx.db
      .query("units")
      .withIndex("by_course_and_order", (q) => q.eq("courseId", args.courseId))
      .order("asc")
      .collect();
    for (const [index, u] of remaining.entries()) {
      if (u.order !== index) await ctx.db.patch(u._id, { order: index });
    }

    await ctx.db.insert("logs", {
      userId: (await ctx.auth.getUserIdentity())?.subject ?? "unknown",
      courseId: args.courseId,
      unitId: args.id,
      action: "DELETE_UNIT",
      timestamp: Date.now(),
    });
  },
});


