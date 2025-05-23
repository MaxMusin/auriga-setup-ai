/**
 * Interface representing the structure of an iRacing setup file (.sto)
 */
export interface SetupFile {
  // Header information
  header: {
    // Setup file version
    version: string;
    // Car model identifier
    carIdentifier: string;
    // Track identifier
    trackIdentifier: string;
    // Setup name
    name: string;
    // Creation/modification timestamp
    timestamp?: string;
    // Additional metadata
    [key: string]: any;
  };
  
  // Sections of the setup file
  sections: {
    [sectionName: string]: {
      [key: string]: string | number | boolean;
    };
  };
}

/**
 * Interface representing a parsed setup in a more structured format
 * This matches the SetupData interface from the ai-agents package
 */
export interface ParsedSetup {
  // Car model identifier
  carId: string;
  
  // Track identifier
  trackId: string;
  
  // Setup name
  name: string;
  
  // Setup description or notes
  description?: string;
  
  // Suspension settings
  suspension: {
    // Front suspension settings
    front: {
      // Spring rate in N/m
      springRate: number;
      
      // Ride height in mm
      rideHeight: number;
      
      // Camber angle in degrees (negative is tilted inward at top)
      camber: number;
      
      // Toe angle in degrees (positive is toe-in)
      toe: number;
      
      // Anti-roll bar stiffness (0-100 scale or specific units)
      antiRollBar: number;
    },
    
    // Rear suspension settings
    rear: {
      // Spring rate in N/m
      springRate: number;
      
      // Ride height in mm
      rideHeight: number;
      
      // Camber angle in degrees (negative is tilted inward at top)
      camber: number;
      
      // Toe angle in degrees (positive is toe-in)
      toe: number;
      
      // Anti-roll bar stiffness (0-100 scale or specific units)
      antiRollBar: number;
    }
  };
  
  // Damper/shock absorber settings
  dampers: {
    // Front damper settings
    front: {
      // Bump/compression damping (0-100 scale or specific units)
      bump: number;
      
      // Rebound damping (0-100 scale or specific units)
      rebound: number;
    },
    
    // Rear damper settings
    rear: {
      // Bump/compression damping (0-100 scale or specific units)
      bump: number;
      
      // Rebound damping (0-100 scale or specific units)
      rebound: number;
    }
  };
  
  // Tire pressure settings in kPa
  tirePressures: {
    // Front left tire pressure
    frontLeft: number;
    
    // Front right tire pressure
    frontRight: number;
    
    // Rear left tire pressure
    rearLeft: number;
    
    // Rear right tire pressure
    rearRight: number;
  };
  
  // Aerodynamic settings
  aero: {
    // Front wing/splitter setting (0-100 scale or specific units)
    frontWing?: number;
    
    // Rear wing setting (0-100 scale or specific units)
    rearWing?: number;
  };
  
  // Differential settings
  differential?: {
    // Preload setting (0-100 scale or specific units)
    preload: number;
    
    // Power/acceleration ramp setting (0-100 scale or percentage)
    powerRamp?: number;
    
    // Coast/deceleration ramp setting (0-100 scale or percentage)
    coastRamp?: number;
  };
  
  // Brake bias as percentage to the front (e.g., 55 means 55% front, 45% rear)
  brakeBias: number;
  
  // Gear ratios array, from first gear onwards
  gearRatios?: number[];
  
  // Additional car-specific settings that don't fit in the standard categories
  additionalSettings?: Record<string, any>;
  
  // Metadata about the setup
  metadata?: {
    // Creation date
    created: string;
    
    // Last modified date
    modified: string;
    
    // Creator name or identifier
    author?: string;
    
    // Version of the setup
    version?: string;
  };
}

/**
 * Mapping configuration for converting between raw .sto file and structured setup data
 * This helps with different cars having different parameter names
 */
export interface CarMappingConfig {
  // Car identifier this mapping applies to
  carId: string;
  
  // Human-readable car name
  carName: string;
  
  // Mapping from structured fields to raw .sto file fields
  fieldMappings: {
    // Section name in .sto file -> field mappings
    [sectionName: string]: {
      // Target field in structured data -> source field in .sto file
      [targetField: string]: string;
    };
  };
  
  // Transformations to apply to values (e.g., unit conversions)
  valueTransformations?: {
    // Field path in structured data -> transformation function
    [fieldPath: string]: {
      // Function to transform from raw to structured
      fromRaw: (value: any) => any;
      // Function to transform from structured to raw
      toRaw: (value: any) => any;
    };
  };
}
