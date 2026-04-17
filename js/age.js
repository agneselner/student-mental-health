import dbQuery from './libs/dbQuery.js'
import drawGoogleChart from './libs/drawGoogleChart.js'

async function init() {

  // 1. Hämta data för diagram (genomsnitt per ålder)
  let data = await dbQuery(`
    SELECT 
      Age, 
      AVG(CAST("Academic Pressure" AS FLOAT)) as avg_stress
    FROM students_raw
    GROUP BY Age
    ORDER BY Age
  `, 'students')

  // 2. Hämta total medelstress (VG-krav)
  let avgData = await dbQuery(`
    SELECT 
      AVG(CAST("Academic Pressure" AS FLOAT)) as avg_stress
    FROM students_raw
  `, 'students')

  let avgStress = Number(avgData[0].avg_stress).toFixed(2)

  // 3. HTML
  document.querySelector('main').innerHTML = `
    <h1>Hur stress varierar med ålder</h1>

    <p>
      Här analyseras sambandet mellan studenters ålder och deras upplevda akademiska stress.
    </p>

    <p>
      Genomsnittlig stressnivå i datan är: <strong>${avgStress}</strong>
    </p>

    <div id="ageChart" style="width:100%; height:400px;"></div>

    <p>
      Diagrammet visar att stressnivån varierar något mellan olika åldrar,
      men utan några extremt stora skillnader.
    </p>

    <p>
      Det verkar finnas ett svagt samband mellan ålder och stress,
      men skillnaderna är inte tillräckligt stora för att dra en stark slutsats.
    </p>
  `

  // 4. Rita diagram
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