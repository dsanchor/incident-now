# Incident Now - REST API Backend

REST API for managing IT incidents, built with **Spring Boot 3.5.7** and **Java 21**.

## Quick Start

### Prerequisites
- Java 21+
- Maven 3.9+

### Run the application

```bash
cd backend
./mvnw spring-boot:run
```

The API will be available at `http://localhost:8080/api/v1`.

### Swagger UI

Open [http://localhost:8080/api/v1/swagger-ui.html](http://localhost:8080/api/v1/swagger-ui.html) to explore the API.

### H2 Console

Open [http://localhost:8080/api/v1/h2-console](http://localhost:8080/api/v1/h2-console) (JDBC URL: `jdbc:h2:mem:incidentdb`).

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| **Owners** | | |
| GET | `/owners` | List all owners (paginated, filterable) |
| POST | `/owners` | Create a new owner |
| GET | `/owners/{id}` | Get owner by ID |
| PUT | `/owners/{id}` | Full update owner |
| PATCH | `/owners/{id}` | Partial update owner |
| DELETE | `/owners/{id}` | Soft-delete owner |
| GET | `/owners/{id}/incidents` | Get owned incidents |
| GET | `/owners/{id}/assigned-incidents` | Get assigned incidents |
| **Incidents** | | |
| GET | `/incidents` | List all incidents (paginated, filterable) |
| POST | `/incidents` | Create a new incident |
| GET | `/incidents/{id}` | Get incident by ID |
| PUT | `/incidents/{id}` | Full update incident |
| PATCH | `/incidents/{id}` | Partial update incident |
| DELETE | `/incidents/{id}` | Delete incident |
| POST | `/incidents/{id}/resolve` | Resolve an incident |
| POST | `/incidents/{id}/close` | Close a resolved incident |
| POST | `/incidents/{id}/reopen` | Reopen an incident |
| POST | `/incidents/{id}/assign` | Assign users to incident |
| GET | `/incidents/{id}/comments` | Get incident comments |
| POST | `/incidents/{id}/comments` | Add comment to incident |
| GET | `/incidents/{id}/timeline` | Get incident timeline |
| **Statistics** | | |
| GET | `/statistics/summary` | Incident summary stats |
| GET | `/statistics/by-status` | Count by status |
| GET | `/statistics/by-priority` | Count by priority |
| GET | `/statistics/by-category` | Count by category |
| GET | `/statistics/by-owner` | Count by owner |
| GET | `/statistics/resolution-time` | Resolution time stats |
| GET | `/statistics/trends` | Incident trends |

---

## Curl Examples

> **Note:** The application starts with sample data. Replace UUIDs below with actual IDs from your responses.

### Set base URL

```bash
BASE_URL="http://localhost:8080/api/v1"
```

---

### Owners

#### Create an owner

```bash
curl -s -X POST "$BASE_URL/owners" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@company.com",
    "phone": "+1-555-0199",
    "team": "Platform Engineering",
    "role": "engineer",
    "department": "Engineering",
    "timezone": "America/New_York",
    "slackHandle": "@john.doe",
    "githubUsername": "johndoe",
    "onCall": false
  }' | jq .
```

#### List all owners

```bash
curl -s "$BASE_URL/owners" | jq .
```

#### List owners with filters

```bash
# Filter by team and active status
curl -s "$BASE_URL/owners?team=Platform%20Engineering&active=true" | jq .

# Search by name or email
curl -s "$BASE_URL/owners?search=alice" | jq .

# Filter by role
curl -s "$BASE_URL/owners?role=senior_engineer" | jq .
```

#### Get owner by ID

```bash
# Replace OWNER_ID with actual UUID
OWNER_ID="<uuid>"
curl -s "$BASE_URL/owners/$OWNER_ID" | jq .
```

#### Update an owner (full)

```bash
curl -s -X PUT "$BASE_URL/owners/$OWNER_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe Updated",
    "email": "john.doe@company.com",
    "phone": "+1-555-0199",
    "team": "Infrastructure",
    "role": "senior_engineer",
    "department": "Engineering",
    "timezone": "America/Chicago",
    "slackHandle": "@john.doe",
    "githubUsername": "johndoe",
    "active": true,
    "onCall": true
  }' | jq .
```

#### Partially update an owner

```bash
curl -s -X PATCH "$BASE_URL/owners/$OWNER_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "onCall": true,
    "team": "Security"
  }' | jq .
```

#### Delete an owner (soft delete)

```bash
curl -s -X DELETE "$BASE_URL/owners/$OWNER_ID" -w "\nHTTP Status: %{http_code}\n"
```

#### Get incidents owned by user

```bash
curl -s "$BASE_URL/owners/$OWNER_ID/incidents" | jq .

# Filter by status
curl -s "$BASE_URL/owners/$OWNER_ID/incidents?status=open" | jq .
```

#### Get incidents assigned to user

```bash
curl -s "$BASE_URL/owners/$OWNER_ID/assigned-incidents" | jq .
```

---

### Incidents

#### Create an incident

```bash
curl -s -X POST "$BASE_URL/incidents" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Network switch failure in US-East datacenter",
    "description": "Core network switch in rack 42 has failed, causing connectivity issues for services in US-East region.",
    "priority": "critical",
    "severity": "critical",
    "category": "network",
    "tags": ["network", "datacenter", "us-east"],
    "affectedSystems": ["API Gateway", "CDN", "Load Balancer"],
    "affectedUsers": 15000,
    "ownerId": "'$OWNER_ID'",
    "workaround": "Traffic rerouted through US-West datacenter",
    "githubRepo": {
      "repoOwner": "incidentnow",
      "repoName": "infrastructure",
      "branch": "fix/switch-failover",
      "issueNumber": 456
    },
    "dueDate": "2026-02-17T18:00:00"
  }' | jq .
```

#### Create an incident (minimal)

```bash
curl -s -X POST "$BASE_URL/incidents" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Login page returning 503",
    "description": "Users unable to log in, receiving 503 Service Unavailable.",
    "priority": "high",
    "severity": "high",
    "category": "application",
    "ownerId": "'$OWNER_ID'"
  }' | jq .
```

#### List all incidents

```bash
curl -s "$BASE_URL/incidents" | jq .
```

#### List incidents with filters

```bash
# Filter by status
curl -s "$BASE_URL/incidents?status=open" | jq .

# Filter by priority
curl -s "$BASE_URL/incidents?priority=critical" | jq .

# Filter by category
curl -s "$BASE_URL/incidents?category=database" | jq .

# Search
curl -s "$BASE_URL/incidents?search=database" | jq .

# Combine filters with sorting and pagination
curl -s "$BASE_URL/incidents?status=in_progress&priority=critical&sortBy=createdAt&sortOrder=desc&page=1&pageSize=10" | jq .

# Filter by date range
curl -s "$BASE_URL/incidents?createdAfter=2026-02-01T00:00:00&createdBefore=2026-02-28T23:59:59" | jq .
```

#### Get incident by ID

```bash
INCIDENT_ID="<uuid>"
curl -s "$BASE_URL/incidents/$INCIDENT_ID" | jq .
```

#### Update an incident (full)

```bash
curl -s -X PUT "$BASE_URL/incidents/$INCIDENT_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Network switch failure in US-East datacenter - UPDATED",
    "description": "Updated description with more details.",
    "priority": "critical",
    "severity": "critical",
    "category": "network",
    "tags": ["network", "datacenter", "us-east", "escalated"],
    "affectedSystems": ["API Gateway", "CDN", "Load Balancer", "DNS"],
    "affectedUsers": 20000,
    "ownerId": "'$OWNER_ID'"
  }' | jq .
```

#### Partially update an incident

```bash
curl -s -X PATCH "$BASE_URL/incidents/$INCIDENT_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "priority": "medium",
    "tags": ["network", "resolved-partially"]
  }' | jq .
```

#### Assign users to an incident

```bash
ASSIGNEE_ID_1="<uuid>"
ASSIGNEE_ID_2="<uuid>"
curl -s -X POST "$BASE_URL/incidents/$INCIDENT_ID/assign" \
  -H "Content-Type: application/json" \
  -d '{
    "assigneeIds": ["'$ASSIGNEE_ID_1'", "'$ASSIGNEE_ID_2'"]
  }' | jq .
```

#### Resolve an incident

```bash
curl -s -X POST "$BASE_URL/incidents/$INCIDENT_ID/resolve" \
  -H "Content-Type: application/json" \
  -d '{
    "rootCause": "Network switch firmware bug causing packet drops under high load",
    "resolution": "Applied firmware patch v2.4.1 and replaced the faulty switch module"
  }' | jq .
```

#### Close an incident

```bash
curl -s -X POST "$BASE_URL/incidents/$INCIDENT_ID/close" \
  -H "Content-Type: application/json" \
  -d '{
    "closingNotes": "Verified fix in production for 24 hours with no recurrence"
  }' | jq .
```

#### Reopen an incident

```bash
curl -s -X POST "$BASE_URL/incidents/$INCIDENT_ID/reopen" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Issue reoccurred after firmware update on secondary switch"
  }' | jq .
```

#### Delete an incident

```bash
curl -s -X DELETE "$BASE_URL/incidents/$INCIDENT_ID" -w "\nHTTP Status: %{http_code}\n"
```

---

### Comments

#### Add a comment

```bash
curl -s -X POST "$BASE_URL/incidents/$INCIDENT_ID/comments" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Deployed hotfix to production. Monitoring for the next 2 hours.",
    "isInternal": false
  }' | jq .
```

#### Add an internal comment

```bash
curl -s -X POST "$BASE_URL/incidents/$INCIDENT_ID/comments" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Need to discuss SLA implications with management.",
    "isInternal": true
  }' | jq .
```

#### Get comments for an incident

```bash
curl -s "$BASE_URL/incidents/$INCIDENT_ID/comments" | jq .
```

---

### Timeline

#### Get incident timeline

```bash
curl -s "$BASE_URL/incidents/$INCIDENT_ID/timeline" | jq .
```

---

### Statistics

#### Get summary

```bash
curl -s "$BASE_URL/statistics/summary" | jq .
```

#### Get incidents by status

```bash
curl -s "$BASE_URL/statistics/by-status" | jq .
```

#### Get incidents by priority

```bash
curl -s "$BASE_URL/statistics/by-priority" | jq .
```

#### Get incidents by category

```bash
curl -s "$BASE_URL/statistics/by-category" | jq .
```

#### Get incidents by owner

```bash
curl -s "$BASE_URL/statistics/by-owner?limit=5" | jq .
```

#### Get resolution time stats

```bash
curl -s "$BASE_URL/statistics/resolution-time" | jq .

# With date range and grouping
curl -s "$BASE_URL/statistics/resolution-time?from=2026-01-01&to=2026-12-31&groupBy=month" | jq .
```

#### Get incident trends

```bash
curl -s "$BASE_URL/statistics/trends" | jq .

# With date range
curl -s "$BASE_URL/statistics/trends?from=2026-01-01&to=2026-03-31&groupBy=week" | jq .
```

---

### End-to-End Workflow Example

```bash
BASE_URL="http://localhost:8080/api/v1"

# 1. Create an owner
OWNER=$(curl -s -X POST "$BASE_URL/owners" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Engineer",
    "email": "jane@company.com",
    "team": "SRE",
    "role": "senior_engineer"
  }')
OWNER_ID=$(echo $OWNER | jq -r '.id')
echo "Created owner: $OWNER_ID"

# 2. Create an incident
INCIDENT=$(curl -s -X POST "$BASE_URL/incidents" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "CPU spike on web servers",
    "description": "Web server cluster CPU usage at 95%",
    "priority": "high",
    "severity": "high",
    "category": "performance",
    "tags": ["cpu", "web-servers"],
    "affectedSystems": ["Web Cluster"],
    "affectedUsers": 3000,
    "ownerId": "'$OWNER_ID'"
  }')
INCIDENT_ID=$(echo $INCIDENT | jq -r '.id')
echo "Created incident: $INCIDENT_ID"

# 3. Assign the owner to the incident
curl -s -X POST "$BASE_URL/incidents/$INCIDENT_ID/assign" \
  -H "Content-Type: application/json" \
  -d '{"assigneeIds": ["'$OWNER_ID'"]}' | jq '.status'

# 4. Add a comment
curl -s -X POST "$BASE_URL/incidents/$INCIDENT_ID/comments" \
  -H "Content-Type: application/json" \
  -d '{"content": "Investigating runaway process on web-server-03"}' | jq '.id'

# 5. Resolve the incident
curl -s -X POST "$BASE_URL/incidents/$INCIDENT_ID/resolve" \
  -H "Content-Type: application/json" \
  -d '{
    "rootCause": "Runaway cron job causing infinite loop",
    "resolution": "Killed runaway process and fixed cron schedule"
  }' | jq '.status'

# 6. Close the incident
curl -s -X POST "$BASE_URL/incidents/$INCIDENT_ID/close" \
  -H "Content-Type: application/json" \
  -d '{"closingNotes": "Monitored for 4 hours, all clear"}' | jq '.status'

# 7. View the timeline
curl -s "$BASE_URL/incidents/$INCIDENT_ID/timeline" | jq '.[].description'

# 8. Check statistics
curl -s "$BASE_URL/statistics/summary" | jq .
```

---

## Tech Stack

- **Java 21** (LTS)
- **Spring Boot 3.5.7**
- **Spring Data JPA** with H2 in-memory database
- **Jakarta Bean Validation**
- **SpringDoc OpenAPI** (Swagger UI)
- **Lombok**
