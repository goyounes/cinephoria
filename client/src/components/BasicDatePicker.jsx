import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useState } from 'react';

const BasicDatePicker = ({value,onChange}) => {
    // const [value,setValue] = useState(null)
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
            label="Basic date picker"
            value={value}
            onChange={onChange}
        />
    </LocalizationProvider>
  );
}

export default BasicDatePicker