browser.contextMenus.create({
    'title': browser.i18n.getMessage('extension_name'),
    'id': 'downwitharia2firefox',
    'contexts': ['link']
});

browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'downwitharia2firefox') {
        downWithAria2(info.linkUrl, tab.url);
    }
});

browser.downloads.onCreated.addListener((item) => {
    var capture = JSON.parse(localStorage.getItem('capture')) || false;
    if (capture) {
        if (item.referrer) {
            captureAdd(item);
        }
        else {
            browser.tabs.query({'active': true, 'currentWindow': true}, (tabs) => {
                item.referrer = tab[0].url;
                captureAdd(item);
            });
        }
    }

    function captureAdd(item) {
        var captured = captureCheck(item.referrer.split('/')[2], item.filename.split('.').pop());
        if (captured) {
            browser.downloads.cancel(item.id, () => {
                browser.downloads.erase({id: item.id});
                downWithAria2(item.url, item.referrer);
            });
        }
    }

    function captureCheck(host, ext) {
        var ignored = localStorage.getItem('ignored');
        if (ignored && ignored !== '[]') {
            if (matchPattern(ignored, host)) {
                return false;
            }
        }
        var monitored = localStorage.getItem('monitored');
        if (monitored && monitored !== '[]') {
            if (matchPattern(monitored, host)) {
                return true;
            }
        }
        var fileExt = localStorage.getItem('fileExt');
        if (fileExt && fileExt !== '') {
            if (fileExt.includes(ext)) {
                return true;
            }
        }
        return false;
    }

    function matchPattern(pattern, string) {
        var match = JSON.parse(pattern).filter(item => string.includes(item));
        if (match.length !== 0) {
            return true;
        }
        return false;
    }
});
