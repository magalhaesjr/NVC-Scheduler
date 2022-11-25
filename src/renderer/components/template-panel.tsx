/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-underscore-dangle */
import { useCallback, useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import InputLabel from '@mui/material/InputLabel';
import { isEqual } from 'lodash';
import { Template } from '../template';
import {
  selectActiveTemplate,
  selectSeasonTemplates,
  setActiveTemplate,
} from '../redux/template';
import { useAppDispatch, useAppSelector } from '../redux/hooks';

const findTeams = (templates: Template[] | null): string[] | null => {
  if (templates === null) {
    return null;
  }

  const outTeams = ['All'];

  templates.forEach((t: any) => {
    const teamLabel = `${t.numTeams}`;
    if (outTeams.findIndex((team) => team === teamLabel) === -1) {
      outTeams.push(teamLabel);
    }
  });

  return outTeams;
};

const Header = () => {
  return (
    <TableHead key="header">
      <TableRow key="header-row">
        <TableCell key="header-choose" />
        <TableCell key="header-title">Title</TableCell>
        <TableCell key="header-teams">Teams</TableCell>
        <TableCell key="header-weeks">Weeks</TableCell>
        <TableCell key="header-courts">Courts</TableCell>
        <TableCell key="header-byes">Byes</TableCell>
        <TableCell key="header-description">Description</TableCell>
      </TableRow>
    </TableHead>
  );
};

const TeamRow = ({ template }: any) => {
  const dispatch = useAppDispatch();
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const {
    _id: id,
    title,
    numTeams,
    numWeeks,
    numByes,
    numCourts,
    description,
  } = template;

  const active = useAppSelector(selectActiveTemplate, isEqual);

  const handleChoose = (chosenId: string) => {
    dispatch(setActiveTemplate(chosenId));
  };

  return (
    <TableRow key={`${id}-row`} selected={active !== null && active._id === id}>
      <TableCell>
        <Button
          key={`${id}-select`}
          variant="contained"
          onClick={() => handleChoose(id)}
        >
          choose
        </Button>
      </TableCell>
      <TableCell key={`${id}-title`}>{title}</TableCell>
      <TableCell key={`${id}-teams`}>{numTeams}</TableCell>
      <TableCell key={`${id}-weeks`}>{numWeeks}</TableCell>
      <TableCell key={`${id}-courts`}>{numCourts}</TableCell>
      <TableCell key={`${id}-byes`}>{numByes}</TableCell>
      <TableCell key={`${id}-desc`}>{description}</TableCell>
    </TableRow>
  );
};

const TemplatePanel = () => {
  const [teams, setTeams] = useState<string>('');
  const [filteredTemplates, setTemplates] = useState<Template[] | null>(null);

  const templates = useAppSelector(selectSeasonTemplates, isEqual);
  // Calculate possible teams for filter
  const availableTeams = useMemo(() => {
    return findTeams(templates);
  }, [templates]);

  const handleChange = useCallback(
    (event: SelectChangeEvent) => {
      setTeams(event.target.value);
    },
    [setTeams]
  );

  useEffect(() => {
    if (teams && teams !== 'All') {
      setTemplates(templates.filter((t: any) => `${t.numTeams}` === teams));
    } else {
      setTemplates(templates);
    }
  }, [setTemplates, teams, templates]);

  return (
    <Box width="100%" height="500px" overflow="auto">
      {availableTeams && (
        <Box width="100%" height="100%" overflow="auto">
          <InputLabel>Teams</InputLabel>
          <Select value={`${teams}`} label="Teams" onChange={handleChange}>
            {availableTeams.map((num) => (
              <MenuItem key={`team-filter-${num}`} value={num}>
                {num}
              </MenuItem>
            ))}
          </Select>
          {filteredTemplates && (
            <Table stickyHeader>
              <Header />
              <TableBody>
                {filteredTemplates.map((t: any) => (
                  <TeamRow key={`${t._id}-row`} template={t} />
                ))}
              </TableBody>
            </Table>
          )}
        </Box>
      )}
    </Box>
  );
};

export default TemplatePanel;
