import dbQuery from './libs/dbQuery.js'
import drawGoogleChart from './libs/drawGoogleChart.js'

function calculateMean(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function calculateMedian(values) {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2
}

function calculateStandardDeviation(values, mean) {
  const variance = values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / values.length
  return Math.sqrt(variance)
}

function calculatePearson(xValues, yValues) {
  const n = xValues.length
  const meanX = calculateMean(xValues)
  const meanY = calculateMean(yValues)
  const covariance = xValues.reduce((sum, x, index) => sum + (x - meanX) * (yValues[index] - meanY), 0) / n
  const stdX = calculateStandardDeviation(xValues, meanX)
  const stdY = calculateStandardDeviation(yValues, meanY)
  return stdX && stdY ? covariance / (stdX * stdY) : 0
}

async function init() {
  const allStressData = await dbQuery(`
    SELECT CAST(Age AS INTEGER) AS Age,
           CAST("Academic Pressure" AS FLOAT) AS stress
    FROM students_raw
    WHERE Age IS NOT NULL
      AND Age != ''
      AND "Academic Pressure" IS NOT NULL
      AND "Academic Pressure" != ''
  `, 'students')

  const stressValues = allStressData
    .map(row => Number(row.stress))
    .filter(Number.isFinite)

  const mean = calculateMean(stressValues)
  const median = calculateMedian(stressValues)
  const stdDev = calculateStandardDeviation(stressValues, mean)

  const ageGrouped = await dbQuery(`
    SELECT CAST(Age AS INTEGER) AS Age,
           AVG(CAST("Academic Pressure" AS FLOAT)) AS avg_stress,
           COUNT(*) AS student_count
    FROM students_raw
    WHERE Age IS NOT NULL
      AND Age != ''
      AND "Academic Pressure" IS NOT NULL
      AND "Academic Pressure" != ''
    GROUP BY CAST(Age AS INTEGER)
    ORDER BY Age
  `, 'students')

  const ageNumbers = ageGrouped.map(row => Number(row.Age))
  const avgStressNumbers = ageGrouped.map(row => Number(row.avg_stress))
  const pearsonR = calculatePearson(ageNumbers, avgStressNumbers)

  const correlationDescription = Math.abs(pearsonR) < 0.2
    ? 'svagt samband'
    : Math.abs(pearsonR) < 0.5
      ? 'måttligt samband'
      : 'starkare samband'

  const main = document.querySelector('main')
  main.innerHTML = `
    <h1>Hur stress varierar med ålder</h1>

    <p>
      I denna del av analysen undersöker vi hur studenternas upplevda akademiska stress
      varierar beroende på ålder.
    </p>

    <p>
      Medelvärde: <strong>${mean.toFixed(2)}</strong><br>
      Median: <strong>${median.toFixed(2)}</strong><br>
      Standardavvikelse: <strong>${stdDev.toFixed(2)}</strong>
    </p>

    <p>
      Eftersom medelvärde och median ligger nära varandra, tyder det på att fördelningen
      inte är extremt skev. Det är en enkel kontroll av normalfördelning i den här datan.
    </p>

    <div id="ageChart" style="width:100%; height:400px; margin-top: 30px"></div>

    <h2>Genomsnittlig stress per ålder</h2>
    <p>
      Tabellen visar genomsnittlig stress och antal observationer för varje åldersgrupp.
    </p>

    <div class="table-responsive">
      <table class="table table-striped">
        <thead>
          <tr>
            <th>Ålder</th>
            <th>Genomsnittlig stress</th>
            <th>Antal studenter</th>
          </tr>
        </thead>
        <tbody>
          ${ageGrouped.map(row => `
            <tr>
              <td>${row.Age}</td>
              <td>${Number(row.avg_stress).toFixed(2)}</td>
              <td>${row.student_count}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <p>
      Korrelationskoefficienten mellan ålder och genomsnittlig stress är
      <strong>${pearsonR.toFixed(2)}</strong>, vilket indikerar ett ${correlationDescription}.
    </p>

    <p>
    <p>
 <p>
  Nollhypotesen är att det inte finns något samband mellan ålder och stress.
  Eftersom korrelationskoefficienten är <strong>${pearsonR.toFixed(2)}</strong>,
  vilket visar ett ${correlationDescription}, kan vi inte förkasta nollhypotesen.
  Det innebär att analysen inte visar något tydligt statistiskt samband mellan
  ålder och stress i denna datamängd.
</p>
</p>
    </p>
  `

  drawGoogleChart({
    htmlId: 'ageChart',
    type: 'LineChart',
    data: [
      ['Ålder', 'Genomsnittlig stress'],
      ...ageGrouped.map(row => [Number(row.Age), Number(row.avg_stress)])
    ],
    options: {
      title: 'Genomsnittlig stress per ålder',
      hAxis: { title: 'Ålder' },
      vAxis: {
        title: 'Genomsnittlig stress',
        viewWindow: { min: 0 }
      },
      legend: 'none'
    }
  })
}

init()