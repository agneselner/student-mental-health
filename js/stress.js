import dbQuery from './libs/dbQuery.js'
import drawGoogleChart from './libs/drawGoogleChart.js'

async function init() {

  let data = await dbQuery(`
    SELECT 
      CAST("Academic Pressure" AS INTEGER) as stress,
      COUNT(*) as total
    FROM students_raw
    WHERE CAST(Depression AS INTEGER) = 1
    GROUP BY stress
    ORDER BY stress
  `, 'students')

  document.querySelector('main').innerHTML = `
    <h1>Samband mellan stress och depression</h1>

    <p>
      Här undersöks hur studenters upplevda akademiska stress hänger ihop med depression.
    </p>

    <div id="stressChart" style="width:100%; height:400px; margin:30px 0;"></div>

    <h3>Delresultat</h3>
    <table border="1" cellpadding="8" style="border-collapse: collapse;">
      <tr>
        <th>Stressnivå</th>
        <th>Antal deprimerade</th>
      </tr>
      ${data.map(row => `
        <tr>
          <td>${row.stress}</td>
          <td>${row.total}</td>
        </tr>
      `).join('')}
    </table>

    <p>
      Resultatet visar att högre stressnivåer ofta sammanfaller med fler fall av depression.
      Detta tyder på ett möjligt samband mellan stress och psykisk ohälsa.
    </p>

    <p>
      Samtidigt är det viktigt att komma ihåg att korrelation inte innebär kausalitet,
      vilket betyder att vi inte kan säga att stress direkt orsakar depression.
    </p>
  `

  drawGoogleChart({
    htmlId: 'stressChart',
    type: 'ColumnChart',
    data: [
      ['Stressnivå', 'Antal deprimerade'],
      ...data.map(row => [Number(row.stress), Number(row.total)])
    ],
    options: {
      title: 'Stress och depression',
      hAxis: { title: 'Stressnivå' },
      vAxis: { title: 'Antal deprimerade' },
      legend: 'none'
    }
  })
}

init() 