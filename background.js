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
                item.referrer = tabs[0].url;
                captureAdd(item);
            });
        }
    }

    function captureAdd(item) {
        var captured = captureCheck(getDomain(item.referrer), item.filename.split('.').pop());
        if (captured) {
            browser.downloads.cancel(item.id, () => {
                browser.downloads.erase({'id': item.id}, () => {
                    downWithAria2(item.finalUrl, item.referrer);
                });
            });
        }
    }

    function getDomain(url) {
        var host = url.split(/[\/:]+/)[1];
        var temp = host.split('.').reverse();
        if ('com,net,org,edu,gov,co'.includes(temp[1])) {
            return temp[2] + '.' + temp[1] + '.' + temp[0];
        }
        return temp[1] + '.' + temp[0];
    }

    function captureCheck(domain, ext) {
        var ignored = localStorage.getItem('ignored');
        if (ignored && ignored.includes(domain)) {
            return false;
        }
        var monitored = localStorage.getItem('monitored');
        if (monitored && monitored.includes(domain)) {
            return true;
        }
        var fileExt = localStorage.getItem('fileExt');
        if (fileExt && fileExt.includes(ext)) {
            return true;
        }
        return false;
    }
});
