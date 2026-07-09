export const formatDate = (
  date: string | Date,
  options?: Intl.DateTimeFormatOptions
) => {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  });
};