import React from 'react';
import { 
  Box, 
  Grid, 
  Typography, 
  Paper, 
  Badge,
  useTheme
} from '@mui/material';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isToday, 
  getDay, 
  addMonths,
  subMonths,
  isSameDay,
  parseISO
} from 'date-fns';
import { 
  ChevronLeft as ChevronLeftIcon, 
  ChevronRight as ChevronRightIcon,
  Today as TodayIcon
} from '@mui/icons-material';
import { useContent } from '@/hooks/useContent';

export function CalendarPreviewMUI() {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const { getScheduledPosts } = useContent();
  const theme = useTheme();

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDay = getDay(monthStart);
  
  const scheduledPosts = getScheduledPosts();

  const getPostsForDay = (date: Date) => {
    return scheduledPosts.filter(post => {
      if (!post.scheduledFor) return false;
      return isSameDay(parseISO(post.scheduledFor), date);
    });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box 
          sx={{ 
            cursor: 'pointer', 
            p: 1, 
            borderRadius: 1, 
            '&:hover': { bgcolor: 'action.hover' } 
          }}
          onClick={handlePreviousMonth}
        >
          <ChevronLeftIcon />
        </Box>
        <Typography variant="h6">
          {format(currentDate, 'MMMM yyyy')}
        </Typography>
        <Box 
          sx={{ 
            cursor: 'pointer', 
            p: 1, 
            borderRadius: 1, 
            '&:hover': { bgcolor: 'action.hover' } 
          }}
          onClick={handleNextMonth}
        >
          <ChevronRightIcon />
        </Box>
      </Box>

      <Grid container columns={7}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
          <Grid item xs={1} key={index} sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              {day}
            </Typography>
          </Grid>
        ))}
      </Grid>

      <Grid container columns={7}>
        {Array.from({ length: startDay }).map((_, index) => (
          <Grid item xs={1} key={`empty-${index}`} sx={{ p: 0.5 }}>
            <Box 
              sx={{ 
                height: '32px', 
                width: '100%', 
                borderRadius: 1 
              }} 
            />
          </Grid>
        ))}

        {days.map((day) => {
          const postsForDay = getPostsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isCurrentDay = isToday(day);
          const hasPosts = postsForDay.length > 0;

          return (
            <Grid item xs={1} key={day.toString()} sx={{ p: 0.5 }}>
              <Paper 
                elevation={0}
                sx={{ 
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: isCurrentDay ? 'primary.main' : (hasPosts ? 'primary.light' : 'transparent'),
                  color: isCurrentDay ? 'primary.contrastText' : (hasPosts ? 'primary.contrastText' : 'text.primary'),
                  opacity: isCurrentMonth ? 1 : 0.4,
                  borderRadius: 1,
                  position: 'relative',
                  cursor: hasPosts ? 'pointer' : 'default',
                  border: hasPosts && !isCurrentDay ? `1px solid ${theme.palette.primary.main}` : 'none',
                  '&:hover': hasPosts ? {
                    bgcolor: isCurrentDay ? 'primary.dark' : 'primary.light',
                  } : {}
                }}
              >
                <Typography variant="body2">
                  {format(day, 'd')}
                </Typography>
                {hasPosts && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -4,
                      right: -4,
                      bgcolor: isCurrentDay ? 'secondary.main' : 'primary.main',
                      color: 'white',
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.7rem',
                      fontWeight: 'bold',
                    }}
                  >
                    {postsForDay.length}
                  </Box>
                )}
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}

export default CalendarPreviewMUI;