import { useQuery } from "@tanstack/react-query";
import { getPengantaran } from "@/services/get-pengantaran-service";

const getPengantaranQuery = () => {
  return {
    queryKey: ["pengantaran"],
    queryFn: () => getPengantaran(),
  };
};

const useGetPengantaran = () => {
  return useQuery(getPengantaranQuery());
};

export { useGetPengantaran, getPengantaranQuery };
