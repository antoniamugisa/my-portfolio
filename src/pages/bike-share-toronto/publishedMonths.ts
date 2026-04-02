/**
 * Months that exist on the Bike Share Parquet host (`/parquets/${month}.parquet`).
 * Update when you upload new parquets; avoids prefetch / requests for missing files.
 */
export const PUBLISHED_MONTHS: readonly string[] = [
  '2017-07', '2017-08', '2017-09',
  '2018-05', '2018-06', '2018-07', '2018-08', '2018-09',
  '2019-06', '2019-07', '2019-08', '2019-09',
  '2020-07', '2020-08', '2020-09',
  '2021-06', '2021-07', '2021-08', '2021-09',
  '2022-06', '2022-07', '2022-08', '2022-09',
  '2023-06', '2023-07', '2023-08', '2023-09',
  '2024-06', '2024-07', '2024-08', '2024-09',
  '2025-01', '2025-02', '2025-03', '2025-04',
  '2025-05', '2025-06', '2025-07', '2025-08',
  '2025-09', '2025-10', '2025-11',
];

const publishedSet = new Set<string>(PUBLISHED_MONTHS);

export function isPublishedParquetMonth(month: string): boolean {
  return publishedSet.has(month);
}
