// Global variables to store data
let currentData = [];
let chart1Instance = null;
let chart2Instance = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeFileUpload();
    initializePowerBI();
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

    console.log('Processing file:', fileName);

    // Show file info
    const fileInfo = document.getElementById('fileInfo');
    fileInfo.innerHTML = `
        <h3>✅ Fil uploadet</h3>
        <p><strong>Filnavn:</strong> ${fileName}</p>
        <p><strong>Størrelse:</strong> ${fileSize} KB</p>
        <p>Behandler data...</p>
    `;
    fileInfo.style.display = 'block';

    // Check if CSV file
    const isCSV = fileName.toLowerCase().endsWith('.csv');

    // Read the file
    const reader = new FileReader();

    reader.onerror = function() {
        console.error('File read error');
        fileInfo.innerHTML = `
            <h3>❌ Fejl</h3>
            <p style="color: red;">Kunne ikke læse filen</p>
        `;
    };

    reader.onload = function(e) {
        try {
            console.log('File loaded, parsing...');

            let jsonData;

            if (isCSV) {
                // For CSV, read as text
                const text = e.target.result;
                console.log('CSV content preview:', text.substring(0, 200));

                // Parse CSV manually
                const lines = text.split('\n').filter(line => line.trim());
                jsonData = lines.map(line => {
                    // Simple CSV parsing (handles basic cases)
                    return line.split(',').map(cell => cell.trim());
                });
            } else {
                // For Excel files
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });

                // Get first sheet
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];

                // Convert to JSON with raw values
                jsonData = XLSX.utils.sheet_to_json(worksheet, {
                    header: 1,
                    raw: false,
                    defval: ''
                });
            }

            console.log('Parsed data:', jsonData);
            console.log('Rows:', jsonData.length, 'Columns:', jsonData[0]?.length);

            if (jsonData && jsonData.length > 0 && jsonData[0].length > 0) {
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
            console.error('Error processing file:', error);
            fileInfo.innerHTML = `
                <h3>❌ Fejl</h3>
                <p style="color: red;">Kunne ikke læse filen: ${error.message}</p>
                <p style="font-size: 0.9em;">Tjek browser konsollen (F12) for mere info</p>
            `;
        }
    };

    // Read as text for CSV, as array buffer for Excel
    if (isCSV) {
        reader.readAsText(file);
    } else {
        reader.readAsArrayBuffer(file);
    }
}

// Process and display data
function processData(data) {
    console.log('Processing data...');
    currentData = data;

    // Show data sections
    document.getElementById('dataSection').style.display = 'block';
    document.getElementById('chartsSection').style.display = 'block';

    // Display statistics
    console.log('Displaying statistics...');
    displayStatistics(data);

    // Display table
    console.log('Displaying table...');
    displayTable(data);

    // Create charts
    console.log('Creating charts...');
    createCharts(data);

    console.log('Data processing complete!');
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
    console.log('createCharts called with data length:', data.length);

    if (data.length < 2) {
        console.log('Not enough data for charts');
        return;
    }

    // Find numeric columns (skip first column as it's usually labels)
    const numericColumns = [];
    for (let j = 1; j < data[0].length; j++) {
        let isNumeric = true;
        const values = [];

        for (let i = 1; i < Math.min(data.length, 100); i++) {
            const value = data[i][j];
            if (value !== null && value !== undefined && value !== '') {
                const numValue = parseFloat(String(value).replace(/,/g, ''));
                if (isNaN(numValue)) {
                    isNumeric = false;
                    break;
                }
                values.push(numValue);
            }
        }

        if (isNumeric && values.length > 0) {
            numericColumns.push({
                index: j,
                name: data[0][j] || `Kolonne ${j + 1}`,
                values: values
            });
            console.log(`Found numeric column: ${data[0][j]} with ${values.length} values`);
        }
    }

    console.log(`Total numeric columns found: ${numericColumns.length}`);

    // Get labels (first column or row numbers)
    const labels = [];
    const maxDataPoints = Math.min(data.length - 1, 20);

    for (let i = 1; i <= maxDataPoints; i++) {
        labels.push(String(data[i][0] || `Række ${i}`));
    }

    console.log('Labels:', labels);

    // Create Chart 1 - Line/Bar chart of first numeric column
    if (numericColumns.length > 0) {
        console.log('Creating chart 1...');
        createChart1(labels, numericColumns[0]);
    } else {
        console.log('No numeric columns for chart 1');
        document.getElementById('chart1').parentElement.innerHTML =
            '<p style="text-align: center; padding: 2rem; color: var(--text-secondary);">Ingen numeriske data fundet til visualisering</p>';
    }

    // Create Chart 2 - Comparison of multiple columns or pie chart
    if (numericColumns.length > 1) {
        console.log('Creating chart 2 (bar)...');
        createChart2(labels, numericColumns);
    } else if (numericColumns.length === 1) {
        console.log('Creating chart 2 (pie)...');
        createPieChart(labels, numericColumns[0]);
    } else {
        console.log('No data for chart 2');
        document.getElementById('chart2').parentElement.innerHTML =
            '<p style="text-align: center; padding: 2rem; color: var(--text-secondary);">Tilføj flere numeriske kolonner for sammenligning</p>';
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

// ===========================================
// Power BI Integration Functions
// ===========================================

// Initialize Power BI on page load
function initializePowerBI() {
    console.log('Initializing Power BI integration...');

    // Load saved client ID
    const savedClientId = window.powerBIConnector.loadClientId();
    if (savedClientId) {
        document.getElementById('clientIdInput').value = savedClientId;
        document.getElementById('connectBtn').disabled = false;
    }

    // Check if already authenticated
    if (window.powerBIConnector.isAuthenticated()) {
        showAuthenticatedState();
        loadWorkspaces();
    }
}

// Save Client ID
function saveClientId() {
    const clientIdInput = document.getElementById('clientIdInput');
    const clientId = clientIdInput.value.trim();

    if (!clientId) {
        alert('Indtast venligst et gyldigt Application ID');
        return;
    }

    try {
        window.powerBIConnector.setClientId(clientId);
        document.getElementById('connectBtn').disabled = false;

        // Show success message
        showAuthStatus('✓ Client ID gemt succesfuldt', 'success');
        console.log('Client ID saved:', clientId);
    } catch (error) {
        console.error('Error saving client ID:', error);
        showAuthStatus('✗ Kunne ikke gemme Client ID', 'error');
    }
}

// Connect to Power BI (initiate OAuth flow)
function connectToPowerBI() {
    try {
        console.log('Initiating Power BI authentication...');
        window.powerBIConnector.authenticate();
    } catch (error) {
        console.error('Authentication error:', error);
        showAuthStatus('✗ ' + error.message, 'error');
    }
}

// Disconnect from Power BI
function disconnectPowerBI() {
    if (confirm('Er du sikker på, at du vil afbryde forbindelsen til Power BI?')) {
        window.powerBIConnector.clearAuthentication();
        location.reload();
    }
}

// Show authenticated state
function showAuthenticatedState() {
    document.getElementById('powerbiConfig').style.display = 'none';
    document.getElementById('powerbiDataSelection').style.display = 'block';
    showAuthStatus('✓ Forbundet til Power BI', 'success');
}

// Show authentication status message
function showAuthStatus(message, type) {
    const authStatus = document.getElementById('authStatus');
    authStatus.textContent = message;
    authStatus.className = `auth-status ${type}`;
    authStatus.style.display = 'block';

    // Hide after 5 seconds
    setTimeout(() => {
        authStatus.style.display = 'none';
    }, 5000);
}

// Load workspaces
async function loadWorkspaces() {
    try {
        console.log('Loading workspaces...');
        const workspaces = await window.powerBIConnector.getWorkspaces();

        const workspaceSelect = document.getElementById('workspaceSelect');
        workspaceSelect.innerHTML = '<option value="">-- Vælg workspace --</option>';

        // Add "My Workspace" option
        workspaceSelect.innerHTML += '<option value="">Mit Workspace (default)</option>';

        workspaces.forEach(workspace => {
            const option = document.createElement('option');
            option.value = workspace.id;
            option.textContent = workspace.name;
            workspaceSelect.appendChild(option);
        });

        console.log(`Loaded ${workspaces.length} workspaces`);

        // Load datasets for default workspace
        loadDatasetsForWorkspace();
    } catch (error) {
        console.error('Error loading workspaces:', error);
        alert('Fejl ved indlæsning af workspaces: ' + error.message);
    }
}

// Load datasets for selected workspace
async function loadDatasetsForWorkspace() {
    try {
        const workspaceId = document.getElementById('workspaceSelect').value || null;
        console.log('Loading datasets for workspace:', workspaceId || 'default');

        const datasets = await window.powerBIConnector.getDatasets(workspaceId);

        const datasetSelect = document.getElementById('datasetSelect');
        datasetSelect.innerHTML = '<option value="">-- Vælg dataset --</option>';

        datasets.forEach(dataset => {
            const option = document.createElement('option');
            option.value = dataset.id;
            option.textContent = dataset.name;
            datasetSelect.appendChild(option);
        });

        console.log(`Loaded ${datasets.length} datasets`);

        // Clear table selection
        document.getElementById('tableSelect').innerHTML = '<option value="">-- Vælg tabel --</option>';
        document.getElementById('loadDataBtn').disabled = true;
    } catch (error) {
        console.error('Error loading datasets:', error);
        alert('Fejl ved indlæsning af datasets: ' + error.message);
    }
}

// Load tables for selected dataset
async function loadTablesForDataset() {
    try {
        const workspaceId = document.getElementById('workspaceSelect').value || null;
        const datasetId = document.getElementById('datasetSelect').value;

        if (!datasetId) {
            document.getElementById('loadDataBtn').disabled = true;
            return;
        }

        console.log('Loading tables for dataset:', datasetId);

        const tables = await window.powerBIConnector.getTables(datasetId, workspaceId);

        const tableSelect = document.getElementById('tableSelect');
        tableSelect.innerHTML = '<option value="">-- Vælg tabel --</option>';

        tables.forEach(table => {
            const option = document.createElement('option');
            option.value = table.name;
            option.textContent = table.name;
            tableSelect.appendChild(option);
        });

        console.log(`Loaded ${tables.length} tables`);

        // Enable load button
        document.getElementById('loadDataBtn').disabled = false;
    } catch (error) {
        console.error('Error loading tables:', error);
        alert('Fejl ved indlæsning af tabeller: ' + error.message);
    }
}

// Load data from Power BI
async function loadPowerBIData() {
    try {
        const workspaceId = document.getElementById('workspaceSelect').value || null;
        const datasetId = document.getElementById('datasetSelect').value;
        const tableName = document.getElementById('tableSelect').value;
        const rowLimit = parseInt(document.getElementById('rowLimitInput').value, 10);

        if (!datasetId || !tableName) {
            alert('Vælg venligst både et dataset og en tabel');
            return;
        }

        // Show loading status
        document.getElementById('loadingStatus').style.display = 'flex';
        document.getElementById('loadDataBtn').disabled = true;

        console.log('Loading data from Power BI...');
        console.log('Workspace:', workspaceId || 'default');
        console.log('Dataset:', datasetId);
        console.log('Table:', tableName);
        console.log('Row limit:', rowLimit);

        // Get table data
        const tableData = await window.powerBIConnector.getTableData(datasetId, tableName, workspaceId, rowLimit);

        // Convert to CSV format
        const csvData = window.powerBIConnector.convertToCSV(tableData);

        console.log('Data loaded successfully, processing...');

        // Parse CSV into array format for existing dashboard functions
        const lines = csvData.split('\n').filter(line => line.trim());
        const data = lines.map(line => {
            // Handle quoted values
            const values = [];
            let current = '';
            let inQuotes = false;

            for (let i = 0; i < line.length; i++) {
                const char = line[i];

                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    values.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }
            values.push(current.trim());

            return values;
        });

        console.log('Parsed data:', data.length, 'rows');

        // Process the data using existing dashboard functions
        processData(data);

        // Hide loading status
        document.getElementById('loadingStatus').style.display = 'none';
        document.getElementById('loadDataBtn').disabled = false;

        // Show success message
        alert(`✓ Data indlæst succesfuldt!\n\nRækker: ${data.length - 1}\nKolonner: ${data[0].length}`);

    } catch (error) {
        console.error('Error loading Power BI data:', error);
        document.getElementById('loadingStatus').style.display = 'none';
        document.getElementById('loadDataBtn').disabled = false;
        alert('Fejl ved indlæsning af data: ' + error.message);
    }
}

// Show setup guide (placeholder)
function showSetupGuide() {
    const guideUrl = 'POWERBI-SETUP.md';
    window.open(guideUrl, '_blank');
}
