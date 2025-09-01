import { Link } from "react-router-dom";
import { Box, Card, CardMedia, Stack, Typography } from "@mui/material";

const MovieCard = ({ movie, to, state, onClick }) => {
  const Component = to ? Link : "div";

  return (
    <Box sx={{ width: { xs: 150, sm: 180, md: 225 } }} onClick={onClick} role="button">
      <Card
        component={Component}
        {...(to ? { to, state } : {})}  // <-- pass state along with to
        sx={{
          textDecoration: "none",
          color: "inherit",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
          "&:hover": {
            transform: "scale(1.03)",
            boxShadow: 6,
          },
          width: "100%",
          cursor: "pointer",
        }}
      >
        <CardMedia
          component="img"
          image={movie.imageUrl}
          alt={`Poster for ${movie.title}`}
          sx={{
            width: "100%",
            height: { xs: 200, sm: 240, md: 300 },
            objectFit: "cover",
          }}
        />
        <Stack justifyContent="center" height="75px">
          <Typography
            variant="body1"
            sx={{
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            {movie.title}
          </Typography>
        </Stack>
      </Card>
    </Box>
  );
};

export default MovieCard;
