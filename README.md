##Difference to [Download with Aria2 Chromium](https://github.com/jc3213/download_with_aria2-chromium/blob/master/README.md)

- Cancel download first before remove it from history to prevent downloading the file twice
- Removed capture filter `File Sze`, since Firefox doesn't provide `downloadItem.fileSize` (-1)
- Changed all `chrome` to `browser` for Firefox
