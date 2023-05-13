import { useState } from 'react';
import Button from '@mui/material/Button';

export interface TriProps {
  // eslint-disable-next-line react/require-default-props
  onChange?: (state: number) => void;
}

const stateColor = ['auto', 'green', 'orange'];

const TriStateButton = ({ onChange }: TriProps) => {
  const [state, setState] = useState<number>(0);

  const handleChange = () => {
    const newState = (state + 1) % 2;
    if (onChange) {
      onChange(newState);
    }
    setState(newState);
  };

  return (
    <Button
      onClick={handleChange}
      sx={{ backgroundColor: stateColor[state] }}
    />
  );
};

export default TriStateButton;
