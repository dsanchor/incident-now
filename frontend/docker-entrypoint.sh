#!/bin/sh
# Replace the placeholder with the actual API base URL from environment variable
# Default to /api/v1 if not set (assumes a reverse proxy in front)
API_BASE_URL="${API_BASE_URL:-/api/v1}"

# AI Agent configuration
FOUNDRY_RESOURCE_NAME="${FOUNDRY_RESOURCE_NAME:-}"
FOUNDRY_PROJECT_NAME="${FOUNDRY_PROJECT_NAME:-}"
AGENT_NAME="${AGENT_NAME:-}"
AGENT_API_KEY="${AGENT_API_KEY:-}"
AGENT_PROXY_ENDPOINT="${AGENT_PROXY_ENDPOINT:-}"

# Replace in all JS files
find /usr/share/nginx/html -name '*.js' -exec sed -i "s|API_BASE_URL_PLACEHOLDER|${API_BASE_URL}|g" {} +
find /usr/share/nginx/html -name '*.js' -exec sed -i "s|FOUNDRY_RESOURCE_NAME_PLACEHOLDER|${FOUNDRY_RESOURCE_NAME}|g" {} +
find /usr/share/nginx/html -name '*.js' -exec sed -i "s|FOUNDRY_PROJECT_NAME_PLACEHOLDER|${FOUNDRY_PROJECT_NAME}|g" {} +
find /usr/share/nginx/html -name '*.js' -exec sed -i "s|AGENT_NAME_PLACEHOLDER|${AGENT_NAME}|g" {} +
find /usr/share/nginx/html -name '*.js' -exec sed -i "s|AGENT_API_KEY_PLACEHOLDER|${AGENT_API_KEY}|g" {} +
find /usr/share/nginx/html -name '*.js' -exec sed -i "s|AGENT_PROXY_ENDPOINT_PLACEHOLDER|${AGENT_PROXY_ENDPOINT}|g" {} +

echo "API_BASE_URL set to: ${API_BASE_URL}"
echo "FOUNDRY_RESOURCE_NAME set to: ${FOUNDRY_RESOURCE_NAME}"
echo "FOUNDRY_PROJECT_NAME set to: ${FOUNDRY_PROJECT_NAME}"
echo "AGENT_NAME set to: ${AGENT_NAME}"
echo "AGENT_API_KEY set to: [REDACTED]"
echo "AGENT_PROXY_ENDPOINT set to: ${AGENT_PROXY_ENDPOINT}"

# Start nginx
exec nginx -g 'daemon off;'
