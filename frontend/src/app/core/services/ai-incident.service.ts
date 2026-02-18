import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface AiIncidentRequest {
    description: string;
    ownerId: string;
    ownerName: string;
}

interface RunAgentResponse {
    output: string;
}

@Injectable({ providedIn: 'root' })
export class AiIncidentService {
    private readonly agentProxyEndpoint: string;
    private readonly foundryResourceName: string;
    private readonly foundryProjectName: string;
    private readonly agentName: string;
    private readonly apiKey: string;

    constructor(private readonly http: HttpClient) {
        const { foundryResourceName, foundryProjectName, agentName, apiKey, agentProxyEndpoint } =
            environment.aiAgent;

        this.agentProxyEndpoint = agentProxyEndpoint;
        this.foundryResourceName = foundryResourceName;
        this.foundryProjectName = foundryProjectName;
        this.agentName = agentName;
        this.apiKey = apiKey;
    }

    /**
     * Sends a free-text incident description to the agent proxy,
     * which forwards it to the Azure AI Foundry agent.
     * The agent is responsible for creating the incident via the backend API.
     * Returns an Observable that completes on success or errors on failure.
     */
    processDescription(request: AiIncidentRequest): Observable<void> {
        const inputContent = `Owner: ${request.ownerName}\n\n${request.description}`;

        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Key': this.apiKey,
        });

        return this.http
            .post<RunAgentResponse>(`${this.agentProxyEndpoint}/run_agent`, {
                foundry_resource_name: this.foundryResourceName,
                project_name: this.foundryProjectName,
                agent_name: this.agentName,
                message: inputContent,
            }, { headers })
            .pipe(map(() => void 0));
    }
}
