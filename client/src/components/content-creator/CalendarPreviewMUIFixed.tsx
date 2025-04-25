import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
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
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import { useContent } from '@/hooks/useContent';

export function CalendarPreviewMUIFixed() {
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

      {/* Week Day Headers */}
      <Box sx={{ display: 'flex', width: '100%', mb: 1 }}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
          <Box key={index} sx={{ flex: '1 0 14.28%', textAlign: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              {day}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Calendar Grid */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', width: '100%' }}>
        {/* Empty days before the first day of month */}
        {Array.from({ length: startDay }).map((_, index) => (
          <Box key={`empty-${index}`} sx={{ flex: '1 0 14.28%', p: 0.5, height: '40px' }} />
        ))}

        {/* Days of month */}
        {days.map((day) => {
          const postsForDay = getPostsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isCurrentDay = isToday(day);
          const hasPosts = postsForDay.length > 0;

          return (
            <Box key={day.toString()} sx={{ flex: '1 0 14.28%', p: 0.5 }}>
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
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

export default CalendarPreviewMUIFixed;