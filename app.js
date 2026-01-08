// Global variables to store data
let currentData = [];
let chart1Instance = null;
let chart2Instance = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeFileUpload();
});

// Initialize file upload functionality
function initializeFileUpload() {
    const fileInput = document.getElementById('fileInput');
    const uploadBox = document.getElementById('uploadBox');

    // File input change event
    fileInput.addEventListener('change', handleFileSelect);

    // Drag and drop events
    uploadBox.addEventListener('click', () => fileInput.click());

    uploadBox.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadBox.classList.add('dragover');
    });

    uploadBox.addEventListener('dragleave', () => {
        uploadBox.classList.remove('dragover');
    });

    uploadBox.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadBox.classList.remove('dragover');

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });
}

// Handle file selection
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
}

// Process the uploaded file
function handleFile(file) {
    const fileName = file.name;
    const fileSize = (file.size / 1024).toFixed(2);

    // Show file info
    const fileInfo = document.getElementById('fileInfo');
    fileInfo.innerHTML = `
        <h3>✅ Fil uploadet</h3>
        <p><strong>Filnavn:</strong> ${fileName}</p>
        <p><strong>Størrelse:</strong> ${fileSize} KB</p>
        <p>Behandler data...</p>
    `;
    fileInfo.style.display = 'block';

    // Read the file
    const reader = new FileReader();

    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });

            // Get first sheet
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];

            // Convert to JSON
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            if (jsonData.length > 0) {
                processData(jsonData);
                fileInfo.innerHTML = `
                    <h3>✅ Data indlæst succesfuldt!</h3>
                    <p><strong>Filnavn:</strong> ${fileName}</p>
                    <p><strong>Rækker:</strong> ${jsonData.length}</p>
                    <p><strong>Kolonner:</strong> ${jsonData[0].length}</p>
                `;
            } else {
                throw new Error('Ingen data fundet i filen');
            }
        } catch (error) {
            fileInfo.innerHTML = `
                <h3>❌ Fejl</h3>
                <p style="color: red;">Kunne ikke læse filen: ${error.message}</p>
            `;
        }
    };

    reader.readAsArrayBuffer(file);
}

// Process and display data
function processData(data) {
    currentData = data;

    // Show data sections
    document.getElementById('dataSection').style.display = 'block';
    document.getElementById('chartsSection').style.display = 'block';

    // Display statistics
    displayStatistics(data);

    // Display table
    displayTable(data);

    // Create charts
    createCharts(data);
}

// Display statistics
function displayStatistics(data) {
    const statsGrid = document.getElementById('statsGrid');

    const totalRows = data.length - 1; // Exclude header
    const totalColumns = data[0].length;

    // Calculate some basic stats
    let numericColumns = 0;
    let totalCells = 0;

    for (let i = 1; i < data.length; i++) {
        for (let j = 0; j < data[i].length; j++) {
            if (data[i][j] !== null && data[i][j] !== undefined && data[i][j] !== '') {
                totalCells++;
            }
        }
    }

    // Check for numeric columns
    for (let j = 0; j < data[0].length; j++) {
        let isNumeric = true;
        for (let i = 1; i < Math.min(data.length, 10); i++) {
            if (data[i][j] && isNaN(data[i][j])) {
                isNumeric = false;
                break;
            }
        }
        if (isNumeric) numericColumns++;
    }

    statsGrid.innerHTML = `
        <div class="stat-card">
            <div class="stat-label">Total Rækker</div>
            <div class="stat-value">${totalRows}</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Total Kolonner</div>
            <div class="stat-value">${totalColumns}</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Fyldte Celler</div>
            <div class="stat-value">${totalCells}</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Numeriske Kolonner</div>
            <div class="stat-value">${numericColumns}</div>
        </div>
    `;
}

// Display data table
function displayTable(data) {
    const dataTable = document.getElementById('dataTable');

    if (data.length === 0) return;

    const maxRows = Math.min(data.length, 50); // Limit to 50 rows for performance

    let tableHTML = '<table><thead><tr>';

    // Header row
    data[0].forEach(header => {
        tableHTML += `<th>${header || 'N/A'}</th>`;
    });
    tableHTML += '</tr></thead><tbody>';

    // Data rows
    for (let i = 1; i < maxRows; i++) {
        tableHTML += '<tr>';
        data[i].forEach(cell => {
            tableHTML += `<td>${cell !== null && cell !== undefined ? cell : ''}</td>`;
        });
        tableHTML += '</tr>';
    }

    tableHTML += '</tbody></table>';

    if (data.length > 50) {
        tableHTML += `<p style="margin-top: 1rem; color: var(--text-secondary);">Viser de første 50 rækker af ${data.length - 1} total</p>`;
    }

    dataTable.innerHTML = tableHTML;
}

// Create charts
function createCharts(data) {
    if (data.length < 2) return;

    // Find numeric columns
    const numericColumns = [];
    for (let j = 0; j < data[0].length; j++) {
        let isNumeric = true;
        const values = [];

        for (let i = 1; i < Math.min(data.length, 100); i++) {
            const value = data[i][j];
            if (value !== null && value !== undefined && value !== '') {
                if (isNaN(value)) {
                    isNumeric = false;
                    break;
                }
                values.push(parseFloat(value));
            }
        }

        if (isNumeric && values.length > 0) {
            numericColumns.push({
                index: j,
                name: data[0][j] || `Kolonne ${j + 1}`,
                values: values
            });
        }
    }

    // Get labels (first column or row numbers)
    const labels = [];
    const maxDataPoints = Math.min(data.length - 1, 20);

    for (let i = 1; i <= maxDataPoints; i++) {
        labels.push(data[i][0] || `Række ${i}`);
    }

    // Create Chart 1 - Line/Bar chart of first numeric column
    if (numericColumns.length > 0) {
        createChart1(labels, numericColumns[0]);
    }

    // Create Chart 2 - Comparison of multiple columns or pie chart
    if (numericColumns.length > 1) {
        createChart2(labels, numericColumns);
    } else if (numericColumns.length === 1) {
        createPieChart(labels, numericColumns[0]);
    }
}

// Create first chart (Line Chart)
function createChart1(labels, column) {
    const ctx = document.getElementById('chart1');

    if (chart1Instance) {
        chart1Instance.destroy();
    }

    const values = column.values.slice(0, labels.length);

    chart1Instance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: column.name,
                data: values,
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                title: {
                    display: true,
                    text: `${column.name} - Trend`,
                    font: { size: 16, weight: 'bold' }
                },
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Create second chart (Bar Chart with multiple datasets)
function createChart2(labels, columns) {
    const ctx = document.getElementById('chart2');

    if (chart2Instance) {
        chart2Instance.destroy();
    }

    const colors = [
        '#6366f1',
        '#ec4899',
        '#10b981',
        '#f59e0b',
        '#8b5cf6'
    ];

    const datasets = columns.slice(0, 3).map((column, index) => ({
        label: column.name,
        data: column.values.slice(0, labels.length),
        backgroundColor: colors[index],
        borderColor: colors[index],
        borderWidth: 2
    }));

    chart2Instance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Sammenligning af Kolonner',
                    font: { size: 16, weight: 'bold' }
                },
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Create pie chart
function createPieChart(labels, column) {
    const ctx = document.getElementById('chart2');

    if (chart2Instance) {
        chart2Instance.destroy();
    }

    const values = column.values.slice(0, 8);
    const pieLabels = labels.slice(0, 8);

    const colors = [
        '#6366f1', '#ec4899', '#10b981', '#f59e0b',
        '#8b5cf6', '#06b6d4', '#ef4444', '#14b8a6'
    ];

    chart2Instance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: pieLabels,
            datasets: [{
                data: values,
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                title: {
                    display: true,
                    text: `${column.name} - Fordeling`,
                    font: { size: 16, weight: 'bold' }
                },
                legend: {
                    display: true,
                    position: 'right'
                }
            }
        }
    });
}
