import { DEFAULT_QUERY_PARAMS } from "@/constants/common.constants"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getDefaultsQueryParams = () => {
  return {
    page: DEFAULT_QUERY_PARAMS.PAGE,
    limit: DEFAULT_QUERY_PARAMS.LIMIT,
    sort: DEFAULT_QUERY_PARAMS.SORT,
    sortOrder: DEFAULT_QUERY_PARAMS.SORT_ORDER,
  } as const;
}
