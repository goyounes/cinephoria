import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useState } from 'react';
import dayjs from 'dayjs';

const BasicDatePicker = ({value,onChange, allowedDates}) => {
    // const [value,setValue] = useState(null)
    console.log("BasicDatePicker current value = ", value)

    const allowedDatesFromated = allowedDates.map(dateStr => dayjs(dateStr).format('YYYY-MM-DD'));

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
            label="Basic date picker"
            value={value}
            onChange={onChange}
            format="ddd DD/MM/YYYY"
            shouldDisableDate={(date) => {
              // Format date as YYYY-MM-DD for easy comparison
              const formatted = date.format('YYYY-MM-DD');
              return !allowedDatesFromated.includes(formatted); // disable if NOT in allowedDates
            }}
        />
    </LocalizationProvider>
  );
}

export default BasicDatePicker