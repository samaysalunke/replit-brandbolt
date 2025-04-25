import React, { useState } from 'react';
import { 
  Box, 
  Container,
  Grid, 
  Typography, 
  Card, 
  CardContent, 
  CardHeader,
  Tabs,
  Tab,
  Paper,
  Divider
} from '@mui/material';
import { useContent } from '@/hooks/useContent';
import { ContentFormMUI } from '@/components/content-creator/ContentFormMUI';
import { ContentSuggestionsMUI } from '@/components/content-creator/ContentSuggestionsMUI';
import CalendarPreviewMUI from '@/components/content-creator/CalendarPreviewMUI';
import { 
  Add as AddIcon, 
  Article as ArticleIcon, 
  Schedule as ScheduleIcon,
  CalendarMonth as CalendarIcon
} from '@mui/icons-material';

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
      id={`content-creator-tabpanel-${index}`}
      aria-labelledby={`content-creator-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function ContentCreatorMUI() {
  const { getDraftPosts, getScheduledPosts } = useContent();
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const formatPreviewText = (text: string, maxLength = 80) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Content Creator
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Create and optimize LinkedIn posts with AI assistance
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        {/* Main Content Area */}
        <Grid item xs={12} md={8}>
          <Paper elevation={0} variant="outlined">
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              aria-label="content creator tabs"
              sx={{ 
                borderBottom: 1, 
                borderColor: 'divider',
                px: 2
              }}
            >
              <Tab icon={<AddIcon />} label="Create" iconPosition="start" />
              <Tab 
                icon={<ArticleIcon />} 
                label={`Drafts (${getDraftPosts().length})`} 
                iconPosition="start"
              />
              <Tab 
                icon={<ScheduleIcon />} 
                label={`Scheduled (${getScheduledPosts().length})`} 
                iconPosition="start"
              />
            </Tabs>
            
            <TabPanel value={tabValue} index={0}>
              <Box sx={{ px: 2 }}>
                <Card variant="outlined">
                  <CardHeader 
                    title="Create LinkedIn Post"
                    subheader="Craft a new post with AI-powered optimization for maximum engagement"
                  />
                  <CardContent>
                    <ContentFormMUI />
                  </CardContent>
                </Card>
              </Box>
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              <Box sx={{ px: 2 }}>
                <Card variant="outlined">
                  <CardHeader 
                    title="Draft Posts"
                    subheader="Your saved drafts that are ready to be published"
                  />
                  <CardContent>
                    {getDraftPosts().length > 0 ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {getDraftPosts().map(post => (
                          <Paper 
                            key={post.id} 
                            variant="outlined" 
                            sx={{ 
                              p: 2, 
                              cursor: 'pointer',
                              '&:hover': { bgcolor: 'action.hover' }
                            }}
                          >
                            <Typography variant="body1" fontWeight="medium" gutterBottom>
                              {formatPreviewText(post.content)}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <ArticleIcon fontSize="small" color="action" />
                              <Typography variant="caption" color="text.secondary">
                                Draft • {new Date(post.createdAt).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </Paper>
                        ))}
                      </Box>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <ArticleIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                        <Typography color="text.secondary" gutterBottom>
                          No draft posts yet
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Create a post and save it as a draft to see it here
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Box>
            </TabPanel>
            
            <TabPanel value={tabValue} index={2}>
              <Box sx={{ px: 2 }}>
                <Card variant="outlined">
                  <CardHeader 
                    title="Scheduled Posts"
                    subheader="Posts scheduled to be published at a future date"
                  />
                  <CardContent>
                    {getScheduledPosts().length > 0 ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {getScheduledPosts().map(post => (
                          <Paper 
                            key={post.id} 
                            variant="outlined" 
                            sx={{ 
                              p: 2, 
                              cursor: 'pointer',
                              '&:hover': { bgcolor: 'action.hover' }
                            }}
                          >
                            <Typography variant="body1" fontWeight="medium" gutterBottom>
                              {formatPreviewText(post.content)}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <ScheduleIcon fontSize="small" color="action" />
                              <Typography variant="caption" color="text.secondary">
                                Scheduled for • {post.scheduledFor && new Date(post.scheduledFor).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </Paper>
                        ))}
                      </Box>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <ScheduleIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                        <Typography color="text.secondary" gutterBottom>
                          No scheduled posts yet
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Schedule a post to see it here
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Box>
            </TabPanel>
          </Paper>
        </Grid>
        
        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Card variant="outlined">
              <CardHeader 
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarIcon color="primary" />
                    <Typography variant="h6">Content Calendar</Typography>
                  </Box>
                }
                subheader="Your scheduled posts and content plan"
              />
              <CardContent>
                <CalendarPreviewMUI />
              </CardContent>
            </Card>
            
            {tabValue === 0 && (
              <ContentSuggestionsMUI
                onUseSuggestion={(content) => {
                  // We'll implement this functionality later
                  console.log("Using suggestion:", content);
                }}
              />
            )}
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}