$('#addTask_btn, #cancel_btn').on('click', (event) => {
    $('#addTask_btn, #cancel_btn, #addTaskWindow').toggle();
    $('#addMore_btn, #taskInput').show();
    $('#addLess_btn, #taskBatch').hide();
    $('#taskInput, #taskBatch').val('');
});

$('#purdge_btn').on('click', (event) => {
    jsonRPCRequest(createJSON('aria2.purgeDownloadResult'));
});

$('#addMore_btn, #addLess_btn').on('click', (event) => {
    $('#addMore_btn, #addLess_btn, #taskInput, #taskBatch').toggle();
});

$('#submit_btn').on('click', (event) => {
    var url = $('#taskBatch').val() || $('#taskInput').val();
    var json = url.split('\n').filter(item => item !== '').map(item => downWithAria2(item));
    $('#addTask_btn').show();
    $('#cancel_btn, #addTaskWindow').hide();
    $('#taskInput, #taskBatch').val('');
});

$('#active_btn, #waiting_btn, #stopped_btn').on('click', (event) => {
    var active = '#' + event.target.id;
    var activeQueue = active.replace('_btn', 'Queue');
    var inactive = ['#active_btn', '#waiting_btn', '#stopped_btn'].filter(item => item !== active).join(', ');
    var inactiveQueue = ['#allTaskQueue', '#activeQueue', '#waitingQueue', '#stoppedQueue'].filter(item => item !== activeQueue).join(', ');
    if ($(active).hasClass('checked')) {
        $('#allTaskQueue').show();
        $(activeQueue).hide();
    }
    else {
        $(inactive).removeClass('checked');
        $(activeQueue).show();
        $(inactiveQueue).hide();
    }
    $(active).toggleClass('checked');
});

$('#options_btn').on('click', (event) => {
    open('options.html', '_blank');
});

$('div.taskQueue').on('click', '#remove_btn', (event) => {
    var taskInfo = $('div.taskInfo').has($(event.target));
    var status = taskInfo.attr('status'), gid = taskInfo.attr('gid');
    if (['active', 'waiting', 'paused'].includes(status)) {
        var method = 'aria2.forceRemove';
    }
    else if (['complete', 'error', 'removed'].includes(status)) {
        method = 'aria2.removeDownloadResult';
    }
    else {
        console.log(status);
    }
    jsonRPCRequest(createJSON(method, {'gid': gid}));
}).on('click', 'div.progress', (event) => {
    var taskInfo = $('div.taskInfo').has($(event.target));
    var status = taskInfo.attr('status'), gid = taskInfo.attr('gid');
    if (['active', 'waiting'].includes(status)) {
        var method = 'aria2.pause';
    }
    else if (['complete', 'error', 'removed'].includes(status)) {
        method = 'aria2.removeDownloadResult';
    }
    else if (status === 'paused') {
        method = 'aria2.unpause';
    }
    else {
        console.log(status);
    }
    jsonRPCRequest(createJSON(method, {'gid': gid}));
}).on('click', '#show_btn', (event) => {
    clearInterval(keepFilesAlive);
    var taskInfo = $('div.taskInfo').has($(event.target));
    var status = taskInfo.attr('status'), gid = taskInfo.attr('gid'), name = taskInfo.attr('name');
    $('#showTaskFiles').html('<div id="showTask" class="taskName status button ' + status + '">' + name + '</div><hr><div id="showFiles"></div>').show();
    printTaskFiles(gid);
    keepFilesAlive = setInterval(() => {
        printTaskFiles(gid);
    }, 1000);
});

$('#showTaskFiles').on('click', '#showTask', (event) => {
    clearInterval(keepFilesAlive);
    $('#showTaskFiles').hide();
});

function printTaskFiles(gid) {
    jsonRPCRequest(
        createJSON('aria2.tellStatus', {'gid': gid}),
        (result) => {
            if (result.bittorrent && result.bittorrent.info && result.bittorrent.info.name) {
                var name = result.bittorrent.info.name;
            }
            else {
                name = result.files[0].path.split('/').pop();
            }
            var taskFiles = result.files.map((item, index) => item = '<tr><td>'
            +   multiDecimalNumber(index + 1, 3) + '</td><td style="text-align: left;">'
            +   item.path.split('/').pop() + '</td><td>'
            +   bytesToFileSize(item.length) + '</td><td>'
            +   ((item.completedLength / item.length * 10000 | 0) / 100).toString() + '%</td></tr>'
            );
            $('#showTaskFiles').html('<div id="showTask" class="taskName status button ' + result.status + '">' + name + '</div><hr>'
            +   '<div id="showFiles"><table>'
            +       '<tr><td>' + window['task_file_index'] + '</td><td>' + window['task_file_name'] + '</td><td>' + window['task_download_size'] + '</td><td>' + window['task_complete_ratio'] + '</td></tr>'
            +       taskFiles.join('')
            +   '</table></div>');
        }
    );
}

function printTaskInfo(result) {
    var downloadSpeed = bytesToFileSize(result.downloadSpeed);
    var totalLength = bytesToFileSize(result.totalLength);
    var completedLength = bytesToFileSize(result.completedLength);
    var estimatedTime = secondsToHHMMSS((result.totalLength - result.completedLength) / result.downloadSpeed);
    var completeRatio = ((result.completedLength / result.totalLength * 10000 | 0) / 100).toString() + '%';
    if (result.bittorrent && result.bittorrent.info && result.bittorrent.info.name) {
        var taskName = result.bittorrent.info.name;
    }
    else {
        taskName = result.files[0].path.split('/').pop();
    }
    if (result.bittorrent) {
        var uploadSpeed = bytesToFileSize(result.uploadSpeed);
        var seedsInfo = ' (' + result.numSeeders + ' ' + window['task_bit_seeders'] + ')';
        var uploadInfo = ', ⇧: ' + uploadSpeed + '/s';
    }
    else {
        seedsInfo = '';
        uploadInfo = '';
    }
    return '<div class="taskInfo" gid="' + result.gid + '" status="' + result.status + '" name="' + taskName + '">'
    +          '<div><span class="taskName">' + taskName + '</span> <span id="show_btn" class="button">👁️</span> <span id="remove_btn" class="button">❌</span></div>'
    +          '<div>' + window['task_download_size'] + ': ' + completedLength + '/' + totalLength + ', ' + window['task_estimated_time'] + ': ' + estimatedTime + '</div>'
    +          '<div class="' + result.status + '_info">' + window['task_connections'] + ': ' + result.connections + seedsInfo + ', ⇩: ' + downloadSpeed + '/s' + uploadInfo + '</div>'
    +          '<div class="progress ' + result.status + '_bar"><span class="' + result.status + '" style="width: ' + completeRatio + '">' + completeRatio + '</span></div>'
    +      '</div>'
}

function printTaskQueue(globalWaiting, globalStopped) {
    jsonRPCRequest([
        createJSON('aria2.tellActive'),
        createJSON('aria2.tellWaiting', {'params': [0, globalWaiting]}),
        createJSON('aria2.tellStopped', {'params': [0, globalStopped]}),
    ], (activeQueue, waitingQueue, stoppedQueue) => {
        var active = activeQueue.map(item => printTaskInfo(item));
        var waiting = waitingQueue.map(item => printTaskInfo(item));
        var stopped = stoppedQueue.map(item => printTaskInfo(item));
        $('#allTaskQueue').html([...active, ...waiting, ...stopped].join('<hr>'));
        $('#activeQueue').html(active.join('<hr>'));
        $('#waitingQueue').html(waiting.join('<hr>'));
        $('#stoppedQueue').html(stopped.join('<hr>'));
    });
}

function printMainFrame() {
    jsonRPCRequest(
        createJSON('aria2.getGlobalStat'),
        (result) => {
            var downloadSpeed = bytesToFileSize(result.downloadSpeed) + '/s';
            var uploadSpeed = bytesToFileSize(result.uploadSpeed) + '/s';
            var active = (result.numActive | 0);
            var waiting = (result.numWaiting | 0);
            var stopped = (result.numStopped | 0);
            $('#numActive').html(active);
            $('#numWaiting').html(waiting);
            $('#numStopped').html(stopped);
            $('#downloadSpeed').html(downloadSpeed);
            $('#uploadSpeed').html(uploadSpeed);
            $('#globalHeader, #globalMenu').show();
            $('#globalError').hide();
            printTaskQueue(waiting, stopped);
        }, (error, rpc) => {
            $('#globalHeader, #globalMenu').hide();
            $('#globalError').show().html(error);
        }
    );
}

printMainFrame();
var keepContentAlive = setInterval(printMainFrame, 1000);
var keepFilesAlive;