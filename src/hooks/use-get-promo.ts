import { useQuery } from "@tanstack/react-query";
import { getPromo } from "@/services/get-promo-service";

const getPromoQuery = () => {
  return {
    queryKey: ["promo"],
    queryFn: () => getPromo(),
  };
};

const useGetPromo = () => {
  return useQuery(getPromoQuery());
};

export { useGetPromo, getPromoQuery };
