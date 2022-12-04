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
import { isEqual } from 'lodash';
import {
  selectFinalSchedule,
  setStartDate,
  selectSchedule,
} from '../redux/schedule';
import type { LeagueNight } from '../redux/schedule';
import { useAppDispatch, useAppSelector } from '../redux/hooks';

type NightProps = { week: Required<LeagueNight> };

// Blackout row
const LeagueWeek = ({ week }: NightProps) => {
  const dispatch = useAppDispatch();

  const baseKey = `week-${week.date.toJSON()}`;
  return (
    <TableRow key={`${baseKey}/row`}>
      <TableCell key={`${baseKey}/week`}>{week.week}</TableCell>
      <TableCell key={`${baseKey}/date`}>
        {week.date.format('MM/DD/YYYY')}
      </TableCell>
      <TableCell key={`${baseKey}/msg`} />
    </TableRow>
  );
};

const FinalPreview = () => {
  const dispatch = useAppDispatch();

  // Pull start date from redux state
  const schedule = useAppSelector(selectFinalSchedule, isEqual);

return <></>;
/*
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
    <>
      <Box height="300px" width="100%">
        <Table stickyHeader key="schedule-table">
          <TableHead key="schedule-table-header">
            <TableRow key="schedule-table-header-row">
              <TableCell key="schedule-header-week">
                Week
              </TableCell>
              <TableCell key="schedule-header-date">
                Date
              </TableCell>
              <TableCell key="schedule-header-bye">
                Byes
              </TableCell>
              <TableCell key="schedule-header-bye">
                Court
              </TableCell>
              <TableCell key="schedule-header-bye">
                Team1
              </TableCell>
              <TableCell key="schedule-header-bye">
                Team2
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
    </>
  );
  */
};

export default FinalPreview;
