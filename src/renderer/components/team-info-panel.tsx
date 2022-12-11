/* eslint-disable react/jsx-props-no-spreading */
import { useCallback, useEffect, useState } from 'react';
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

  useEffect(() => {
    setTemp(team);
  }, [setTemp, team]);

  const handleCommit = useCallback(() => {
    dispatch(updateTeam(teamTemp));
  }, [dispatch, teamTemp]);

  const handleChange = useCallback(
    (t) => {
      setTemp(t);
    },
    [setTemp]
  );

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
    <>
      <Box height="300px" width="100%">
        <Tooltip title="Import mapping codes and team names from SportsEngine exported csv file">
          <Button variant="contained" onClick={handleImport}>
            Import CSV
          </Button>
        </Tooltip>
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
    </>
  );
};

export default TeamInfoPanel;
