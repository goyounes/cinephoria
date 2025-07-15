import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useState } from 'react';
import dayjs from 'dayjs';

const BasicDatePicker = ({ value, onChange, allowedDates }) => {
  const allowedDatesFormatted = allowedDates.map(dateStr =>
    dayjs(dateStr).format('YYYY-MM-DD')
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        label="Pick a Date"
        value={value}
        onChange={onChange}
        format="ddd DD/MM/YYYY"
        shouldDisableDate={(date) => {
          const formatted = date.format('YYYY-MM-DD');
          return !allowedDatesFormatted.includes(formatted);
        }}
        slotProps={{
          textField: {
            fullWidth: true,
            sx: {
              height: '100%',
              '& .MuiPickersInputBase-root': {
                height: '100%',
              },
            },
          },
        }}
      />
    </LocalizationProvider>
  );
};

export default BasicDatePicker;