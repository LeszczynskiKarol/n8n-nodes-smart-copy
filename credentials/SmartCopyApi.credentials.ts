import type {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from "n8n-workflow";

// Klucz osobisty sc_live_/sc_test_ z panelu https://www.smart-copy.ai/developers
export class SmartCopyApi implements ICredentialType {
  name = "smartCopyApi";

  displayName = "Smart-Copy API";

  documentationUrl = "https://www.smart-copy.ai/docs/api";

  properties: INodeProperties[] = [
    {
      displayName: "API Key",
      name: "apiKey",
      type: "string",
      typeOptions: { password: true },
      required: true,
      default: "",
      description:
        "Personal API key from the Smart-Copy dashboard (Developers → API keys). Use an sc_test_ key for free integration testing.",
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: "generic",
    properties: {
      headers: {
        Authorization: "=Bearer {{$credentials.apiKey}}",
      },
    },
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: "https://www.smart-copy.ai/api/v1",
      url: "/balance",
    },
  };
}
