import React from "react";
import { Box, Card, CardContent, CardMedia, Typography } from "@mui/material";
import { Link } from "react-router-dom";

const HorizontalMovieScroller = ({ movies }) => {
  return (
    <Box
      sx={{
        display: "flex",
        overflowX: "auto",
        gap: 2,
        px: 2,
        py: 3,
        maskImage: "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
      }}
    >
      {movies.map((movie) => (
        <Box
          key={movie.movie_id}
          sx={{
            flex: "0 0 auto",
            width: 225,
            position: "relative",
            overflow: "visible",
          }}
        >
          <Card
            component={Link}
            to={`/movies/${movie.movie_id}`}
            sx={{
              textDecoration: "none",
              color: "inherit",
              display: "flex",
              flexDirection: "column",
              transition:
                "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
              position: "relative",
              zIndex: 1,
              "&:hover": {
                transform: "scale(1.05)",
                boxShadow: 6,
                zIndex: 10,
              },
            }}
          >
            <CardMedia
              component="img"
              image={movie.imageUrl}
              alt={`Poster for ${movie.title}`}
              sx={{ width: 225, height: 300, objectFit: "cover" }}
            />
            <CardContent
              sx={{
                p: 1,
                "&:last-child": { pb: 1 },
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: 75,
              }}
            >
              <Typography
                variant="body1"
                sx={{ fontWeight: "bold", textAlign: "center" }}
              >
                {movie.title}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      ))}
    </Box>
  );
};

export default HorizontalMovieScroller;