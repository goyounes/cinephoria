import {
  Card,
  CardContent,
  Stack,
  Box,
  Typography,
  Chip,
  Rating,
  Skeleton,
  Divider,
} from "@mui/material";
import { Stars as StarsIcon } from "@mui/icons-material";
import dayjs from "dayjs";

const MovieSkeleton = () => (
  <Stack direction={{ xs: "column", md: "row" }} spacing={4}>
    {/* Poster skeleton */}
    <Skeleton
      variant="rectangular"
      sx={{
        width: { xs: "100%", md: 338 },
        height: { xs: 300, md: 450 },
        borderRadius: 2,
      }}
    />

    {/* Details skeleton */}
    <Stack spacing={2} flex={1}>
      <Skeleton variant="text" height={48} width="70%" />

      <Stack direction="row" spacing={1}>
        <Skeleton variant="rounded" width={90} height={32} />
        <Skeleton variant="rounded" width={120} height={32} />
        <Skeleton variant="rounded" width={100} height={32} />
      </Stack>

      <Skeleton variant="text" width="30%" height={28} />
      <Skeleton variant="text" width="25%" height={24} />

      <Divider />

      <Stack direction="row" gap={1} flexWrap="wrap" rowGap={1}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" width={70} height={28} />
        ))}
      </Stack>

      <Skeleton variant="rectangular" height={100} sx={{ mt: 2 }} />
    </Stack>
  </Stack>
);

const MovieDetails = ({ movie, loadingMovie }) => {
  return (
    <Card elevation={4}> 
      <CardContent sx={{ p: 4}}>
        {loadingMovie ? (
          <MovieSkeleton />
        ) : (
          <Stack direction={{xs: "column",md: "row"}} spacing={4}>
            {/* Poster */}
            <Box
              component="img"
              src={movie.imageUrl}
              alt={movie.title}
              sx={{
                width: {
                  xs: "100%",
                  md: 338,
                },
                height: {
                  xs: "auto",
                  md: 450,
                },
                objectFit: "cover",
                borderRadius: 2,
              }}
            />

            <Stack spacing={2} flex={1}>
              <Typography variant="h3" fontWeight="bold">
                {movie.title}
              </Typography>

              <Stack direction="row" spacing={2} flexWrap="wrap">
                <Chip label={`Age ${movie.age_rating}+`} />
                <Chip label={`Duration: ${movie.length}`} />
                {movie.is_team_pick === 1 && (
                  <Chip
                    label="Team Pick"
                    color="success"
                    icon={<StarsIcon />}
                  />
                )}
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="h6">Rating:</Typography>
                <Rating
                  value={parseFloat(movie.score)}
                  precision={0.1}
                  readOnly
                  size="large"
                />
                <Typography variant="body1">({movie.score})</Typography>
              </Stack>

              <Divider />

              <Stack direction="row" gap="8px" flexWrap="wrap" rowGap={1}>
                {movie.genres?.map((genre) => (
                  <Chip
                    key={genre.genre_id}
                    label={genre.genre_name}
                    size="small"
                  />
                ))}
              </Stack>

              <Typography
                variant="body1"
                color="text.secondary"
                sx={{
                  flexGrow: 1,
                }}
              >
                {movie.description}
              </Typography>

              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{
                  textAlign: "end",
                }}
              >
                Added on {dayjs(movie.created_at).format("YYYY-MM-DD")}
              </Typography>
            </Stack>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
};

export default MovieDetails;
