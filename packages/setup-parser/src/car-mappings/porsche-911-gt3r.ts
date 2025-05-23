import { CarMappingConfig } from '../types';

/**
 * Mapping configuration for the Porsche 911 GT3 R
 */
export const porsche911GT3RMapping: CarMappingConfig = {
  carId: 'porsche_911_gt3r',
  carName: 'Porsche 911 GT3 R',
  fieldMappings: {
    // Tire section mappings
    'TIRE': {
      'tirePressures.frontLeft': 'LEFT_FRONT',
      'tirePressures.frontRight': 'RIGHT_FRONT',
      'tirePressures.rearLeft': 'LEFT_REAR',
      'tirePressures.rearRight': 'RIGHT_REAR'
    },
    
    // Suspension section mappings
    'SUSPENSION': {
      'suspension.front.springRate': 'FRONT_SPRING_RATE',
      'suspension.front.rideHeight': 'FRONT_RIDE_HEIGHT',
      'suspension.front.camber': 'FRONT_CAMBER',
      'suspension.front.toe': 'FRONT_TOE',
      'suspension.front.antiRollBar': 'FRONT_ARB',
      
      'suspension.rear.springRate': 'REAR_SPRING_RATE',
      'suspension.rear.rideHeight': 'REAR_RIDE_HEIGHT',
      'suspension.rear.camber': 'REAR_CAMBER',
      'suspension.rear.toe': 'REAR_TOE',
      'suspension.rear.antiRollBar': 'REAR_ARB',
      
      'dampers.front.bump': 'FRONT_BUMP',
      'dampers.front.rebound': 'FRONT_REBOUND',
      'dampers.rear.bump': 'REAR_BUMP',
      'dampers.rear.rebound': 'REAR_REBOUND'
    },
    
    // Aerodynamics section mappings
    'AERO': {
      'aero.rearWing': 'REAR_WING'
    },
    
    // Brake section mappings
    'BRAKE': {
      'brakeBias': 'BRAKE_BIAS'
    },
    
    // Differential section mappings
    'DIFFERENTIAL': {
      'differential.preload': 'DIFF_PRELOAD',
      'differential.powerRamp': 'DIFF_ENTRY',
      'differential.coastRamp': 'DIFF_EXIT'
    }
  },
  
  // Value transformations for specific fields
  valueTransformations: {
    // Porsche uses different units for spring rates (N/mm vs N/m)
    'suspension.front.springRate': {
      fromRaw: (value: any) => parseFloat(value) * 1000, // Convert from N/mm to N/m
      toRaw: (value: any) => value / 1000 // Convert from N/m to N/mm
    },
    'suspension.rear.springRate': {
      fromRaw: (value: any) => parseFloat(value) * 1000,
      toRaw: (value: any) => value / 1000
    },
    // Porsche uses positive camber values for negative camber
    'suspension.front.camber': {
      fromRaw: (value: any) => -parseFloat(value),
      toRaw: (value: any) => -value
    },
    'suspension.rear.camber': {
      fromRaw: (value: any) => -parseFloat(value),
      toRaw: (value: any) => -value
    }
  }
};
