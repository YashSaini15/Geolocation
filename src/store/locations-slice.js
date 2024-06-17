import { createSlice } from "@reduxjs/toolkit";

const SavedLocationsSlice = createSlice({
  name: "savedLocations",
  initialState: [],
  reducers: {
    addLocation: (state, action) => {
      state.push(action.payload);
    },
    removeLocation: (state, action) => {
      return state.filter((location, index) => index !== action.payload);
    },
  },
});

export const { addLocation, removeLocation } = SavedLocationsSlice.actions;
export default SavedLocationsSlice;
