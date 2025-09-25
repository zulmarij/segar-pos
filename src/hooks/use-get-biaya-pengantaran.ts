import { getBiayaPengantaran } from "@/services/get-biaya-pengantaran-service";
import { useQuery } from "@tanstack/react-query";

const getBiayaPengantaranQuery = () => {
  return {
    queryKey: ["biaya-pengantaran"],
    queryFn: () => getBiayaPengantaran(),
  };
};

const useGetBiayaPengantaran = () => {
  return useQuery(getBiayaPengantaranQuery());
};

export { useGetBiayaPengantaran, getBiayaPengantaranQuery };
