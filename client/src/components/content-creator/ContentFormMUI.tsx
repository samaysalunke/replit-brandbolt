import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Box,
  Button,
  Card,
  CardContent,
  Container,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Tab,
  Tabs,
  TextField,
  Typography,
  Chip,
  IconButton,
  OutlinedInput,
  InputAdornment,
  FormLabel,
  Divider
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
  Tag as TagIcon,
  Today as TodayIcon
} from '@mui/icons-material';
import { useContent, CreatePostData } from '@/hooks/useContent';
import { OptimizeButtonMUI } from './OptimizeButtonMUI';

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
      id={`content-tabpanel-${index}`}
      aria-labelledby={`content-tab-${index}`}
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

// Define the form schema
const postFormSchema = z.object({
  content: z.string().min(1, "Content is required"),
  postType: z.string().min(1, "Post type is required"),
  hashtags: z.array(z.string()).optional(),
  mediaUrls: z.array(z.string()).optional(),
  scheduledFor: z.date().optional().nullable(),
  status: z.enum(['draft', 'scheduled', 'published']),
});

type PostFormValues = z.infer<typeof postFormSchema>;

interface ContentFormProps {
  onSuccess?: () => void;
}

export function ContentFormMUI({ onSuccess }: ContentFormProps) {
  const { createPost, isCreating } = useContent();
  const [hashtagInput, setHashtagInput] = useState('');
  const [tabValue, setTabValue] = useState(0);
  
  // Initialize form with default values
  const { control, handleSubmit, setValue, getValues, formState: { errors }, reset } = useForm<PostFormValues>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      content: '',
      postType: 'text',
      hashtags: [],
      mediaUrls: [],
      scheduledFor: null,
      status: 'draft',
    },
  });
  
  const onSubmit = (data: PostFormValues) => {
    createPost(data as CreatePostData);
    if (onSuccess) {
      onSuccess();
    }
    reset();
  };
  
  const addHashtag = () => {
    if (hashtagInput.trim()) {
      const tag = hashtagInput.trim().startsWith('#') ? hashtagInput.trim() : `#${hashtagInput.trim()}`;
      const currentTags = getValues('hashtags') || [];
      if (!currentTags.includes(tag)) {
        setValue('hashtags', [...currentTags, tag]);
      }
      setHashtagInput('');
    }
  };
  
  const removeHashtag = (tag: string) => {
    const currentTags = getValues('hashtags') || [];
    setValue('hashtags', currentTags.filter(t => t !== tag));
  };
  
  const handleOptimizedContent = (optimizedContent: string) => {
    setValue('content', optimizedContent);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  return (
    <Paper elevation={0} sx={{ p: 0 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="content creation tabs">
          <Tab label="Compose" />
          <Tab label="Schedule" />
          <Tab label="Settings" />
        </Tabs>
      </Box>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ mt: 2 }}>
            <Controller
              name="content"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.content}>
                  <FormLabel sx={{ mb: 1 }}>Post Content</FormLabel>
                  <TextField
                    {...field}
                    placeholder="What do you want to share on LinkedIn?"
                    multiline
                    rows={6}
                    fullWidth
                    error={!!errors.content}
                    helperText={errors.content?.message}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                    <OptimizeButtonMUI 
                      content={field.value} 
                      onApplyOptimized={handleOptimizedContent} 
                      disabled={isCreating}
                    />
                  </Box>
                </FormControl>
              )}
            />
            
            <Box sx={{ mt: 3 }}>
              <FormLabel sx={{ mb: 1 }}>Hashtags</FormLabel>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  placeholder="Add hashtag (e.g. #marketing)"
                  value={hashtagInput}
                  onChange={(e) => setHashtagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addHashtag();
                    }
                  }}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <TagIcon />
                      </InputAdornment>
                    ),
                  }}
                />
                <IconButton 
                  onClick={addHashtag} 
                  color="primary"
                  sx={{ border: '1px solid', borderColor: 'divider' }}
                >
                  <AddIcon />
                </IconButton>
              </Box>
              
              <Controller
                name="hashtags"
                control={control}
                render={({ field }) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {field.value && field.value.length > 0 ? (
                      field.value.map((tag, index) => (
                        <Chip
                          key={index}
                          label={tag.replace('#', '')}
                          icon={<TagIcon />}
                          onDelete={() => removeHashtag(tag)}
                          color="primary"
                          variant="outlined"
                        />
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No hashtags added yet
                      </Typography>
                    )}
                  </Box>
                )}
              />
              <FormHelperText>
                Add relevant hashtags to increase your post's visibility
              </FormHelperText>
            </Box>
            
            <Box sx={{ mt: 3 }}>
              <FormLabel sx={{ mb: 1 }}>Media</FormLabel>
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 4, 
                  textAlign: 'center',
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'action.hover'
                  }
                }}
              >
                <ImageIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Upload images or videos (coming soon)
                </Typography>
              </Paper>
            </Box>
          </Box>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mt: 2 }}>
            <Controller
              name="scheduledFor"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <FormLabel sx={{ mb: 1 }}>Schedule Post</FormLabel>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      value={field.value}
                      onChange={(date) => field.onChange(date)}
                      disablePast
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.scheduledFor,
                          helperText: errors.scheduledFor?.message,
                        }
                      }}
                    />
                  </LocalizationProvider>
                  <FormHelperText>
                    Choose when to publish your post on LinkedIn
                  </FormHelperText>
                </FormControl>
              )}
            />
            
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth sx={{ mt: 3 }}>
                  <FormLabel sx={{ mb: 1 }}>Post Status</FormLabel>
                  <Select
                    {...field}
                    error={!!errors.status}
                  >
                    <MenuItem value="draft">Draft</MenuItem>
                    <MenuItem value="scheduled">Scheduled</MenuItem>
                    <MenuItem value="published">Publish Now</MenuItem>
                  </Select>
                  <FormHelperText error={!!errors.status}>
                    {errors.status?.message || "Set the status for your post"}
                  </FormHelperText>
                </FormControl>
              )}
            />
          </Box>
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ mt: 2 }}>
            <Controller
              name="postType"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <FormLabel sx={{ mb: 1 }}>Post Type</FormLabel>
                  <Select
                    {...field}
                    error={!!errors.postType}
                  >
                    <MenuItem value="text">Text Post</MenuItem>
                    <MenuItem value="article">Article</MenuItem>
                    <MenuItem value="poll">Poll (Coming Soon)</MenuItem>
                    <MenuItem value="document">Document (Coming Soon)</MenuItem>
                  </Select>
                  <FormHelperText error={!!errors.postType}>
                    {errors.postType?.message || "Select the type of content you want to post"}
                  </FormHelperText>
                </FormControl>
              )}
            />
          </Box>
        </TabPanel>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, p: 3, pt: 0 }}>
          <Button 
            variant="outlined" 
            onClick={() => reset()}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            variant="contained"
            disabled={isCreating}
          >
            {isCreating ? 'Creating...' : 'Create Post'}
          </Button>
        </Box>
      </form>
    </Paper>
  );
}