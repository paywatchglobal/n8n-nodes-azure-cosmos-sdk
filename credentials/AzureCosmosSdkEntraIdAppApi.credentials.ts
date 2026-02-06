import type {
	ICredentialDataDecryptedObject,
	ICredentialTestRequest,
	ICredentialType,
	IHttpRequestOptions,
	INodeProperties,
} from 'n8n-workflow';

export class AzureCosmosSdkEntraIdAppApi implements ICredentialType {
	name = 'azureCosmosSdkEntraIdAppApi';
	displayName = 'Azure Cosmos DB SDK (Entra ID Application) API';
	documentationUrl = 'https://learn.microsoft.com/en-us/azure/cosmos-db/how-to-setup-rbac';
	properties: INodeProperties[] = [
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

	async authenticate(
		credentials: ICredentialDataDecryptedObject,
		requestOptions: IHttpRequestOptions,
	): Promise<IHttpRequestOptions> {
		const tenantId = credentials.tenantId as string;
		const clientId = credentials.clientId as string;
		const clientSecret = credentials.clientSecret as string;

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

		const tokenData = (await response.json()) as {
			access_token?: string;
			error?: string;
			error_description?: string;
		};

		if (!response.ok || !tokenData.access_token) {
			throw new Error(
				`Failed to obtain access token: ${tokenData.error_description || tokenData.error || 'Unknown error'}`,
			);
		}

		requestOptions.headers = {
			...requestOptions.headers,
			Authorization: `type=aad&ver=1.0&sig=${tokenData.access_token}`,
			'x-ms-version': '2018-12-31',
		};

		return requestOptions;
	}

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.endpoint}}',
			url: '/dbs',
			method: 'GET',
		},
	};
}
