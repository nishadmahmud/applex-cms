import { createSlice } from "@reduxjs/toolkit";

const STORAGE_KEY = "recentLinks";
const MAX_LINKS = 8;

// Function to load the initial state from localStorage
const loadInitialState = () => {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error("Error loading recent links from localStorage", error);
    }
  }
  return [];
};

const recentSlice = createSlice({
  name: "recent",
  initialState: loadInitialState(),
  reducers: {
    addRecentLink: (state, action) => {
      const { name, link } = action.payload;
      const newLink = { name, link, timestamp: Date.now() };

      // 1. Filter out the link if it already exists
      const filtered = state.filter((item) => item.link !== link);

      // 2. Add the new link to the front
      const updatedLinks = [newLink, ...filtered];

      // 3. Trim the list
      const finalLinks = updatedLinks.slice(0, MAX_LINKS);

      // 4. Update Redux State (this is the new list)
      state.splice(0, state.length, ...finalLinks);

      // 5. Sync to LocalStorage (for persistence)
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(finalLinks));
        } catch (error) {
          console.error("Error writing recent links to localStorage", error);
        }
      }
    },
    clearRecentLinks: (state) => {
      state.splice(0, state.length); // Clear Redux State

      // Clear LocalStorage
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
          console.error("Error clearing recent links from localStorage", error);
        }
      }
    },
  },
});

export const { addRecentLink, clearRecentLinks } = recentSlice.actions;
export default recentSlice.reducer;

// Selector to easily access the recent links array
export const selectRecentLinks = (state) => state.recent;
