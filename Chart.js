function getChartDataFromLocalStorage() {
  const savedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
  
  // Lấy số công việc hoàn thành theo ngày
  const statsByDay = {};

  savedTasks.forEach(task => {
    const day = task.date || new Date().toLocaleDateString(); // hoặc lưu ngày khi thêm task
    if (!statsByDay[day]) statsByDay[day] = { done: 0, total: 0 };
    statsByDay[day].total++;
    if (task.done) statsByDay[day].done++;
  });

  const labels = Object.keys(statsByDay);
  const data = Object.values(statsByDay).map(d => d.done);

  return { labels, data };
}

const chartData = getChartDataFromLocalStorage();

const taskChart = new Chart(document.getElementById('taskChart'), {
  type: 'bar',
  data: {
    labels: chartData.labels,
    datasets: [{
      label: 'Công việc hoàn thành',
      data: chartData.data,
      backgroundColor: '#6cb4f3'
    }]
  }
});
function updateChart() {
  const chartData = getChartDataFromLocalStorage();
  console.log("Dữ liệu biểu đồ:", chartData);
  taskChart.data.labels = chartData.labels;
  taskChart.data.datasets[0].data = chartData.data;
  taskChart.update();
}
