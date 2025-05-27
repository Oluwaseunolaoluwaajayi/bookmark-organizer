# Bookmark Organizer Extension
A Chrome/Firefox extension to save, tag, and search bookmarks quickly, addressing issues with forgetting bookmark names and slow searches.

## Features
- Save bookmarks with custom titles and optional tags.
- Search bookmarks by title or tag in real-time.
- Click bookmarks to open in a new tab.
- Delete bookmarks from the list.

## Installation
1. Clone or download: `git clone https://github.com/Oluwaseunolaoluwaajayi/bookmark-organizer.git`
2. Download `browser-polyfill.js` from [Mozilla WebExtension polyfill](https://github.com/mozilla/webextension-polyfill) and place it in the project folder.
3. **For Chrome**:
   - Go to `chrome://extensions/`, enable "Developer mode," click "Load unpacked."
   - Select the `bookmark-organizer` folder.
4. **For Firefox**:
   - Go to `about:debugging#/runtime/this-firefox`, click "Load Temporary Add-on."
   - Select any file in the `bookmark-organizer` folder (e.g., `manifest.json`).

## Files
- `manifest.json`: Extension configuration with Chrome/Firefox support.
- `popup.html`: Popup UI with search and add form.
- `popup.css`: Styles with black "Add Current Page" button.
- `popup.js`: Logic for saving, searching, and deleting bookmarks.
- `browser-polyfill.js`: Ensures cross-browser compatibility (download separately).

## Requirements
- Chrome 88+ or Firefox 57+.
- `browser-polyfill.js` for full cross-browser compatibility.
