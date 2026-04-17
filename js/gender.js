import dbQuery from './libs/dbQuery.js'
import drawGoogleChart from './libs/drawGoogleChart.js'

async function init() {
  window.scrollTo(0, 0)
  let data = await dbQuery(`
    SELECT Gender, COUNT(*) as total
    FROM students_raw
    WHERE CAST(Depression AS INTEGER) = 1
    GROUP BY Gender
  `, 'students')

  const main = document.querySelector('main')

  // 1. Rubrik + intro
  main.innerHTML = `
    <h1>Skillnader i depression mellan män och kvinnor</h1>

    <p>
      Här jämförs hur många män respektive kvinnor i datan som har depression.
    </p>
  `

  // 2. Skapa chart-container direkt här
  const chartDiv = document.createElement('div')
  chartDiv.id = 'genderChart'
  chartDiv.style.width = '100%'
  chartDiv.style.height = '400px'
  chartDiv.style.margin = '30px 0'
  main.appendChild(chartDiv)

  // 3. Rita diagrammet
  drawGoogleChart({
    htmlId: 'genderChart',
    type: 'ColumnChart',
    data: [
      ['Kön', 'Antal deprimerade'],
      ...data.map(row => [row.Gender, Number(row.total)])
    ],
    options: {
      title: 'Depression per kön',
      hAxis: { title: 'Kön' },
      vAxis: {
        title: 'Antal deprimerade',
        viewWindow: { min: 0 }
      },
      legend: 'none'
    }
  })

  // 4. Lägg analysen EFTER diagrammet
  const analysis = document.createElement('div')
  analysis.innerHTML = `
    <p>
      Diagrammet visar att både män och kvinnor påverkas av depression, men att det finns
      något fler män i datan som rapporterar depression. Skillnaden är dock inte extrem,
      vilket tyder på att psykisk ohälsa är ett problem som berör båda könen.
    </p>

    <p>
      För att förstå problemet bättre behöver vi även undersöka andra faktorer,
      till exempel om ålder kan påverka stressnivåer.
    </p>
  `
  main.appendChild(analysis)
}

init() 