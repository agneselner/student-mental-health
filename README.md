# Psykisk ohälsa bland studenter – dataanalys

Detta projekt är en webbaserad dataanalys som undersöker psykisk ohälsa bland studenter, baserat på en enkätundersökning.

Syftet med analysen är att identifiera mönster och samband mellan olika faktorer, såsom kön, ålder och stressnivåer.

---

## 🔍 Innehåll i analysen

Projektet består av flera delar:

- **Introduktion** – bakgrund och syfte med analysen  
- **Kön & depression** – jämförelse mellan män och kvinnor  
- **Ålder & stress** – hur stress varierar mellan olika åldrar  
- **Sömn & depression** – samband mellan sömnvaraktighet och depression  
- **Slutsats** – sammanfattning och reflektion  

---

## 📊 Metod

Analysen bygger på data från en SQLite-databas som hämtas med SQL-frågor.

Följande tekniker har använts:

- **SQLite** – för datalagring  
- **JavaScript (STJS-mallen)** – för logik och analys  
- **Google Charts** – för visualisering av data  

---

## 📈 Statistik

Följande statistiska mått används i analysen:

- Medelvärde (average)  
- Median  
- Standardavvikelse  

Dessa används för att beskriva och tolka variationen i studenters stressnivåer.

---

## 🧠 Resultat

Resultaten visar att:

- Både män och kvinnor påverkas av depression, med en något högre andel män i denna datamängd  
- Stressnivåer varierar mellan olika åldrar, men utan starka skillnader  
- Det finns ett svagt samband mellan ålder och stress  
- Sömnmönster påverkar andelen depression, där kortare sömn ofta sammanfaller med högre depressionsfrekvens  

Det är viktigt att notera att **korrelation inte innebär kausalitet**, vilket betyder att vi inte kan fastställa orsakssamband utifrån denna analys.

---

## 💡 Slutsats

Analysen visar att psykisk ohälsa bland studenter är ett komplext problem som sannolikt påverkas av flera faktorer.

För att få en djupare förståelse krävs mer omfattande data och vidare statistiska analyser.

---

## ⚙️ Installation & körning

1. Installera Node.js (LTS-version)  
2. Ladda ner projektet  
3. Öppna projektmappen i VS Code  
4. Kör i terminalen:

```bash
npm install
npm start
Öppna sedan webbläsaren på:
http://localhost:3005
