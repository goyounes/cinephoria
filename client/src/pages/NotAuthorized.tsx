import { Container, Typography } from "@mui/material";

const NotAuthorized = () => {
  return (
    <Container sx={{ flexGrow: 1, py: 4, display: 'flex', flexDirection:'column',justifyContent: 'flex-start' }}>
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
            Not Authorized
        </Typography>

        <Typography variant="body1">
            You do not have permission to view this page.
        </Typography>
    </Container>
  );
};

export default NotAuthorized;