import { useState } from "react";

interface ContributorCardProps {
  name: string;
  avatar: string;
  description: string;
}

export default function ContributorCard({
  name,
  avatar,
  description,
}: ContributorCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  function handleClick() {
    setIsExpanded(!isExpanded);
  }

  return (
    <div
      className={`cursor-pointer overflow-hidden rounded-lg bg-background shadow-md transition-all duration-300 ease-in-out ${
        isExpanded ? "max-h-[500px]" : "h-20"
      }`}
      onClick={handleClick}
    >
      <div
        className={`flex ${
          isExpanded ? "flex-col items-start" : "flex-row items-center"
        } p-4`}
      >
        <div
          className={`relative ${
            isExpanded ? "mb-4 aspect-4/3 w-full" : "h-10 w-10"
          } transition-all duration-300 ease-in-out`}
        >
          <img
            alt={`${name}'s avatar`}
            className={`object-cover transition-all duration-300 ease-in-out ${
              isExpanded ? "rounded-lg" : "rounded-full"
            }`}
            sizes={isExpanded ? "100vw" : "40px"}
            src={avatar}
          />
        </div>
        <div className={`${isExpanded ? "w-full" : "ml-4 grow"} flex flex-col`}>
          <h2 className="font-semibold text-lg">{name}</h2>
          {isExpanded && <p className="mt-2 text-gray-600">{description}</p>}
        </div>
      </div>
    </div>
  );
}
