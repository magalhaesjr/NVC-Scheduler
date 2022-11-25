import { useState } from 'react';
import { Button, Step, StepButton, Stepper } from '@mui/material';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TemplatePanel from './template-panel';
import DatePanel from './date-panel';

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
    label: 'Select template',
    panel: <TemplatePanel />,
  },
  {
    label: 'Select start date',
    panel: <DatePanel />,
  },
  {
    label: 'Select blackouts',
    panel: <TabPanel label="3" />,
  },
  {
    label: 'Import team info',
    panel: <TabPanel label="4" />,
  },
  {
    label: 'Assign team numbers',
    panel: <TabPanel label="5" />,
  },
  {
    label: 'Finalize schedule',
    panel: <TabPanel label="6" />,
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
      {steps[step].panel}
      <Button onClick={nextStep}>
        {step === steps.length - 1 ? 'Finish' : 'Next'}
      </Button>
    </form>
  );
};

export default ScheduleForm;
