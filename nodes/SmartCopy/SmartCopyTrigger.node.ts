import type {
  IPollFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from "n8n-workflow";
import { NodeConnectionTypes } from "n8n-workflow";

// Trigger pollingowy: nowe ukończone / nieudane teksty.
// Watermark (ostatnie widziane updated_at + widziane ID) trzymamy w staticData.
export class SmartCopyTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: "Smart-Copy Trigger",
    name: "smartCopyTrigger",
    icon: "file:smartcopy.svg",
    group: ["trigger"],
    version: 1,
    polling: true,
    description:
      "Fires when a Smart-Copy text finishes generating or fails (funds are refunded automatically on failure)",
    defaults: { name: "Smart-Copy Trigger" },
    inputs: [],
    outputs: [NodeConnectionTypes.Main],
    credentials: [{ name: "smartCopyApi", required: true }],
    properties: [
      {
        displayName: "Event",
        name: "event",
        type: "options",
        options: [
          {
            name: "Text Completed",
            value: "completed",
            description:
              "A text finished generating (with HTML, featured image and WordPress publication links)",
          },
          {
            name: "Text Failed",
            value: "failed",
            description:
              "A generation failed — funds are refunded to the balance automatically",
          },
        ],
        default: "completed",
      },
    ],
  };

  async poll(this: IPollFunctions): Promise<INodeExecutionData[][] | null> {
    const event = this.getNodeParameter("event") as string;
    const staticData = this.getWorkflowStaticData("node") as {
      lastSeen?: string;
      seenIds?: string[];
    };

    const response = (await this.helpers.httpRequestWithAuthentication.call(
      this,
      "smartCopyApi",
      {
        method: "GET",
        url: "https://www.smart-copy.ai/api/v1/texts",
        qs: { limit: 100 },
        json: true,
      },
    )) as {
      data: Array<{ id: string; status: string; updated_at: string }>;
    };

    const matching = response.data.filter((t) => t.status === event);

    // Pierwsze uruchomienie: ustaw watermark, nie emituj historii
    // (chyba że to ręczny test w edytorze — wtedy pokaż próbkę).
    if (!staticData.lastSeen) {
      staticData.lastSeen = new Date().toISOString();
      staticData.seenIds = matching.slice(0, 20).map((t) => t.id);
      if (this.getMode() === "manual" && matching.length > 0) {
        return [this.helpers.returnJsonArray([matching[0] as any])];
      }
      return null;
    }

    const seen = new Set(staticData.seenIds ?? []);
    const fresh = matching.filter(
      (t) => !seen.has(t.id) && t.updated_at > (staticData.lastSeen as string),
    );

    if (fresh.length === 0) {
      if (this.getMode() === "manual" && matching.length > 0) {
        return [this.helpers.returnJsonArray([matching[0] as any])];
      }
      return null;
    }

    const newest = fresh
      .map((t) => t.updated_at)
      .sort()
      .pop();
    if (newest && newest > staticData.lastSeen) staticData.lastSeen = newest;
    staticData.seenIds = [
      ...fresh.map((t) => t.id),
      ...(staticData.seenIds ?? []),
    ].slice(0, 300);

    return [this.helpers.returnJsonArray(fresh as any[])];
  }
}
