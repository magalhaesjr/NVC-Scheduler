import { useState } from 'react';
import { Button, Step, StepButton, Stepper } from '@mui/material';
import Box from '@mui/material/Box';
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

  return (
    <form id="scheduleForm">
      <Box width="100%" height="100%">
        <Stepper
          activeStep={step}
          alternativeLabel
          nonLinear
          sx={{ width: '100%', height: '100%' }}
        >
          {steps.map((panel, index) => (
            <Step key={panel.label}>
              <StepButton onClick={() => handleStep(index)}>
                {panel.label}
              </StepButton>
            </Step>
          ))}
        </Stepper>
      </Box>
      <Box width="100%">
        <Button onClick={nextStep}>
          {step === steps.length - 1 ? 'Finish' : 'Next'}
        </Button>
      </Box>
      <Box width="100%">
        <Typography variant="h4" align="center" color="black">
          {steps[step].label}
        </Typography>
      </Box>
      {steps[step].panel}
    </form>
  );
};

export default ScheduleForm;
