import dbQuery from './libs/dbQuery.js'
import drawGoogleChart from './libs/drawGoogleChart.js'

async function init() {

  let data = await dbQuery(`
    SELECT 
      Age, 
      AVG(CAST("Academic Pressure" AS FLOAT)) as avg_stress
    FROM students_raw
    GROUP BY Age
    ORDER BY Age
  `, 'students')

  let rawData = await dbQuery(`
    SELECT CAST("Academic Pressure" AS FLOAT) as stress
    FROM students_raw
  `, 'students')

  let stressValues = rawData.map(row => row.stress)

  let mean = stressValues.reduce((a, b) => a + b, 0) / stressValues.length

  let sorted = [...stressValues].sort((a, b) => a - b)
  let mid = Math.floor(sorted.length / 2)
  let median = sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2

  let variance = stressValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / stressValues.length
  let stdDev = Math.sqrt(variance)

  const main = document.querySelector('main')

  // 🔹 INTRO
  main.innerHTML = `
    <h1>Hur stress varierar med ålder</h1>

    <p>
      Efter att ha undersökt kön är nästa steg att analysera hur stress varierar mellan olika åldrar.
      Detta hjälper oss att förstå om vissa grupper av studenter upplever mer stress än andra.
    </p>

    <p>
      Medelvärde: <strong>${mean.toFixed(2)}</strong><br>
      Median: <strong>${median.toFixed(2)}</strong><br>
      Standardavvikelse: <strong>${stdDev.toFixed(2)}</strong>
    </p>
  `

  // 🔹 DIAGRAM
  const chartDiv = document.createElement('div')
  chartDiv.id = 'ageChart'
  chartDiv.style.width = '100%'
  chartDiv.style.height = '400px'
  chartDiv.style.margin = '30px 0'
  main.appendChild(chartDiv)

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
      vAxis: { title: 'Stressnivå', viewWindow: { min: 0 } },
      legend: 'none'
    }
  })

  // 🔹 ANALYS
  const analysis = document.createElement('div')
  analysis.innerHTML = `
    <p>
      Diagrammet visar att stressnivån varierar något mellan olika åldrar, men utan stora skillnader.
    </p>

    <p>
      Att medelvärde och median ligger nära varandra tyder på att stressnivåerna är relativt jämnt fördelade,
      medan standardavvikelsen visar att det finns viss variation mellan studenter.
    </p>

    <p>
      Detta innebär att stress är ett vanligt problem i flera åldersgrupper, men att den upplevs olika.
      Nästa steg är därför att undersöka hur stress hänger ihop med depression.
    </p>
  `
  main.appendChild(analysis)
}

init()