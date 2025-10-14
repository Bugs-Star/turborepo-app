"use client";

import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  CustomerService,
  type GetAllCustomersResponse,
} from "@/lib/api/customer";

export const useGetAllCustomers = (page = 1, limit = 15) =>
  useQuery<GetAllCustomersResponse, Error>({
    queryKey: ["customers", page, limit] as const,
    queryFn: () => CustomerService.getAll(page, limit),
    placeholderData: keepPreviousData, // v5: 이전 데이터 유지
    staleTime: 60_000,
  });
