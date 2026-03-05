import { useMemo } from "react";
import { useAuthStore } from "../features/auth/useAuthStore";
import { dataService } from "../services/dataService";

export const useCurrentClient = () => {
  const selectedClientId = useAuthStore((state) => state.selectedClientId);

  return useMemo(() => dataService.getClientById(selectedClientId), [selectedClientId]);
};
