import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

const useFollow = () => {
  const queryClient = useQueryClient();
  const { mutate: followUser, isPending } = useMutation({
    mutationFn: async (userId) => {
      try {
        const token = localStorage.getItem("jwt");
        const res = await fetch(`/api/user/followUnfollowUser/${userId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "An error occurred");
        }
        return data;
      } catch (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["usersSuggest"] }),
        queryClient.invalidateQueries({ queryKey: ["authUser"] }),
      ]);
      toast.success("User followed!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return { followUser, isPending };
};

export default useFollow;
