import { useState } from 'react';
import { Button, Step, StepButton, Stepper } from '@mui/material';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import isEqual from 'lodash/isEqual';
import { useAppSelector } from '../redux/hooks';
import {
  LeagueNight,
  selectSchedule,
  selectStartCourt,
} from '../redux/schedule';
import { selectTeams } from '../redux/teams';
import TemplatePanel from './template-panel';
import DatePanel from './date-panel';
import TeamInfoPanel from './team-info-panel';
import TeamNumberPanel from './team-number-panel';
import FinalPreview from './final-preview';
import outputSchedule from '../../domain/schedule';

// Steps in the process
const steps = [
  {
    label: 'Select Template',
    panel: <TemplatePanel />,
  },
  {
    label: 'Select Dates',
    panel: <DatePanel />,
  },
  {
    label: 'Set Team Codes',
    panel: <TeamInfoPanel />,
  },
  {
    label: 'Assign Team Numbers',
    panel: <TeamNumberPanel />,
  },
  {
    label: 'Finalize Schedule',
    panel: <FinalPreview />,
  },
];

const ScheduleForm = () => {
  /** State */
  const [step, setStep] = useState<number>(0);

  /** Redux */
  const schedule = useAppSelector(selectSchedule, isEqual);
  const startCourt = useAppSelector(selectStartCourt);
  const teams = useAppSelector(selectTeams, isEqual);

  const handleStep = async (index: number) => {
    if (index === steps.length && teams) {
      const success = await outputSchedule(
        schedule as Required<LeagueNight>[],
        teams,
        startCourt
      );
      if (success) {
        setStep(0);
      }
      return;
    }
    setStep(index);
  };

  const nextStep = () => {
    handleStep(Math.min(step + 1));
  };

  // Button tooltip
  const tooltip =
    step === steps.length - 1
      ? 'Export SportsEngine schedule'
      : 'Continue to the next step';

  return (
    <Box
      width="100%"
      height="100%"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        verticalAlign: 'top',
        justifyContent: 'center',
        padding: 0,
      }}
    >
      <Box
        width="100%"
        display="flex"
        sx={{ paddingBottom: '30px', verticalAlign: 'top' }}
      >
        <Stepper
          activeStep={step}
          alternativeLabel
          nonLinear
          sx={{ width: '100%', height: '100%' }}
        >
          {steps.map((panel, index) => (
            <Step key={panel.label}>
              <StepButton
                onClick={() => handleStep(index)}
                sx={{
                  width: '100%',
                  '&.MuiStepButton-root': {
                    paddingLeft: '0px',
                    paddingRight: '0px',
                    marginLeft: '0px',
                    marginRight: '0px',
                  },
                }}
              >
                {panel.label}
              </StepButton>
            </Step>
          ))}
        </Stepper>
      </Box>
      <Box width="100%" justifyContent="center" display="flex">
        <Tooltip title={tooltip}>
          <Button onClick={nextStep}>
            {step === steps.length - 1 ? 'Finish' : 'Next'}
          </Button>
        </Tooltip>
      </Box>
      <Box width="100%" justifyContent="center" display="flex">
        <Typography variant="h4" align="center" color="black">
          {steps[step].label}
        </Typography>
      </Box>
      {steps[step].panel}
    </Box>
  );
};

export default ScheduleForm;
