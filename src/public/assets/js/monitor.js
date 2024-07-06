const chartConfigs = {
  cpu: { data: [], chart: null, color: "rgba(48, 209, 88, 0.5)" },
  memory: { data: [], chart: null, color: "rgba(255, 204, 0, 0.5)" },
  responseTime: { data: [], chart: null, color: "rgba(10, 132, 255, 0.5)" },
  connections: { data: [], chart: null, color: "rgba(94, 92, 230, 0.5)" },
};

function createChart(ctx, label) {
  return new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: label,
          data: [],
          backgroundColor: chartConfigs[label].color,
          borderColor: chartConfigs[label].color,
          fill: true,
          tension: 0.4,
          borderWidth: 1,
          pointRadius: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { display: false },
        y: {
          display: false,
          beginAtZero: true,
          suggestedMax: label === "cpu" ? 100 : undefined,
        },
      },
      animation: { duration: 0 },
    },
  });
}

function updateChart(chart, newValue) {
  const now = new Date();
  chart.data.labels.push(now.toLocaleTimeString());
  chart.data.datasets[0].data.push(newValue);
  if (chart.data.labels.length > 60) {
    chart.data.labels.shift();
    chart.data.datasets[0].data.shift();
  }
  chart.update("none");
}

function initCharts() {
  chartConfigs.cpu.chart = createChart(
    document.getElementById("cpuChart").getContext("2d"),
    "cpu"
  );
  chartConfigs.memory.chart = createChart(
    document.getElementById("memoryChart").getContext("2d"),
    "memory"
  );
  chartConfigs.responseTime.chart = createChart(
    document.getElementById("responseTimeChart").getContext("2d"),
    "responseTime"
  );
  chartConfigs.connections.chart = createChart(
    document.getElementById("connectionsChart").getContext("2d"),
    "connections"
  );
}

async function fetchStats() {
  try {
    const startTime = performance.now();
    const response = await fetch("/api/server-stats");
    const data = await response.json();
    const endTime = performance.now();
    const clientResponseTime = endTime - startTime;
    console.log(data);

    document.getElementById("cpuUsage").textContent = `${data.cpuUsage.toFixed(
      1
    )}%`;
    document.getElementById("memoryUsage").textContent = `${(
      data.memoryUsage /
      (1024 * 1024)
    ).toFixed(1)} MB`;
    document.getElementById(
      "responseTime"
    ).textContent = `${clientResponseTime.toFixed(2)}ms`;
    document.getElementById("openConnections").textContent =
      data.openConnections;
    document.getElementById("uptime").textContent = formatUptime(data.uptime);

    updateChart(chartConfigs.cpu.chart, data.cpuUsage);
    updateChart(chartConfigs.memory.chart, data.memoryUsage / (1024 * 1024));
    updateChart(chartConfigs.responseTime.chart, clientResponseTime);
    updateChart(chartConfigs.connections.chart, data.openConnections);
  } catch (error) {
    console.error("Error fetching server stats:", error);
  }
}

function formatUptime(seconds) {
  if (seconds < 60) {
    return `${Math.floor(seconds)}s`;
  } else if (seconds < 3600) {
    const second = Math.floor(seconds % 60);
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${second}s`;
  } else if (seconds < 86400) {
    const second = Math.floor(seconds % 60);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m ${second}s`;
  } else {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}h ${hours}j ${minutes}m`;
  }
}

window.addEventListener("load", () => {
  initCharts();
  fetchStats();
  setInterval(fetchStats, 1000);
});
