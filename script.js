const totalDays = 150;
const startingBalance = 1000;
const stored = localStorage.getItem('dailyPnL');
const dailyPnL = stored ? JSON.parse(stored) : new Array(totalDays).fill(null);
let selectedDayIndex = null;
let chart;

function getStatusClass(value) {
  if (value === null || value === 0) return '';
  return value > 0 ? 'profit' : 'loss';
}

function calculateTotalBalance() {
  return dailyPnL.reduce((acc, val) => acc + (val !== null ? val : 0), startingBalance);
}

function updateBalanceDisplay() {
  document.getElementById("balanceDisplay").textContent = `Total Balance: ₹${calculateTotalBalance()}`;
}

function saveToLocalStorage() {
  localStorage.setItem('dailyPnL', JSON.stringify(dailyPnL));
}

function renderGrid() {
  const container = document.getElementById('heatmapContainer');
  container.innerHTML = '';

  for (let i = 0; i < totalDays; i++) {
    const value = dailyPnL[i];

    const dayContainer = document.createElement('div');
    dayContainer.className = 'day-container';

    const box = document.createElement('div');
    box.className = `day ${getStatusClass(value)}`;
    if (selectedDayIndex === i) {
      box.classList.add('selected');
    }
    box.title = value !== null ? `Day ${i + 1}: ₹${value}` : `Day ${i + 1}`;

    box.onclick = () => {
      if (i > 0 && dailyPnL[i - 1] === null) {
        alert(`Please fill Day ${i} before entering Day ${i + 1}`);
        return;
      }
      selectedDayIndex = i;
      renderGrid();
    };

    const label = document.createElement('div');
    label.className = 'label';
    label.innerText = `Day ${i + 1}`;

    dayContainer.appendChild(box);
    dayContainer.appendChild(label);
    container.appendChild(dayContainer);
  }

  updateBalanceDisplay();
  renderChart();
}

function submitPnL() {
  const input = document.getElementById("pnlInput").value;
  const amount = parseFloat(input);

  if (selectedDayIndex === null) {
    alert("Please select a day box first.");
    return;
  }

  if (isNaN(amount)) {
    alert("Enter a valid number.");
    return;
  }

  dailyPnL[selectedDayIndex] = amount;
  saveToLocalStorage();
  document.getElementById("pnlInput").value = '';
  selectedDayIndex = null;
  renderGrid();
}

function resetTracker() {
  if (confirm("Are you sure you want to reset all data?")) {
    localStorage.removeItem('dailyPnL');
    for (let i = 0; i < totalDays; i++) dailyPnL[i] = null;
    selectedDayIndex = null;
    renderGrid();
  }
}

function renderChart() {
  const ctx = document.getElementById('pnlChart').getContext('2d');

  const labels = dailyPnL.map((_, i) => `Day ${i + 1}`);
  const data = dailyPnL.map(v => v === null ? 0 : v);
  const colors = dailyPnL.map(v => {
    if (v === null || v === 0) return '#aaa';
    return v > 0 ? '#2ecc71' : '#e74c3c';
  });

  const config = {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Daily PnL',
        data,
        backgroundColor: colors,
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: '#c9d1d9',
            callback: value => `₹${value}`
          },
          grid: {
            color: '#30363d'
          }
        },
        x: {
          ticks: {
            color: '#c9d1d9',
            display: false
          },
          grid: {
            color: '#30363d'
          }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: ctx => `₹${ctx.raw}`
          }
        }
      }
    }
  };

  if (chart) chart.destroy();
  chart = new Chart(ctx, config);
}

renderGrid();
