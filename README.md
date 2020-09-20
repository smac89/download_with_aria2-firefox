## Differences compared to [Download with Aria2 Chromium](https://github.com/jc3213/download_with_aria2-chromium)

- Published on [AMO](https://addons.mozilla.org/en-US/firefox/addon/downwitharia2/)

- Differences
    - Moved to `downloads.onCreated` event handler, but works the same as `downloads.onDeterminingFilename` on Chrome
    - Exclusive feature: Ability to choose download folder for `3` options
        1. Native (Aria2 download folder)
        2. Browser (Browser download folder)
        3. Custom (Custom folder)
    - Cancel the download first before removing it from history to prevent downloading the file twice
    - Disabled `File Size` filter because `downloadItem.fileSize` property is `-1` on Firefox
        - See https://bugzilla.mozilla.org/show_bug.cgi?id=1666137 for more details
    - Changed all `chrome` to `browser` for Firefox
