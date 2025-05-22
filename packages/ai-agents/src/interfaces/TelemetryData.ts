/**
 * Interface representing telemetry data from iRacing/SimHub
 */
export interface TelemetryData {
  /**
   * Metadata about the telemetry session
   */
  metadata: {
    /**
     * Car model identifier
     */
    carId: string;
    
    /**
     * Track identifier
     */
    trackId: string;
    
    /**
     * Driver name
     */
    driver: string;
    
    /**
     * Session type (race, qualify, practice)
     */
    sessionType: string;
    
    /**
     * Date and time of the session
     */
    timestamp: string;
    
    /**
     * Lap count in the session
     */
    lapCount: number;
  };
  
  /**
   * Array of lap data
   */
  laps: TelemetryLap[];
  
  /**
   * Summary statistics across all laps
   */
  summary: {
    /**
     * Best lap time in seconds
     */
    bestLapTime: number;
    
    /**
     * Average lap time in seconds
     */
    averageLapTime: number;
    
    /**
     * Maximum speed achieved in km/h
     */
    maxSpeed: number;
    
    /**
     * Average speed across all laps in km/h
     */
    averageSpeed: number;
    
    /**
     * Maximum lateral G-force experienced
     */
    maxLateralG: number;
    
    /**
     * Maximum longitudinal G-force experienced (acceleration)
     */
    maxLongitudinalGAccel: number;
    
    /**
     * Maximum longitudinal G-force experienced (braking)
     */
    maxLongitudinalGBrake: number;
    
    /**
     * Average tire temperatures
     */
    averageTireTemps: {
      frontLeft: number;
      frontRight: number;
      rearLeft: number;
      rearRight: number;
    };
    
    /**
     * Additional summary statistics
     */
    [key: string]: any;
  };
}

/**
 * Interface representing a single lap of telemetry data
 */
export interface TelemetryLap {
  /**
   * Lap number
   */
  lapNumber: number;
  
  /**
   * Lap time in seconds
   */
  lapTime: number;
  
  /**
   * Sector times in seconds
   */
  sectors: number[];
  
  /**
   * Array of data points for this lap
   */
  dataPoints: TelemetryDataPoint[];
  
  /**
   * Lap-specific summary statistics
   */
  summary: {
    /**
     * Maximum speed in km/h
     */
    maxSpeed: number;
    
    /**
     * Average speed in km/h
     */
    averageSpeed: number;
    
    /**
     * Maximum lateral G-force
     */
    maxLateralG: number;
    
    /**
     * Maximum longitudinal G-force (acceleration)
     */
    maxLongitudinalGAccel: number;
    
    /**
     * Maximum longitudinal G-force (braking)
     */
    maxLongitudinalGBrake: number;
    
    /**
     * Minimum, maximum, and average tire temperatures
     */
    tireTemps: {
      frontLeft: { min: number; max: number; avg: number };
      frontRight: { min: number; max: number; avg: number };
      rearLeft: { min: number; max: number; avg: number };
      rearRight: { min: number; max: number; avg: number };
    };
    
    /**
     * Additional lap-specific summary statistics
     */
    [key: string]: any;
  };
}

/**
 * Interface representing a single telemetry data point
 */
export interface TelemetryDataPoint {
  /**
   * Time in seconds from the start of the lap
   */
  time: number;
  
  /**
   * Distance in meters from the start/finish line
   */
  distance: number;
  
  /**
   * Speed in km/h
   */
  speed: number;
  
  /**
   * Engine RPM
   */
  rpm: number;
  
  /**
   * Current gear (0 = neutral, -1 = reverse, 1-8 = forward gears)
   */
  gear: number;
  
  /**
   * Throttle position (0-100%)
   */
  throttle: number;
  
  /**
   * Brake pressure (0-100%)
   */
  brake: number;
  
  /**
   * Steering angle in degrees
   */
  steering: number;
  
  /**
   * Lateral G-force (positive = right)
   */
  lateralG: number;
  
  /**
   * Longitudinal G-force (positive = acceleration, negative = braking)
   */
  longitudinalG: number;
  
  /**
   * Tire temperatures in Celsius
   */
  tireTemps: {
    frontLeft: number;
    frontRight: number;
    rearLeft: number;
    rearRight: number;
  };
  
  /**
   * Tire pressures in kPa
   */
  tirePressures: {
    frontLeft: number;
    frontRight: number;
    rearLeft: number;
    rearRight: number;
  };
  
  /**
   * Suspension travel in mm
   */
  suspensionTravel: {
    frontLeft: number;
    frontRight: number;
    rearLeft: number;
    rearRight: number;
  };
  
  /**
   * Additional telemetry data points
   */
  [key: string]: any;
}
