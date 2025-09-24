import { Link } from "@tanstack/react-router";

export type Course = {
  _id: string;
  name: string;
  description?: string;
  unitLength?: number;
  imageUrl?: string;
};

type Props = {
  course: Course;
};

function CourseCard({ course }: Props) {
  return (
    <Link
      className="overflow-hidden rounded-lg bg-card shadow-md transition-shadow duration-200 hover:shadow-lg"
      params={{ id: course._id }}
      to="/course/$id"
    >
      {course.imageUrl ? (
        <img
          alt={course.name}
          className="h-48 w-full object-cover"
          loading="lazy"
          src={course.imageUrl}
        />
      ) : (
        <div className="flex h-48 w-full items-center justify-center bg-gray-100">
          <span className="text-muted-foreground">{course.name}</span>
        </div>
      )}

      <div className="p-4">
        <h3 className="mb-2 line-clamp-2 font-semibold text-foreground text-lg">
          {course.name}
        </h3>
        <p className="mb-3 line-clamp-3 text-muted-foreground text-sm">
          {course.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm">
            {course.unitLength ?? 0} units
          </span>
        </div>
      </div>
    </Link>
  );
}

export default CourseCard;
