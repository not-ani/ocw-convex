type Props = {
  value: string;
  onChange: (v: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
};

function SearchBar({
  value,
  onChange,
  onSubmit,
  placeholder = "Search courses...",
}: Props) {
  return (
    <form
      className="max-w-md"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
      role="search"
    >
      <label htmlFor="courses-search" className="sr-only">
        Search courses
      </label>
      <div className="flex">
        <input
          id="courses-search"
          className="flex-1 border border-input bg-background px-4 py-2 outline-none focus:border-primary focus:ring-2 focus:ring-ring"
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          type="search"
          value={value}
          autoComplete="off"
          aria-label="Search courses"
        />
      </div>
    </form>
  );
}

export default SearchBar;
