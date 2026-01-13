/**
 * Power BI Service Connector
 * Handles authentication and data fetching from Power BI Service
 */

class PowerBIConnector {
    constructor() {
        // Power BI API configuration
        this.clientId = null;
        this.redirectUri = window.location.origin + window.location.pathname;
        this.apiBaseUrl = 'https://api.powerbi.com/v1.0/myorg';
        this.authEndpoint = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';
        this.scopes = 'https://analysis.windows.net/powerbi/api/Dataset.Read.All https://analysis.windows.net/powerbi/api/Report.Read.All';
        this.accessToken = null;

        // Check for access token in URL (OAuth callback)
        this.checkForAccessToken();
    }

    /**
     * Set the Azure AD Application (Client) ID
     */
    setClientId(clientId) {
        this.clientId = clientId;
        localStorage.setItem('powerbi_client_id', clientId);
    }

    /**
     * Load saved client ID from localStorage
     */
    loadClientId() {
        const savedClientId = localStorage.getItem('powerbi_client_id');
        if (savedClientId) {
            this.clientId = savedClientId;
            return savedClientId;
        }
        return null;
    }

    /**
     * Check if we have an access token in the URL (OAuth callback)
     */
    checkForAccessToken() {
        const hash = window.location.hash;
        if (hash && hash.includes('access_token')) {
            const params = new URLSearchParams(hash.substring(1));
            this.accessToken = params.get('access_token');

            if (this.accessToken) {
                // Store token with expiration
                const expiresIn = parseInt(params.get('expires_in') || '3600', 10);
                const expirationTime = Date.now() + (expiresIn * 1000);
                localStorage.setItem('powerbi_access_token', this.accessToken);
                localStorage.setItem('powerbi_token_expiration', expirationTime.toString());

                // Clean up URL
                window.location.hash = '';

                console.log('Power BI authentication successful');
                return true;
            }
        }

        // Check for stored token
        const storedToken = localStorage.getItem('powerbi_access_token');
        const expiration = localStorage.getItem('powerbi_token_expiration');

        if (storedToken && expiration) {
            if (Date.now() < parseInt(expiration, 10)) {
                this.accessToken = storedToken;
                return true;
            } else {
                // Token expired
                this.clearAuthentication();
            }
        }

        return false;
    }

    /**
     * Initiate OAuth authentication flow
     */
    authenticate() {
        if (!this.clientId) {
            throw new Error('Client ID not set. Please configure your Azure AD Application ID first.');
        }

        // Build authorization URL
        const authUrl = new URL(this.authEndpoint);
        authUrl.searchParams.append('client_id', this.clientId);
        authUrl.searchParams.append('response_type', 'token');
        authUrl.searchParams.append('redirect_uri', this.redirectUri);
        authUrl.searchParams.append('scope', this.scopes);
        authUrl.searchParams.append('response_mode', 'fragment');

        // Redirect to Microsoft login
        window.location.href = authUrl.toString();
    }

    /**
     * Clear authentication data
     */
    clearAuthentication() {
        this.accessToken = null;
        localStorage.removeItem('powerbi_access_token');
        localStorage.removeItem('powerbi_token_expiration');
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return !!this.accessToken;
    }

    /**
     * Make authenticated API request to Power BI
     */
    async makeApiRequest(endpoint) {
        if (!this.accessToken) {
            throw new Error('Not authenticated. Please sign in to Power BI first.');
        }

        const response = await fetch(`${this.apiBaseUrl}${endpoint}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                this.clearAuthentication();
                throw new Error('Authentication expired. Please sign in again.');
            }
            throw new Error(`Power BI API error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    }

    /**
     * Get all workspaces (groups)
     */
    async getWorkspaces() {
        try {
            const data = await this.makeApiRequest('/groups');
            return data.value || [];
        } catch (error) {
            console.error('Error fetching workspaces:', error);
            throw error;
        }
    }

    /**
     * Get all datasets in a workspace
     */
    async getDatasets(workspaceId = null) {
        try {
            let endpoint = '/datasets';
            if (workspaceId) {
                endpoint = `/groups/${workspaceId}/datasets`;
            }
            const data = await this.makeApiRequest(endpoint);
            return data.value || [];
        } catch (error) {
            console.error('Error fetching datasets:', error);
            throw error;
        }
    }

    /**
     * Get tables in a dataset
     */
    async getTables(datasetId, workspaceId = null) {
        try {
            let endpoint = `/datasets/${datasetId}/tables`;
            if (workspaceId) {
                endpoint = `/groups/${workspaceId}/datasets/${datasetId}/tables`;
            }
            const data = await this.makeApiRequest(endpoint);
            return data.value || [];
        } catch (error) {
            console.error('Error fetching tables:', error);
            throw error;
        }
    }

    /**
     * Execute DAX query to get data from a dataset
     */
    async executeQuery(datasetId, query, workspaceId = null) {
        if (!this.accessToken) {
            throw new Error('Not authenticated. Please sign in to Power BI first.');
        }

        try {
            let endpoint = `${this.apiBaseUrl}/datasets/${datasetId}/executeQueries`;
            if (workspaceId) {
                endpoint = `${this.apiBaseUrl}/groups/${workspaceId}/datasets/${datasetId}/executeQueries`;
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    queries: [{
                        query: query
                    }],
                    serializerSettings: {
                        includeNulls: true
                    }
                })
            });

            if (!response.ok) {
                if (response.status === 401) {
                    this.clearAuthentication();
                    throw new Error('Authentication expired. Please sign in again.');
                }
                const errorText = await response.text();
                throw new Error(`Query execution error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            return data.results[0];
        } catch (error) {
            console.error('Error executing query:', error);
            throw error;
        }
    }

    /**
     * Get data from a table
     */
    async getTableData(datasetId, tableName, workspaceId = null, rowLimit = 1000) {
        try {
            // Construct DAX query to get table data
            const query = `EVALUATE TOPN(${rowLimit}, '${tableName}')`;
            const result = await this.executeQuery(datasetId, query, workspaceId);

            if (!result || !result.tables || result.tables.length === 0) {
                throw new Error('No data returned from query');
            }

            const table = result.tables[0];
            return {
                columns: table.rows[0] ? Object.keys(table.rows[0]) : [],
                rows: table.rows
            };
        } catch (error) {
            console.error('Error getting table data:', error);
            throw error;
        }
    }

    /**
     * Convert Power BI table data to CSV format (for compatibility with existing dashboard)
     */
    convertToCSV(tableData) {
        if (!tableData || !tableData.columns || !tableData.rows) {
            throw new Error('Invalid table data format');
        }

        const { columns, rows } = tableData;

        // Create header row
        let csv = columns.join(',') + '\n';

        // Create data rows
        rows.forEach(row => {
            const values = columns.map(col => {
                let value = row[col];

                // Handle null/undefined
                if (value === null || value === undefined) {
                    return '';
                }

                // Convert to string and escape quotes
                value = String(value).replace(/"/g, '""');

                // Quote if contains comma, newline, or quotes
                if (value.includes(',') || value.includes('\n') || value.includes('"')) {
                    return `"${value}"`;
                }

                return value;
            });
            csv += values.join(',') + '\n';
        });

        return csv;
    }
}

// Create global instance
window.powerBIConnector = new PowerBIConnector();
