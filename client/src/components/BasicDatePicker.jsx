import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { TextField } from '@mui/material';
import { useState } from 'react';

const BasicDatePicker = () => {
    const [value,setValue] = useState(null)
    
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
            label="Basic date picker"
            value={value}
            onChange={setValue}
        />
    </LocalizationProvider>
  );
}

export default BasicDatePicker