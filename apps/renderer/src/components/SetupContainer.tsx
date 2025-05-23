import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Button, Alert, Snackbar } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SaveIcon from '@mui/icons-material/Save';
import SetupEditor from './SetupEditor';

// Import setup parser types and functions
import { parseSetupString, convertToSto, ParsedSetup } from 'setup-parser';

// Define the Electron API interface
declare global {
  interface Window {
    electronAPI: {
      openFile: () => Promise<string>;
      readFile: (path: string) => Promise<string>;
      saveFile: (path: string, content: string) => Promise<string>;
      getSavePath: (defaultPath: string) => Promise<string>;
    };
  }
}

// Define the ParsedSetup interface to match what's expected from the setup-parser
interface ParsedSetup {
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

interface SetupContainerProps {
  // Optional props for integration with parent components
  onSetupLoaded?: (setup: ParsedSetup) => void;
  onSetupSaved?: (setup: ParsedSetup, path: string) => void;
}

const SetupContainer: React.FC<SetupContainerProps> = ({ 
  onSetupLoaded, 
  onSetupSaved 
}) => {
  const [setupFile, setSetupFile] = useState<{ path: string; name: string; content: string } | null>(null);
  const [parsedSetup, setParsedSetup] = useState<ParsedSetup | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'info'
  });

  // Parse setup file when it changes
  useEffect(() => {
    if (setupFile?.content) {
      try {
        // Use the actual parser from the setup-parser package
        const parsed = parseSetupString(setupFile.content);
        setParsedSetup(parsed);
        
        if (onSetupLoaded) {
          onSetupLoaded(parsed);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error parsing setup file:', err);
        setError('Failed to parse setup file. Make sure it is a valid iRacing .sto file.');
        setParsedSetup(null);
      }
    }
  }, [setupFile, onSetupLoaded]);

  // This function is no longer needed as we're using the actual parser

  // This function is no longer needed as we're using the actual converter

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
      
      setNotification({
        open: true,
        message: `Loaded setup: ${fileName}`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error opening setup file:', error);
      setError('Failed to open setup file');
      setNotification({
        open: true,
        message: 'Failed to open setup file',
        severity: 'error'
      });
    }
  };

  // Handle saving a setup file
  const handleSaveSetupFile = async () => {
    if (!parsedSetup) {
      setNotification({
        open: true,
        message: 'No setup to save',
        severity: 'error'
      });
      return;
    }

    try {
      // Convert parsed setup back to .sto format using the actual converter
      const stoContent = convertToSto(parsedSetup);
      
      // Get save path from user or use existing path
      const savePath = setupFile?.path || await window.electronAPI.getSavePath(parsedSetup.name + '.sto');
      if (!savePath) return;
      
      // Save the file
      await window.electronAPI.saveFile(savePath, stoContent);
      
      // Update setup file reference
      const fileName = savePath.split('/').pop() || 'unknown.sto';
      setSetupFile({
        path: savePath,
        name: fileName,
        content: stoContent
      });
      
      // Notify parent component if needed
      if (onSetupSaved) {
        onSetupSaved(parsedSetup, savePath);
      }
      
      setNotification({
        open: true,
        message: `Setup saved to ${fileName}`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error saving setup file:', error);
      setNotification({
        open: true,
        message: 'Failed to save setup file',
        severity: 'error'
      });
    }
  };

  // Handle setup changes from the editor
  const handleSetupChange = (updatedSetup: ParsedSetup) => {
    setParsedSetup(updatedSetup);
  };

  // Handle notification close
  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Actions toolbar */}
      <Paper sx={{ p: 2, mb: 2, display: 'flex', gap: 2 }}>
        <Button 
          variant="contained" 
          startIcon={<UploadFileIcon />}
          onClick={handleOpenSetupFile}
        >
          Load Setup
        </Button>
        <Button 
          variant="contained" 
          startIcon={<SaveIcon />}
          onClick={handleSaveSetupFile}
          disabled={!parsedSetup}
        >
          Save Setup
        </Button>
        {setupFile && (
          <Typography variant="body1" sx={{ ml: 2, alignSelf: 'center' }}>
            {setupFile.name}
          </Typography>
        )}
      </Paper>
      
      {/* Error display */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {/* Setup editor */}
      <Box sx={{ flexGrow: 1 }}>
        <SetupEditor 
          setupData={parsedSetup} 
          onSave={handleSetupChange} 
        />
      </Box>
      
      {/* Notification snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SetupContainer;
