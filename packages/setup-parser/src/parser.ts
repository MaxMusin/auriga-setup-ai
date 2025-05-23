import * as fs from 'fs';
import * as ini from 'ini';
import { SetupFile, ParsedSetup, CarMappingConfig } from './types';

/**
 * Parse an iRacing setup file (.sto) into a structured format
 */
export class SetupParser {
  private carMappings: Map<string, CarMappingConfig> = new Map();
  
  /**
   * Create a new SetupParser
   * @param carMappingsArray Array of car mapping configurations
   */
  constructor(carMappingsArray: CarMappingConfig[] = []) {
    // Initialize car mappings
    for (const mapping of carMappingsArray) {
      this.carMappings.set(mapping.carId, mapping);
    }
  }
  
  /**
   * Register a car mapping configuration
   * @param mapping Car mapping configuration
   */
  public registerCarMapping(mapping: CarMappingConfig): void {
    this.carMappings.set(mapping.carId, mapping);
  }
  
  /**
   * Parse a .sto file from a file path
   * @param filePath Path to the .sto file
   * @returns Parsed setup data
   */
  public parseFile(filePath: string): ParsedSetup {
    const content = fs.readFileSync(filePath, 'utf8');
    return this.parseString(content);
  }
  
  /**
   * Parse a .sto file content from a string
   * @param content Content of the .sto file
   * @returns Parsed setup data
   */
  public parseString(content: string): ParsedSetup {
    // Parse the .sto file as INI format
    const rawSetup = this.parseIniString(content);
    
    // Convert the raw setup to a structured format
    return this.convertToStructured(rawSetup);
  }
  
  /**
   * Parse a .sto file content as INI format
   * @param content Content of the .sto file
   * @returns Raw setup data in INI format
   */
  private parseIniString(content: string): SetupFile {
    try {
      // Parse the content as INI
      const parsed = ini.parse(content);
      
      // Extract header information
      const header = {
        version: parsed.VERSION || '1.0',
        carIdentifier: parsed.CAR || '',
        trackIdentifier: parsed.TRACK || '',
        name: parsed.SETUPS?.ACTIVE || 'Unnamed Setup',
        timestamp: parsed.TIMESTAMP || new Date().toISOString(),
      };
      
      // Remove known header sections
      delete parsed.VERSION;
      delete parsed.CAR;
      delete parsed.TRACK;
      delete parsed.TIMESTAMP;
      
      // The rest are sections
      const sections: SetupFile['sections'] = {};
      
      // Process each section
      for (const key in parsed) {
        if (typeof parsed[key] === 'object') {
          sections[key] = parsed[key];
        }
      }
      
      return { header, sections };
    } catch (error) {
      console.error('Error parsing .sto file:', error);
      throw new Error('Failed to parse .sto file: ' + (error as Error).message);
    }
  }
  
  /**
   * Convert a raw setup to a structured format
   * @param rawSetup Raw setup data
   * @returns Structured setup data
   */
  private convertToStructured(rawSetup: SetupFile): ParsedSetup {
    // Initialize the structured setup with default values
    const setup: ParsedSetup = {
      carId: rawSetup.header.carIdentifier,
      trackId: rawSetup.header.trackIdentifier,
      name: rawSetup.header.name,
      suspension: {
        front: {
          springRate: 0,
          rideHeight: 0,
          camber: 0,
          toe: 0,
          antiRollBar: 0
        },
        rear: {
          springRate: 0,
          rideHeight: 0,
          camber: 0,
          toe: 0,
          antiRollBar: 0
        }
      },
      dampers: {
        front: {
          bump: 0,
          rebound: 0
        },
        rear: {
          bump: 0,
          rebound: 0
        }
      },
      tirePressures: {
        frontLeft: 0,
        frontRight: 0,
        rearLeft: 0,
        rearRight: 0
      },
      aero: {},
      brakeBias: 50,
      metadata: {
        created: rawSetup.header.timestamp || new Date().toISOString(),
        modified: rawSetup.header.timestamp || new Date().toISOString(),
        version: rawSetup.header.version
      }
    };
    
    // Get car mapping if available
    const carMapping = this.carMappings.get(rawSetup.header.carIdentifier);
    
    if (carMapping) {
      // Apply mappings based on the car configuration
      this.applyCarMapping(setup, rawSetup, carMapping);
    } else {
      // Apply generic mappings if no specific car mapping is available
      this.applyGenericMapping(setup, rawSetup);
    }
    
    return setup;
  }
  
  /**
   * Apply car-specific mapping to convert raw setup to structured format
   * @param setup Structured setup to populate
   * @param rawSetup Raw setup data
   * @param mapping Car mapping configuration
   */
  private applyCarMapping(
    setup: ParsedSetup,
    rawSetup: SetupFile,
    mapping: CarMappingConfig
  ): void {
    // Process each section in the mapping
    for (const sectionName in mapping.fieldMappings) {
      const sectionMapping = mapping.fieldMappings[sectionName];
      const rawSection = rawSetup.sections[sectionName];
      
      if (!rawSection) continue;
      
      // Process each field in the section mapping
      for (const targetField in sectionMapping) {
        const sourceField = sectionMapping[targetField];
        const rawValue = rawSection[sourceField];
        
        if (rawValue === undefined) continue;
        
        // Apply value transformation if available
        let value = rawValue;
        const transformation = mapping.valueTransformations?.[targetField];
        if (transformation) {
          value = transformation.fromRaw(rawValue);
        } else {
          // Default conversion to number if possible
          if (typeof rawValue === 'string' && !isNaN(Number(rawValue))) {
            value = Number(rawValue);
          }
        }
        
        // Set the value in the structured setup
        this.setNestedProperty(setup, targetField, value);
      }
    }
  }
  
  /**
   * Apply generic mapping for cars without specific mappings
   * @param setup Structured setup to populate
   * @param rawSetup Raw setup data
   */
  private applyGenericMapping(setup: ParsedSetup, rawSetup: SetupFile): void {
    // Generic mapping for common sections and fields
    
    // Tire pressures
    const tirePressureSection = rawSetup.sections['TIRE'] || {};
    setup.tirePressures.frontLeft = this.parseNumber(tirePressureSection['LEFT_FRONT'] || tirePressureSection['PRESSURE_LF']);
    setup.tirePressures.frontRight = this.parseNumber(tirePressureSection['RIGHT_FRONT'] || tirePressureSection['PRESSURE_RF']);
    setup.tirePressures.rearLeft = this.parseNumber(tirePressureSection['LEFT_REAR'] || tirePressureSection['PRESSURE_LR']);
    setup.tirePressures.rearRight = this.parseNumber(tirePressureSection['RIGHT_REAR'] || tirePressureSection['PRESSURE_RR']);
    
    // Suspension
    const suspensionSection = rawSetup.sections['SUSPENSION'] || {};
    
    // Front suspension
    setup.suspension.front.springRate = this.parseNumber(suspensionSection['SPRING_RATE_LF'] || suspensionSection['FRONT_SPRING_RATE']);
    setup.suspension.front.rideHeight = this.parseNumber(suspensionSection['RIDE_HEIGHT_LF'] || suspensionSection['FRONT_RIDE_HEIGHT']);
    setup.suspension.front.camber = this.parseNumber(suspensionSection['CAMBER_LF'] || suspensionSection['FRONT_CAMBER']);
    setup.suspension.front.toe = this.parseNumber(suspensionSection['TOE_IN_LF'] || suspensionSection['FRONT_TOE']);
    setup.suspension.front.antiRollBar = this.parseNumber(suspensionSection['FRONT_ANTI_ROLL_BAR'] || suspensionSection['ARB_FRONT']);
    
    // Rear suspension
    setup.suspension.rear.springRate = this.parseNumber(suspensionSection['SPRING_RATE_LR'] || suspensionSection['REAR_SPRING_RATE']);
    setup.suspension.rear.rideHeight = this.parseNumber(suspensionSection['RIDE_HEIGHT_LR'] || suspensionSection['REAR_RIDE_HEIGHT']);
    setup.suspension.rear.camber = this.parseNumber(suspensionSection['CAMBER_LR'] || suspensionSection['REAR_CAMBER']);
    setup.suspension.rear.toe = this.parseNumber(suspensionSection['TOE_IN_LR'] || suspensionSection['REAR_TOE']);
    setup.suspension.rear.antiRollBar = this.parseNumber(suspensionSection['REAR_ANTI_ROLL_BAR'] || suspensionSection['ARB_REAR']);
    
    // Dampers
    const damperSection = rawSetup.sections['DAMPER'] || suspensionSection;
    
    // Front dampers
    setup.dampers.front.bump = this.parseNumber(damperSection['BUMP_LF'] || damperSection['FRONT_BUMP']);
    setup.dampers.front.rebound = this.parseNumber(damperSection['REBOUND_LF'] || damperSection['FRONT_REBOUND']);
    
    // Rear dampers
    setup.dampers.rear.bump = this.parseNumber(damperSection['BUMP_LR'] || damperSection['REAR_BUMP']);
    setup.dampers.rear.rebound = this.parseNumber(damperSection['REBOUND_LR'] || damperSection['REAR_REBOUND']);
    
    // Aero
    const aeroSection = rawSetup.sections['AERO'] || {};
    setup.aero.frontWing = this.parseNumber(aeroSection['FRONT_WING'] || aeroSection['WING_FRONT']);
    setup.aero.rearWing = this.parseNumber(aeroSection['REAR_WING'] || aeroSection['WING_REAR']);
    
    // Brake bias
    const brakeSection = rawSetup.sections['BRAKE'] || {};
    setup.brakeBias = this.parseNumber(brakeSection['BIAS'] || brakeSection['BRAKE_BIAS'] || 50);
    
    // Differential
    const diffSection = rawSetup.sections['DIFFERENTIAL'] || {};
    if (Object.keys(diffSection).length > 0) {
      setup.differential = {
        preload: this.parseNumber(diffSection['PRELOAD'] || diffSection['DIFF_PRELOAD'] || 0),
        powerRamp: this.parseNumber(diffSection['POWER_RAMP'] || diffSection['DIFF_POWER'] || 0),
        coastRamp: this.parseNumber(diffSection['COAST_RAMP'] || diffSection['DIFF_COAST'] || 0)
      };
    }
    
    // Gear ratios
    const gearSection = rawSetup.sections['GEARS'] || {};
    const gearRatios: number[] = [];
    
    // Look for gear ratios in the format GEAR_1, GEAR_2, etc.
    for (let i = 1; i <= 8; i++) {
      const gearKey = `GEAR_${i}`;
      if (gearSection[gearKey] !== undefined) {
        gearRatios.push(this.parseNumber(gearSection[gearKey]));
      }
    }
    
    // If we found any gear ratios, add them to the setup
    if (gearRatios.length > 0) {
      setup.gearRatios = gearRatios;
    }
    
    // Store any additional sections as additionalSettings
    setup.additionalSettings = {};
    
    for (const sectionName in rawSetup.sections) {
      // Skip sections we've already processed
      if (['TIRE', 'SUSPENSION', 'DAMPER', 'AERO', 'BRAKE', 'DIFFERENTIAL', 'GEARS'].includes(sectionName)) {
        continue;
      }
      
      // Add the section to additionalSettings
      setup.additionalSettings[sectionName] = rawSetup.sections[sectionName];
    }
  }
  
  /**
   * Set a nested property in an object
   * @param obj Object to set property in
   * @param path Path to the property (e.g., 'suspension.front.springRate')
   * @param value Value to set
   */
  private setNestedProperty(obj: any, path: string, value: any): void {
    const parts = path.split('.');
    let current = obj;
    
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (current[part] === undefined) {
        current[part] = {};
      }
      current = current[part];
    }
    
    current[parts[parts.length - 1]] = value;
  }
  
  /**
   * Parse a value as a number, returning 0 if it's not a valid number
   * @param value Value to parse
   * @returns Parsed number or 0
   */
  private parseNumber(value: any): number {
    if (value === undefined || value === null) return 0;
    
    if (typeof value === 'number') return value;
    
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    
    return 0;
  }
  
  /**
   * Convert a structured setup back to a .sto file format
   * @param setup Structured setup data
   * @returns .sto file content as a string
   */
  public convertToSto(setup: ParsedSetup): string {
    // Initialize the raw setup
    const rawSetup: Record<string, any> = {
      VERSION: setup.metadata?.version || '1.0',
      CAR: setup.carId,
      TRACK: setup.trackId,
      TIMESTAMP: setup.metadata?.modified || new Date().toISOString(),
      SETUPS: {
        ACTIVE: setup.name
      }
    };
    
    // Get car mapping if available
    const carMapping = this.carMappings.get(setup.carId);
    
    if (carMapping) {
      // Apply car-specific mapping
      this.applyCarMappingReverse(setup, rawSetup, carMapping);
    } else {
      // Apply generic mapping
      this.applyGenericMappingReverse(setup, rawSetup);
    }
    
    // Convert to INI format
    return ini.stringify(rawSetup);
  }
  
  /**
   * Apply car-specific mapping to convert structured setup to raw format
   * @param setup Structured setup data
   * @param rawSetup Raw setup data to populate
   * @param mapping Car mapping configuration
   */
  private applyCarMappingReverse(
    setup: ParsedSetup,
    rawSetup: Record<string, any>,
    mapping: CarMappingConfig
  ): void {
    // Process each section in the mapping
    for (const sectionName in mapping.fieldMappings) {
      const sectionMapping = mapping.fieldMappings[sectionName];
      
      // Create the section if it doesn't exist
      if (!rawSetup[sectionName]) {
        rawSetup[sectionName] = {};
      }
      
      // Process each field in the section mapping
      for (const targetField in sectionMapping) {
        const sourceField = sectionMapping[targetField];
        
        // Get the value from the structured setup
        const value = this.getNestedProperty(setup, targetField);
        
        if (value === undefined) continue;
        
        // Apply value transformation if available
        let rawValue = value;
        const transformation = mapping.valueTransformations?.[targetField];
        if (transformation) {
          rawValue = transformation.toRaw(value);
        }
        
        // Set the value in the raw setup
        rawSetup[sectionName][sourceField] = rawValue;
      }
    }
  }
  
  /**
   * Apply generic mapping to convert structured setup to raw format
   * @param setup Structured setup data
   * @param rawSetup Raw setup data to populate
   */
  private applyGenericMappingReverse(setup: ParsedSetup, rawSetup: Record<string, any>): void {
    // Initialize sections
    rawSetup.TIRE = {};
    rawSetup.SUSPENSION = {};
    rawSetup.AERO = {};
    rawSetup.BRAKE = {};
    
    // Tire pressures
    rawSetup.TIRE.LEFT_FRONT = setup.tirePressures.frontLeft;
    rawSetup.TIRE.RIGHT_FRONT = setup.tirePressures.frontRight;
    rawSetup.TIRE.LEFT_REAR = setup.tirePressures.rearLeft;
    rawSetup.TIRE.RIGHT_REAR = setup.tirePressures.rearRight;
    
    // Suspension
    // Front suspension
    rawSetup.SUSPENSION.SPRING_RATE_LF = setup.suspension.front.springRate;
    rawSetup.SUSPENSION.RIDE_HEIGHT_LF = setup.suspension.front.rideHeight;
    rawSetup.SUSPENSION.CAMBER_LF = setup.suspension.front.camber;
    rawSetup.SUSPENSION.TOE_IN_LF = setup.suspension.front.toe;
    rawSetup.SUSPENSION.FRONT_ANTI_ROLL_BAR = setup.suspension.front.antiRollBar;
    
    // Rear suspension
    rawSetup.SUSPENSION.SPRING_RATE_LR = setup.suspension.rear.springRate;
    rawSetup.SUSPENSION.RIDE_HEIGHT_LR = setup.suspension.rear.rideHeight;
    rawSetup.SUSPENSION.CAMBER_LR = setup.suspension.rear.camber;
    rawSetup.SUSPENSION.TOE_IN_LR = setup.suspension.rear.toe;
    rawSetup.SUSPENSION.REAR_ANTI_ROLL_BAR = setup.suspension.rear.antiRollBar;
    
    // Dampers
    rawSetup.SUSPENSION.BUMP_LF = setup.dampers.front.bump;
    rawSetup.SUSPENSION.REBOUND_LF = setup.dampers.front.rebound;
    rawSetup.SUSPENSION.BUMP_LR = setup.dampers.rear.bump;
    rawSetup.SUSPENSION.REBOUND_LR = setup.dampers.rear.rebound;
    
    // Aero
    if (setup.aero.frontWing !== undefined) {
      rawSetup.AERO.FRONT_WING = setup.aero.frontWing;
    }
    if (setup.aero.rearWing !== undefined) {
      rawSetup.AERO.REAR_WING = setup.aero.rearWing;
    }
    
    // Brake bias
    rawSetup.BRAKE.BIAS = setup.brakeBias;
    
    // Differential
    if (setup.differential) {
      rawSetup.DIFFERENTIAL = {
        PRELOAD: setup.differential.preload
      };
      
      if (setup.differential.powerRamp !== undefined) {
        rawSetup.DIFFERENTIAL.POWER_RAMP = setup.differential.powerRamp;
      }
      
      if (setup.differential.coastRamp !== undefined) {
        rawSetup.DIFFERENTIAL.COAST_RAMP = setup.differential.coastRamp;
      }
    }
    
    // Gear ratios
    if (setup.gearRatios && setup.gearRatios.length > 0) {
      rawSetup.GEARS = {};
      
      for (let i = 0; i < setup.gearRatios.length; i++) {
        rawSetup.GEARS[`GEAR_${i + 1}`] = setup.gearRatios[i];
      }
    }
    
    // Add any additional settings
    if (setup.additionalSettings) {
      for (const sectionName in setup.additionalSettings) {
        rawSetup[sectionName] = setup.additionalSettings[sectionName];
      }
    }
  }
  
  /**
   * Get a nested property from an object
   * @param obj Object to get property from
   * @param path Path to the property (e.g., 'suspension.front.springRate')
   * @returns Property value or undefined if not found
   */
  private getNestedProperty(obj: any, path: string): any {
    const parts = path.split('.');
    let current = obj;
    
    for (const part of parts) {
      if (current === undefined || current === null) {
        return undefined;
      }
      current = current[part];
    }
    
    return current;
  }
  
  /**
   * Save a structured setup to a .sto file
   * @param setup Structured setup data
   * @param filePath Path to save the .sto file
   */
  public saveToFile(setup: ParsedSetup, filePath: string): void {
    const content = this.convertToSto(setup);
    fs.writeFileSync(filePath, content, 'utf8');
  }
}
