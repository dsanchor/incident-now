#!/bin/sh
# Replace the placeholder with the actual API base URL from environment variable
# Default to /api/v1 if not set (assumes a reverse proxy in front)
API_BASE_URL="${API_BASE_URL:-/api/v1}"

# Replace in all JS files
find /usr/share/nginx/html -name '*.js' -exec sed -i "s|API_BASE_URL_PLACEHOLDER|${API_BASE_URL}|g" {} +

echo "API_BASE_URL set to: ${API_BASE_URL}"

# Start nginx
exec nginx -g 'daemon off;'
