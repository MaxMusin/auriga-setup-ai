import { BaseAgent } from './BaseAgent';
import { TelemetryAgent } from './TelemetryAgent';
import { EngineerAgent } from './EngineerAgent';
import { TestDriverAgent } from './TestDriverAgent';
import { SetupData } from '../interfaces/SetupData';

/**
 * CoordinatorAgent orchestrates the other agents and manages the dialogue
 */
export class CoordinatorAgent extends BaseAgent {
  /**
   * The TelemetryAgent instance
   */
  private telemetryAgent: TelemetryAgent | null = null;
  
  /**
   * The EngineerAgent instance
   */
  private engineerAgent: EngineerAgent | null = null;
  
  /**
   * The TestDriverAgent instance
   */
  private testDriverAgent: TestDriverAgent | null = null;
  
  /**
   * Create a new CoordinatorAgent
   */
  constructor() {
    super(
      'coordinator-agent',
      'Setup Coordinator',
      'Orchestrates the other agents and manages the dialogue for a cohesive experience'
    );
  }
  
  /**
   * Initialize the CoordinatorAgent with configuration and sub-agents
   * @param config Configuration for the CoordinatorAgent
   */
  public async initialize(config: Record<string, any>): Promise<void> {
    await super.initialize(config);
    
    // Initialize sub-agents
    this.telemetryAgent = new TelemetryAgent();
    await this.telemetryAgent.initialize(config.telemetryAgent || {});
    
    this.engineerAgent = new EngineerAgent();
    await this.engineerAgent.initialize(config.engineerAgent || {});
    
    this.testDriverAgent = new TestDriverAgent();
    await this.testDriverAgent.initialize(config.testDriverAgent || {});
  }
  
  /**
   * Run the CoordinatorAgent to orchestrate the setup optimization process
   * @param input Input containing setup data, telemetry data, and/or driver feedback
   * @returns Orchestrated results from the various agents
   */
  public async run(input: { 
    setupData?: SetupData | string;
    telemetryData?: string;
    driverFeedback?: string;
    action?: 'analyze_telemetry' | 'suggest_setup' | 'evaluate_changes' | 'full_workflow';
  }): Promise<Record<string, any>> {
    this.checkInitialized();
    
    // Ensure we have the required agents
    if (!this.telemetryAgent || !this.engineerAgent || !this.testDriverAgent) {
      throw new Error('Sub-agents have not been properly initialized');
    }
    
    // Parse setup data if it's a string
    let setupData: SetupData | undefined;
    if (input.setupData) {
      setupData = typeof input.setupData === 'string' 
        ? this.parseSetupData(input.setupData)
        : input.setupData;
    }
    
    // Determine the action to take
    const action = input.action || 'full_workflow';
    
    // Execute the appropriate workflow based on the action
    switch (action) {
      case 'analyze_telemetry':
        return this.analyzeTelemetry(input.telemetryData);
        
      case 'suggest_setup':
        if (!setupData) {
          throw new Error('Setup data is required for suggesting setup changes');
        }
        return this.suggestSetupChanges(
          setupData,
          input.telemetryData,
          input.driverFeedback
        );
        
      case 'evaluate_changes':
        if (!setupData) {
          throw new Error('Setup data is required for evaluating changes');
        }
        // For this action, we assume setupData contains the modified setup
        // and we need the original setup from a previous state
        // This would be handled in a real implementation
        return this.evaluateSetupChanges(
          setupData, // Original setup would come from state
          setupData  // Modified setup from input
        );
        
      case 'full_workflow':
      default:
        return this.runFullWorkflow(
          setupData,
          input.telemetryData,
          input.driverFeedback
        );
    }
  }
  
  /**
   * Parse setup data from a string (either JSON or .sto format)
   * @param setupDataString Setup data as a string
   * @returns Parsed SetupData
   */
  private parseSetupData(setupDataString: string): SetupData {
    // This is a placeholder implementation
    // In a real implementation, this would parse the setup data from JSON or .sto format
    console.log('Parsing setup data...');
    
    try {
      // Try parsing as JSON first
      return JSON.parse(setupDataString);
    } catch (error) {
      // If not valid JSON, assume it's .sto format and parse accordingly
      console.log('Not valid JSON, parsing as .sto format...');
      
      // Mock implementation for now
      return {
        carId: 'mock-car',
        trackId: 'mock-track',
        name: 'Mock Setup',
        suspension: {
          front: {
            springRate: 150000,
            rideHeight: 60,
            camber: -3.0,
            toe: 0.1,
            antiRollBar: 20
          },
          rear: {
            springRate: 130000,
            rideHeight: 70,
            camber: -2.5,
            toe: 0.3,
            antiRollBar: 15
          }
        },
        dampers: {
          front: {
            bump: 10,
            rebound: 15
          },
          rear: {
            bump: 8,
            rebound: 12
          }
        },
        tirePressures: {
          frontLeft: 172,
          frontRight: 172,
          rearLeft: 165,
          rearRight: 165
        },
        aero: {
          frontWing: 30,
          rearWing: 40
        },
        brakeBias: 55
      };
    }
  }
  
  /**
   * Analyze telemetry data using the TelemetryAgent
   * @param telemetryData Telemetry data as a string
   * @returns Telemetry analysis results
   */
  private async analyzeTelemetry(telemetryData?: string): Promise<Record<string, any>> {
    if (!telemetryData) {
      throw new Error('Telemetry data is required for analysis');
    }
    
    if (!this.telemetryAgent) {
      throw new Error('TelemetryAgent has not been properly initialized');
    }
    
    console.log('Running TelemetryAgent...');
    const result = await this.telemetryAgent.run({ telemetryData });
    
    return {
      action: 'analyze_telemetry',
      result
    };
  }
  
  /**
   * Suggest setup changes using the EngineerAgent
   * @param currentSetup Current setup data
   * @param telemetryData Optional telemetry data
   * @param driverFeedback Optional driver feedback
   * @returns Setup suggestions
   */
  private async suggestSetupChanges(
    currentSetup: SetupData,
    telemetryData?: string,
    driverFeedback?: string
  ): Promise<Record<string, any>> {
    if (!this.engineerAgent) {
      throw new Error('EngineerAgent has not been properly initialized');
    }
    
    // If telemetry data is provided, analyze it first
    let telemetryAnalysis: Record<string, any> | undefined;
    if (telemetryData && this.telemetryAgent) {
      console.log('Analyzing telemetry data first...');
      const result = await this.telemetryAgent.run({ telemetryData });
      telemetryAnalysis = result;
    }
    
    // Run the EngineerAgent to suggest setup changes
    console.log('Running EngineerAgent...');
    const result = await this.engineerAgent.run({
      currentSetup,
      driverFeedback,
      telemetryAnalysis
    });
    
    return {
      action: 'suggest_setup',
      telemetryAnalysis,
      result
    };
  }
  
  /**
   * Evaluate setup changes using the TestDriverAgent
   * @param originalSetup Original setup data
   * @param modifiedSetup Modified setup data
   * @returns Evaluation of the setup changes
   */
  private async evaluateSetupChanges(
    originalSetup: SetupData,
    modifiedSetup: SetupData
  ): Promise<Record<string, any>> {
    if (!this.testDriverAgent) {
      throw new Error('TestDriverAgent has not been properly initialized');
    }
    
    console.log('Running TestDriverAgent...');
    const result = await this.testDriverAgent.run({
      originalSetup,
      modifiedSetup
    });
    
    return {
      action: 'evaluate_changes',
      result
    };
  }
  
  /**
   * Run the full workflow using all agents
   * @param setupData Optional setup data
   * @param telemetryData Optional telemetry data
   * @param driverFeedback Optional driver feedback
   * @returns Results from the full workflow
   */
  private async runFullWorkflow(
    setupData?: SetupData,
    telemetryData?: string,
    driverFeedback?: string
  ): Promise<Record<string, any>> {
    // Validate inputs
    if (!setupData && !telemetryData && !driverFeedback) {
      throw new Error('At least one of setupData, telemetryData, or driverFeedback is required');
    }
    
    // Step 1: Analyze telemetry if available
    let telemetryAnalysis: Record<string, any> | undefined;
    if (telemetryData && this.telemetryAgent) {
      console.log('Step 1: Analyzing telemetry...');
      telemetryAnalysis = await this.telemetryAgent.run({ telemetryData });
    }
    
    // Step 2: Suggest setup changes if we have a current setup
    let setupSuggestions: Record<string, any> | undefined;
    let modifiedSetup: SetupData | undefined;
    if (setupData && this.engineerAgent) {
      console.log('Step 2: Suggesting setup changes...');
      const engineerResult = await this.engineerAgent.run({
        currentSetup: setupData,
        driverFeedback,
        telemetryAnalysis
      });
      
      setupSuggestions = engineerResult.suggestions;
      modifiedSetup = engineerResult.modifiedSetup;
    }
    
    // Step 3: Evaluate the changes if we have both original and modified setups
    let setupEvaluation: Record<string, any> | undefined;
    if (setupData && modifiedSetup && this.testDriverAgent) {
      console.log('Step 3: Evaluating setup changes...');
      setupEvaluation = await this.testDriverAgent.run({
        originalSetup: setupData,
        modifiedSetup
      });
    }
    
    // Compile the results
    return {
      action: 'full_workflow',
      telemetryAnalysis,
      setupSuggestions,
      modifiedSetup,
      setupEvaluation,
      summary: this.generateSummary(
        telemetryAnalysis,
        setupSuggestions,
        setupEvaluation
      )
    };
  }
  
  /**
   * Generate a summary of the results from all agents
   * @param telemetryAnalysis Optional telemetry analysis
   * @param setupSuggestions Optional setup suggestions
   * @param setupEvaluation Optional setup evaluation
   * @returns Summary of the results
   */
  private generateSummary(
    telemetryAnalysis?: Record<string, any>,
    setupSuggestions?: Record<string, any>,
    setupEvaluation?: Record<string, any>
  ): string {
    let summary = 'Auriga Setup AI Analysis Summary:\n\n';
    
    // Add telemetry analysis summary
    if (telemetryAnalysis) {
      summary += '📊 Telemetry Analysis:\n';
      
      if (telemetryAnalysis.summary) {
        const s = telemetryAnalysis.summary;
        summary += `- Average Speed: ${s.averageSpeed} km/h\n`;
        summary += `- Maximum Speed: ${s.maxSpeed} km/h\n`;
        summary += `- Best Lap Time: ${s.bestLapTime} seconds\n`;
        summary += `- Maximum Lateral G: ${s.maxLateralG} G\n`;
      }
      
      if (telemetryAnalysis.insights && Array.isArray(telemetryAnalysis.insights)) {
        summary += '\nKey Insights:\n';
        for (const insight of telemetryAnalysis.insights) {
          summary += `- ${insight}\n`;
        }
      }
      
      summary += '\n';
    }
    
    // Add setup suggestions summary
    if (setupSuggestions) {
      summary += '🔧 Setup Suggestions:\n';
      
      if (setupSuggestions.explanation) {
        summary += `${setupSuggestions.explanation}\n\n`;
      }
      
      if (setupSuggestions.changes && Array.isArray(setupSuggestions.changes)) {
        for (const change of setupSuggestions.changes) {
          summary += `- ${change.component}: ${change.currentValue} → ${change.suggestedValue}\n`;
          summary += `  Reason: ${change.reason}\n`;
        }
      }
      
      summary += '\n';
    }
    
    // Add setup evaluation summary
    if (setupEvaluation) {
      summary += '🏁 Setup Evaluation:\n';
      
      if (setupEvaluation.evaluation && setupEvaluation.evaluation.overallImpression) {
        summary += `${setupEvaluation.evaluation.overallImpression}\n\n`;
      }
      
      if (setupEvaluation.evaluation && setupEvaluation.evaluation.performanceImpact) {
        const impact = setupEvaluation.evaluation.performanceImpact;
        summary += 'Expected Performance Impact:\n';
        summary += `- Lap Time: ${impact.lapTime > 0 ? '+' : ''}${impact.lapTime} seconds\n`;
        summary += `- Consistency: ${impact.consistency > 0 ? '+' : ''}${impact.consistency} (higher is better)\n`;
        summary += `- Tire Wear: ${impact.tireWear > 0 ? '+' : ''}${impact.tireWear} (lower is better)\n`;
      }
      
      if (setupEvaluation.followUpQuestions && Array.isArray(setupEvaluation.followUpQuestions)) {
        summary += '\nFollow-up Questions:\n';
        for (const question of setupEvaluation.followUpQuestions) {
          summary += `- ${question}\n`;
        }
      }
    }
    
    return summary;
  }
}
