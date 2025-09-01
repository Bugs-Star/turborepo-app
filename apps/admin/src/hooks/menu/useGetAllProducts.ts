import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import {
  ProductsService,
  GetProductsParams,
  GetProductsResponse,
} from "@/lib/api/products";

export const useGetAllProducts = (params?: GetProductsParams) => {
  const options: UseQueryOptions<GetProductsResponse, Error> = {
    queryKey: ["products", params],
    queryFn: () => ProductsService.getAll(params),
    staleTime: 1000 * 60 * 5, // 5분 캐시
  };

  return useQuery(options);
};
