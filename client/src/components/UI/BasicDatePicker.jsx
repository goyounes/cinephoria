import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

const BasicDatePicker = ({ value, onChange, allowedDates, format}) => {
  // Format allowed dates only if they exist and have length
  const allowedDatesFormatted = Array.isArray(allowedDates) && allowedDates.length > 0
    ? allowedDates.map(dateStr => dayjs(dateStr).format('YYYY-MM-DD'))
    : null;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        label="Pick a Date"
        value={value}
        onChange={onChange}
        format={format || 'YYYY-MM-DD'}
        shouldDisableDate={(date) => {
          if (!allowedDatesFormatted) return false; // no restriction if no allowed dates

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