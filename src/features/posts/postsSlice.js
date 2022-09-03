import { createSelector, createEntityAdapter } from "@reduxjs/toolkit";
import { sub } from "date-fns";
import { apiSlice } from "../api/apiSlice";

const postsAdapter = createEntityAdapter({
  sortComparer: (a, b) => b.date.localeCompare(a.date),
});

const initialState = postsAdapter.getInitialState();

export const extendedApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPosts: builder.query({
      query: () => "/posts",
      transformResponse: (responseData) => {
        let min = 1;
        const loadedPosts = responseData.map((post) => {
          if (!post?.date)
            post.date = sub(new Date(), { minutes: min++ }).toISOString();
          if (!post?.reactions)
            post.reactions = {
              thumbsUp: 0,
              wow: 0,
              heart: 0,
              rocket: 0,
              coffee: 0,
            };
          return post;
        });
        return postsAdapter.setAll(initialState, loadedPosts);
      },
      providesTags: (result, error, arg) => [
        { type: "Post", id: "LIST" },
        ...result.ids.map((id) => ({ type: "Post", id })),
      ],
    }),
    getPostsByUserId: builder.query({
      query: (id) => `/posts/?userId=${id}`,
      transformResponse: (responseData) => {
        let min = 1;
        const loadedPosts = responseData.map((post) => {
          if (!post?.date)
            post.date = sub(new Date(), { minutes: min++ }).toISOString();
          if (!post?.reactions)
            post.reactions = {
              thumbsUp: 0,
              wow: 0,
              heart: 0,
              rocket: 0,
              coffee: 0,
            };
          return post;
        });
        return postsAdapter.setAll(initialState, loadedPosts);
      },
      providesTags: (result, error, arg) => [
        ...result.ids.map((id) => ({ type: "Post", id })),
      ],
    }),
    addNewPost: builder.mutation({
      query: (initialPost) => ({
        url: "/posts",
        method: "POST",
        body: {
          ...initialPost,
          userId: Number(initialPost.userId),
          date: new Date().toISOString(),
          reactions: {
            thumbsUp: 0,
            wow: 0,
            heart: 0,
            rocket: 0,
            coffee: 0,
          },
        },
      }),
      invalidatesTags: [{ type: "Post", id: "LIST" }],
    }),
    updatePost: builder.mutation({
      query: (initialPost) => ({
        url: `/posts/${initialPost.id}`,
        method: "PUT",
        body: {
          ...initialPost,
          date: new Date().toISOString(),
        },
      }),
      invalidatesTags: (result, error, arg) => [{ type: "Post", id: arg.id }],
    }),
    deletePost: builder.mutation({
      query: ({ id }) => ({
        url: `/posts/${id}`,
        method: "DELETE",
        body: { id },
      }),
      invalidatesTags: (result, error, arg) => [{ type: "Post", id: arg.id }],
    }),
    addReaction: builder.mutation({
      query: ({ postId, reactions }) => ({
        url: `posts/${postId}`,
        method: "PATCH",
        // In a real app, we'd probably need to base this on user ID somehow
        // so that a user can't do the same reaction more than once
        body: { reactions },
      }),
      async onQueryStarted(
        { postId, reactions },
        { dispatch, queryFulfilled }
      ) {
        // `updateQueryData` requires the endpoint name and cache key arguments,
        // so it knows which piece of cache state to update
        const patchResult = dispatch(
          extendedApiSlice.util.updateQueryData(
            "getPosts",
            undefined,
            (draft) => {
              // The `draft` is Immer-wrapped and can be "mutated" like in createSlice
              const post = draft.entities[postId];
              if (post) post.reactions = reactions;
            }
          )
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
  }),
});

// const initialState = postsAdapter.getInitialState({
//   status: "idle",
//   error: null,
//   count: 0,
// });

// const POSTS_URL = "https://jsonplaceholder.typicode.com/posts";

// export const fetchPosts = createAsyncThunk("posts/fetchPosts", async () => {
//   const response = await axios.get(POSTS_URL);
//   return response.data;
// });

// export const addNewPost = createAsyncThunk(
//   "posts/addNewPost",
//   async (initialPost) => {
//     const response = await axios.post(POSTS_URL, initialPost);
//     return response.data;
//   }
// );

// export const updatePost = createAsyncThunk(
//   "posts/updatePost",
//   async (initialPost) => {
//     const { id } = initialPost;
//     try {
//       const response = await axios.put(`${POSTS_URL}/${id}`, initialPost);
//       return response.data;
//     } catch (err) {
//       // return err.message;
//       return initialPost; // for testing purpose
//     }
//   }
// );

// export const deletePost = createAsyncThunk(
//   "post/deletePost",
//   async (initialPost) => {
//     const { id } = initialPost;
//     try {
//       const response = await axios.delete(`${POSTS_URL}/${id}`);
//       if (response?.status === 200) return initialPost;
//       return `${response.status}: ${response?.statusText}`;
//     } catch (err) {
//       console.log(err);
//     }
//   }
// );

// const postSlice = createSlice({
//   name: "posts",
//   initialState,
//   reducers: {
//     // postAdded: {
//     //   reducer: (state, action) => {
//     //     state.posts.push(action.payload);
//     //   },
//     //   prepare: (title, content, userId) => {
//     //     return {
//     //       payload: {
//     //         id: nanoid(),
//     //         title,
//     //         content,
//     //         date: new Date().toISOString(),
//     //         userId,
//     //         reactions: {
//     //           thumbsUp: 0,
//     //           wow: 0,
//     //           heart: 0,
//     //           rocket: 0,
//     //           coffee: 0,
//     //         },
//     //       },
//     //     };
//     //   },
//     // },
//     reactionAdded: (state, action) => {
//       const { postId, reaction } = action.payload;
//       // const existingPost = state.posts.find((post) => post.id === postId);
//       const existingPost = state.entities[postId];
//       if (existingPost) {
//         existingPost.reactions[reaction]++;
//       }
//     },
//     increaseCount: (state, action) => {
//       state.count = state.count + 1;
//     },
//   },
//   extraReducers(builder) {
//     builder
//       .addCase(fetchPosts.pending, (state, action) => {
//         state.status = "loading";
//       })
//       .addCase(fetchPosts.fulfilled, (state, action) => {
//         state.status = "succeeded";
//         // Adding date and reactions
//         let min = 1;
//         const loadedPosts = action.payload.map((post) => {
//           post.date = sub(new Date(), { minutes: min++ }).toISOString();
//           post.reactions = {
//             thumbsUp: 0,
//             wow: 0,
//             heart: 0,
//             rocket: 0,
//             coffee: 0,
//           };
//           return post;
//         });

//         // state.posts = state.posts.concat(loadedPosts);
//         postsAdapter.upsertMany(state, loadedPosts);
//       })
//       .addCase(fetchPosts.rejected, (state, action) => {
//         state.status = "failed";
//         state.error = action.error.message;
//       })
//       .addCase(addNewPost.fulfilled, (state, action) => {
//         // Fix for API post IDs:
//         // Creating sortedPosts & assigning the id
//         // would be not be needed if the fake API
//         // returned accurate new post IDs
//         const sortedPosts = state.posts.sort((a, b) => {
//           if (a.id > b.id) return 1;
//           if (a.id < b.id) return -1;
//           return 0;
//         });
//         action.payload.id = sortedPosts[sortedPosts.length - 1].id + 1;
//         // End fix for fake API post IDs

//         action.payload.userId = Number(action.payload.userId);
//         action.payload.date = new Date().toISOString();
//         action.payload.reactions = {
//           thumbsUp: 0,
//           wow: 0,
//           heart: 0,
//           rocket: 0,
//           coffee: 0,
//         };

//         // state.posts.push(action.payload);
//         postsAdapter.addOne(state, action.payload);
//       })
//       .addCase(updatePost.fulfilled, (state, action) => {
//         if (!action.payload?.id) {
//           console.log("update failed");
//           return;
//         }
//         // const { id } = action.payload;
//         // const posts = state.posts.filter((post) => post.id !== id);
//         // state.posts = [...posts, action.payload];
//         action.payload.date = new Date().toISOString();
//         postsAdapter.upsertOne(state, action.payload);
//       })
//       .addCase(deletePost.fulfilled, (state, action) => {
//         if (!action.payload?.id) {
//           console.log("Delete could not complete");
//           return;
//         }
//         // const posts = state.posts.filter((post) => post.id !== id);
//         // state.posts = posts;
//         const { id } = action.payload;
//         postsAdapter.removeOne(state, id);
//       });
//   },
// });

export const {
  useGetPostsQuery,
  useGetPostsByUserIdQuery,
  useAddNewPostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
  useAddReactionMutation,
} = extendedApiSlice;

export const selectPostsResult = extendedApiSlice.endpoints.getPosts.select();

const selectPostsData = createSelector(
  selectPostsResult,
  (postResult) => postResult.data
);

export const {
  selectAll: selectAllPosts,
  selectById: selectPostById,
  selectIds: selectPostIds,
} = postsAdapter.getSelectors(
  (state) => selectPostsData(state) ?? initialState
);

// export const getPostsError = (state) => state.posts.error;
// export const getPostsStatus = (state) => state.posts.status;
// export const getCount = (state) => state.posts.count;
// export const selectAllPosts = (state) => state.posts.posts;
// export const selectPostById = (state, postId) =>
//   state.posts.posts.find((post) => post.id === postId);

// export const selectPostsByUser = createSelector(
//   [selectAllPosts, (state, userId) => userId],
//   (posts, userId) => posts.filter((post) => post.userId === userId)
// );

// export const { increaseCount, reactionAdded } = postSlice.actions;

// export default postSlice.reducer;
