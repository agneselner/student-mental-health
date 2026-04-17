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

  // 🔹 INTRO
  main.innerHTML = `
    <h1>Skillnader i depression mellan män och kvinnor</h1>

    <p>
      För att börja analysen undersöker vi om det finns skillnader i depression mellan män och kvinnor.
      Detta ger en första bild av hur psykisk ohälsa ser ut i datan.
    </p>
  `

  // 🔹 DIAGRAM
  const chartDiv = document.createElement('div')
  chartDiv.id = 'genderChart'
  chartDiv.style.width = '100%'
  chartDiv.style.height = '400px'
  chartDiv.style.margin = '30px 0'
  main.appendChild(chartDiv)

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
      vAxis: { title: 'Antal deprimerade', viewWindow: { min: 0 } },
      legend: 'none'
    }
  })

  // 🔹 TABELL + ANALYS
  const analysis = document.createElement('div')
  analysis.innerHTML = `
    <h3>Delresultat</h3>

    <table border="1" cellpadding="8" style="border-collapse: collapse; margin-bottom:20px;">
      <tr>
        <th>Kön</th>
        <th>Antal deprimerade</th>
      </tr>
      ${data.map(row => `
        <tr>
          <td>${row.Gender}</td>
          <td>${row.total}</td>
        </tr>
      `).join('')}
    </table>

    <p>
      Diagrammet visar att både män och kvinnor påverkas av depression, med en något högre andel män i denna datamängd.
      Skillnaden är dock inte särskilt stor, vilket tyder på att psykisk ohälsa är ett problem som berör studenter oavsett kön.
    </p>

    <p>
      Detta innebär att kön i sig inte verkar vara den avgörande faktorn.
      För att få en djupare förståelse behöver vi därför undersöka andra variabler.
    </p>
  `
  main.appendChild(analysis)
}

init() 