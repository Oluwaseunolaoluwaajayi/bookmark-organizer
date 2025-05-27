document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("search");
  const showAddFormButton = document.getElementById("showAddForm");
  const addForm = document.getElementById("addForm");
  const bookmarkTitleInput = document.getElementById("bookmarkTitle");
  const bookmarkTagsInput = document.getElementById("bookmarkTags");
  const saveBookmarkButton = document.getElementById("saveBookmark");
  const cancelBookmarkButton = document.getElementById("cancelBookmark");
  const bookmarkList = document.getElementById("bookmarkList");

  // Load and display bookmarks
  async function loadBookmarks(query = "") {
    const data = await browser.storage.local.get("bookmarks");
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
      deleteBtn.onclick = () => deleteBookmark(index);
      li.appendChild(deleteBtn);
      bookmarkList.appendChild(li);
    });
  }

  // Show/hide add form
  showAddFormButton.onclick = async () => {
    addForm.style.display = addForm.style.display === "none" ? "block" : "none";
    if (addForm.style.display === "block") {
      const tabs = await browser.tabs.query({ active: true, currentWindow: true });
      bookmarkTitleInput.value = tabs[0].title;
      bookmarkTagsInput.value = "";
    }
  };

  // Save bookmark
  saveBookmarkButton.onclick = async () => {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    const url = tabs[0].url;
    const title = bookmarkTitleInput.value;
    const tags = bookmarkTagsInput.value
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t);
    if (title && url) {
      const data = await browser.storage.local.get("bookmarks");
      const bookmarks = data.bookmarks || [];
      bookmarks.push({ title, url, tags });
      await browser.storage.local.set({ bookmarks });
      await loadBookmarks();
      addForm.style.display = "none";
      bookmarkTitleInput.value = "";
      bookmarkTagsInput.value = "";
    }
  };

  // Cancel form
  cancelBookmarkButton.onclick = () => {
    addForm.style.display = "none";
    bookmarkTitleInput.value = "";
    bookmarkTagsInput.value = "";
  };

  // Delete a bookmark
  async function deleteBookmark(index) {
    const data = await browser.storage.local.get("bookmarks");
    const bookmarks = data.bookmarks || [];
    bookmarks.splice(index, 1);
    await browser.storage.local.set({ bookmarks });
    await loadBookmarks();
  }

  // Real-time search
  searchInput.addEventListener("input", (e) => {
    loadBookmarks(e.target.value);
  });

  // Initial load
  loadBookmarks();
});