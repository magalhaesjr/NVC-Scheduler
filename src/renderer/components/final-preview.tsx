/* eslint-disable react/jsx-props-no-spreading */
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { isEqual } from 'lodash';
import { selectSchedule } from '../redux/schedule';
import type { LeagueNight } from '../redux/schedule';
import { useAppSelector } from '../redux/hooks';
import { TimeSlot } from '../../domain/schedule';
import { Team } from '../../domain/teams';
import { selectTeams } from '../redux/teams';

type NightProps = { week: Required<LeagueNight>; teams: Team[] };

interface ByeWeek {
  [key: string]: number;
}

interface ByeTeams {
  full: string[];
  partial: string[];
}

// Determine byes
const getByeTeams = (week: Required<LeagueNight>, teams: Team[]): ByeTeams => {
  const byes: ByeWeek = {};

  if (teams.length === 0) {
    return { full: [], partial: [] };
  }

  teams.forEach((t) => {
    byes[t.teamName] = 0;
  });

  week.timeSlot.forEach((slot: TimeSlot) => {
    if (slot.byeTeams.length > 0) {
      slot.byeTeams.forEach((t) => {
        byes[teams[t - 1].teamName] += 1;
      });
    }
  });

  const byeTeams: ByeTeams = { full: [], partial: [] };
  Object.entries(byes).forEach(([team, bye]) => {
    if (bye === week.timeSlot.length) {
      byeTeams.full.push(team);
    } else if (bye > 0) {
      byeTeams.partial.push(team);
    }
  });

  return {
    full: [byeTeams.full.join(', ')],
    partial: [byeTeams.partial.join(', ')],
  };
};

// Blackout row
const LeagueWeek = ({ teams, week }: NightProps) => {
  const baseKey = `week-${week.date.toJSON()}`;
  const { full, partial } = getByeTeams(week, teams);

  return (
    <TableRow
      key={`${baseKey}/row`}
      sx={{
        color: week.blackout ? 'white' : 'black',
        backgroundColor: week.blackout ? 'black' : 'auto',
      }}
    >
      <TableCell
        key={`${baseKey}/week`}
        align="center"
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
        {week.message}
      </TableCell>
      <TableCell
        key={`${baseKey}/full-bye`}
        sx={{
          color: week.blackout ? 'white' : 'black',
          backgroundColor: week.blackout ? 'black' : 'auto',
        }}
      >
        {full}
      </TableCell>
      <TableCell
        key={`${baseKey}/part-bye`}
        sx={{
          color: week.blackout ? 'white' : 'black',
          backgroundColor: week.blackout ? 'black' : 'auto',
        }}
      >
        {partial}
      </TableCell>
    </TableRow>
  );
};

const FinalPreview = () => {
  // Pull start date from redux state
  const schedule = useAppSelector(selectSchedule, isEqual);
  const teams = useAppSelector(selectTeams, isEqual);

  return (
    <>
      <Box maxHeight="550px" width="100%" overflow="auto">
        <Table stickyHeader key="schedule-table">
          <TableHead key="schedule-table-header">
            <TableRow key="schedule-table-header-row">
              <TableCell key="schedule-header-week" sx={{ fontSize: '18pt' }}>
                Week
              </TableCell>
              <TableCell key="schedule-header-date" sx={{ fontSize: '18pt' }}>
                Date
              </TableCell>
              <TableCell
                key="schedule-header-msg"
                sx={{ textAlign: 'center', fontSize: '18pt' }}
              >
                Message
              </TableCell>
              <TableCell
                key="schedule-header-full-bye"
                sx={{ fontSize: '18pt' }}
              >
                Full Bye
              </TableCell>
              <TableCell
                key="schedule-header-part-bye"
                sx={{ fontSize: '18pt' }}
              >
                Part Bye
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {schedule.map((w) => (
              <LeagueWeek
                key={`league-week-${w.week}`}
                week={w as Required<LeagueNight>}
                teams={teams || []}
              />
            ))}
          </TableBody>
        </Table>
      </Box>
    </>
  );
};

export default FinalPreview;
