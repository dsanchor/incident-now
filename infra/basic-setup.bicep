// Basic agent setup 
@description('The name of the Azure AI Foundry resource.')
@maxLength(9)
param aiServicesName string = 'foundy'

@description('The name of your project')
param projectName string = 'project'

@description('The description of your project')
param projectDescription string = 'some description'

@description('The display name of your project')
param projectDisplayName string = 'project_display_name'

//ensures unique name for the account
// Create a short, unique suffix, that will be unique to each resource group
param deploymentTimestamp string = utcNow('yyyyMMddHHmmss')
@description('Optional unique suffix. If not provided, one will be auto-generated.')
param uniqueSuffixParam string = ''
var uniqueSuffix = uniqueSuffixParam != '' ? uniqueSuffixParam : substring(uniqueString('${resourceGroup().id}-${deploymentTimestamp}'), 0, 4)
var accountName = toLower('${aiServicesName}${uniqueSuffix}')
@allowed([
  'australiaeast'
  'canadaeast'
  'eastus'
  'eastus2'
  'francecentral'
  'japaneast'
  'koreacentral'
  'norwayeast'
  'polandcentral'
  'southindia'
  'swedencentral'
  'switzerlandnorth'
  'uaenorth'
  'uksouth'
  'westus'
  'westus2'
  'westus3'
  'westeurope'
  'southeastasia'
  'brazilsouth'
  'germanywestcentral'
  'italynorth'
  'southafricanorth'
  'southcentralus'
  'northcentralus'
])
@description('The Azure region where your AI Foundry resource and project will be created.')
param location string = 'germanywestcentral'

@description('The name of the OpenAI model you want to deploy')
param modelName string = 'gpt-4.1'

@description('The model format of the model you want to deploy. Example: OpenAI')
param modelFormat string = 'OpenAI'

@description('The version of the model you want to deploy. Example: 2024-11-20')
param modelVersion string = '2025-04-14'

@description('The SKU name for the model deployment. Example: GlobalStandard')
param modelSkuName string = 'GlobalStandard'

@description('The capacity of the model deployment in TPM.')
param modelCapacity int = 100

#disable-next-line BCP081
resource account 'Microsoft.CognitiveServices/accounts@2025-04-01-preview' = {
  name: accountName
  location: location
  sku: {
    name: 'S0'
  }
  kind: 'AIServices'
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    allowProjectManagement: true
    customSubDomainName: toLower(accountName)
    networkAcls: {
      defaultAction: 'Allow'
      virtualNetworkRules: []
      ipRules: []
    }
    publicNetworkAccess: 'Enabled'
    disableLocalAuth: true
  }
}

/*
  Step 3: Create a Cognitive Services Project
    
*/
#disable-next-line BCP081
resource project 'Microsoft.CognitiveServices/accounts/projects@2025-04-01-preview' = {
  parent: account
  name: projectName
  location: location
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    description: projectDescription
    displayName: projectDisplayName
  }
}

#disable-next-line BCP081
resource modelDeployment 'Microsoft.CognitiveServices/accounts/deployments@2024-10-01'= {
  parent: account
  name: modelName
  sku : {
    capacity: modelCapacity
    name: modelSkuName
  }
  properties: {
    model:{
      name: modelName
      format: modelFormat
      version: modelVersion
    }
  }
}

/*
  Step 4: Create Log Analytics Workspace for monitoring
*/
resource logAnalyticsWorkspace 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: 'law-${accountName}'
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
  }
}

/*
  Step 5: Create Application Insights for telemetry
*/
resource applicationInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: 'appi-${accountName}'
  location: location
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalyticsWorkspace.id
  }
}

output accountName string = account.name
output projectName string = project.name
output accountEndpoint string = account.properties.endpoint
output logAnalyticsWorkspaceId string = logAnalyticsWorkspace.id
output applicationInsightsConnectionString string = applicationInsights.properties.ConnectionString
output applicationInsightsInstrumentationKey string = applicationInsights.properties.InstrumentationKey

/*
  Step 6: Create API Management (BasicV2)
*/
@description('The email address of the API Management publisher.')
param apimPublisherEmail string = 'admin@incident-now.io'

@description('The name of the API Management publisher.')
param apimPublisherName string = 'IncidentNow'

resource apiManagement 'Microsoft.ApiManagement/service@2023-09-01-preview' = {
  name: 'apim-${accountName}'
  location: location
  sku: {
    name: 'BasicV2'
    capacity: 1
  }
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    publisherEmail: apimPublisherEmail
    publisherName: apimPublisherName
  }
}

/*
  Step 7: Create Azure AI Search
*/
@description('The SKU for Azure AI Search. Default: basic')
@allowed(['free', 'basic', 'standard', 'standard2', 'standard3'])
param searchSkuName string = 'basic'

resource aiSearch 'Microsoft.Search/searchServices@2024-06-01-preview' = {
  name: 'search-${accountName}'
  location: location
  sku: {
    name: searchSkuName
  }
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    hostingMode: 'default'
    partitionCount: 1
    replicaCount: 1
    publicNetworkAccess: 'enabled'
  }
}

output apiManagementName string = apiManagement.name
output apiManagementGatewayUrl string = apiManagement.properties.gatewayUrl
output aiSearchName string = aiSearch.name
output aiSearchEndpoint string = 'https://${aiSearch.name}.search.windows.net'

/*
  Step 8: Create Container App Environment and Apps
*/
@description('The container image for the backend app')
param backendImage string = 'ghcr.io/dsanchor/incident-now/backend:latest'

@description('The container image for the frontend app')
param frontendImage string = 'ghcr.io/dsanchor/incident-now/frontend:latest'

resource containerAppEnvironment 'Microsoft.App/managedEnvironments@2024-03-01' = {
  name: 'cae-${accountName}'
  location: location
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalyticsWorkspace.properties.customerId
        sharedKey: logAnalyticsWorkspace.listKeys().primarySharedKey
      }
    }
  }
}

resource backendApp 'Microsoft.App/containerApps@2024-03-01' = {
  name: 'incidentnow-backend'
  location: location
  properties: {
    managedEnvironmentId: containerAppEnvironment.id
    configuration: {
      ingress: {
        external: true
        targetPort: 8080
        transport: 'http'
        allowInsecure: false
      }
    }
    template: {
      containers: [
        {
          name: 'backend'
          image: backendImage
          resources: {
            cpu: json('1')
            memory: '2Gi'
          }
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 3
      }
    }
  }
}

resource frontendApp 'Microsoft.App/containerApps@2024-03-01' = {
  name: 'incidentnow-frontend'
  location: location
  properties: {
    managedEnvironmentId: containerAppEnvironment.id
    configuration: {
      ingress: {
        external: true
        targetPort: 80
        transport: 'http'
        allowInsecure: false
      }
    }
    template: {
      containers: [
        {
          name: 'frontend'
          image: frontendImage
          resources: {
            cpu: json('0.5')
            memory: '1Gi'
          }
          env: [
            {
              name: 'API_BASE_URL'
              value: 'https://${backendApp.properties.configuration.ingress.fqdn}/api/v1'
            }
          ]
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 3
      }
    }
  }
}

output containerAppEnvironmentName string = containerAppEnvironment.name
output backendFqdn string = backendApp.properties.configuration.ingress.fqdn
output frontendFqdn string = frontendApp.properties.configuration.ingress.fqdn
output backendUrl string = 'https://${backendApp.properties.configuration.ingress.fqdn}'
output frontendUrl string = 'https://${frontendApp.properties.configuration.ingress.fqdn}'
