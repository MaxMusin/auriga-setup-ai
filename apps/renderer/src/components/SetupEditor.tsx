import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Tabs, 
  Tab, 
  Grid, 
  TextField, 
  Slider, 
  Paper,
  Button,
  Tooltip,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import InfoIcon from '@mui/icons-material/Info';
import SaveIcon from '@mui/icons-material/Save';
import RestoreIcon from '@mui/icons-material/Restore';

// Define interfaces for our setup data
interface SetupData {
  carId: string;
  trackId: string;
  name: string;
  description?: string;
  suspension: {
    front: {
      springRate: number;
      rideHeight: number;
      camber: number;
      toe: number;
      antiRollBar: number;
    };
    rear: {
      springRate: number;
      rideHeight: number;
      camber: number;
      toe: number;
      antiRollBar: number;
    };
  };
  dampers: {
    front: {
      bump: number;
      rebound: number;
    };
    rear: {
      bump: number;
      rebound: number;
    };
  };
  tirePressures: {
    frontLeft: number;
    frontRight: number;
    rearLeft: number;
    rearRight: number;
  };
  aero: {
    frontWing?: number;
    rearWing?: number;
  };
  brakeBias: number;
  differential?: {
    preload: number;
    powerRamp?: number;
    coastRamp?: number;
  };
  metadata?: {
    created: string;
    modified: string;
    author?: string;
    version?: string;
  };
}

// Define validation rules for setup parameters
interface ValidationRule {
  min: number;
  max: number;
  step: number;
  unit: string;
  description: string;
}

interface ValidationRules {
  [key: string]: ValidationRule;
}

// Setup validation rules
const setupValidationRules: ValidationRules = {
  'suspension.front.springRate': { min: 50000, max: 250000, step: 1000, unit: 'N/m', description: 'Front spring rate' },
  'suspension.rear.springRate': { min: 50000, max: 250000, step: 1000, unit: 'N/m', description: 'Rear spring rate' },
  'suspension.front.rideHeight': { min: 40, max: 120, step: 0.5, unit: 'mm', description: 'Front ride height' },
  'suspension.rear.rideHeight': { min: 40, max: 120, step: 0.5, unit: 'mm', description: 'Rear ride height' },
  'suspension.front.camber': { min: -5, max: 0, step: 0.1, unit: '°', description: 'Front camber angle (negative is tilted inward at top)' },
  'suspension.rear.camber': { min: -5, max: 0, step: 0.1, unit: '°', description: 'Rear camber angle (negative is tilted inward at top)' },
  'suspension.front.toe': { min: -0.5, max: 0.5, step: 0.01, unit: '°', description: 'Front toe angle (positive is toe-in)' },
  'suspension.rear.toe': { min: -0.5, max: 0.5, step: 0.01, unit: '°', description: 'Rear toe angle (positive is toe-in)' },
  'suspension.front.antiRollBar': { min: 0, max: 50, step: 1, unit: '', description: 'Front anti-roll bar stiffness' },
  'suspension.rear.antiRollBar': { min: 0, max: 50, step: 1, unit: '', description: 'Rear anti-roll bar stiffness' },
  'dampers.front.bump': { min: 0, max: 20, step: 1, unit: '', description: 'Front bump damping' },
  'dampers.front.rebound': { min: 0, max: 20, step: 1, unit: '', description: 'Front rebound damping' },
  'dampers.rear.bump': { min: 0, max: 20, step: 1, unit: '', description: 'Rear bump damping' },
  'dampers.rear.rebound': { min: 0, max: 20, step: 1, unit: '', description: 'Rear rebound damping' },
  'tirePressures.frontLeft': { min: 120, max: 200, step: 0.5, unit: 'kPa', description: 'Front left tire pressure' },
  'tirePressures.frontRight': { min: 120, max: 200, step: 0.5, unit: 'kPa', description: 'Front right tire pressure' },
  'tirePressures.rearLeft': { min: 120, max: 200, step: 0.5, unit: 'kPa', description: 'Rear left tire pressure' },
  'tirePressures.rearRight': { min: 120, max: 200, step: 0.5, unit: 'kPa', description: 'Rear right tire pressure' },
  'aero.frontWing': { min: 0, max: 10, step: 1, unit: '', description: 'Front wing/splitter setting' },
  'aero.rearWing': { min: 0, max: 20, step: 1, unit: '', description: 'Rear wing setting' },
  'brakeBias': { min: 45, max: 65, step: 0.1, unit: '%', description: 'Brake bias (percentage to the front)' },
  'differential.preload': { min: 0, max: 200, step: 1, unit: 'Nm', description: 'Differential preload' },
  'differential.powerRamp': { min: 0, max: 100, step: 1, unit: '%', description: 'Power/acceleration ramp' },
  'differential.coastRamp': { min: 0, max: 100, step: 1, unit: '%', description: 'Coast/deceleration ramp' }
};

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: '100%',
  overflow: 'auto'
}));

const ParameterRow = styled(Grid)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  alignItems: 'center'
}));

interface SetupEditorProps {
  setupData: SetupData | null;
  onSave: (updatedSetup: SetupData) => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`setup-tabpanel-${index}`}
      aria-labelledby={`setup-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `setup-tab-${index}`,
    'aria-controls': `setup-tabpanel-${index}`,
  };
}

export const SetupEditor: React.FC<SetupEditorProps> = ({ setupData, onSave }) => {
  const [editedSetup, setEditedSetup] = useState<SetupData | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isModified, setIsModified] = useState(false);

  // Initialize edited setup when setupData changes
  useEffect(() => {
    if (setupData) {
      setEditedSetup(JSON.parse(JSON.stringify(setupData)));
      setIsModified(false);
      setValidationErrors({});
    }
  }, [setupData]);

  if (!setupData || !editedSetup) {
    return (
      <StyledPaper>
        <Typography variant="h6">No setup loaded</Typography>
        <Typography variant="body2">
          Load a setup file to view and edit its parameters.
        </Typography>
      </StyledPaper>
    );
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Get nested property from object by path
  const getNestedProperty = (obj: any, path: string): any => {
    const parts = path.split('.');
    let current = obj;
    
    for (const part of parts) {
      if (current === undefined || current === null) {
        return undefined;
      }
      current = current[part];
    }
    
    return current;
  };

  // Set nested property in object by path
  const setNestedProperty = (obj: any, path: string, value: any): void => {
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
  };

  // Handle parameter change
  const handleParameterChange = (path: string, value: number) => {
    if (!editedSetup) return;
    
    // Validate the value
    const rule = setupValidationRules[path];
    if (rule) {
      if (value < rule.min || value > rule.max) {
        setValidationErrors({
          ...validationErrors,
          [path]: `Value must be between ${rule.min} and ${rule.max} ${rule.unit}`
        });
      } else {
        // Clear validation error if it exists
        const newErrors = { ...validationErrors };
        delete newErrors[path];
        setValidationErrors(newErrors);
      }
    }
    
    // Update the setup
    const newSetup = { ...editedSetup };
    setNestedProperty(newSetup, path, value);
    
    // Update metadata
    if (newSetup.metadata) {
      newSetup.metadata.modified = new Date().toISOString();
    } else {
      newSetup.metadata = {
        created: new Date().toISOString(),
        modified: new Date().toISOString()
      };
    }
    
    setEditedSetup(newSetup);
    setIsModified(true);
  };

  // Handle save
  const handleSave = () => {
    if (editedSetup && Object.keys(validationErrors).length === 0) {
      onSave(editedSetup);
      setIsModified(false);
    }
  };

  // Handle reset
  const handleReset = () => {
    if (setupData) {
      setEditedSetup(JSON.parse(JSON.stringify(setupData)));
      setValidationErrors({});
      setIsModified(false);
    }
  };

  // Render parameter control based on validation rule
  const renderParameterControl = (path: string, label: string) => {
    const rule = setupValidationRules[path];
    if (!rule) return null;
    
    const value = getNestedProperty(editedSetup, path);
    const error = validationErrors[path];
    
    return (
      <ParameterRow container spacing={2}>
        <Grid item xs={4}>
          <Typography variant="body2">
            {label}
            <Tooltip title={rule.description}>
              <InfoIcon sx={{ fontSize: 16, ml: 0.5, verticalAlign: 'middle', color: 'action.active' }} />
            </Tooltip>
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Slider
            value={value}
            min={rule.min}
            max={rule.max}
            step={rule.step}
            onChange={(_, newValue) => handleParameterChange(path, newValue as number)}
            aria-labelledby={`${path}-slider`}
            valueLabelDisplay="auto"
          />
        </Grid>
        <Grid item xs={3}>
          <TextField
            value={value}
            onChange={(e) => {
              const newValue = parseFloat(e.target.value);
              if (!isNaN(newValue)) {
                handleParameterChange(path, newValue);
              }
            }}
            type="number"
            size="small"
            inputProps={{
              min: rule.min,
              max: rule.max,
              step: rule.step
            }}
            error={!!error}
            helperText={error}
          />
        </Grid>
        <Grid item xs={1}>
          <Typography variant="body2" color="text.secondary">
            {rule.unit}
          </Typography>
        </Grid>
      </ParameterRow>
    );
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="setup editor tabs">
          <Tab label="Suspension" {...a11yProps(0)} />
          <Tab label="Dampers" {...a11yProps(1)} />
          <Tab label="Tires" {...a11yProps(2)} />
          <Tab label="Aero & Brakes" {...a11yProps(3)} />
          <Tab label="Differential" {...a11yProps(4)} />
          <Tab label="Info" {...a11yProps(5)} />
        </Tabs>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RestoreIcon />}
            onClick={handleReset}
            disabled={!isModified}
            sx={{ mr: 1 }}
          >
            Reset
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={!isModified || Object.keys(validationErrors).length > 0}
          >
            Save Changes
          </Button>
        </Box>
      </Box>
      
      {/* Suspension Tab */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Front Suspension</Typography>
            {renderParameterControl('suspension.front.springRate', 'Spring Rate')}
            {renderParameterControl('suspension.front.rideHeight', 'Ride Height')}
            {renderParameterControl('suspension.front.camber', 'Camber')}
            {renderParameterControl('suspension.front.toe', 'Toe')}
            {renderParameterControl('suspension.front.antiRollBar', 'Anti-Roll Bar')}
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Rear Suspension</Typography>
            {renderParameterControl('suspension.rear.springRate', 'Spring Rate')}
            {renderParameterControl('suspension.rear.rideHeight', 'Ride Height')}
            {renderParameterControl('suspension.rear.camber', 'Camber')}
            {renderParameterControl('suspension.rear.toe', 'Toe')}
            {renderParameterControl('suspension.rear.antiRollBar', 'Anti-Roll Bar')}
          </Grid>
        </Grid>
      </TabPanel>
      
      {/* Dampers Tab */}
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Front Dampers</Typography>
            {renderParameterControl('dampers.front.bump', 'Bump')}
            {renderParameterControl('dampers.front.rebound', 'Rebound')}
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Rear Dampers</Typography>
            {renderParameterControl('dampers.rear.bump', 'Bump')}
            {renderParameterControl('dampers.rear.rebound', 'Rebound')}
          </Grid>
        </Grid>
      </TabPanel>
      
      {/* Tires Tab */}
      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Front Tires</Typography>
            {renderParameterControl('tirePressures.frontLeft', 'Front Left Pressure')}
            {renderParameterControl('tirePressures.frontRight', 'Front Right Pressure')}
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Rear Tires</Typography>
            {renderParameterControl('tirePressures.rearLeft', 'Rear Left Pressure')}
            {renderParameterControl('tirePressures.rearRight', 'Rear Right Pressure')}
          </Grid>
        </Grid>
      </TabPanel>
      
      {/* Aero & Brakes Tab */}
      <TabPanel value={tabValue} index={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Aerodynamics</Typography>
            {editedSetup.aero.frontWing !== undefined && 
              renderParameterControl('aero.frontWing', 'Front Wing')}
            {editedSetup.aero.rearWing !== undefined && 
              renderParameterControl('aero.rearWing', 'Rear Wing')}
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Brakes</Typography>
            {renderParameterControl('brakeBias', 'Brake Bias')}
          </Grid>
        </Grid>
      </TabPanel>
      
      {/* Differential Tab */}
      <TabPanel value={tabValue} index={4}>
        {editedSetup.differential ? (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>Differential</Typography>
              {renderParameterControl('differential.preload', 'Preload')}
              {editedSetup.differential.powerRamp !== undefined && 
                renderParameterControl('differential.powerRamp', 'Power Ramp')}
              {editedSetup.differential.coastRamp !== undefined && 
                renderParameterControl('differential.coastRamp', 'Coast Ramp')}
            </Grid>
          </Grid>
        ) : (
          <Typography variant="body1">No differential settings available for this car.</Typography>
        )}
      </TabPanel>
      
      {/* Info Tab */}
      <TabPanel value={tabValue} index={5}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Setup Information</Typography>
            <TextField
              label="Setup Name"
              value={editedSetup.name}
              onChange={(e) => {
                const newSetup = { ...editedSetup, name: e.target.value };
                setEditedSetup(newSetup);
                setIsModified(true);
              }}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Description"
              value={editedSetup.description || ''}
              onChange={(e) => {
                const newSetup = { ...editedSetup, description: e.target.value };
                setEditedSetup(newSetup);
                setIsModified(true);
              }}
              fullWidth
              margin="normal"
              multiline
              rows={4}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>Metadata</Typography>
            <Typography variant="body2">
              <strong>Car:</strong> {editedSetup.carId}
            </Typography>
            <Typography variant="body2">
              <strong>Track:</strong> {editedSetup.trackId}
            </Typography>
            {editedSetup.metadata && (
              <>
                <Typography variant="body2">
                  <strong>Created:</strong> {new Date(editedSetup.metadata.created).toLocaleString()}
                </Typography>
                <Typography variant="body2">
                  <strong>Modified:</strong> {new Date(editedSetup.metadata.modified).toLocaleString()}
                </Typography>
                {editedSetup.metadata.author && (
                  <Typography variant="body2">
                    <strong>Author:</strong> {editedSetup.metadata.author}
                  </Typography>
                )}
                {editedSetup.metadata.version && (
                  <Typography variant="body2">
                    <strong>Version:</strong> {editedSetup.metadata.version}
                  </Typography>
                )}
              </>
            )}
          </Grid>
        </Grid>
      </TabPanel>
      
      {/* Validation Error Summary */}
      {Object.keys(validationErrors).length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Alert severity="error">
            <Typography variant="subtitle1">Please fix the following errors:</Typography>
            <ul>
              {Object.entries(validationErrors).map(([path, error]) => (
                <li key={path}>
                  {setupValidationRules[path]?.description}: {error}
                </li>
              ))}
            </ul>
          </Alert>
        </Box>
      )}
    </Box>
  );
};

export default SetupEditor;
