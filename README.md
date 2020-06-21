## Differences compared to [Download with Aria2 Chromium](https://github.com/jc3213/download_with_aria2-chromium/blob/master/README.md)

- Moved to `downloads.onCreated` event handler, but works the same as `downloads.onDeterminingFilename` on Chrome
- Cancel the download first before removing it from history to prevent downloading the file twice
- Removed capture filter `File Sze`, since the value of `downloadItem.fileSize` property is `-1` on Firefox
- Changed all `chrome` to `browser` for Firefox
