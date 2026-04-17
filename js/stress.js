import dbQuery from './libs/dbQuery.js'
import drawGoogleChart from './libs/drawGoogleChart.js'

function formatNumber(value, decimals = 1) {
  return value.toFixed(decimals).replace('.', ',')
}

function formatPercent(value) {
  return `${formatNumber(value, 1)} %`
}

async function init() {
  const data = await dbQuery(`
    SELECT 
      "Sleep Duration" AS sleep_duration,
      SUM(CAST(Depression AS INTEGER)) AS depressed_count,
      COUNT(*) AS total_count,
      ROUND(100.0 * SUM(CAST(Depression AS INTEGER)) / COUNT(*), 1) AS depression_rate,
      CASE "Sleep Duration"
        WHEN 'Less than 5 hours' THEN 4.5
        WHEN '5-6 hours' THEN 5.5
        WHEN '7-8 hours' THEN 7.5
        WHEN 'More than 8 hours' THEN 9.0
        ELSE NULL
      END AS sleep_hours
    FROM students_raw
    WHERE "Sleep Duration" IS NOT NULL
      AND "Sleep Duration" != ''
      AND Depression IS NOT NULL
      AND Depression != ''
    GROUP BY "Sleep Duration"
    ORDER BY sleep_hours
  `, 'students')

  const correlationData = data.filter(row => row.sleep_hours !== null)
  const sleepHours = correlationData.map(row => Number(row.sleep_hours))
  const depressionRates = correlationData.map(row => Number(row.depression_rate))

  const mean = values => values.reduce((sum, value) => sum + value, 0) / values.length
  const stdDev = (values, avg) => Math.sqrt(values.reduce((sum, value) => sum + Math.pow(value - avg, 2), 0) / values.length)
  const pearsonR = (() => {
    if (!sleepHours.length) return 0
    const meanX = mean(sleepHours)
    const meanY = mean(depressionRates)
    const covariance = sleepHours.reduce((sum, x, index) => sum + (x - meanX) * (depressionRates[index] - meanY), 0) / sleepHours.length
    const stdX = stdDev(sleepHours, meanX)
    const stdY = stdDev(depressionRates, meanY)
    return stdX && stdY ? covariance / (stdX * stdY) : 0
  })()

  const correlationText = Math.abs(pearsonR) < 0.2
    ? 'svagt samband'
    : Math.abs(pearsonR) < 0.5
      ? 'måttligt samband'
      : 'tydligare samband'

  document.querySelector('main').innerHTML = `
    <h1>Sömn och depression</h1>

    <p>
      Här undersöker vi sambandet mellan studenters sömnrutiner och depression.
      Sömnmönster är en viktig del av psykisk hälsa och kan påverka både energi och humör.
    </p>

    <div id="sleepChart" style="width:100%; height:400px; margin:30px 0;"></div>

    <h3>Delresultat per sömnkategori</h3>
    <div class="table-responsive">
      <table class="table table-striped">
        <thead>
          <tr>
            <th>Sömnvaraktighet</th>
            <th>Antal</th>
            <th>Antal med depression</th>
            <th>Andel depression</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(row => `
            <tr>
              <td>${row.sleep_duration}</td>
              <td>${row.total_count}</td>
              <td>${row.depressed_count}</td>
              <td>${formatPercent(Number(row.depression_rate))}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <p>
      Vi ser att andelen depression varierar mellan sömnkategorier. I de grupper som sover
      mindre än 5 timmar per natt är andelen depression i den här datan ofta högre.
    </p>

    <p>
      Pearsons korrelationskoefficient mellan uppskattad sömnlängd och andel depression är
      <strong>${formatNumber(pearsonR, 2)}</strong>, vilket tyder på ett relativt starkt negativt samband.

      Detta innebär att kortare sömn ofta hänger ihop med en högre andel depression i datan.

      Samtidigt är det viktigt att komma ihåg att detta endast visar ett samband och inte innebär att sömn direkt orsakar depression.
    </p>

    <p>
      Detta stärker bilden av att livsstilsfaktorer, som sömn, kan spela en viktig roll i studenters psykiska mående.
    </p>
  `

  drawGoogleChart({
    htmlId: 'sleepChart',
    type: 'ColumnChart',
    data: [
      ['Sömnvaraktighet', 'Andel depression'],
      ...data.map(row => [row.sleep_duration, Number(row.depression_rate)])
    ],
    options: {
      title: 'Andel depression per sömnkategori',
      hAxis: { title: 'Sömnvaraktighet' },
      vAxis: { title: 'Andel depression (%)', viewWindow: { min: 0 } },
      legend: 'none'
    }
  })
}

init() 