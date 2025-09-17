import { api } from "@ocw-convex/backend/convex/_generated/api";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { useCallback, useState, useEffect } from "react";
import CourseCard from "@/components/courses/course-card";
import Pagination from "@/components/courses/pagination";
import SearchBar from "@/components/courses/search-bar";
import { useDebouncedValue } from "@/hooks/use-debounce";

export const Route = createFileRoute("/_marketing/courses")({
  component: CoursesPage,
});

const COURSES_PER_PAGE = 12;

function CoursesPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput, 300);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const coursesData = useQuery(api.courses.getPaginatedCourses, {
    page: currentPage,
    limit: COURSES_PER_PAGE,
    search: debouncedSearch || undefined,
  });

  const courses = coursesData?.courses ?? [];
  const totalPages = coursesData?.totalPages ?? 1;
  const totalCourses = coursesData?.totalCourses ?? 0;

  const goToPage = useCallback(
    (page: number) => {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [setCurrentPage]
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
  }, []);

  if (!coursesData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <SearchBar
            value={searchInput}
            onChange={handleSearchChange}
            onSubmit={() => setCurrentPage(1)}
          />
        </div>

        {courses.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-lg text-muted-foreground">
              {debouncedSearch
                ? `No courses found for "${debouncedSearch}"`
                : "No courses available"}
            </p>
          </div>
        ) : (
          <div>
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {courses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex flex-col items-center space-y-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={goToPage}
                />
                <p className="text-muted-foreground text-sm">
                  Showing page {currentPage} of {totalPages} ({totalCourses}{" "}
                  total courses)
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default CoursesPage;
