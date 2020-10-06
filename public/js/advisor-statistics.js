var url = 'https://geo-tracking-dc7aa.firebaseio.com/plan-growth.json';

function drawChart() {
    fetch(url)
        .then(function (res) {
            return res.json();
        })
        .then(function (data) {
            $('#table_id').DataTable({
                "processing": true,
                "ajax": {
                    "url": "https://api.myjson.com/bins/14t4g",
                    dataSrc: ''
                },
                "columns": [{
                    "data": "id"
                }, {
                    "data": "name"
                }, {
                    "data": "lat"
                }, {
                    "data": "lon"
                }]
            });
        });
};