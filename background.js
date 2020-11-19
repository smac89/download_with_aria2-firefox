browser.contextMenus.create({
    'title': browser.i18n.getMessage('extension_name'),
    'id': 'downwitharia2firefox',
    'contexts': ['link']
});

browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'downwitharia2firefox') {
        downWithAria2({'url': info.linkUrl, 'referer': tab.url, 'domain': domainFromUrl(tab.url)});
    }
});

browser.downloads.onCreated.addListener((item) => {
    var capture = (localStorage.getItem('capture') | 0);
    if (capture === 0 || item.url.match(/^(blob|data)/)) {
        return;
    }

    var session = {'url': item.url, 'filename': item.filename.match(/[^\\]+$/i)[0], 'path': item.filename.replace(/[^\\]+$/i, '')};
    chrome.tabs.query({'active': true, 'currentWindow': true}, (tabs) => {
        session.referer = item.referrer || tabs[0].url;
        session.domain = domainFromUrl(session.referer);
        if (capture === 2) {
            return captureDownload();
        }
        var ignored = localStorage.getItem('ignored') || '';
        if (ignored.includes(session.domain)) {
            return;
        }
        var monitored = localStorage.getItem('monitored') || '';
        if (monitored.includes(session.domain)) {
            return captureDownload();
        }
        var fileExt = localStorage.getItem('fileExt') || '';
        if (fileExt.includes(item.filename.split('.').pop())) {
            return captureDownload();
        }
        var fileSize = (localStorage.getItem('fileSize') | 0);
        if (fileSize !== 0 && item.fileSize >= fileSize) {
            return captureDownload();
        }
    });

    function captureDownload() {
        chrome.downloads.cancel(item.id, () => {
            chrome.downloads.erase({'id': item.id}, () => {
                downWithAria2(session);
            });
        });
    }
});

function displayActiveTaskNumber() {
    jsonRPCRequest(
        {'method': 'aria2.getGlobalStat'},
        (result) => {
            if (result.numActive !== '0') {
                browser.browserAction.setBadgeText({'text': result.numActive});
                browser.browserAction.setBadgeBackgroundColor({'color': '#3CC'});
            }
            else {
                browser.browserAction.setBadgeText({'text': ''});
            }
        }
    )
}

displayActiveTaskNumber();
var activeTaskNumber = setInterval(displayActiveTaskNumber, 1000);
