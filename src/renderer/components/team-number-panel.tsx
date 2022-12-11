/* eslint-disable react/jsx-props-no-spreading */
import { useCallback, useState } from 'react';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import MenuItem from '@mui/material/MenuItem';
import RadioGroup from '@mui/material/RadioGroup';
import Radio from '@mui/material/Radio';
import Select from '@mui/material/Select';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Tooltip from '@mui/material/Tooltip';
import { isEqual } from 'lodash';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { selectTeams, swapTeamNum } from '../redux/teams';
import { Team } from '../../domain/teams';
import { LeagueNight, selectSchedule } from '../redux/schedule';
// import TriStateButton from './tri-state-button';

type TeamProps = {
  team: Team;
};

// Manual Selection
const ManualRow = ({ team }: TeamProps) => {
  const dispatch = useAppDispatch();

  const teams = useAppSelector(selectTeams, isEqual);

  const handleChange = useCallback(
    (o, n) => {
      dispatch(swapTeamNum({ old: o, new: n }));
    },
    [dispatch]
  );

  const baseKey = `team-${team.teamName}`;

  return (
    <TableRow key={`${baseKey}/row`}>
      <TableCell key={`${baseKey}/number`}>
        <Select
          key={`${baseKey}/select`}
          value={`${team.teamNumber}`}
          onChange={(e) =>
            handleChange(team.teamNumber, parseInt(e.target.value, 10))
          }
        >
          {teams &&
            teams.map((t) => (
              <MenuItem
                key={`${baseKey}/select-${t.teamNumber}`}
                value={`${t.teamNumber}`}
              >{`${t.teamNumber}`}</MenuItem>
            ))}
        </Select>
      </TableCell>
      <TableCell key={`${baseKey}/name`}>{team.teamName}</TableCell>
    </TableRow>
  );
};

const ManualTable = () => {
  const teams = useAppSelector(selectTeams, isEqual);

  return (
    <Table stickyHeader key="team-table">
      <TableBody>
        {teams &&
          teams.map((t) => (
            <ManualRow key={`team-row-${t.teamNumber}`} team={t} />
          ))}
      </TableBody>
    </Table>
  );
};

const AutoTable = () => {
  const teams = useAppSelector(selectTeams, isEqual);
  const schedule = useAppSelector(selectSchedule, isEqual);

  return (
    <>
      <Table key="team-table">
        <TableBody>
          {teams &&
            teams.map((t) => (
              <TableRow>
                <TableCell key={`team-${t.teamNumber}/num`}>
                  {t.teamNumber}
                </TableCell>
                <TableCell key={`team-${t.teamName}/name`}>
                  {t.teamName}
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
      <Table stickyHeader key="bye-table">
        <TableHead key="bye-header">
          <TableRow key="bye-header-row">
            <TableCell key="bye-header-team">Team</TableCell>
            {schedule.map(
              (w: LeagueNight) =>
                w.date && (
                  <TableCell key={`bye-header-${w.date}`}>
                    {w.date.format('MM/DD/YYYY')}
                  </TableCell>
                )
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          <Button>
            <AddCircleIcon />
          </Button>
        </TableBody>
      </Table>
    </>
  );
};

const TeamNumberPanel = () => {
  // Pull start date from redux state
  const [mode, setMode] = useState<string>('manual');

  return (
    <>
      <Box height="300px" width="100%">
        <FormControl variant="outlined">
          <FormHelperText>Assignment Mode</FormHelperText>
          <RadioGroup value={mode} onChange={(e) => setMode(e.target.value)}>
            <Tooltip title="Manually assign team numbers">
              <FormControlLabel
                value="manual"
                control={<Radio />}
                label="Manual"
                sx={{ color: 'black' }}
              />
            </Tooltip>
            <Tooltip title="Calculate optimal team numbers">
              <FormControlLabel
                value="auto"
                disabled
                control={<Radio />}
                label="Auto"
                sx={{ color: 'black' }}
              />
            </Tooltip>
          </RadioGroup>
        </FormControl>
        {mode === 'manual' ? <ManualTable /> : <AutoTable />}
      </Box>
    </>
  );
};

export default TeamNumberPanel;
