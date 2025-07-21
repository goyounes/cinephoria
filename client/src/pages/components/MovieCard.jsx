import { Link } from "react-router-dom";
import { Box, Card, CardMedia, Stack, Typography } from "@mui/material";

const MovieCard = ({ movie, to, onClick }) => {
  const Component = to ? Link : "div";

  return (
    <Box sx={{ width: 225 }} onClick={onClick} role="button">
      <Card
        component={Component}
        {...(to ? { to } : {})}
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
            height: 300,
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
