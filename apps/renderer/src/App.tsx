import { useState } from 'react';
import { Box, Container, Typography, Paper, AppBar, Toolbar, Button, Grid } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SaveIcon from '@mui/icons-material/Save';
import SettingsIcon from '@mui/icons-material/Settings';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import BuildIcon from '@mui/icons-material/Build';

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

function App() {
  const [setupFile, setSetupFile] = useState<SetupFile | null>(null);
  const [telemetryFile, setTelemetryFile] = useState<TelemetryFile | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  // Handle opening a setup file
  const handleOpenSetupFile = async () => {
    try {
      const filePath = await window.electronAPI.openFile();
      if (!filePath) return;
      
      const fileName = filePath.split('/').pop() || 'unknown.sto';
      const content = await window.electronAPI.readFile(filePath);
      
      setSetupFile({
        path: filePath,
        name: fileName,
        content
      });
    } catch (error) {
      console.error('Error opening setup file:', error);
      alert('Failed to open setup file');
    }
  };

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

  // Handle saving a setup file
  const handleSaveSetupFile = async () => {
    if (!setupFile) {
      alert('No setup file to save');
      return;
    }

    try {
      const savedPath = await window.electronAPI.saveFile(setupFile.path, setupFile.content);
      if (savedPath) {
        alert(`Setup saved to ${savedPath}`);
      }
    } catch (error) {
      console.error('Error saving setup file:', error);
      alert('Failed to save setup file');
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
      
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        <Grid container spacing={3}>
          {/* File Operations Panel */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2, display: 'flex', gap: 2 }}>
              <Button 
                variant="contained" 
                startIcon={<UploadFileIcon />}
                onClick={handleOpenSetupFile}
              >
                Load Setup
              </Button>
              <Button 
                variant="contained" 
                startIcon={<UploadFileIcon />}
                onClick={handleOpenTelemetryFile}
              >
                Load Telemetry
              </Button>
              <Button 
                variant="contained" 
                startIcon={<SaveIcon />}
                onClick={handleSaveSetupFile}
                disabled={!setupFile}
              >
                Save Setup
              </Button>
            </Paper>
          </Grid>
          
          {/* AI Tools Panel */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2, display: 'flex', gap: 2 }}>
              <Button 
                variant="contained" 
                color="secondary"
                startIcon={<AnalyticsIcon />}
                onClick={runTelemetryAnalysis}
                disabled={!telemetryFile}
              >
                Analyze Telemetry
              </Button>
              <Button 
                variant="contained" 
                color="secondary"
                startIcon={<BuildIcon />}
                onClick={generateSetupSuggestions}
                disabled={!setupFile}
              >
                Generate Setup Suggestions
              </Button>
            </Paper>
          </Grid>
          
          {/* Main Content Area */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: '60vh', overflow: 'auto' }}>
              <Typography variant="h6" gutterBottom>
                {setupFile ? `Setup: ${setupFile.name}` : 'No Setup Loaded'}
              </Typography>
              {setupFile && (
                <pre style={{ whiteSpace: 'pre-wrap' }}>
                  {setupFile.content}
                </pre>
              )}
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: '60vh', overflow: 'auto' }}>
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
      </Container>
      
      <Box component="footer" sx={{ p: 2, bgcolor: 'background.paper' }}>
        <Typography variant="body2" color="text.secondary" align="center">
          Auriga Setup AI © {new Date().getFullYear()}
        </Typography>
      </Box>
    </Box>
  );
}

export default App;
