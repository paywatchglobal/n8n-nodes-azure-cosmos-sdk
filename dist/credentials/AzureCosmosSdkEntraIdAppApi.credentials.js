"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AzureCosmosSdkEntraIdAppApi = void 0;
class AzureCosmosSdkEntraIdAppApi {
    constructor() {
        this.name = 'azureCosmosSdkEntraIdAppApi';
        this.displayName = 'Azure Cosmos DB SDK (Entra ID Application) API';
        this.documentationUrl = 'https://learn.microsoft.com/en-us/azure/cosmos-db/how-to-setup-rbac';
        this.properties = [
            {
                displayName: 'Tenant ID',
                name: 'tenantId',
                type: 'string',
                default: '',
                required: true,
                placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
                description: 'The Azure AD / Entra ID tenant (directory) ID',
                noDataExpression: true,
            },
            {
                displayName: 'Client ID',
                name: 'clientId',
                type: 'string',
                default: '',
                required: true,
                placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
                description: 'The application (client) ID from the Azure AD app registration',
                noDataExpression: true,
            },
            {
                displayName: 'Client Secret',
                name: 'clientSecret',
                type: 'string',
                typeOptions: {
                    password: true,
                },
                default: '',
                required: true,
                description: 'The client secret from the Azure AD app registration',
                noDataExpression: true,
            },
            {
                displayName: 'Endpoint',
                name: 'endpoint',
                type: 'string',
                default: '',
                required: true,
                placeholder: 'https://your-account.documents.azure.com:443/',
                description: 'The Cosmos DB account endpoint URL',
                noDataExpression: true,
            },
        ];
        this.test = {
            request: {
                baseURL: '={{$credentials.endpoint}}',
                url: '/dbs',
                method: 'GET',
            },
        };
    }
    async authenticate(credentials, requestOptions) {
        const tenantId = credentials.tenantId;
        const clientId = credentials.clientId;
        const clientSecret = credentials.clientSecret;
        const tokenUrl = `https://login.microsoftonline.com/${encodeURIComponent(tenantId)}/oauth2/v2.0/token`;
        const body = new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: clientId,
            client_secret: clientSecret,
            scope: 'https://cosmos.azure.com/.default',
        });
        const response = await fetch(tokenUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: body.toString(),
        });
        const tokenData = (await response.json());
        if (!response.ok || !tokenData.access_token) {
            throw new Error(`Failed to obtain access token: ${tokenData.error_description || tokenData.error || 'Unknown error'}`);
        }
        requestOptions.headers = {
            ...requestOptions.headers,
            Authorization: `type=aad&ver=1.0&sig=${tokenData.access_token}`,
            'x-ms-version': '2018-12-31',
        };
        return requestOptions;
    }
}
exports.AzureCosmosSdkEntraIdAppApi = AzureCosmosSdkEntraIdAppApi;
//# sourceMappingURL=AzureCosmosSdkEntraIdAppApi.credentials.js.map