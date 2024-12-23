import Post from "./Post.jsx";
import PostSkeleton from "../skeletons/PostSkeleton.jsx";

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

const Posts = ({ feedType, username, userId }) => {
  const getEndpoint = () => {
    switch (feedType) {
      case "forYou":
        return "/api/post";
      case "following":
        return "/api/post/following";
      case "posts":
        return `/api/post/user/${username}`;
      case "likes":
        return `/api/post/likes/${userId}`;
      default:
        return "/api/post";
    }
  };

  const POST_ENDPOINT = getEndpoint();

  const {
    data: post,
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
        console.log(data);
        if (!res.ok) {
          throw new Error(data.message || "An error occurred");
        }
        return data.posts;
      } catch (error) {
        throw new Error(error.message);
      }
    },
    retry: false,
    enabled: false,
  });

  useEffect(() => {
    refetch();
  }, [feedType, refetch, username]);

  console.log(post);
  return (
    <>
      {(isLoading || isRefetching) && (
        <div className="flex flex-col justify-center">
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      )}
      {!isLoading && post?.length === 0 && (
        <p className="text-center my-4">
          No hay publicaciones en esta pestaña. Cambia 👻
        </p>
      )}
      {!isLoading && post && (
        <div>
          {post.map((post) => (
            <Post key={post._id} post={post} />
          ))}
        </div>
      )}
    </>
  );
};
export default Posts;
