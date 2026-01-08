# 📊 Moderne Dashboard

Et moderne, responsivt dashboard til visualisering af Excel data direkte i browseren.

## ⚡ QUICK START

**Vil du bare i gang? Følg disse 3 trin:**

1. **Åbn `index.html`** i din browser (dobbeltklik)
2. **Klik "Vælg Fil"** og vælg `sample-data.csv`
3. **Se dine data visualiseret!**

**Virker det ikke?** Se [START-HER.md](START-HER.md) for detaljeret guide og fejlfinding.

**Vil du teste først?** Åbn `simpel-test.html` for at verificere at alt virker.

---

## ✨ Features

- 🎨 **Moderne Design** - Flot gradient design med smooth animationer
- 📁 **Excel Import** - Upload `.xlsx`, `.xls` eller `.csv` filer
- 🖱️ **Drag & Drop** - Træk og slip filer direkte til dashboardet
- 📊 **Automatisk Visualisering** - Generer automatisk grafer fra dine data
- 📈 **Flere Diagram Typer** - Linje-, søjle- og cirkeldiagrammer
- 📱 **Responsivt Design** - Virker perfekt på desktop, tablet og mobil
- ⚡ **Hurtig Performance** - Ingen backend nødvendig, alt kører i browseren

## 🚀 Kom I Gang

### 1. Åbn Dashboard

Åbn blot `index.html` i din browser. Ingen installation eller server nødvendig!

#### Metode 1: Dobbeltklik
- Dobbeltklik på `index.html` filen

#### Metode 2: Via Browser
- Højreklik på `index.html`
- Vælg "Åbn med" → Din foretrukne browser

#### Metode 3: Lokal Server (anbefalet for udvikling)
```bash
# Med Python 3
python -m http.server 8000

# Med Node.js (hvis du har http-server installeret)
npx http-server

# Med PHP
php -S localhost:8000
```

Åbn derefter: `http://localhost:8000`

### 2. Upload Excel Data

1. Klik på "Vælg Fil" knappen eller træk og slip din Excel fil
2. Dashboardet læser automatisk dataen
3. Se statistik, tabel og grafer genereret fra dine data

## 📋 Excel Fil Format

Dashboardet virker bedst med Excel filer der har:

- **Første række** indeholder kolonnenavne/headers
- **Numeriske data** for at generere grafer
- **Struktureret data** i kolonner

### Eksempel på god datastruktur:

| Måned   | Salg  | Udgifter | Profit |
|---------|-------|----------|--------|
| Januar  | 15000 | 8000     | 7000   |
| Februar | 18000 | 9000     | 9000   |
| Marts   | 22000 | 10000    | 12000  |

## 🎨 Hvad Vises På Dashboardet?

1. **Fil Information** - Navn, størrelse og antal rækker/kolonner
2. **Statistik Cards** - Hurtigt overblik over dine data
3. **Data Tabel** - De første 50 rækker af dine data
4. **Visualiseringer**:
   - Linjediagram - Viser trends over tid
   - Søjlediagram - Sammenligner flere kolonner
   - Cirkeldiagram - Viser fordelinger

## 🛠️ Teknologier

- **HTML5** - Struktur
- **CSS3** - Moderne styling med gradient og animationer
- **Vanilla JavaScript** - Logik og interaktivitet
- **SheetJS (xlsx)** - Excel fil læsning
- **Chart.js** - Data visualisering

## 📁 Projekt Struktur

```
Dashboard/
├── index.html      # Hovedfil - åbn denne i browseren
├── styles.css      # Styling og design
├── app.js          # JavaScript logik
└── README.md       # Denne fil
```

## 🌐 Browser Support

Dashboardet virker i alle moderne browsere:
- ✅ Chrome/Edge (anbefalet)
- ✅ Firefox
- ✅ Safari
- ✅ Opera

## 💡 Tips

1. **Første kolonne** bruges ofte som labels i graferne
2. **Numeriske kolonner** genererer automatisk grafer
3. **Store filer**: Tabellen viser kun de første 50 rækker for performance
4. **CSV filer** virker også - gem din Excel fil som .csv
5. **Prøv forskellige filtyper**: .xlsx, .xls, .csv understøttes alle

## 🔒 Privatliv

Alt data behandles lokalt i din browser. Ingen data sendes til nogen server. Dit data forbliver 100% privat.

## 🎯 Fremtidige Features

Mulige forbedringer:
- [ ] Eksporter grafer som billeder
- [ ] Vælg hvilke kolonner der skal visualiseres
- [ ] Flere diagram typer (scatter, area, etc.)
- [ ] Filtrer og sorter data
- [ ] Gem dashboard konfiguration
- [ ] Sammenlign flere filer
- [ ] Avancerede statistikker (gennemsnit, median, etc.)

## 📝 Licens

Dette projekt er open source og frit at bruge og modificere.

## 🤝 Support

Hvis du støder på problemer:
1. Tjek at din Excel fil har den rigtige struktur
2. Prøv at åbne i en anden browser
3. Tjek browser konsollen for fejl (F12)

---

**Lavet med ❤️ til moderne data visualisering**
