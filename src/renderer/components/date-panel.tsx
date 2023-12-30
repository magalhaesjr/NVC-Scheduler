/* eslint-disable react/jsx-props-no-spreading */
import { useCallback } from 'react';
import { Dayjs } from 'dayjs';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Tooltip from '@mui/material/Tooltip';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { isEqual } from 'lodash';
import {
  addBlackout,
  removeBlackout,
  selectStartDate,
  setStartDate,
  selectSchedule,
} from '../redux/schedule';
import type { LeagueNight } from '../redux/schedule';
import { useAppDispatch, useAppSelector } from '../redux/hooks';

type NightProps = { week: Required<LeagueNight> };

// Blackout row
const LeagueWeek = ({ week }: NightProps) => {
  const dispatch = useAppDispatch();

  const handleBlackout = (weekNum: number, blackout: boolean) => {
    if (blackout) {
      dispatch(removeBlackout(weekNum));
    } else {
      dispatch(addBlackout(weekNum));
    }
  };

  const tooltip = week.blackout
    ? 'Remove blackout'
    : 'Make this week a blackout';

  const baseKey = `week-${week.date.toJSON()}`;
  return (
    <TableRow
      key={`${baseKey}/row`}
      sx={{
        color: week.blackout ? 'white' : 'black',
        backgroundColor: week.blackout ? 'black' : 'auto',
      }}
    >
      <TableCell
        key={`${baseKey}/button`}
        sx={{
          color: week.blackout ? 'white' : 'black',
          backgroundColor: week.blackout ? 'black' : 'auto',
        }}
      >
        <Tooltip title={tooltip}>
          {week.blackout ? (
            <Button
              variant="contained"
              onClick={() => handleBlackout(week.week, week.blackout)}
              sx={{ backgroundColor: 'red' }}
            >
              remove
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={() => handleBlackout(week.week, week.blackout)}
            >
              add
            </Button>
          )}
        </Tooltip>
      </TableCell>
      <TableCell
        key={`${baseKey}/week`}
        sx={{
          color: week.blackout ? 'white' : 'black',
          backgroundColor: week.blackout ? 'black' : 'auto',
        }}
      >
        {week.week}
      </TableCell>
      <TableCell
        key={`${baseKey}/date`}
        sx={{
          color: week.blackout ? 'white' : 'black',
          backgroundColor: week.blackout ? 'black' : 'auto',
        }}
      >
        {week.date.format('MM/DD/YYYY')}
      </TableCell>
      <TableCell
        key={`${baseKey}/msg`}
        sx={{
          color: week.blackout ? 'white' : 'black',
          backgroundColor: week.blackout ? 'black' : 'auto',
        }}
      >
        {week.blackout ? 'BLACKOUT' : 'LEAGUE NIGHT'}
      </TableCell>
    </TableRow>
  );
};

const DatePanel = () => {
  const dispatch = useAppDispatch();

  // Pull start date from redux state
  const startDate = useAppSelector(selectStartDate, isEqual);
  const schedule = useAppSelector(selectSchedule, isEqual);

  // Dispatches update to redux state
  const changeDate = useCallback(
    (newDay: Dayjs | null) => {
      if (newDay) {
        dispatch(setStartDate(newDay.toJSON()));
      }
    },
    [dispatch]
  );

  return (
    <Box
      width="100%"
      height="100%"
      alignItems="center"
      display="flex"
      flexDirection="column"
    >
      <DesktopDatePicker
        label="Start Date"
        inputFormat="MM/DD/YYYY"
        value={startDate}
        onChange={changeDate}
        renderInput={(params) => <TextField {...params} />}
      />
      <Box flexGrow="1" width="100%" overflow="auto">
        <Table stickyHeader key="schedule-table">
          <TableHead key="schedule-table-header">
            <TableRow key="schedule-table-header-row">
              <TableCell
                key="schedule-header-blackout"
                sx={{ fontSize: '18pt' }}
              >
                Blackout
              </TableCell>
              <TableCell key="schedule-header-week" sx={{ fontSize: '18pt' }}>
                Week
              </TableCell>
              <TableCell key="schedule-header-date" sx={{ fontSize: '18pt' }}>
                Date
              </TableCell>
              <TableCell key="schedule-header-msg" sx={{ fontSize: '18pt' }}>
                Msg
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {schedule.map((w) => (
              <LeagueWeek
                key={`league-week-${w.week}`}
                week={w as Required<LeagueNight>}
              />
            ))}
          </TableBody>
        </Table>
      </Box>
    </Box>
  );
};

export default DatePanel;
