/** biome-ignore-all lint/nursery/useImageSize: this ain't nextjs bro lock in  */
/** biome-ignore-all lint/performance/noImgElement: */
import { api } from "@ocw-convex/backend/convex/_generated/api";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/courses")({
  component: RouteComponent,
});

const COURSES_PER_PAGE = 10;

function RouteComponent() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const coursesData = useQuery(api.courses.getPaginatedCourses, {
    page: currentPage,
    limit: COURSES_PER_PAGE,
    search: searchQuery || undefined,
  });

  const courses = coursesData?.courses || [];
  const totalPages = coursesData?.totalPages || 1;
  const totalCourses = coursesData?.totalCourses || 0;

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    if (currentPage > 1) {
      buttons.push(
        <Button
          className="rounded-l-md px-3 py-2 font-medium text-sm"
          key="prev"
          onClick={() => goToPage(currentPage - 1)}
        >
          Previous
        </Button>
      );
    }

    // First page
    if (startPage > 1) {
      buttons.push(
        <Button
          className="px-3 py-2 font-medium text-sm"
          key={1}
          onClick={() => goToPage(1)}
        >
          1
        </Button>
      );
      if (startPage > 2) {
        buttons.push(
          <span
            className="border border-gray-300 bg-background px-3 py-2 font-medium text-gray-500 text-sm"
            key="ellipsis1"
          >
            ...
          </span>
        );
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <Button
          className={`border px-3 py-2 font-medium text-sm ${
            i === currentPage
              ? "border-blue-500 bg-blue-50 text-blue-600"
              : "border-gray-300 bg-background text-gray-500 hover:bg-gray-50 hover:text-gray-700"
          }`}
          key={i}
          onClick={() => goToPage(i)}
        >
          {i}
        </Button>
      );
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(
          <span
            className="border border-gray-300 bg-background px-3 py-2 font-medium text-gray-500 text-sm"
            key="ellipsis2"
          >
            ...
          </span>
        );
      }
      buttons.push(
        <Button
          className="border border-gray-300 bg-background px-3 py-2 font-medium text-gray-500 text-sm hover:bg-gray-50 hover:text-gray-700"
          key={totalPages}
          onClick={() => goToPage(totalPages)}
        >
          {totalPages}
        </Button>
      );
    }

    // Next button
    if (currentPage < totalPages) {
      buttons.push(
        <Button
          className="rounded-r-md px-3 py-2 font-medium text-sm"
          key="next"
          onClick={() => goToPage(currentPage + 1)}
        >
          Next
        </Button>
      );
    }

    return buttons;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-4 font-bold text-3xl text-foreground">
            Browse Courses
          </h1>
          <p className="text-muted-foreground">
            Discover {totalCourses} courses across various subjects
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <form className="max-w-md" onSubmit={handleSearch}>
            <div className="flex">
              <input
                className="flex-1 rounded-l-md border border-input bg-background px-4 py-2 outline-none focus:border-primary focus:ring-2 focus:ring-ring"
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses..."
                type="text"
                value={searchQuery}
              />
              <button
                className="rounded-r-md bg-primary px-6 py-2 text-primary-foreground hover:bg-primary/90 focus:ring-2 focus:ring-ring focus:ring-offset-2"
                type="submit"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Loading State */}
        {coursesData === undefined && (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
          </div>
        )}

        {/* Courses Grid */}
        {coursesData && (
          <div>
            {courses.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-lg text-muted-foreground">
                  {searchQuery
                    ? `No courses found for "${searchQuery}"`
                    : "No courses available"}
                </p>
              </div>
            ) : (
              <div>
                <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {courses.map((course) => (
                    <div
                      className="overflow-hidden rounded-lg bg-card shadow-md transition-shadow duration-200 hover:shadow-lg"
                      key={course._id}
                    >
                      <img
                        alt={course.name}
                        className="h-48 w-full object-cover"
                        src={course.imageUrl}
                      />
                      <div className="p-4">
                        <h3 className="mb-2 line-clamp-2 font-semibold text-foreground text-lg">
                          {course.name}
                        </h3>
                        <p className="mb-3 line-clamp-3 text-muted-foreground text-sm">
                          {course.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground text-sm">
                            {course.unitLength} units
                          </span>
                          <Link
                            className="rounded bg-primary px-3 py-1 text-primary-foreground text-sm transition-colors hover:bg-primary/90"
                            params={{
                              id: course._id,
                            }}
                            to={"/course/$id"}
                          >
                            View Course
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex flex-col items-center space-y-4">
                    <div className="flex items-center space-x-1">
                      {renderPaginationButtons()}
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Showing page {currentPage} of {totalPages} ({totalCourses}{" "}
                      total courses)
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
