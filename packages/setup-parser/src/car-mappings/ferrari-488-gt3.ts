import { CarMappingConfig } from '../types';

/**
 * Mapping configuration for the Ferrari 488 GT3
 */
export const ferrari488GT3Mapping: CarMappingConfig = {
  carId: 'ferrari_488_gt3',
  carName: 'Ferrari 488 GT3',
  fieldMappings: {
    // Tire section mappings
    'TIRE': {
      'tirePressures.frontLeft': 'PRESSURE_LF',
      'tirePressures.frontRight': 'PRESSURE_RF',
      'tirePressures.rearLeft': 'PRESSURE_LR',
      'tirePressures.rearRight': 'PRESSURE_RR'
    },
    
    // Suspension section mappings
    'SUSPENSION': {
      'suspension.front.springRate': 'SPRING_RATE_LF',
      'suspension.front.rideHeight': 'RIDE_HEIGHT_LF',
      'suspension.front.camber': 'CAMBER_LF',
      'suspension.front.toe': 'TOE_LF',
      'suspension.front.antiRollBar': 'ARB_FRONT',
      
      'suspension.rear.springRate': 'SPRING_RATE_LR',
      'suspension.rear.rideHeight': 'RIDE_HEIGHT_LR',
      'suspension.rear.camber': 'CAMBER_LR',
      'suspension.rear.toe': 'TOE_LR',
      'suspension.rear.antiRollBar': 'ARB_REAR',
      
      'dampers.front.bump': 'BUMP_LF',
      'dampers.front.rebound': 'REBOUND_LF',
      'dampers.rear.bump': 'BUMP_LR',
      'dampers.rear.rebound': 'REBOUND_LR'
    },
    
    // Aerodynamics section mappings
    'AERO': {
      'aero.rearWing': 'WING_REAR'
    },
    
    // Brake section mappings
    'BRAKE': {
      'brakeBias': 'BIAS'
    },
    
    // Differential section mappings
    'DIFFERENTIAL': {
      'differential.preload': 'PRELOAD',
      'differential.powerRamp': 'POWER_RAMP',
      'differential.coastRamp': 'COAST_RAMP'
    }
  },
  
  // Value transformations for specific fields
  valueTransformations: {
    // Example: Convert camber from Ferrari's format to our standard format
    'suspension.front.camber': {
      fromRaw: (value: any) => -parseFloat(value), // Negate to match our convention
      toRaw: (value: any) => -value // Negate back when converting to raw
    },
    'suspension.rear.camber': {
      fromRaw: (value: any) => -parseFloat(value),
      toRaw: (value: any) => -value
    }
  }
};
