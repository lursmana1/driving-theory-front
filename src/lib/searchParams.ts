export type SearchParamsRecord = Record<
  string,
  string | string[] | undefined
>;

export function searchParamsToRecord(
  searchParams: SearchParamsRecord | undefined,
): Record<string, string> {
  if (!searchParams) return {};

  const record: Record<string, string> = {};
  for (const [key, value] of Object.entries(searchParams)) {
    if (value === undefined) continue;
    record[key] = Array.isArray(value) ? value[0] ?? "" : value;
  }
  return record;
}

export function buildCategoryPickerQuery(
  searchParams: Record<string, string>,
  categoryId: number,
): string {
  const params = new URLSearchParams(searchParams);
  params.set("category", String(categoryId));
  return params.toString();
}
