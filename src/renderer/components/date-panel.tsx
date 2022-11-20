/* eslint-disable react/jsx-props-no-spreading */
import { useCallback } from 'react';
import { Dayjs } from 'dayjs';
import TextField from '@mui/material/TextField';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { selectStartDate, setStartDate } from '../redux/schedule';
import { useAppDispatch, useAppSelector } from '../redux/hooks';

const DatePanel = () => {
  const dispatch = useAppDispatch();

  // Pull start date from redux state
  const startDate = useAppSelector(selectStartDate);

  // Dispatches update to redux state
  const changeDate = useCallback(
    (newDay: Dayjs | null) => {
      if (newDay) {
        dispatch(setStartDate(newDay.toJSON()));
      }
    },
    [dispatch]
  );

  return (
    <DesktopDatePicker
      label="Start Date"
      inputFormat="MM/DD/YYYY"
      value={startDate}
      onChange={changeDate}
      renderInput={(params) => <TextField {...params} />}
    />
  );
};

export default DatePanel;
