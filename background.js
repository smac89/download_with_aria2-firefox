chrome.contextMenus.create({
    'title': chrome.i18n.getMessage('extension_name'),
    'id': 'downwitharia2firefox',
    'contexts': ['link']
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'downwitharia2firefox') {
        downWithAria2(info.linkUrl, tab.url);
    }
});

function captureToggle(checked) {
    if (checked) {
        chrome.webRequest.onHeadersReceived.addListener(
            captureDownload, {
                'urls': ['<all_urls>'],
                types: ['main_frame', 'sub_frame']
            },
            ['blocking', 'responseHeaders']
        );
    }
    else {
        chrome.webRequest.onResponseStarted.removeListener(captureDownload);
    }
}

function captureDownload(details) {
    var download = details.responseHeaders.filter(item => 
        ['application', 'video', 'audio', 'image', 'font', 'text'].includes(item.value.split('/')[0])
    );
    if (download[0]) {
        var pageUrl = details.documentUrl || details.initiator || 'null';
        var referer = pageUrl === 'null' ? details.url.match(/^https?:\/\/[^\/]+\//)[0] : pageUrl;
        var captured = captureCheck(referer.split('/')[2], details.url.split(/[\/\.]/g).pop(), details.responseHeaders.filter(item => item.name === 'Content-Length')[0].value);
        if (captured) {
            downWithAria2(details.url, referer);
            return {cancel: true};
        }
    }

    function captureCheck(host, ext, size) {
        var ignored = localStorage.getItem('ignored');
        if (ignored && ignored !== '[]') {
            if (matchPattern(ignored, host)) {
                return false;
            }
        }
        var fileExt = localStorage.getItem('fileExt');
        if (fileExt && fileExt !== '') {
            if (fileExt.includes(ext)) {
                return true;
            }
        }
        var fileSize = localStorage.getItem('fileSize');
        if (fileSize && fileSize > 0) {
            if (size >= fileSize) {
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
}

chrome.runtime.onMessage.addListener((message, sender) => {
    captureToggle(message.capture);
});

captureToggle(JSON.parse(localStorage.getItem('capture')) || false);
