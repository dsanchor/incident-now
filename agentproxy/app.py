from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from openai import OpenAI
from azure.identity import DefaultAzureCredential, get_bearer_token_provider

app = FastAPI(title="Agent Proxy")


class RunAgentRequest(BaseModel):
    foundry_resource_name: str
    project_name: str
    agent_name: str
    message: str


class RunAgentResponse(BaseModel):
    output: str


@app.post("/run_agent", response_model=RunAgentResponse)
def run_agent(request: RunAgentRequest):
    try:
        base_url = (
            f"https://{request.foundry_resource_name}.services.ai.azure.com"
            f"/api/projects/{request.project_name}"
            f"/applications/{request.agent_name}/protocols/openai"
        )

        client = OpenAI(
            api_key=get_bearer_token_provider(
                DefaultAzureCredential(), "https://ai.azure.com/.default"
            ),
            base_url=base_url,
            default_query={"api-version": "2025-11-15-preview"},
        )

        response = client.responses.create(input=request.message)
        return RunAgentResponse(output=response.output_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
