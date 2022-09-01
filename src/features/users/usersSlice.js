import { createSlice } from "@reduxjs/toolkit";

const initialState = [
  {
    id: "0",
    name: "dude lebowski",
  },
  {
    id: "2",
    name: "neil young",
  },
  { id: "3", name: "dave grey" },
];

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
});

export const selectAllUsers = (state) => state.users;

// export const { postAdded } = usersSlice.actions;

export default usersSlice.reducer;
