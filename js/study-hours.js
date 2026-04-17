import dbQuery from './libs/dbQuery.js'
import drawGoogleChart from './libs/drawGoogleChart.js'

async function init() {

  let rawData = await dbQuery(`
    SELECT 
      CAST("Work/Study Hours" AS FLOAT) as hours,
      CAST("Academic Pressure" AS FLOAT) as stress
    FROM students_raw
    WHERE "Work/Study Hours" IS NOT NULL AND "Academic Pressure" IS NOT NULL
  `, 'students')

  let hours = rawData.map(row => row.hours)
  let stress = rawData.map(row => row.stress)

  // 🔥 medelvärde
  let mean = stress.reduce((a, b) => a + b, 0) / stress.length

  // 🔥 korrelation
  let n = hours.length

  let avgHours = hours.reduce((a, b) => a + b, 0) / n
  let avgStress = stress.reduce((a, b) => a + b, 0) / n

  let num = 0
  let denomHours = 0
  let denomStress = 0

  for (let i = 0; i < n; i++) {
    let hDiff = hours[i] - avgHours
    let sDiff = stress[i] - avgStress

    num += hDiff * sDiff
    denomHours += hDiff * hDiff
    denomStress += sDiff * sDiff
  }

  let correlation = num / Math.sqrt(denomHours * denomStress)

  const main = document.querySelector('main')

  // 🔹 INTRO
  main.innerHTML = `
    <h1>Samband mellan studietid och stress</h1>

    <p>
      I denna del undersöks hur antal timmar studenter arbetar eller studerar per dag
      hänger ihop med deras upplevda stressnivå.
    </p>

    <p>
      Medelvärde (stress): <strong>${mean.toFixed(2)}</strong><br>
      Korrelation (r): <strong>${correlation.toFixed(2)}</strong>
    </p>
  `

  // 🔹 DIAGRAM
  const chartDiv = document.createElement('div')
  chartDiv.id = 'hoursChart'
  chartDiv.style.width = '100%'
  chartDiv.style.height = '400px'
  chartDiv.style.margin = '30px 0'
  main.appendChild(chartDiv)

  drawGoogleChart({
    htmlId: 'hoursChart',
    type: 'ScatterChart',
    data: [
      ['Studietimmar per dag', 'Stressnivå'],
      ...rawData.map(row => [Number(row.hours), Number(row.stress)])
    ],
    options: {
      title: 'Studietid och stress',
      hAxis: { title: 'Timmar per dag' },
      vAxis: { title: 'Stressnivå' },
      legend: 'none'
    }
  })

  // 🔹 ANALYS
  const analysis = document.createElement('div')
  analysis.innerHTML = `
    <p>
      Diagrammet visar hur stressnivåer varierar beroende på hur många timmar
      studenter arbetar eller studerar per dag.
    </p>

    <p>
      Korrelationen är ${correlation.toFixed(2)}, vilket tyder på ett 
      ${Math.abs(correlation) < 0.3 ? 'svagt' : 'måttligt'} samband.
    </p>

    <p>
      Detta innebär att studietid kan ha viss påverkan på stressnivåer,
      men att sambandet inte är tillräckligt starkt för att vara den enda förklaringen.
    </p>

    <p>
      Detta stärker bilden av att flera faktorer tillsammans påverkar studenters psykiska mående.
    </p>
  `
  main.appendChild(analysis)
}

init() 