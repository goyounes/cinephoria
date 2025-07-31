import AccessibleIcon from "@mui/icons-material/Accessible";
import { Button, Stack, Typography } from "@mui/material";
import { grey } from "@mui/material/colors";
import dayjs from "dayjs";

const ScreeningButton = ({screening, room_name}) => {
  return (
    <Button variant="contained" sx={{ p: 0}}>
        <Stack direction="row">
            <Stack width={40} px={1} py={1} spacing={0.5}>
            {screening.qualities?.map((quality) => (
                <Typography
                    key={quality.quality_id}
                    variant="caption"
                    sx={{
                        px:0.5,
                        fontSize: 12,
                        fontWeight: "bolder"
                    }}
                    textAlign="start"
                >
                    {quality.quality_name}
                </Typography>
            ))}
            </Stack>

            <Stack width={80} height={100} justifyContent="center">
                <Typography  variant="h5" sx={{mt: 1.5, fontWeight: "bold"}}>
                    {screening.start_time.substring(0, 5)}
                </Typography>
                <Typography
                    variant="caption"
                    sx={{
                    fontSize: 10,
                    color: grey[200],
                    mt: 0,
                    textTransform: "none",
                    }}
                >
                    Ends at {screening.end_time.substring(0, 5)}
                </Typography>
                <Typography variant="caption" sx={{mt: 1,textTransform: "none"}}>
                    {room_name}
                </Typography>
            </Stack>

            <Stack width={40} alignItems="end" px={1} py={1}>
                <AccessibleIcon />
            </Stack>
        </Stack>
    </Button>
  );
}

export default ScreeningButton