import { Agent } from '../interfaces/Agent';

/**
 * Abstract base class for all AI agents in the Auriga Setup AI system
 */
export abstract class BaseAgent implements Agent {
  /**
   * Unique identifier for the agent
   */
  public id: string;
  
  /**
   * Human-readable name of the agent
   */
  public name: string;
  
  /**
   * Description of the agent's purpose and capabilities
   */
  public description: string;
  
  /**
   * Whether the agent has been initialized
   */
  protected initialized: boolean = false;
  
  /**
   * Configuration for the agent
   */
  protected config: Record<string, any> = {};
  
  /**
   * Create a new BaseAgent
   * @param id Unique identifier for the agent
   * @param name Human-readable name of the agent
   * @param description Description of the agent's purpose and capabilities
   */
  constructor(id: string, name: string, description: string) {
    this.id = id;
    this.name = name;
    this.description = description;
  }
  
  /**
   * Initialize the agent with any required configuration
   * @param config Configuration object for the agent
   */
  public async initialize(config: Record<string, any>): Promise<void> {
    this.config = { ...this.config, ...config };
    this.initialized = true;
  }
  
  /**
   * Run the agent with the provided input data
   * @param input Input data for the agent to process
   * @returns The result of the agent's processing
   */
  public abstract run(input: Record<string, any>): Promise<Record<string, any>>;
  
  /**
   * Check if the agent has been initialized
   * @throws Error if the agent has not been initialized
   */
  protected checkInitialized(): void {
    if (!this.initialized) {
      throw new Error(`Agent ${this.name} (${this.id}) has not been initialized`);
    }
  }
}
