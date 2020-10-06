var url = 'https://geo-tracking-dc7aa.firebaseio.com/plan-growth/plan-growth.json';
var options = {
    title: 'Plan Growth Chart',
    hAxis: { title: 'Year', titleTextStyle: { color: '#333' } },
    vAxis: { minValue: 0 },
    colors: ['#343a40']

};

google.charts.load('current', { 'packages': ['corechart'] });
google.charts.setOnLoadCallback(drawChart);

function loadChartDate(data) {
    var dataTable = new google.visualization.DataTable();
    dataTable.addColumn('string', 'year');
    dataTable.addColumn('number', 'count');

    for (var i = 0; i < data.length; i++) {
        dataTable.addRow([data[i].year, data[i].count]);
    }
    //var data = new google.visualization.DataTable(data);
    var chart = new google.visualization.AreaChart(document.getElementById('chart_div'));
    chart.draw(dataTable, options);
};

function drawChart() {
    fetch(url)
        .then(function (res) {
            return res.json();
        })
        .then(function (data) {
            console.log('From web', data);
            loadChartDate(data);
        });

    // if ('indexedDB' in window) {
    //     readAllData('plan-growth')
    //         .then(function (data) {
    //             if (!networkDataReceived) {
    //                 console.log('From cache', data);
    //                 loadChartDate(data);
    //             }
    //         });
    // };
};

fetch('https://geo-tracking-dc7aa.firebaseio.com/plan-growth/plan-growth.json', {
    method: 'PUT',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    body: JSON.stringify({
        count: 100,
        year: 2059
    })
})
    .then(function (res) {
        console.log('Sent data', res);
        updateUI();
    })


// if ('serviceWorker' in navigator && 'SyncManager' in window) {
//     navigator.serviceWorker.ready
//         .then(function (sw) {
//             var post = {
//                 id: new Date().toISOString(),
//                 year: 2020,
//                 count: 20000
//             };
//             writeData('sync-posts', post)
//                 .then(function () {
//                     return sw.sync.register('sync-new-posts');
//                 })
//                 .then(function () {
//                     // var snackbarContainer = document.querySelector('#confirmation-toast');
//                     // var data = { message: 'Your Post was saved for syncing!' };
//                     // snackbarContainer.MaterialSnackbar.showSnackbar(data);
//                 })
//                 .catch(function (err) {
//                     console.log(err);
//                 });
//         });
// }