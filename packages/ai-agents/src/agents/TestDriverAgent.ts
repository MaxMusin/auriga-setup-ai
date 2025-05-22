import { BaseAgent } from './BaseAgent';
import { SetupData } from '../interfaces/SetupData';

/**
 * TestDriverAgent evaluates the effects of proposed setup modifications
 */
export class TestDriverAgent extends BaseAgent {
  /**
   * Create a new TestDriverAgent
   */
  constructor() {
    super(
      'test-driver-agent',
      'Test Driver',
      'Evaluates the subjective effects of proposed setup modifications'
    );
  }
  
  /**
   * Initialize the TestDriverAgent with configuration
   * @param config Configuration for the TestDriverAgent
   */
  public async initialize(config: Record<string, any>): Promise<void> {
    await super.initialize(config);
    // Additional initialization specific to TestDriverAgent
  }
  
  /**
   * Run the TestDriverAgent to evaluate setup modifications
   * @param input Input containing original and modified setup data
   * @returns Evaluation of the setup modifications
   */
  public async run(input: { 
    originalSetup: SetupData;
    modifiedSetup: SetupData;
    trackConditions?: Record<string, any>;
    drivingStyle?: string;
  }): Promise<Record<string, any>> {
    this.checkInitialized();
    
    // Compare the setups and evaluate the modifications
    const evaluation = this.evaluateSetupChanges(
      input.originalSetup,
      input.modifiedSetup,
      input.trackConditions,
      input.drivingStyle
    );
    
    // Generate follow-up questions for the driver
    const followUpQuestions = this.generateFollowUpQuestions(evaluation);
    
    return {
      evaluation,
      followUpQuestions
    };
  }
  
  /**
   * Evaluate the effects of setup changes
   * @param originalSetup Original setup data
   * @param modifiedSetup Modified setup data
   * @param trackConditions Optional track conditions
   * @param drivingStyle Optional driving style description
   * @returns Evaluation of the setup changes
   */
  private evaluateSetupChanges(
    originalSetup: SetupData,
    modifiedSetup: SetupData,
    trackConditions?: Record<string, any>,
    drivingStyle?: string
  ): Record<string, any> {
    // This is a placeholder implementation
    // In a real implementation, this would use an AI model to predict the subjective
    // effects of the setup changes based on the driver's style and track conditions
    console.log('Evaluating setup changes...');
    
    // Identify the changes between the setups
    const changes = this.identifySetupChanges(originalSetup, modifiedSetup);
    
    // Mock evaluation for now
    const evaluation: Record<string, any> = {
      overallImpression: 'The modified setup should improve overall balance and stability.',
      effects: [],
      performanceImpact: {
        lapTime: -0.2, // Negative means improvement (faster)
        consistency: +0.5, // Positive means improvement (more consistent)
        tireWear: -0.1, // Negative means worse (more wear)
        fuelConsumption: 0 // No change
      },
      confidence: 0.75 // 0-1 scale of confidence in the evaluation
    };
    
    // Generate effects for each change
    for (const change of changes) {
      let effect: Record<string, any> = {
        component: change.component,
        change: `${change.originalValue} → ${change.modifiedValue}`,
        impact: 'Neutral',
        details: 'No significant effect expected.'
      };
      
      // Suspension changes
      if (change.component.includes('antiRollBar')) {
        if (change.component.includes('front') && change.modifiedValue < change.originalValue) {
          effect.impact = 'Positive';
          effect.details = 'Reduced front anti-roll bar stiffness should reduce understeer in corners.';
        } else if (change.component.includes('rear') && change.modifiedValue < change.originalValue) {
          effect.impact = 'Positive';
          effect.details = 'Reduced rear anti-roll bar stiffness should reduce oversteer, especially on corner exit.';
        }
      }
      
      // Damper changes
      if (change.component.includes('dampers')) {
        if (change.component.includes('bump') && change.modifiedValue > change.originalValue) {
          effect.impact = 'Positive';
          effect.details = 'Increased bump damping should improve stability over bumps and curbs.';
        } else if (change.component.includes('rebound') && change.modifiedValue > change.originalValue) {
          effect.impact = 'Positive';
          effect.details = 'Increased rebound damping should improve stability during weight transfer.';
        }
      }
      
      // Tire pressure changes
      if (change.component.includes('tirePressures')) {
        if (change.modifiedValue < change.originalValue) {
          effect.impact = 'Positive';
          effect.details = 'Lower tire pressure should improve grip but may increase tire wear.';
        } else if (change.modifiedValue > change.originalValue) {
          effect.impact = 'Mixed';
          effect.details = 'Higher tire pressure may reduce grip but improve responsiveness and reduce tire wear.';
        }
      }
      
      // Brake bias changes
      if (change.component === 'brakeBias') {
        if (change.modifiedValue > change.originalValue) {
          effect.impact = 'Positive';
          effect.details = 'More front brake bias should improve initial braking response but may increase front lockup risk.';
        } else if (change.modifiedValue < change.originalValue) {
          effect.impact = 'Mixed';
          effect.details = 'Less front brake bias should improve braking stability but may reduce initial braking power.';
        }
      }
      
      evaluation.effects.push(effect);
    }
    
    // Consider track conditions if provided
    if (trackConditions) {
      console.log('Considering track conditions:', trackConditions);
      
      if (trackConditions.temperature && trackConditions.temperature > 30) {
        evaluation.trackSpecificNotes = 'In high temperatures, the lower tire pressures will be particularly beneficial.';
      } else if (trackConditions.temperature && trackConditions.temperature < 15) {
        evaluation.trackSpecificNotes = 'In cool temperatures, you may need to increase tire pressures slightly from the recommended values.';
      }
      
      if (trackConditions.surface && trackConditions.surface === 'bumpy') {
        evaluation.trackSpecificNotes = (evaluation.trackSpecificNotes || '') + ' The increased damping will be very helpful on this bumpy surface.';
      }
    }
    
    // Consider driving style if provided
    if (drivingStyle) {
      console.log('Considering driving style:', drivingStyle);
      
      if (drivingStyle.toLowerCase().includes('aggressive')) {
        evaluation.drivingStyleNotes = 'With your aggressive driving style, you may find the reduced oversteer particularly beneficial.';
      } else if (drivingStyle.toLowerCase().includes('smooth')) {
        evaluation.drivingStyleNotes = 'Your smooth driving style will work well with these changes, especially the improved stability.';
      }
    }
    
    return evaluation;
  }
  
  /**
   * Identify the changes between two setups
   * @param originalSetup Original setup data
   * @param modifiedSetup Modified setup data
   * @returns List of identified changes
   */
  private identifySetupChanges(
    originalSetup: SetupData,
    modifiedSetup: SetupData
  ): Array<{
    component: string;
    originalValue: any;
    modifiedValue: any;
  }> {
    const changes: Array<{
      component: string;
      originalValue: any;
      modifiedValue: any;
    }> = [];
    
    // Helper function to recursively compare objects
    const compareObjects = (
      original: any,
      modified: any,
      path: string = ''
    ) => {
      // Skip metadata
      if (path === 'metadata') return;
      
      if (typeof original === 'object' && original !== null &&
          typeof modified === 'object' && modified !== null) {
        // Compare nested objects
        for (const key in original) {
          const newPath = path ? `${path}.${key}` : key;
          compareObjects(original[key], modified[key], newPath);
        }
        
        // Check for new properties in modified
        for (const key in modified) {
          if (!(key in original)) {
            const newPath = path ? `${path}.${key}` : key;
            compareObjects(undefined, modified[key], newPath);
          }
        }
      } else if (original !== modified) {
        // Values differ, record the change
        changes.push({
          component: path,
          originalValue: original,
          modifiedValue: modified
        });
      }
    };
    
    // Compare the setups
    compareObjects(originalSetup, modifiedSetup);
    
    return changes;
  }
  
  /**
   * Generate follow-up questions based on the evaluation
   * @param evaluation Evaluation of the setup changes
   * @returns List of follow-up questions
   */
  private generateFollowUpQuestions(
    evaluation: Record<string, any>
  ): string[] {
    // This is a placeholder implementation
    // In a real implementation, this would generate questions based on the evaluation
    // to help refine the setup further
    console.log('Generating follow-up questions...');
    
    const questions: string[] = [
      'How does the car feel on corner entry compared to before?',
      'Is the car more stable under braking?',
      'Do you notice any difference in tire wear or grip degradation over a stint?'
    ];
    
    // Add specific questions based on the evaluation
    for (const effect of evaluation.effects) {
      if (effect.impact === 'Positive') {
        questions.push(`Do you notice the improvement in ${effect.component.split('.').pop()} as expected?`);
      } else if (effect.impact === 'Mixed' || effect.impact === 'Negative') {
        questions.push(`Are there any negative effects from the change to ${effect.component.split('.').pop()}?`);
      }
    }
    
    // Add track-specific questions if available
    if (evaluation.trackSpecificNotes) {
      questions.push('How does the car handle in the most challenging sections of the track?');
    }
    
    // Add driving style-specific questions if available
    if (evaluation.drivingStyleNotes) {
      questions.push('Does the car respond better to your driving style now?');
    }
    
    // Limit to 5 questions maximum
    return questions.slice(0, 5);
  }
}
