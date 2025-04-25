import React, { useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography
} from '@mui/material';
import {
  AutoAwesome as SparklesIcon,
  ThumbUp as ThumbsUpIcon,
  Public as GlobeIcon,
  People as UsersIcon,
  EmojiEvents as AwardIcon,
  Check as CheckIcon,
  ContentCopy as CopyIcon
} from '@mui/icons-material';
import { useContent, OptimizePostData, OptimizedPost } from '@/hooks/useContent';

interface OptimizeButtonProps {
  content: string;
  onApplyOptimized: (optimizedContent: string) => void;
  disabled?: boolean;
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
      id={`goal-tabpanel-${index}`}
      aria-labelledby={`goal-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export function OptimizeButtonMUI({ content, onApplyOptimized, disabled = false }: OptimizeButtonProps) {
  const [open, setOpen] = useState(false);
  const [optimizationGoal, setOptimizationGoal] = useState<'engagement' | 'connections' | 'visibility' | 'thought-leadership'>('engagement');
  const [optimizedResult, setOptimizedResult] = useState<OptimizedPost | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const { optimizePost, isOptimizing } = useContent();

  const handleOptimize = async () => {
    if (!content.trim()) return;
    
    try {
      const data: OptimizePostData = {
        content,
        goal: optimizationGoal
      };
      
      const result = await optimizePost(data);
      setOptimizedResult(result);
    } catch (error) {
      console.error('Error optimizing post:', error);
    }
  };

  const handleApply = () => {
    if (optimizedResult) {
      onApplyOptimized(optimizedResult.optimizedContent);
      setOpen(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setOptimizationGoal(['engagement', 'connections', 'visibility', 'thought-leadership'][newValue] as any);
    setTabValue(newValue);
  };

  return (
    <>
      <Button 
        variant="outlined" 
        size="small" 
        onClick={() => setOpen(true)}
        disabled={disabled || !content.trim()}
        startIcon={<SparklesIcon />}
      >
        AI Optimize
      </Button>

      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>AI Post Optimization</DialogTitle>
        <DialogContentText sx={{ px: 3 }}>
          Use AI to optimize your LinkedIn post for better engagement and results.
        </DialogContentText>
        
        <DialogContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="optimization goals"
              variant="fullWidth"
            >
              <Tab 
                icon={<ThumbsUpIcon />} 
                label="Engagement" 
                iconPosition="start"
              />
              <Tab 
                icon={<UsersIcon />} 
                label="Connections" 
                iconPosition="start"
              />
              <Tab 
                icon={<GlobeIcon />} 
                label="Visibility" 
                iconPosition="start"
              />
              <Tab 
                icon={<AwardIcon />} 
                label="Leadership" 
                iconPosition="start"
              />
            </Tabs>
          </Box>
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Original Content
            </Typography>
            <TextField
              multiline
              fullWidth
              rows={4}
              value={content}
              InputProps={{
                readOnly: true,
              }}
              variant="outlined"
            />
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          {isOptimizing ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 4 }}>
              <CircularProgress size={40} />
              <Typography variant="body1" sx={{ mt: 2 }}>
                Optimizing your content with AI...
              </Typography>
            </Box>
          ) : optimizedResult ? (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Optimized Content
              </Typography>
              <TextField
                multiline
                fullWidth
                rows={4}
                value={optimizedResult.optimizedContent}
                InputProps={{
                  readOnly: true,
                }}
                variant="outlined"
              />
              
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Suggestions for Further Improvement
                </Typography>
                <List dense>
                  {optimizedResult.suggestions.map((suggestion, index) => (
                    <ListItem key={index}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={suggestion} />
                    </ListItem>
                  ))}
                </List>
              </Box>
              
              <Paper 
                variant="outlined" 
                sx={{ 
                  mt: 3, 
                  p: 2, 
                  bgcolor: 'primary.light', 
                  color: 'primary.contrastText',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle2">
                    Estimated Improvement: 
                  </Typography>
                  <Typography variant="body2">
                    {optimizedResult.estimatedImprovement}
                  </Typography>
                </Box>
                <SparklesIcon />
              </Paper>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', my: 4 }}>
              <Typography variant="body1" color="text.secondary">
                Click the button below to optimize your content
              </Typography>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleClose} variant="outlined">
            Cancel
          </Button>
          {optimizedResult ? (
            <Button onClick={handleApply} variant="contained" startIcon={<CopyIcon />}>
              Apply Optimized Content
            </Button>
          ) : (
            <Button 
              onClick={handleOptimize} 
              variant="contained" 
              disabled={isOptimizing}
              startIcon={isOptimizing ? <CircularProgress size={16} /> : <SparklesIcon />}
            >
              Optimize with AI
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
}