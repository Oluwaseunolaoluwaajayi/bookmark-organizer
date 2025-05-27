document.addEventListener("DOMContentLoaded", () => {
  // Fallback to chrome or browser API
  const api = typeof chrome !== "undefined" ? chrome : (typeof browser !== "undefined" ? browser : null);
  console.log("API initialized:", api ? (api === chrome ? "chrome" : "browser") : "null");
  console.log("chrome defined:", typeof chrome !== "undefined");
  console.log("browser defined:", typeof browser !== "undefined");

  if (!api) {
    console.error("No API available (neither chrome nor browser defined)");
    alert("Extension error: Browser API not available. Please check console for details.");
    return;
  }

  const searchInput = document.getElementById("search");
  const showAddFormButton = document.getElementById("showAddForm");
  const addForm = document.getElementById("addForm");
  const bookmarkTitleInput = document.getElementById("bookmarkTitle");
  const bookmarkTagsInput = document.getElementById("bookmarkTags");
  const saveBookmarkButton = document.getElementById("saveBookmark");
  const cancelBookmarkButton = document.getElementById("cancelBookmark");
  const bookmarkList = document.getElementById("bookmarkList");

  // Check for missing DOM elements
  if (!searchInput || !showAddFormButton || !addForm || !bookmarkTitleInput || !bookmarkTagsInput || !saveBookmarkButton || !cancelBookmarkButton || !bookmarkList) {
    console.error("Missing DOM elements:", {
      searchInput, showAddFormButton, addForm, bookmarkTitleInput,
      bookmarkTagsInput, saveBookmarkButton, cancelBookmarkButton, bookmarkList
    });
    return;
  }

  // Load and display bookmarks
  async function loadBookmarks(query = "") {
    try {
      const data = await api.storage.local.get("bookmarks");
      console.log("Loaded bookmarks:", data);
      bookmarkList.innerHTML = "";
      const bookmarks = data.bookmarks || [];
      const filtered = bookmarks.filter(
        (bm) =>
          bm.title.toLowerCase().includes(query.toLowerCase()) ||
          bm.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()))
      );
      filtered.forEach((bm, index) => {
        const li = document.createElement("li");
        li.innerHTML = `<a href="${bm.url}" target="_blank">${bm.title}</a> <span>[${bm.tags.join(", ")}]</span>`;
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.addEventListener("click", () => deleteBookmark(index));
        li.appendChild(deleteBtn);
        bookmarkList.appendChild(li);
      });
    } catch (error) {
      console.error("Error loading bookmarks:", error);
      alert("Failed to load bookmarks: " + error.message);
    }
  }

  // Show/hide add form
  showAddFormButton.addEventListener("click", async () => {
    console.log("Toggling form, current display:", addForm.style.display);
    addForm.style.display = addForm.style.display === "none" ? "block" : "none";
    if (addForm.style.display === "block") {
      try {
        const tabs = await api.tabs.query({ active: true, currentWindow: true });
        console.log("Active tab:", tabs[0]);
        bookmarkTitleInput.value = tabs[0]?.title || "";
        bookmarkTagsInput.value = "";
      } catch (error) {
        console.error("Error fetching tab:", error);
        alert("Failed to get tab info: " + error.message);
      }
    }
  });

  // Save bookmark
  saveBookmarkButton.addEventListener("click", async () => {
    try {
      console.log("Save button clicked");
      const tabs = await api.tabs.query({ active: true, currentWindow: true });
      const url = tabs[0]?.url;
      const title = bookmarkTitleInput.value.trim() || "Untitled Bookmark";
      console.log("Saving bookmark:", { title, url });
      if (!url || url.startsWith("chrome://") || url.startsWith("about:") || url.startsWith("moz-extension://")) {
        console.error("Invalid URL:", url);
        alert("Cannot bookmark this page (restricted URL).");
        return;
      }
      const tags = bookmarkTagsInput.value
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t);
      const data = await api.storage.local.get("bookmarks");
      const bookmarks = data.bookmarks || [];
      bookmarks.push({ title, url, tags });
      await api.storage.local.set({ bookmarks });
      console.log("Bookmark saved:", { title, url, tags });
      await loadBookmarks();
      addForm.style.display = "none";
      bookmarkTitleInput.value = "";
      bookmarkTagsInput.value = "";
    } catch (error) {
      console.error("Error saving bookmark:", error);
      alert("Failed to save bookmark: " + error.message);
    }
  });

  // Cancel form
  cancelBookmarkButton.addEventListener("click", () => {
    console.log("Cancel button clicked");
    addForm.style.display = "none";
    bookmarkTitleInput.value = "";
    bookmarkTagsInput.value = "";
  });

  // Delete a bookmark
  async function deleteBookmark(index) {
    try {
      const data = await api.storage.local.get("bookmarks");
      const bookmarks = data.bookmarks || [];
      bookmarks.splice(index, 1);
      await api.storage.local.set({ bookmarks });
      console.log("Bookmark deleted at index:", index);
      await loadBookmarks();
    } catch (error) {
      console.error("Error deleting bookmark:", error);
    }
  }

  // Real-time search
  searchInput.addEventListener("input", (e) => {
    console.log("Search query:", e.target.value);
    loadBookmarks(e.target.value);
  });

  // Initial load
  loadBookmarks();
});