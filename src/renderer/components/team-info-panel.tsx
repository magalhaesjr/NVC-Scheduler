/* eslint-disable react/jsx-props-no-spreading */
import { useCallback, useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { isEqual } from 'lodash';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { selectTeams, updateTeam } from '../redux/teams';
import { Team } from '../../domain/teams';
import { selectLeagueName, setLeagueName } from '../redux/schedule';

type TeamProps = {
  team: Team;
};

// Blackout row
const TeamRow = ({ team }: TeamProps) => {
  const dispatch = useAppDispatch();
  const [teamTemp, setTemp] = useState<Team>(team);
  const tempRef = useRef<Team>(team);

  useEffect(() => {
    setTemp(team);
    tempRef.current = team;
  }, [setTemp, team]);

  const handleCommit = useCallback(() => {
    dispatch(updateTeam(teamTemp));
  }, [dispatch, teamTemp]);

  const handleChange = useCallback(
    (t) => {
      setTemp(t);
      tempRef.current = t;
    },
    [setTemp]
  );

  useEffect(() => {
    return () => {
      dispatch(updateTeam(tempRef.current));
    };
  }, [dispatch]);

  const baseKey = `team-${team.teamName}`;

  return (
    <TableRow
      key={`${baseKey}/row`}
      sx={{
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      <TableCell
        key={`${baseKey}/name`}
        sx={{
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <ClickAwayListener onClickAway={handleCommit}>
          <TextField
            value={teamTemp.teamName}
            onChange={(e) =>
              handleChange({ ...teamTemp, name: e.target.value })
            }
            sx={{
              '.MuiInputBase-input': { textAlign: 'center' },
            }}
          />
        </ClickAwayListener>
      </TableCell>
    </TableRow>
  );
};

const TeamInfoPanel = () => {
  const dispatch = useAppDispatch();
  // Pull start date from redux state
  const teams = useAppSelector(selectTeams, isEqual);
  const leagueName = useAppSelector(selectLeagueName);
  const [tempLeague, setTempLeague] = useState<string>(leagueName);
  const tempRef = useRef<string>(leagueName);
  tempRef.current = tempLeague;

  const handleCommit = useCallback(() => {
    dispatch(setLeagueName(tempLeague));
  }, [dispatch, tempLeague]);

  const handleChange = useCallback(
    (e) => {
      setTempLeague(e.target.value);
    },
    [setTempLeague]
  );

  useEffect(() => {
    return () => {
      dispatch(setLeagueName(tempRef.current));
    };
  }, [dispatch]);

  return (
    <Box
      width="100%"
      height="100%"
      display="flex"
      flexDirection="column"
      alignItems="center"
      paddingTop="20px"
    >
      <Box
        height="fit-content"
        width="fit-content"
        display="flex"
        flexDirection="row"
        alignItems="center"
      >
        <Typography
          variant="h5"
          textAlign="center"
          color="#121212"
          paddingRight="20px"
        >
          League Name:
        </Typography>
        <ClickAwayListener onClickAway={handleCommit}>
          <TextField
            value={tempLeague}
            onChange={handleChange}
            sx={{
              '.MuiInputBase-input': { textAlign: 'center' },
            }}
          />
        </ClickAwayListener>
      </Box>
      <Box
        width="100%"
        flexGrow="1"
        display="flex"
        alignItems="center"
        justifyContent="center"
        overflow="auto"
      >
        <Table stickyHeader key="team-table">
          <TableHead key="team-table-header">
            <TableRow key="team-table-header-row">
              <TableCell
                key="team-header-name"
                sx={{ fontSize: '18pt', textAlign: 'center' }}
              >
                Name
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {teams &&
              teams.map((t) => (
                <TeamRow key={`team-row-${t.teamNumber}`} team={t} />
              ))}
          </TableBody>
        </Table>
      </Box>
    </Box>
  );
};

export default TeamInfoPanel;
