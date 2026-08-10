import type {
  ILoadOptionsFunctions,
  INodePropertyOptions,
  INodeType,
  INodeTypeDescription,
} from "n8n-workflow";
import { NodeConnectionTypes } from "n8n-workflow";

// Node deklaratywny (routing) na publicznym API v1 Smart-Copy.
export class SmartCopy implements INodeType {
  description: INodeTypeDescription = {
    displayName: "Smart-Copy",
    name: "smartCopy",
    icon: "file:smartcopy.svg",
    group: ["transform"],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description:
      "Order AI-written, researched texts with featured images and automatic WordPress publishing",
    defaults: { name: "Smart-Copy" },
    inputs: [NodeConnectionTypes.Main],
    outputs: [NodeConnectionTypes.Main],
    credentials: [{ name: "smartCopyApi", required: true }],
    requestDefaults: {
      baseURL: "https://www.smart-copy.ai/api/v1",
      headers: { "Content-Type": "application/json" },
    },
    properties: [
      {
        displayName: "Resource",
        name: "resource",
        type: "options",
        noDataExpression: true,
        options: [
          { name: "Text", value: "text" },
          { name: "Balance", value: "balance" },
        ],
        default: "text",
      },

      // ── Text operations ──
      {
        displayName: "Operation",
        name: "operation",
        type: "options",
        noDataExpression: true,
        displayOptions: { show: { resource: ["text"] } },
        options: [
          {
            name: "Create",
            value: "create",
            action: "Create a text",
            description:
              "Order an AI-written text (billed from your Smart-Copy balance)",
            routing: { request: { method: "POST", url: "/texts" } },
          },
          {
            name: "Get",
            value: "get",
            action: "Get a text",
            description:
              "Get a text with its status, HTML and featured image",
            routing: {
              request: {
                method: "GET",
                url: '=/texts/{{$parameter["textId"]}}',
              },
            },
          },
          {
            name: "Get Many",
            value: "getMany",
            action: "List texts",
            description: "List texts on the account, newest first",
            routing: {
              request: { method: "GET", url: "/texts" },
              output: {
                postReceive: [
                  {
                    type: "rootProperty",
                    properties: { property: "data" },
                  },
                ],
              },
            },
          },
          {
            name: "Get Price Estimate",
            value: "estimate",
            action: "Get a price estimate",
            description:
              "Price quote for a given length, without creating an order",
            routing: { request: { method: "POST", url: "/estimate" } },
          },
        ],
        default: "create",
      },

      // ── Balance ──
      {
        displayName: "Operation",
        name: "operation",
        type: "options",
        noDataExpression: true,
        displayOptions: { show: { resource: ["balance"] } },
        options: [
          {
            name: "Get",
            value: "get",
            action: "Get the account balance",
            description:
              "Account balance in PLN with an indicative USD value",
            routing: { request: { method: "GET", url: "/balance" } },
          },
        ],
        default: "get",
      },

      // ── Text: Create ──
      {
        displayName: "Topic",
        name: "topic",
        type: "string",
        required: true,
        default: "",
        description: "3-300 characters",
        displayOptions: { show: { resource: ["text"], operation: ["create"] } },
        routing: { send: { type: "body", property: "topic" } },
      },
      {
        displayName: "Length (Characters)",
        name: "length",
        type: "number",
        required: true,
        default: 8000,
        description:
          "500-300000. 2000 characters is roughly one page. Billed degressively per 1000 characters.",
        displayOptions: { show: { resource: ["text"], operation: ["create"] } },
        routing: { send: { type: "body", property: "length" } },
      },
      {
        displayName: "Language",
        name: "language",
        type: "options",
        options: [
          { name: "English", value: "en" },
          { name: "Polish", value: "pl" },
        ],
        default: "en",
        displayOptions: { show: { resource: ["text"], operation: ["create"] } },
        routing: { send: { type: "body", property: "language" } },
      },
      {
        displayName: "Text Type",
        name: "textType",
        type: "options",
        options: [
          { name: "Analysis", value: "ANALYSIS" },
          { name: "Blog Post", value: "BLOG_POST" },
          { name: "Company Copy", value: "COMPANY_TEXT" },
          { name: "Expert Article", value: "ARTICLE" },
          { name: "Marketing Email", value: "EMAIL_MARKETING" },
          { name: "Other", value: "OTHER" },
          { name: "Product Description", value: "PRODUCT_DESCRIPTION" },
          { name: "Report", value: "REPORT" },
          { name: "Social Media Post", value: "SOCIAL_MEDIA" },
        ],
        default: "ARTICLE",
        displayOptions: { show: { resource: ["text"], operation: ["create"] } },
        routing: { send: { type: "body", property: "text_type" } },
      },
      {
        displayName: "Additional Options",
        name: "additionalOptions",
        type: "collection",
        placeholder: "Add option",
        default: {},
        displayOptions: { show: { resource: ["text"], operation: ["create"] } },
        options: [
          {
            displayName: "Generate Featured Image (AI)",
            name: "generateImage",
            type: "boolean",
            default: true,
            routing: { send: { type: "body", property: "generate_image" } },
          },
          {
            displayName: "Guidelines",
            name: "guidelines",
            type: "string",
            typeOptions: { rows: 3 },
            default: "",
            description: "Tone, audience, what to cover",
            routing: { send: { type: "body", property: "guidelines" } },
          },
          {
            displayName: "Require Outline Approval",
            name: "outlineApproval",
            type: "boolean",
            default: false,
            description:
              "Whether writing should start only after you approve the outline in the Smart-Copy dashboard",
            routing: { send: { type: "body", property: "outline_approval" } },
          },
          {
            displayName: "Research Sources",
            name: "sourceMode",
            type: "options",
            options: [
              { name: "Auto (Model Decides)", value: "auto" },
              { name: "Web Only", value: "web" },
              { name: "Academic Only", value: "academic" },
              { name: "Web + Academic", value: "hybrid" },
            ],
            default: "auto",
            routing: { send: { type: "body", property: "source_mode" } },
          },
          {
            displayName: "SEO Keywords",
            name: "keywords",
            type: "string",
            default: "",
            description: "Comma-separated, up to 10 keywords",
            routing: {
              send: {
                type: "body",
                property: "keywords",
                value:
                  '={{ $value ? $value.split(",").map(k => k.trim()).filter(Boolean) : undefined }}',
              },
            },
          },
          {
            displayName: "Source URLs",
            name: "sourceUrls",
            type: "string",
            default: "",
            description: "Comma-separated own sources, up to 10 URLs",
            routing: {
              send: {
                type: "body",
                property: "source_urls",
                value:
                  '={{ $value ? $value.split(",").map(u => u.trim()).filter(Boolean) : undefined }}',
              },
            },
          },
          {
            displayName: "WordPress Site Name or ID",
            name: "wpSiteId",
            type: "options",
            typeOptions: { loadOptionsMethod: "getWpSites" },
            default: "",
            description:
              'Publish the finished text to this connected site. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
            routing: { send: { type: "body", property: "wp_site_id" } },
          },
          {
            displayName: "WordPress Publication",
            name: "wpStatus",
            type: "options",
            options: [
              { name: "Publish Immediately", value: "publish" },
              { name: "Save as Draft", value: "draft" },
              { name: "Schedule", value: "future" },
            ],
            default: "publish",
            routing: { send: { type: "body", property: "wp_status" } },
          },
          {
            displayName: "Scheduled Publication Date",
            name: "wpScheduledAt",
            type: "dateTime",
            default: "",
            description: "Only for Schedule; at least 5 minutes ahead",
            routing: { send: { type: "body", property: "wp_scheduled_at" } },
          },
        ],
      },

      // ── Text: Get ──
      {
        displayName: "Text ID",
        name: "textId",
        type: "string",
        required: true,
        default: "",
        displayOptions: { show: { resource: ["text"], operation: ["get"] } },
      },

      // ── Text: Get Many ──
      {
        displayName: "Limit",
        name: "limit",
        type: "number",
        typeOptions: { minValue: 1, maxValue: 100 },
        default: 50,
        description: "Max number of results to return",
        displayOptions: {
          show: { resource: ["text"], operation: ["getMany"] },
        },
        routing: { send: { type: "query", property: "limit" } },
      },
      {
        displayName: "WordPress Site Name or ID",
        name: "wpSiteFilter",
        type: "options",
        typeOptions: { loadOptionsMethod: "getWpSites" },
        default: "",
        description:
          'Only texts for this connected site. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
        displayOptions: {
          show: { resource: ["text"], operation: ["getMany"] },
        },
        routing: { send: { type: "query", property: "wp_site_id" } },
      },

      // ── Text: Estimate ──
      {
        displayName: "Length (Characters)",
        name: "estimateLength",
        type: "number",
        required: true,
        default: 8000,
        displayOptions: {
          show: { resource: ["text"], operation: ["estimate"] },
        },
        routing: { send: { type: "body", property: "length" } },
      },
    ],
  };

  methods = {
    loadOptions: {
      async getWpSites(
        this: ILoadOptionsFunctions,
      ): Promise<INodePropertyOptions[]> {
        const response = (await this.helpers.httpRequestWithAuthentication.call(
          this,
          "smartCopyApi",
          {
            method: "GET",
            url: "https://www.smart-copy.ai/api/v1/wp-sites",
            json: true,
          },
        )) as { data: Array<{ id: string; name: string }> };
        return [
          { name: "— None —", value: "" },
          ...response.data.map((s) => ({ name: s.name, value: s.id })),
        ];
      },
    },
  };
}
