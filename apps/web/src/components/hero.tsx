import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative h-[38vh]">
      <div className="container relative z-auto mx-auto flex flex-col gap-5 px-4 text-center">
        <h2 className="mb-8 font-extrabold text-4xl text-foreground sm:text-5xl lg:text-6xl">
          Your Life At Creek Made Easy
        </h2>
        <div className="flex flex-row items-center justify-center gap-20">
          {[
            { value: "26", label: "Classes" },
            { value: "1000+", label: "Resources" },
            { value: "3800+", label: "Students" },
          ].map((stat, index) => (
            <div className="flex flex-col items-center" key={index}>
              <span className="font-bold text-2xl sm:text-5xl">
                {stat.value}
              </span>
              <span className="text-md text-muted-foreground sm:text-lg">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
        <div className="flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
          <Button asChild className="" size="lg">
            <Link to="/courses">See All Courses</Link>
          </Button>
          <Button asChild className="" size="lg" variant="outline">
            <Link to="/about">Learn About Us</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
