/**
 * Interface representing an iRacing car setup
 * This is a simplified version that will be expanded as needed
 */
export interface SetupData {
  /**
   * Car model identifier
   */
  carId: string;
  
  /**
   * Track identifier
   */
  trackId: string;
  
  /**
   * Setup name
   */
  name: string;
  
  /**
   * Setup description or notes
   */
  description?: string;
  
  /**
   * Suspension settings
   */
  suspension: {
    /**
     * Front suspension settings
     */
    front: {
      /**
       * Spring rate in N/m
       */
      springRate: number;
      
      /**
       * Ride height in mm
       */
      rideHeight: number;
      
      /**
       * Camber angle in degrees (negative is tilted inward at top)
       */
      camber: number;
      
      /**
       * Toe angle in degrees (positive is toe-in)
       */
      toe: number;
      
      /**
       * Anti-roll bar stiffness (0-100 scale or specific units)
       */
      antiRollBar: number;
    },
    
    /**
     * Rear suspension settings
     */
    rear: {
      /**
       * Spring rate in N/m
       */
      springRate: number;
      
      /**
       * Ride height in mm
       */
      rideHeight: number;
      
      /**
       * Camber angle in degrees (negative is tilted inward at top)
       */
      camber: number;
      
      /**
       * Toe angle in degrees (positive is toe-in)
       */
      toe: number;
      
      /**
       * Anti-roll bar stiffness (0-100 scale or specific units)
       */
      antiRollBar: number;
    }
  },
  
  /**
   * Damper/shock absorber settings
   */
  dampers: {
    /**
     * Front damper settings
     */
    front: {
      /**
       * Bump/compression damping (0-100 scale or specific units)
       */
      bump: number;
      
      /**
       * Rebound damping (0-100 scale or specific units)
       */
      rebound: number;
    },
    
    /**
     * Rear damper settings
     */
    rear: {
      /**
       * Bump/compression damping (0-100 scale or specific units)
       */
      bump: number;
      
      /**
       * Rebound damping (0-100 scale or specific units)
       */
      rebound: number;
    }
  },
  
  /**
   * Tire pressure settings in kPa
   */
  tirePressures: {
    /**
     * Front left tire pressure
     */
    frontLeft: number;
    
    /**
     * Front right tire pressure
     */
    frontRight: number;
    
    /**
     * Rear left tire pressure
     */
    rearLeft: number;
    
    /**
     * Rear right tire pressure
     */
    rearRight: number;
  },
  
  /**
   * Aerodynamic settings
   */
  aero: {
    /**
     * Front wing/splitter setting (0-100 scale or specific units)
     */
    frontWing?: number;
    
    /**
     * Rear wing setting (0-100 scale or specific units)
     */
    rearWing?: number;
  },
  
  /**
   * Differential settings
   */
  differential?: {
    /**
     * Preload setting (0-100 scale or specific units)
     */
    preload: number;
    
    /**
     * Power/acceleration ramp setting (0-100 scale or percentage)
     */
    powerRamp?: number;
    
    /**
     * Coast/deceleration ramp setting (0-100 scale or percentage)
     */
    coastRamp?: number;
  },
  
  /**
   * Brake bias as percentage to the front (e.g., 55 means 55% front, 45% rear)
   */
  brakeBias: number;
  
  /**
   * Gear ratios array, from first gear onwards
   */
  gearRatios?: number[];
  
  /**
   * Additional car-specific settings that don't fit in the standard categories
   */
  additionalSettings?: Record<string, any>;
  
  /**
   * Metadata about the setup
   */
  metadata?: {
    /**
     * Creation date
     */
    created: string;
    
    /**
     * Last modified date
     */
    modified: string;
    
    /**
     * Creator name or identifier
     */
    author?: string;
    
    /**
     * Version of the setup
     */
    version?: string;
  };
}
