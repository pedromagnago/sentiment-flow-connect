import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useSuggestedActionDetails = (actionId?: string | null) => {
  return useQuery({
    queryKey: ["suggested-action-details", actionId],
    queryFn: async () => {
      if (!actionId) return null;

      const { data, error } = await supabase
        .from("suggested_actions")
        .select("*")
        .eq("id", actionId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching suggested action:", error);
        return null;
      }

      return data;
    },
    enabled: !!actionId,
  });
};
