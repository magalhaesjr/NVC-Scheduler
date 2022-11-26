import { useState } from 'react';
import { Button, Step, StepButton, Stepper } from '@mui/material';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TemplatePanel from './template-panel';
import DatePanel from './date-panel';
import TeamInfoPanel from './team-info-panel';
import TeamNumberPanel from './team-number-panel';

interface Props {
  label: string;
}
const TabPanel = ({ label }: Props) => {
  return (
    <Box width="100%" height="100%">
      <Typography>{label}</Typography>
    </Box>
  );
};

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
    panel: <TabPanel label="5" />,
  },
];

const ScheduleForm = () => {
  const [step, setStep] = useState<number>(0);

  const nextStep = () => {
    setStep(Math.min(step + 1, steps.length - 1));
  };

  return (
    <form id="scheduleForm">
      <Box width="100%" height="100%">
        <Stepper
          activeStep={step}
          alternativeLabel
          sx={{ width: '100%', height: '100%' }}
        >
          {steps.map((panel, index) => (
            <Step key={panel.label}>
              <StepButton onClick={() => setStep(index)}>
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
