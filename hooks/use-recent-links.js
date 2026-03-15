import { useState, useEffect } from "react";

const STORAGE_KEY = "recentLinks";
const MAX_LINKS = 8; // Max number of links to store

export function useRecentLinks() {
  const [recentLinks, setRecentLinks] = useState([]);

  // Effect to load data from localStorage once on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setRecentLinks(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error reading recent links from localStorage", error);
    }
  }, []);

  // Function to add a new link and update state/storage
  const addRecentLink = (name, link) => {
    const newLink = { name, link, timestamp: Date.now() };

    setRecentLinks((prevLinks) => {
      // 1. Remove if already exists (to prevent duplicates and move to top)
      const filtered = prevLinks.filter((item) => item.link !== link);

      // 2. Add the new link to the front
      const updatedLinks = [newLink, ...filtered];

      // 3. Trim the list
      const finalLinks = updatedLinks.slice(0, MAX_LINKS);

      // 4. Save to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(finalLinks));
      } catch (error) {
        console.error("Error writing recent links to localStorage", error);
      }

      return finalLinks;
    });
  };

  // Function to clear all links (used in AppHeader)
  const clearRecentLinks = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setRecentLinks([]);
    } catch (error) {
      console.error("Error clearing recent links from localStorage", error);
    }
  };

  return { recentLinks, addRecentLink, clearRecentLinks };
}
