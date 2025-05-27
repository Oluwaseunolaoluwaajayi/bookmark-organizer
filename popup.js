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
  function loadBookmarks(query = "") {
    chrome.storage.local.get("bookmarks", (data) => {
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
    });
  }

  // Show/hide add form
  showAddFormButton.onclick = () => {
    addForm.style.display = addForm.style.display === "none" ? "block" : "none";
    if (addForm.style.display === "block") {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        bookmarkTitleInput.value = tabs[0].title;
        bookmarkTagsInput.value = "";
      });
    }
  };

  // Save bookmark
  saveBookmarkButton.onclick = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const url = tabs[0].url;
      const title = bookmarkTitleInput.value;
      const tags = bookmarkTagsInput.value
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t);
      if (title && url) {
        chrome.storage.local.get("bookmarks", (data) => {
          const bookmarks = data.bookmarks || [];
          bookmarks.push({ title, url, tags });
          chrome.storage.local.set({ bookmarks }, () => {
            loadBookmarks();
            addForm.style.display = "none";
            bookmarkTitleInput.value = "";
            bookmarkTagsInput.value = "";
          });
        });
      }
    });
  };

  // Cancel form
  cancelBookmarkButton.onclick = () => {
    addForm.style.display = "none";
    bookmarkTitleInput.value = "";
    bookmarkTagsInput.value = "";
  };

  // Delete a bookmark
  function deleteBookmark(index) {
    chrome.storage.local.get("bookmarks", (data) => {
      const bookmarks = data.bookmarks || [];
      bookmarks.splice(index, 1);
      chrome.storage.local.set({ bookmarks }, () => {
        loadBookmarks();
      });
    });
  }

  // Real-time search
  searchInput.addEventListener("input", (e) => {
    loadBookmarks(e.target.value);
  });

  // Initial load
  loadBookmarks();
});