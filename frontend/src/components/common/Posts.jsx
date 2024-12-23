import Post from "./Post.jsx";
import PostSkeleton from "../skeletons/PostSkeleton.jsx";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

const Posts = ({ feedType, username, userId }) => {
  const getEndpoint = () => {
    switch (feedType) {
      case "forYou":
        return "/api/post";
      case "posts":
        return `/api/post/user/${username}`;
      case "likes":
        return `/api/post/likes/${userId}`;
      case "following":
        return "/api/post/following";
      default:
        return "/api/post";
    }
  };

  const POST_ENDPOINT = getEndpoint();

  const {
    data: posts,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      try {
        const token = localStorage.getItem("jwt");
        const res = await fetch(`http://localhost:3000${POST_ENDPOINT}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include", // Esto asegura que las cookies se envíen si usas cookies para la sesión
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
  });

  useEffect(() => {
    if (feedType) {
      refetch(); // Refetch cuando 'feedType' cambie
    }
  }, [feedType, refetch, username]);

  return (
    <>
      {(isLoading || isRefetching) && (
        <div className="flex flex-col justify-center">
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      )}
      {!isLoading && posts.data?.length === 0 && (
        <p className="text-center my-4">No hay posteos en esta ventana 👻</p>
      )}
      {!isLoading && posts && (
        <div>
          {posts.data.map((post) => (
            <Post key={post._id} post={post} />
          ))}
        </div>
      )}
    </>
  );
};
export default Posts;
