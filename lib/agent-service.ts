import { StateGraph, END } from "@langchain/langgraph";
import { AgentState } from "./agents/state";
import { agentPrompts } from "./agents/prompts";
import { AIService, AIConfig } from "./ai-service";
import { getLatestAnalysisByAsset } from "./db";

export class AgentService {
  private aiService: AIService;

  constructor(config: AIConfig) {
    this.aiService = new AIService(config);
  }

  private createAgentNode(agentName: keyof typeof agentPrompts) {
    return async (state: AgentState): Promise<Partial<AgentState>> => {
      // The prompt now includes the full context of the analysis so far
      const fullPrompt = `
        Asset: ${state.assetPair}

        Historical Analysis (from previous sessions):
        ${JSON.stringify(state.historicalAnalysis, null, 2)}

        Current Analysis (from this session):
        ${JSON.stringify({
          researcherReport: state.researcherReport,
          sentimentReport: state.sentimentReport,
          newsReport: state.newsReport,
          macroReport: state.macroReport,
          bullReport: state.bullReport,
          bearReport: state.bearReport,
        }, null, 2)}

        Based on all the information above, please provide your report as the ${agentName}.
      `;

      const report = await this.aiService.generateResponse(fullPrompt, agentPrompts[agentName]);

      const update: Partial<AgentState> = {
        [`${agentName}Report`]: report
      };

      // The trader agent's output needs to be parsed
      if (agentName === 'trader') {
        // Simple parsing logic, can be improved with structured output LLMs
        const decisionMatch = report.match(/FINAL RECOMMENDATION: (BUY|SELL|HOLD)/);
        const priceRangeMatch = report.match(/predicted price range for the asset for the next 7-14 days: (.*?)\./i);

        if (decisionMatch) {
            update.finalDecision = decisionMatch[1] as 'BUY' | 'SELL' | 'HOLD';
        }
        if (priceRangeMatch) {
            update.predictedPriceRange = priceRangeMatch[1];
        }
      }

      return update;
    };
  }

  async run(assetPair: string): Promise<AgentState> {
    const workflow = new StateGraph<AgentState>({
      channels: {
        assetPair: { value: (x, y) => y, default: () => assetPair },
        historicalAnalysis: { value: (x, y) => y, default: () => null },
        researcherReport: { value: (x, y) => y, default: () => undefined },
        sentimentReport: { value: (x, y) => y, default: () => undefined },
        newsReport: { value: (x, y) => y, default: () => undefined },
        macroReport: { value: (x, y) => y, default: () => undefined },
        bullReport: { value: (x, y) => y, default: () => undefined },
        bearReport: { value: (x, y) => y, default: () => undefined },
        traderReport: { value: (x, y) => y, default: () => undefined },
        finalDecision: { value: (x, y) => y, default: () => undefined },
        predictedPriceRange: { value: (x, y) => y, default: () => undefined },
      },
    });

    const fetchMemoryNode = async (state: AgentState): Promise<Partial<AgentState>> => {
      const memory = await getLatestAnalysisByAsset(state.assetPair);
      console.log("Fetched memory:", memory ? "found" : "not found");
      return { historicalAnalysis: memory };
    };

    // Define agent nodes
    const researcherNode = this.createAgentNode("researcher");
    const sentimentNode = this.createAgentNode("sentiment");
    const newsNode = this.createAgentNode("news");
    const macroNode = this.createAgentNode("macro");
    const bullNode = this.createAgentNode("bull");
    const bearNode = this.createAgentNode("bear");
    const traderNode = this.createAgentNode("trader");

    // Add nodes
    workflow.addNode("fetchMemory", fetchMemoryNode);
    workflow.addNode("researcher", researcherNode);
    workflow.addNode("sentiment", sentimentNode);
    workflow.addNode("news", newsNode);
    workflow.addNode("macro", macroNode);
    workflow.addNode("bull", bullNode);
    workflow.addNode("bear", bearNode);
    workflow.addNode("trader", traderNode);

    // Define the graph flow
    workflow.setEntryPoint("fetchMemory");

    // Run research agents in parallel
    workflow.addEdge("fetchMemory", "researcher");
    workflow.addEdge("fetchMemory", "sentiment");
    workflow.addEdge("fetchMemory", "news");
    workflow.addEdge("fetchMemory", "macro");

    // Conditional edge to wait for all research to be done
    workflow.addConditionalEdges(
      "researcher",
      (state) => (state.sentimentReport && state.newsReport && state.macroReport) ? "run_bull_bear" : "continue_research"
    );
     workflow.addConditionalEdges(
      "sentiment",
      (state) => (state.researcherReport && state.newsReport && state.macroReport) ? "run_bull_bear" : "continue_research"
    );
     workflow.addConditionalEdges(
      "news",
      (state) => (state.researcherReport && state.sentimentReport && state.macroReport) ? "run_bull_bear" : "continue_research"
    );
     workflow.addConditionalEdges(
      "macro",
      (state) => (state.researcherReport && state.sentimentReport && state.newsReport) ? "run_bull_bear" : "continue_research"
    );

    // Dummy nodes for branching
    workflow.addNode("run_bull_bear", (state) => state);
    workflow.addNode("continue_research", (state) => state);

    workflow.addEdge("continue_research", END); // Should not happen in practice with this setup

    // Run bull and bear agents in parallel
    workflow.addEdge("run_bull_bear", "bull");
    workflow.addEdge("run_bull_bear", "bear");

    // Conditional edge to wait for both bull and bear agents
    workflow.addConditionalEdges(
        "bull",
        (state) => (state.bearReport) ? "run_trader" : "continue_arguments"
    );
    workflow.addConditionalEdges(
        "bear",
        (state) => (state.bullReport) ? "run_trader" : "continue_arguments"
    );

    // Dummy nodes for branching
    workflow.addNode("run_trader", (state) => state);
    workflow.addNode("continue_arguments", (state) => state);
    workflow.addEdge("continue_arguments", END); // Should not happen

    workflow.addEdge("run_trader", "trader");
    workflow.addEdge("trader", END);

    const app = workflow.compile();
    console.log("Running agent graph for:", assetPair);
    const result = await app.invoke({ assetPair });
    console.log("Agent graph finished. Final result:", result);

    return result;
  }
}
