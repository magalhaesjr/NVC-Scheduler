/* eslint-disable react/jsx-props-no-spreading */
import { useCallback, useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import TextField from '@mui/material/TextField';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Tooltip from '@mui/material/Tooltip';
import { isEqual } from 'lodash';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { importTeams, selectTeams, updateTeam } from '../redux/teams';
import { Team } from '../../domain/teams';

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
    <TableRow key={`${baseKey}/row`}>
      <TableCell key={`${baseKey}/name`}>
        <ClickAwayListener onClickAway={handleCommit}>
          <TextField
            value={teamTemp.teamName}
            onChange={(e) =>
              handleChange({ ...teamTemp, name: e.target.value })
            }
          />
        </ClickAwayListener>
      </TableCell>
      <TableCell key={`${baseKey}/code`}>
        <ClickAwayListener onClickAway={handleCommit}>
          <TextField
            value={teamTemp.mappingCode === null ? '' : teamTemp.mappingCode}
            onChange={(e) =>
              handleChange({ ...teamTemp, mappingCode: e.target.value })
            }
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

  const handleImport = useCallback(() => {
    dispatch(importTeams());
  }, [dispatch]);

  return (
    <Box
      width="100%"
      height="100%"
      display="flex"
      flexDirection="column"
      alignItems="center"
    >
      <Box
        height="fit-content"
        width="fit-content"
        display="flex"
        alignItems="center"
      >
        <Tooltip title="Import mapping codes and team names from SportsEngine exported csv file">
          <Button variant="contained" onClick={handleImport}>
            Import CSV
          </Button>
        </Tooltip>
      </Box>
      <Box
        maxHeight="500px"
        width="100%"
        display="flex"
        alignContent="center"
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
              <TableCell
                key="team-header-code"
                sx={{ fontSize: '18pt', textAlign: 'center' }}
              >
                Mapping Code
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
