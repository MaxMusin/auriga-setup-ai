import { useState } from 'react';
import { Box, Container, Typography, Paper, AppBar, Toolbar, Button, Grid, Tab, Tabs } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SettingsIcon from '@mui/icons-material/Settings';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import BuildIcon from '@mui/icons-material/Build';
import SetupContainer from './components/SetupContainer';

// Define interfaces for our app
interface SetupFile {
  path: string;
  name: string;
  content: string;
}

interface TelemetryFile {
  path: string;
  name: string;
  content: string;
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
      id={`app-tabpanel-${index}`}
      aria-labelledby={`app-tab-${index}`}
      {...other}
      style={{ height: '100%' }}
    >
      {value === index && (
        <Box sx={{ height: '100%' }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `app-tab-${index}`,
    'aria-controls': `app-tabpanel-${index}`,
  };
}

function App() {
  const [setupFile, setSetupFile] = useState<SetupFile | null>(null); // Used in generateSetupSuggestions
  const [telemetryFile, setTelemetryFile] = useState<TelemetryFile | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);



  // Handle opening a telemetry file
  const handleOpenTelemetryFile = async () => {
    try {
      const filePath = await window.electronAPI.openFile();
      if (!filePath) return;
      
      const fileName = filePath.split('/').pop() || 'unknown.csv';
      const content = await window.electronAPI.readFile(filePath);
      
      setTelemetryFile({
        path: filePath,
        name: fileName,
        content
      });
    } catch (error) {
      console.error('Error opening telemetry file:', error);
      alert('Failed to open telemetry file');
    }
  };



  // Placeholder for AI agent functions
  const runTelemetryAnalysis = () => {
    if (!telemetryFile) {
      alert('Please load a telemetry file first');
      return;
    }
    
    // This would be replaced with actual AI agent call
    setAnalysisResult('Telemetry analysis complete. Average speed: 150 km/h, Max lateral G: 1.8G');
  };

  const generateSetupSuggestions = () => {
    if (!setupFile) {
      alert('Please load a setup file first');
      return;
    }
    
    // This would be replaced with actual AI agent call
    alert('Setup suggestions generated');
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Auriga Setup AI
          </Typography>
          <Button color="inherit" startIcon={<SettingsIcon />}>
            Settings
          </Button>
        </Toolbar>
      </AppBar>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="app tabs">
          <Tab label="Setup Editor" {...a11yProps(0)} />
          <Tab label="Telemetry Analysis" {...a11yProps(1)} />
          <Tab label="AI Suggestions" {...a11yProps(2)} />
        </Tabs>
      </Box>
      
      <Container maxWidth="xl" sx={{ mt: 2, mb: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <TabPanel value={tabValue} index={0}>
          <SetupContainer 
            onSetupLoaded={(setup) => {
              console.log('Setup loaded:', setup);
              // Additional logic can be added here
            }}
            onSetupSaved={(setup, path) => {
              console.log('Setup saved:', setup, 'to path:', path);
              // Additional logic can be added here
            }}
          />
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3} sx={{ height: '100%' }}>
            {/* Telemetry Tools Panel */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2, display: 'flex', gap: 2 }}>
                <Button 
                  variant="contained" 
                  startIcon={<UploadFileIcon />}
                  onClick={handleOpenTelemetryFile}
                >
                  Load Telemetry
                </Button>
                <Button 
                  variant="contained" 
                  color="secondary"
                  startIcon={<AnalyticsIcon />}
                  onClick={runTelemetryAnalysis}
                  disabled={!telemetryFile}
                >
                  Analyze Telemetry
                </Button>
              </Paper>
            </Grid>
            
            {/* Telemetry Display */}
            <Grid item xs={12} sx={{ flexGrow: 1 }}>
              <Paper sx={{ p: 2, height: '100%', overflow: 'auto' }}>
                <Typography variant="h6" gutterBottom>
                  {telemetryFile ? `Telemetry: ${telemetryFile.name}` : 'No Telemetry Loaded'}
                </Typography>
                {telemetryFile && (
                  <pre style={{ whiteSpace: 'pre-wrap' }}>
                    {telemetryFile.content.slice(0, 500)}...
                  </pre>
                )}
                
                {analysisResult && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(144, 202, 249, 0.1)', borderRadius: 1 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Analysis Results:
                    </Typography>
                    <Typography variant="body2">
                      {analysisResult}
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3} sx={{ height: '100%' }}>
            {/* AI Tools Panel */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2, display: 'flex', gap: 2 }}>
                <Button 
                  variant="contained" 
                  color="secondary"
                  startIcon={<BuildIcon />}
                  onClick={generateSetupSuggestions}
                >
                  Generate Setup Suggestions
                </Button>
              </Paper>
            </Grid>
            
            {/* AI Suggestions Display */}
            <Grid item xs={12} sx={{ flexGrow: 1 }}>
              <Paper sx={{ p: 2, height: '100%', overflow: 'auto' }}>
                <Typography variant="h6" gutterBottom>
                  AI Setup Suggestions
                </Typography>
                <Typography variant="body2">
                  Load a setup file and telemetry data, then click "Generate Setup Suggestions" to get AI-powered recommendations for improving your car setup.
                </Typography>
                
                {/* This would be replaced with actual AI suggestions */}
                <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(144, 202, 249, 0.1)', borderRadius: 1, display: 'none' }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Suggested Changes:
                  </Typography>
                  <ul>
                    <li>Increase front spring rate by 5000 N/m to improve turn-in response</li>
                    <li>Decrease rear toe by 0.05° to reduce oversteer on corner exit</li>
                    <li>Increase front tire pressures by 2 kPa for better tire temperature</li>
                  </ul>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
      </Container>
      
      <Box component="footer" sx={{ p: 2, bgcolor: 'background.paper' }}>
        <Typography variant="body2" color="text.secondary" align="center">
          Auriga Setup AI &copy; {new Date().getFullYear()}
        </Typography>
      </Box>
    </Box>
  );
}

export default App;
