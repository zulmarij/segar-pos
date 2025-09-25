import { getCaraBayar } from "@/services/get-cara-bayar-service";
import { useQuery } from "@tanstack/react-query";

const getCaraBayarQuery = () => {
  return {
    queryKey: ["cara-bayar"],
    queryFn: () => getCaraBayar(),
  };
};

const useGetCaraBayar = () => {
  return useQuery(getCaraBayarQuery());
};

export { useGetCaraBayar, getCaraBayarQuery };
