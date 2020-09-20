$('#tabBasic, #tabAdvanced, #tabDownload').click((event) => {
    var check = '#' + event.target.id;
    var menu = check.replace('tab', 'menu');
    var uncheck = ['#tabBasic', '#tabAdvanced', '#tabDownload'].filter(item => item !== check).join(', ');
    var hide = ['#menuBasic', '#menuAdvanced', '#menuDownload'].filter(item => item !== menu).join(', ');
    $(uncheck).removeClass('checked');
    $(hide).hide();
    $(check).addClass('checked');
    $(menu).show();
});

[
    {'id': 'jsonrpc', 'value': 'http://localhost:6800/jsonrpc'},
    {'id': 'token', 'value': ''},
    {'id': 'useragent', 'value': navigator.userAgent},
    {'id': 'allproxy', 'value': ''},
    {'id': 'proxied', 'value': ''},
    {'id': 'capture', 'value': 0},
    {'id': 'fileExt', 'value': ''},
    {'id': 'monitored', 'value': ''},
    {'id': 'ignored', 'value': ''}
].map(item => initiateOption(item));

$('#aria2Check').on('click', (event) => {
    jsonRPCRequest(
        {'method': 'aria2.getVersion'},
        (result) => {
            showNotification(window['warn_aria2_version'], result.version);
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

function initiateOption(option) {
    if (option.checkbox) {
        $('#' + option.id).prop('checked', JSON.parse(localStorage.getItem(option.id)) || option.value).on('change', event => localStorage.setItem(event.target.id, event.target.checked));
    }
    else {
        $('#' + option.id).val(localStorage.getItem(option.id) || option.value).on('change', event => option.change ? option.change(event) : localStorage.setItem(event.target.id, event.target.value));
    }
}
