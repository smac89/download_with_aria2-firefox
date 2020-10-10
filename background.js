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

var requests = [];
browser.downloads.onCreated.addListener((item) => {
    if (item.url.startsWith('blob')) {
        return;
    }
    var worker = {'url': item.url, 'saveAs': false, 'filename': item.filename.match(/[^\\]+$/i)[0]};
    var search = requests.indexOf(item.url);
    if (search !== -1) {
        requests = [...requests.slice(0, search), ...requests.slice(search + 1)];
        return;
    }
    browser.downloads.cancel(item.id, () => {
        browser.downloads.erase({'id': item.id}, () => {
            var capture = (localStorage.getItem('capture') | 0);
            if (capture > 0) {
                if (item.referrer) {
                    initiateCapture(capture, item);
                }
                else {
                    browser.tabs.query({'active': true, 'currentWindow': true}, (tabs) => {
                        item.referrer = tabs[0].url;
                        initiateCapture(capture, item);
                    });
                }
            }
            else {
                requests.push(item.url);
                browser.downloads.download(worker);
            }
        });
    });

    function initiateCapture(capture, item) {
        var xhr = new XMLHttpRequest();
        xhr.open('HEAD', item.url, true);
        xhr.onload = (event) => {
            item.fileSize = xhr.getResponseHeader('Content-Length');
            captureAdd(capture, item);
        };
        xhr.send();
    }

    function captureAdd(capture, item) {
        var domain = domainFromUrl(item.referrer);
        var check = captureCheck(domain, item.filename.split('.').pop(), item.fileSize);
        if (capture === 2 || check) {
            downWithAria2({'url': item.url, 'referer': item.referrer, 'domain': domain, 'filename': item.filename.match(/[^\\]+$/i)[0], 'path': item.filename.replace(/[^\\]+$/i, '')});
        }
        else {
            requests.push(item.url);
            browser.downloads.download(worker);
        }
    }

    function captureCheck(domain, ext, size) {
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
        var fileSize = (localStorage.getItem('fileSize') | 0);
        if (fileSize > 0 && size >= fileSize) {
            return true;
        }
        return false;
    }
});
