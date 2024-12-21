import Post from "./Post.jsx";
import PostSkeleton from "../skeletons/PostSkeleton.jsx";
import { POSTS } from "../../utils/db/dummy.js";
import { useQuery } from "@tanstack/react-query";

const Posts = ({ feedType }) => {
  const isLoading = false;

  const POST_ENDPOINT =
    feedType === "forYou" ? "/api/posts/all" : "/api/posts/following";

  const { data: POSTS, isLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      try {
        const res = await fetch(getPostEndpoint);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "An error occurred");
        }
        return data.posts;
      } catch (error) {
        throw new Error(error.message);
      }
    },
    retry: false,
  });

  return (
    <>
      {isLoading && (
        <div className="flex flex-col justify-center">
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      )}
      {!isLoading && POSTS?.length === 0 && (
        <p className="text-center my-4">No posts in this tab. Switch 👻</p>
      )}
      {!isLoading && POSTS && (
        <div>
          {POSTS.map((post) => (
            <Post key={post._id} post={post} />
          ))}
        </div>
      )}
    </>
  );
};
export default Posts;
