import { useQuery } from "@tanstack/react-query";
import { getHargaGalon } from "@/services/get-harga-galon-service";

const getHargaGalonQuery = () => {
  return {
    queryKey: ["harga-galon"],
    queryFn: () => getHargaGalon(),
  };
};

const useGetHargaGalon = () => {
  return useQuery(getHargaGalonQuery());
};

export { useGetHargaGalon, getHargaGalonQuery };
