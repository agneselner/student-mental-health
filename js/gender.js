import dbQuery from './libs/dbQuery.js'
import drawGoogleChart from './libs/drawGoogleChart.js'

async function init() {
  let data = await dbQuery(`
    SELECT Gender, COUNT(*) as total
    FROM students_raw
    WHERE CAST(Depression AS INTEGER) = 1
    GROUP BY Gender
  `, 'students')

  const main = document.querySelector('main')

  main.innerHTML = `
    <h1>Skillnader i depression mellan män och kvinnor</h1>

    <p>
      Här jämförs hur många män respektive kvinnor i datan som har depression.
    </p>

    <div id="genderChart" style="width:100%; height:400px; margin:30px 0;"></div>

    <h3>Delresultat i tabellform</h3>
    <table border="1" cellpadding="8" style="border-collapse: collapse; margin-bottom: 30px;">
      <thead>
        <tr>
          <th>Kön</th>
          <th>Antal deprimerade</th>
        </tr>
      </thead>
      <tbody>
        ${data.map(row => `
          <tr>
            <td>${row.Gender}</td>
            <td>${row.total}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <p>
      Diagrammet visar att både män och kvinnor påverkas av depression, men att det finns
      något fler män i datan som rapporterar depression. Skillnaden är dock inte extrem,
      vilket tyder på att psykisk ohälsa är ett problem som berör båda könen.
    </p>

    <p>
      Skillnaden kan bero på flera faktorer och behöver undersökas vidare.
    </p>

    <p>
      För att förstå problemet bättre behöver vi även undersöka andra faktorer,
      till exempel om andra variabler i studenternas vardag kan kopplas till depression.
    </p>
  `

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
}

init() 