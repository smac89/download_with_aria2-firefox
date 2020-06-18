function saveOption(event) {
    localStorage.setItem(event.target.id, event.target.value);
}

[
    {'id': 'jsonrpc', 'value': 'http://localhost:6800/jsonrpc', 'change': saveOption},
    {'id': 'token', 'value': '', 'change': saveOption},
    {'id': 'fileExt', 'value': '', 'change': saveOption},
    {'id': 'monitoredList', 'value': '', 'change': makePattern},
    {'id': 'ignoredList', 'value': '', 'change': makePattern}
].map(item => $('#' + item.id).val(localStorage.getItem(item.id) || item.value).on('change', item.change));

$('#aria2Check').on('click', (event) => {
    jsonRPCRequest(
        createJSON('aria2.getVersion'),
        (result) => {
            showNotification(result.version, 'Aria2 version');
        },
        (error, rpc) => {
            showNotification(error, rpc);
        }
    );
});

$('#aria2Show').on('click', (event) => {
    if ($('#aria2Show').hasClass('checked')) {
        $('#token').attr('type', 'password');
    }
    else {
        $('#token').attr('type', 'text');
    }
    $('#aria2Show').toggleClass('checked');
});

$('#capture').attr('checked', () => {
    var checked = JSON.parse(localStorage.getItem('capture')) || false;
    captureFilter(checked);
    return checked;
}).on('click', (event) => {
    captureFilter(event.target.checked);
    localStorage.setItem(event.target.id, event.target.checked);
    chrome.runtime.sendMessage({'capture': event.target.checked});
});

function captureFilter(checked) {
    if (checked) {
        $('#filters').show(100);
    }
    else {
        $('#filters').hide(100);
    }
}

function makePattern(event) {
    var pattern = event.target.value.split('\n').filter(item => item !== '');
    localStorage.setItem(event.target.id.replace('List', ''), JSON.stringify(pattern));
    saveOption(event);
}
