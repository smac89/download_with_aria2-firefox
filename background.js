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
    var search = requests.indexOf(worker.url);
    if (search !== -1) {
        requests = [...requests.slice(0, search), ...requests.slice(search + 1)];
        return;
    }
    browser.downloads.cancel(item.id, () => {
        browser.downloads.erase({'id': item.id}, () => {
            var capture = (localStorage.getItem('capture') | 0);
            if (capture > 0) {
                if (item.referrer) {
                    captureAdd(capture, item);
                }
                else {
                    browser.tabs.query({'active': true, 'currentWindow': true}, (tabs) => {
                        item.referrer = tabs[0].url;
                        captureAdd(capture, item);
                    });
                }
            }
            else {
                resumeDownload(worker);
            }
        });
    });

    function captureAdd(capture, item) {
        item.domain = domainFromUrl(item.referrer);
        var ignored = localStorage.getItem('ignored');
        if (ignored && ignored.includes(item.domain)) {
            return resumeDownload(worker);
        }
        var monitored = localStorage.getItem('monitored');
        if (monitored && monitored.includes(item.domain)) {
            return aria2Download(item);
        }
        item.fileExt = item.filename.split('.').pop();
        var fileExt = localStorage.getItem('fileExt');
        if (fileExt && fileExt.includes(item.fileExt)) {
            return aria2Download(item);
        }
        var fileSize = (localStorage.getItem('fileSize') | 0);
        var xhr = new XMLHttpRequest();
        xhr.open('HEAD', item.url, true);
        xhr.onload = (event) => {
            item.fileSize = xhr.getResponseHeader('Content-Length');
            if (fileSize > 0 && item.fileSize >= fileSize) {
                aria2Download(item);
            }
            else {
                resumeDownload(worker);
            }
        };
        xhr.send();
    }

    function resumeDownload(worker) {
        requests.push(worker.url);
        browser.downloads.download(worker);
    }

    function aria2Download(item) {
        downWithAria2({'url': item.url, 'referer': item.referrer, 'domain': item.domain, 'filename': item.filename.match(/[^\\]+$/i)[0], 'path': item.filename.replace(/[^\\]+$/i, '')});
    }
});
