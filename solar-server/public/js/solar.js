function generateHourLabels() {
  var labels = [];
  for (var h = 0; h < 24; ++h) {
    labels.push(`${h}:00`);
  }
  return labels;
}

function generateWeekdayLabels(start_index) {
  var labels = [];
  var days_of_week = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  var h = start_index;
  do {
    labels.push(days_of_week[h]);
    h = (h+1) % 7;
  } while (h != start_index);
  return labels;
}

function generateDayOfMonthLabels(start_date, num_days) {
  var labels = [];
  for (var i = 0; i < num_days; ++i) {
    labels.push((start_date.month()+1) + '/' + (start_date.date()));
    start_date.add(1, 'day');
  }
  return labels;
}

function generateMonthLabels(start_date) {
  var labels = [];
  var months = ['Jan', 'Feb', 'Mar', 'Apr', 
                'May', 'Jun', 'Jul', 'Aug', 'Sep', 
                'Oct', 'Nov', 'Dec'];
  for (var i = 0; i < 12; ++i) {
    labels.push(months[start_date.month()] + ' ' + start_date.year());
    start_date.add(1, 'month');
  }
  return labels;
}

function displayChart(elementId, title, xAxisLabel, labels, solar_data) {
  if (solar_data.length != labels.length) {
    console.error(`Size mismatch between data (${solar_data.length}) and labels (${labels.length}!`);
    return;
  }
  var formatted_data = [];
  for (dp of solar_data) {
    formatted_data.push(Number(dp.toFixed(2)));
  }
  var ctx = document.getElementById(elementId).getContext('2d');
  return new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          data: formatted_data,
          backgroundColor: "rgba(54, 180, 235, 0.3)",
          borderWidth: 1
        }]
      },
      options: {
        title: {
          display: true,
          text: title,
          fontSize: 16,
          fontFamily: "Times",
          fontColor: 'black'
        },
        scales: {
          yAxes: [{
            ticks: {
                beginAtZero: true
            },
            scaleLabel: {
              labelString: 'kWh',
              display: true
            }
          }],
          xAxes: [{
            scaleLabel: {
              labelString: xAxisLabel,
              display: true
            }
          }]
        },
        legend: {
          display: false
        }
      }
  });
}

function queryAndDisplayChart(start_date, num_datapoints, aggregation, callback) {
  $.getJSON(`/query?agg=${aggregation}&year=${start_date.year()}&month=${start_date.month()+1}&day=${start_date.date()}&hour=${start_date.hours()}&num=${num_datapoints}`, function(res) {
    if (res.status != 'OK') {
      console.log('Received error from server: ' + res.description);
      return;
    }
    callback(res.data);
  }); 
}