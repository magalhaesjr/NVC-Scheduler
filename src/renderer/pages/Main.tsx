/* eslint-disable jsx-a11y/label-has-associated-control */
// Footer for main page
import Box from '@mui/material/Box';
import ScheduleForm from '../components/schedule-form';

const Main = () => {
  return (
    <Box
      width="100%"
      height="100%"
      display="flex"
      alignItems="center"
      flexDirection="column"
      justifyContent="center"
    >
      <ScheduleForm />
    </Box>
  );
};

export default Main;
