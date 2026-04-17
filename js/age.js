import dbQuery from './libs/dbQuery.js'
import drawGoogleChart from './libs/drawGoogleChart.js'

async function init() {

  // Hämta data för diagram
  let data = await dbQuery(`
    SELECT 
      Age, 
      AVG(CAST("Academic Pressure" AS FLOAT)) as avg_stress
    FROM students_raw
    GROUP BY Age
    ORDER BY Age
  `, 'students')

  // Hämta ALL stressdata (för median + std)
  let rawData = await dbQuery(`
    SELECT CAST("Academic Pressure" AS FLOAT) as stress
    FROM students_raw
  `, 'students')

  let stressValues = rawData.map(row => row.stress)

  // 🔥 MEDELVÄRDE
  let mean = stressValues.reduce((a, b) => a + b, 0) / stressValues.length

  // 🔥 MEDIAN
  let sorted = [...stressValues].sort((a, b) => a - b)
  let mid = Math.floor(sorted.length / 2)
  let median = sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2

  // 🔥 STANDARDAVVIKELSE
  let variance = stressValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / stressValues.length
  let stdDev = Math.sqrt(variance)

  document.querySelector('main').innerHTML = `
    <h1>Hur stress varierar med ålder</h1>

    <p>
      Här analyseras sambandet mellan studenters ålder och deras upplevda akademiska stress.
    </p>

    <p>
      Medelvärde: <strong>${mean.toFixed(2)}</strong> <br>
      Median: <strong>${median.toFixed(2)}</strong> <br>
      Standardavvikelse: <strong>${stdDev.toFixed(2)}</strong>
    </p>

    <div id="ageChart" style="width:100%; height:400px;"></div>

    <p>
      Diagrammet visar att stressnivån varierar något mellan olika åldrar, men utan
      några extremt stora skillnader.
    </p>

    <p>
      Det verkar finnas ett svagt samband mellan ålder och stress, men skillnaderna
      är inte tillräckligt stora för att dra en stark slutsats.
    </p>
  `

  drawGoogleChart({
    htmlId: 'ageChart',
    type: 'LineChart',
    data: [
      ['Ålder', 'Genomsnittlig stress'],
      ...data.map(row => [Number(row.Age), Number(row.avg_stress)])
    ],
    options: {
      title: 'Stressnivå per ålder',
      hAxis: { title: 'Ålder' },
      vAxis: {
        title: 'Stressnivå',
        viewWindow: { min: 0 }
      },
      legend: 'none'
    }
  })
}

init() 