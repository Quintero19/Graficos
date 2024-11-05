const dataUrl1 = './data/renewable_energy_data.json';
const dataUrl2 = './data/04_share-electricity-renewables.json';
const dataUrl3 = './data/wind_energy_capacity.json';

let energyData1 = [];
let energyData2 = [];
let energyData3 = [];
let chart1, chart2, chart3;

async function loadData() {
  try {
    const response1 = await fetch(dataUrl1);
    energyData1 = await response1.json();
    populateCountrySelector("countrySelector", energyData1, updateChart1);

    const response2 = await fetch(dataUrl2);
    energyData2 = await response2.json();
    populateCountrySelector("countrySelector2", energyData2, updateChart2);

    const response3 = await fetch(dataUrl3);
    energyData3 = await response3.json();
    populateCountrySelector("countrySelector3", energyData3, updateChart3);

    restoreChartState();
  } catch (error) {
    console.error("Error loading data:", error);
  }
}

function populateCountrySelector(selectorId, data, updateChartCallback) {
  const countrySelector = document.getElementById(selectorId);
  const countries = [...new Set(data.map(item => item.Entity))];

  countries.forEach(country => {
    const option = document.createElement("option");
    option.value = country;
    option.textContent = country;
    countrySelector.appendChild(option);
  });

  countrySelector.addEventListener("change", (e) => {
    const selectedCountry = e.target.value;
    if (selectedCountry) {
      const countryData = data.filter(item => item.Entity === selectedCountry);
      updateChartCallback(countryData);
      localStorage.setItem(selectorId, selectedCountry);
    }
  });
}

function updateChart1(data) {
  if (chart1) chart1.destroy();
  const ctx = document.getElementById("energyChart1").getContext("2d");
  createChart(ctx, data, "Renewable Energy (%)", 'bar', (newChart) => chart1 = newChart, 'Renewables (% equivalent primary energy)');
}

function updateChart2(data) {
  if (chart2) chart2.destroy();
  const ctx = document.getElementById("energyChart2").getContext("2d");
  createChart(ctx, data, "Electricity from Renewables (%)", 'pie', (newChart) => chart2 = newChart, 'Renewables (% electricity)');
}

function updateChart3(data) {
  if (chart3) chart3.destroy();
  const ctx = document.getElementById("energyChart3").getContext("2d");
  createChart(ctx, data, "Wind Capacity (GW)", 'line', (newChart) => chart3 = newChart, 'Wind Capacity');
}

function createChart(ctx, data, label, chartType, assignChart, valueKey) {
  const years = data.map(item => item.Year);
  const values = data.map(item => item[valueKey]);

  assignChart(new Chart(ctx, {
    type: chartType,
    data: {
      labels: years,
      datasets: [{
        label: label,
        data: values,
        backgroundColor: generateColors(values.length, chartType),
        borderColor: "rgba(75, 192, 192, 1)",
        fill: chartType === 'line',
      }]
    },
    options: {
      responsive: true,
      scales: chartType !== 'pie' ? {
        x: { title: { display: true, text: "Year" } },
        y: { title: { display: true, text: label } },
      } : {}
    }
  }));
}

function generateColors(length, chartType) {
  const colors = Array.from({ length }, () => `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${chartType === 'pie' ? 0.6 : 0.2})`);
  return colors;
}

function restoreChartState() {
  const selectors = ["countrySelector", "countrySelector2", "countrySelector3"];
  selectors.forEach(selectorId => {
    const savedCountry = localStorage.getItem(selectorId);
    if (savedCountry) {
      const countrySelector = document.getElementById(selectorId);
      countrySelector.value = savedCountry; 
      const data = selectorId === "countrySelector" ? energyData1 : selectorId === "countrySelector2" ? energyData2 : energyData3;
      const countryData = data.filter(item => item.Entity === savedCountry);
      if (selectorId === "countrySelector") updateChart1(countryData);
      else if (selectorId === "countrySelector2") updateChart2(countryData);
      else updateChart3(countryData);
    }
  });
}
loadData();