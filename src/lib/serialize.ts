/**
 * Deep serializes Prisma objects to plain JSON-safe objects.
 * Converts Decimal to number, Date to ISO string.
 */
export function serialize<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_key, value) => {
      // Handle Decimal
      if (value !== null && typeof value === "object" && "toNumber" in value) {
        return Number(value);
      }
      return value;
    }),
  );
}
