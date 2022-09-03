import { useSelector } from "react-redux";
import { selectPostIds } from "./postsSlice";
import { useGetPostsQuery } from "./postsSlice";
import PostsExcerpt from "./PostsExcerpt";

const PostsList = () => {
  const orderedPostIds = useSelector(selectPostIds);
  const { isLoading, isSuccess, isError, error } = useGetPostsQuery();

  // const posts = useSelector(selectAllPosts);
  // const error = useSelector(getPostsError);
  // const postStatus = useSelector(getPostsStatus);

  // let content;
  // if (postStatus === "loading") {
  //   content = <p>"Loading..."</p>;
  // } else if (postStatus === "succeeded") {
  //   // const orderedPosts = posts
  //   //   .slice()
  //   //   .sort((a, b) => b.date.localeCompare(a.date));
  //   // content = orderedPosts.map((post) => (
  //   //   <PostsExcerpt key={post.id} post={post} />
  //   // ));
  //   content = orderedPostIds.map((postId) => (
  //     <PostsExcerpt key={postId} postId={postId} />
  //   ));
  // } else if (postStatus === "failed") {
  //   content = <p>{error}</p>;
  // }

  let content;
  if (isLoading) {
    content = <p>"Loading..."</p>;
  } else if (isSuccess) {
    content = orderedPostIds.map((postId) => (
      <PostsExcerpt key={postId} postId={postId} />
    ));
  } else if (isError) {
    content = <p>{error}</p>;
  }

  return <section>{content}</section>;
};
export default PostsList;
