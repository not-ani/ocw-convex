import { v } from "convex/values";
import { query } from "./_generated/server";

export const getPaginatedCourses = query({
  args: {
    page: v.number(),
    limit: v.number(),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { page, limit, search } = args;
    const offset = (page - 1) * limit;

    let allCourses;

    // Apply search if provided
    if (search && search.trim()) {
      allCourses = await ctx.db
        .query("courses")
        .withSearchIndex("search_name", (q) => q.search("name", search.trim()))
        .collect();
    } else {
      // Filter to only show public courses when not searching
      allCourses = await ctx.db
        .query("courses")
        .withIndex("by_is_public", (q) => q.eq("isPublic", true))
        .collect();
    }

    const totalCourses = allCourses.length;
    const totalPages = Math.ceil(totalCourses / limit);

    // Get paginated results
    const courses = allCourses.slice(offset, offset + limit);

    return {
      courses,
      totalCourses,
      totalPages,
      currentPage: page,
    };
  },
});

export const getCourseById = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.courseId);
    if (!(course && course.isPublic)) {
      return null;
    }
    return course;
  },
});

export const getCourseWithUnitsAndLessons = query({
  args: { id: v.id("courses") },
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.id);

    if (!course) {
      return null;
    }

    const units = await ctx.db
      .query("units")
      .withIndex("by_course_and_order", (q) => q.eq("courseId", course._id))
      .filter((q) => q.eq(q.field("isPublished"), true))
      .collect();

    const unitsWithLessons = await Promise.all(
      units.map(async (unit) => {
        const lessons = await ctx.db
          .query("lessons")
          .withIndex("by_unit_id", (q) => q.eq("unitId", unit._id))
          .collect();

        return {
          id: unit._id,
          order: unit.order,
          name: unit.name,
          lessons: lessons.map((lesson) => ({
            id: lesson._id,
            name: lesson.name,
            contentType: lesson.contentType,
          })),
        };
      })
    );

    return { ...course, units: unitsWithLessons };
  },
});

export const getDashboardSummary = query({
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

    if (!(membership && (membership.role === "admin" || membership.role === "editor"))) {
      return null;
    }

    const course = await ctx.db.get(args.courseId);
    if (!course) return null;

    const units = await ctx.db
      .query("units")
      .withIndex("by_course_id", (q) => q.eq("courseId", course._id))
      .collect();

    const lessons = await ctx.db
      .query("lessons")
      .withIndex("by_course_id", (q) => q.eq("courseId", course._id))
      .collect();

    const publishedUnits = units.filter((u) => u.isPublished).length;
    const publishedLessons = lessons.filter((l) => l.isPublished).length;

    const last10Logs = await ctx.db
      .query("logs")
      .withIndex("by_course_id", (q) => q.eq("courseId", course._id))
      .order("desc")
      .take(10);

    return {
      course: { id: course._id, name: course.name, description: course.description },
      counts: {
        units: units.length,
        lessons: lessons.length,
        publishedUnits,
        publishedLessons,
      },
      recentActivity: last10Logs.map((l) => ({
        id: l._id,
        action: l.action,
        timestamp: l.timestamp ?? l._creationTime,
        userId: l.userId,
      })),
    } as const;
  },
});
