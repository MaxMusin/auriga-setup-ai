/**
 * Base interface for all AI agents in the Auriga Setup AI system
 */
export interface Agent {
  /**
   * Unique identifier for the agent
   */
  id: string;
  
  /**
   * Human-readable name of the agent
   */
  name: string;
  
  /**
   * Description of the agent's purpose and capabilities
   */
  description: string;
  
  /**
   * Initialize the agent with any required configuration
   * @param config Configuration object for the agent
   */
  initialize(config: Record<string, any>): Promise<void>;
  
  /**
   * Run the agent with the provided input data
   * @param input Input data for the agent to process
   * @returns The result of the agent's processing
   */
  run(input: Record<string, any>): Promise<Record<string, any>>;
}
