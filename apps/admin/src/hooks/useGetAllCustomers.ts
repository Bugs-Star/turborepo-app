"use client";

import { CustomerService, GetAllCustomersResponse } from "@/lib/customer";
import { useQuery } from "@tanstack/react-query";
``;

export const useGetAllCustomers = (page = 1, limit = 15) => {
  return useQuery<GetAllCustomersResponse, Error>({
    queryKey: ["customers", page, limit],
    queryFn: () => CustomerService.getAll(page, limit),
    staleTime: 1000 * 60,
  });
};
