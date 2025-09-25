import { useQuery } from "@tanstack/react-query";
import { getJumlahGalon } from "@/services/get-jumlah-galon-service";

const getJumlahGalonQuery = () => {
  return {
    queryKey: ["jumlah-galon"],
    queryFn: () => getJumlahGalon(),
  };
};

const useGetJumlahGalon = () => {
  return useQuery(getJumlahGalonQuery());
};

export { useGetJumlahGalon, getJumlahGalonQuery };
