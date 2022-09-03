import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "../features/api/apiSlice";
import usersReducer from "../features/users/usersSlice";
// import counterReducer from "../features/counter/counterSlice";
// import postReducer from "../features/posts/postsSlice";

export const store = configureStore({
  reducer: {
    // counter: counterReducer,
    // posts: postReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
    users: usersReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});
