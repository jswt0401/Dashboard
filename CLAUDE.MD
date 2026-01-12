# CLAUDE.MD - Project Context for AI Assistants

## Project Overview

**Moderne Dashboard** is a client-side data visualization application that allows users to upload Excel/CSV files and automatically generates interactive dashboards with statistics, tables, and charts. All processing happens locally in the browser - no backend required.

**Language**: Danish (da)
**Type**: Static web application (HTML/CSS/JavaScript)
**Target Users**: Users who need quick data visualization from Excel files

## Key Features

- 📁 **File Upload**: Supports `.xlsx`, `.xls`, and `.csv` files
- 🖱️ **Drag & Drop**: Intuitive file dropping directly onto the upload area
- 📊 **Auto-visualization**: Automatically detects numeric columns and creates charts
- 📈 **Multiple Chart Types**: Line charts, bar charts, and doughnut/pie charts
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile
- 🔒 **Privacy-first**: All data processing happens locally in the browser
- ⚡ **No Backend**: Pure client-side application using CDN libraries

## Technology Stack

### Core Technologies
- **HTML5**: Structure and semantic markup
- **CSS3**: Modern styling with gradients, animations, and responsive design
- **Vanilla JavaScript**: No frameworks - pure ES6+ JavaScript

### External Libraries (CDN)
- **SheetJS (xlsx)** v0.20.1: Excel file parsing
  - CDN: `https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js`
  - Used for reading `.xlsx` and `.xls` files

- **Chart.js** v4.4.1: Data visualization
  - CDN: `https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.js`
  - Used for creating line, bar, and doughnut charts

## File Structure

```
Dashboard/
├── index.html              # Main HTML file - entry point
├── app.js                  # Core JavaScript logic (473 lines)
├── styles.css              # All CSS styling and responsive design
├── sample-data.csv         # Sample CSV file for testing
├── README.md               # User-facing documentation (Danish)
├── START-HER.md           # Step-by-step user guide (Danish)
├── simpel-test.html       # Simple test page for debugging
├── debug.html             # Debug version with console output
├── test.html              # Alternative test page
└── index-no-charts.html   # Version without chart visualization
```

## Architecture & Code Flow

### 1. Initialization (`app.js:7-9`)
```javascript
document.addEventListener('DOMContentLoaded', function() {
    initializeFileUpload();
});
```

### 2. File Upload (`app.js:12-40`)
- Event listeners for file input, drag & drop
- Click on upload box triggers file input
- Drag over adds visual feedback (`.dragover` class)

### 3. File Processing (`app.js:51-145`)

**CSV Files** (`app.js:87-97`):
- Read as text using `FileReader.readAsText()`
- Manual parsing: split by newlines, then by commas
- Simple parsing (doesn't handle complex CSV edge cases)

**Excel Files** (`app.js:99-113`):
- Read as ArrayBuffer using `FileReader.readAsArrayBuffer()`
- Parse with SheetJS: `XLSX.read(data, { type: 'array' })`
- Convert to 2D array: `XLSX.utils.sheet_to_json(worksheet, { header: 1 })`

### 4. Data Processing (`app.js:148-169`)
1. Store data in `currentData` global variable
2. Show data sections (unhide)
3. Display statistics
4. Display table (first 50 rows)
5. Create charts

### 5. Statistics Calculation (`app.js:172-220`)
- Total rows (excluding header)
- Total columns
- Filled cells count
- Numeric columns detection (checks if first 10 rows are numeric)

### 6. Table Rendering (`app.js:223-254`)
- Shows first 50 rows for performance
- First row used as table headers
- Empty cells displayed as empty strings

### 7. Chart Creation (`app.js:257-327`)

**Numeric Column Detection** (`app.js:266-291`):
- Skips first column (assumed to be labels)
- Tests if column values can be parsed as numbers
- Stores column index, name, and parsed values

**Chart 1** - Line Chart (`app.js:329-374`):
- Uses first numeric column
- Shows trend over time
- Blue gradient fill (#6366f1)

**Chart 2** - Bar or Pie Chart (`app.js:376-472`):
- If 2+ numeric columns: Bar chart comparing up to 3 columns
- If 1 numeric column: Doughnut chart showing distribution
- Uses color palette: purple, pink, green, orange, violet

## Important Implementation Details

### Global Variables (`app.js:1-4`)
```javascript
let currentData = [];        // Stores uploaded file data as 2D array
let chart1Instance = null;   // Chart.js instance for first chart
let chart2Instance = null;   // Chart.js instance for second chart
```

### Data Format
Data is stored as a 2D array:
```javascript
[
  ['Måned', 'Salg', 'Udgifter', 'Profit'],  // Row 0: Headers
  ['Januar', '45000', '28000', '17000'],     // Row 1: Data
  ['Februar', '52000', '30000', '22000'],    // Row 2: Data
  ...
]
```

### Chart Cleanup
Always destroys previous chart instances before creating new ones:
```javascript
if (chart1Instance) {
    chart1Instance.destroy();
}
```

### CSV Parsing Limitations
The current CSV parser (`app.js:93-97`) is basic:
- Splits on commas only
- Doesn't handle quoted fields with commas inside
- Doesn't handle escaped quotes
- For complex CSV files, may need a proper CSV parsing library

## Styling Notes (`styles.css`)

### Design System
- **Primary Color**: Purple gradient (`#6366f1`, `#8b5cf6`)
- **Accent Color**: Pink (`#ec4899`)
- **Background**: Light gradient
- **Cards**: White with shadow and border-radius

### Responsive Breakpoints
- Desktop: Default
- Tablet: Likely around 768px
- Mobile: Specific breakpoints in CSS

### Key CSS Classes
- `.upload-box`: File upload dropzone
- `.dragover`: Applied during drag over event
- `.stat-card`: Statistics display cards
- `.chart-container`: Wrapper for Chart.js canvas
- `.btn-primary`: Primary action button

## Common Development Tasks

### Adding a New Chart Type
1. Create new chart function in `app.js` (follow pattern of `createChart1`, `createChart2`)
2. Add canvas element in `index.html`
3. Call function from `createCharts()`
4. Add global variable for chart instance
5. Remember to destroy previous instance

### Supporting New File Formats
1. Add file extension to accept attribute: `accept=".xlsx,.xls,.csv,.json"`
2. Add detection logic in `handleFile()` function
3. Implement parser in `reader.onload` callback
4. Convert to 2D array format for `processData()`

### Changing Color Scheme
1. Update colors array in `createChart2()` function (`app.js:384-390`)
2. Update CSS custom properties in `styles.css`
3. Update hardcoded colors in chart configuration objects

### Modifying Table Display
- Change row limit: `app.js:228` - adjust `Math.min(data.length, 50)`
- Change headers: Modify `app.js:233-236`
- Add filtering/sorting: Need to implement before `displayTable()` call

## Testing

### Test Files Available
- `simpel-test.html`: Minimal test page
- `debug.html`: Version with debug console output
- `test.html`: Alternative test version
- `sample-data.csv`: Sample data for testing

### Manual Testing Checklist
1. Open `index.html` in browser
2. Check gradient background loads
3. Click "Vælg Fil" button
4. Upload `sample-data.csv`
5. Verify success message appears
6. Check statistics cards display
7. Verify table renders
8. Confirm charts appear and are interactive

### Common Issues
1. **Charts don't appear**: Check browser console for Chart.js CDN loading
2. **File won't upload**: Check file extension and size
3. **Data looks wrong**: CSV parsing may fail on complex formats
4. **Slow performance**: Large files - table limited to 50 rows, charts to 20 points

## Browser Compatibility

### Supported Browsers
- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Opera

### Required Features
- FileReader API
- ES6+ JavaScript (arrow functions, let/const, template literals)
- CSS Grid and Flexbox
- Fetch API (for CDN resources)

## Error Handling

### Current Error Handling
- File read errors (`app.js:73-79`)
- Parsing errors (`app.js:129-136`)
- No data found errors (`app.js:127`)
- Displays user-friendly error messages in Danish

### Missing Error Handling
- Network errors for CDN libraries (no fallback)
- Invalid data formats (basic validation only)
- Large file memory issues
- Chart rendering failures

## Localization

All text is in **Danish (da)**:
- UI labels
- Error messages
- Success messages
- Documentation (README, START-HER)

To add English support:
1. Create language object with translations
2. Add language selector UI
3. Replace hardcoded strings with translation function
4. Store user preference in localStorage

## Performance Considerations

### Current Optimizations
- Table limited to 50 rows (`app.js:228`)
- Charts limited to 20 data points (`app.js:297`)
- Numeric detection only checks first 10 rows (`app.js:193`)
- Numeric columns limited to first 100 rows for validation (`app.js:271`)

### Potential Performance Issues
- Large Excel files (>10MB) may cause browser slowdown
- Many columns (>50) may make table unreadable
- Complex CSV parsing on large files
- Chart.js rendering with thousands of data points

## Security Considerations

### Safe Practices
- All processing client-side (no data sent to server)
- No eval() or dangerous DOM manipulation
- File type restrictions in input accept attribute
- No external data fetching (except CDN libraries)

### Potential Risks
- CDN compromise (SheetJS or Chart.js)
- XSS if malicious CSV contains HTML (currently not sanitized in table)
- Memory exhaustion with very large files

### Recommendations
- Add HTML escaping in `displayTable()` function
- Consider file size limits
- Add CSP (Content Security Policy) headers if serving from web server
- Consider SRI (Subresource Integrity) for CDN resources

## Git Workflow

### Current Branch
- Working branch: `claude/update-claude-md-NenCS`
- Always push to this branch with: `git push -u origin claude/update-claude-md-NenCS`

### Recent Commits
- Debug versions for troubleshooting
- Step-by-step guide and test files
- Excel upload error fixes
- Modern dashboard with Excel import

### Commit Message Style
- In Danish
- Descriptive: "Tilføj debug versioner for at finde problemet"
- Clear action: "Ret Excel upload fejl og tilføj debugging funktionalitet"

## Future Enhancements (from README)

Potential features to add:
- [ ] Export charts as images (PNG/SVG)
- [ ] Column selection for visualization
- [ ] More chart types (scatter, area, radar)
- [ ] Data filtering and sorting
- [ ] Save dashboard configuration
- [ ] Compare multiple files
- [ ] Advanced statistics (mean, median, standard deviation)
- [ ] Custom color themes
- [ ] Print-friendly view
- [ ] Export processed data

## Quick Command Reference

### Open in Browser
```bash
# Direct file open (double-click index.html)

# Or with local server:
python -m http.server 8000
# Then: http://localhost:8000
```

### Debug in Browser
1. Open `index.html`
2. Press F12 (Developer Tools)
3. Go to Console tab
4. Upload a file and watch console.log output

### Test Changes
1. Edit file (HTML/CSS/JS)
2. Save
3. Refresh browser (Ctrl+R or Cmd+R)
4. Hard refresh if CSS doesn't update (Ctrl+Shift+R)

## Notes for AI Assistants

### When Making Changes
1. **Read files first**: Always read the relevant file before suggesting changes
2. **Maintain Danish**: Keep all user-facing text in Danish
3. **Test with sample-data.csv**: Verify changes work with provided test file
4. **No frameworks**: This is vanilla JS - don't suggest React/Vue/etc without discussion
5. **Keep it simple**: Avoid over-engineering - this is meant to be lightweight

### Code Style
- Use clear variable names (camelCase)
- Add console.log for debugging
- Comment complex logic
- Keep functions focused and small
- Use ES6+ features (const/let, arrow functions, template literals)

### Common Requests
- **Add new chart type**: Follow existing chart function patterns
- **Fix CSV parsing**: Consider using PapaParse library
- **Improve error handling**: Add try-catch and user-friendly messages
- **Add new statistics**: Calculate in `displayStatistics()` function
- **Style changes**: Edit `styles.css`, use existing CSS custom properties

### What NOT to Do
- Don't add backend/server code (this is client-only)
- Don't add heavy frameworks or build tools
- Don't break Excel file compatibility
- Don't change the core 2D array data structure
- Don't add features that require internet beyond CDN libraries

---

**Last Updated**: 2026-01-12
**Project Version**: Based on commit 83a651d
**Maintained by**: Dashboard project team
