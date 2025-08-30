import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {Container,Typography,TextField,Button,Card,CardContent,Stack,Box,Chip,Rating,CircularProgress} from "@mui/material";
import StarsIcon from "@mui/icons-material/Stars";
import SendIcon from "@mui/icons-material/Send";

import axios from "../api/axiosInstance";
import { useAuth } from "../context/AuthProvider";
import { useSnackbar } from "../context/SnackbarProvider";

const MovieReview = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const showSnackbar = useSnackbar();

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  const [reviewData, setReviewData] = useState({
    score: 0,
    review: "",
  });

  const handleChange = (e) => {
    setReviewData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleRatingChange = (e, newValue) => {
    setReviewData((prev) => ({
      ...prev,
      score: newValue,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/api/v1/movies/reviews`, {
        movie_id: id,
        user_id: currentUser.user_id,
        score: reviewData.score,
        review: reviewData.review,
      });

      setReviewData({ score: 0, review: "" });
      showSnackbar("Review submitted!", "success");
    } catch (err) {
      const message = err.response?.data?.error?.message || err.message || "Submission failed";
      showSnackbar(`Error: ${message}`, "error");
    }
  };

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const res = await axios.get(`/api/v1/movies/${id}`);
        setMovie(res.data);
      } catch (err) {
        console.error("Failed to load movie details");
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [id]);

  if (loading) {
    return (
      <Container sx={{ py: 6, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!movie) return null;

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      {/* Mini Movie Card */}
      <Card elevation={2} sx={{ my: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={2}>
            <Box
              component="img"
              src={movie.imageUrl}
              alt={movie.title}
              sx={{
                width: 100,
                height: 150,
                objectFit: "cover",
                borderRadius: 2,
              }}
            />
            <Stack spacing={1} flex={1}>
              <Typography variant="h6" fontWeight="bold">
                {movie.title}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip label={`Age ${movie.age_rating}+`} size="small" />
                <Chip label={`Duration: ${movie.length}`} size="small" />
                {movie.is_team_pick === 1 && (
                  <Chip
                    label="Team Pick"
                    color="success"
                    size="small"
                    icon={<StarsIcon fontSize="small" />}
                  />
                )}
              </Stack>
              {movie.genres?.length > 0 && (
                <Stack direction="row" spacing={1} flexWrap="wrap" mt={1}>
                  {movie.genres.map((genre) => (
                    <Chip key={genre.genre_id} label={genre.genre_name} size="small" />
                  ))}
                </Stack>
              )}
              <Stack direction="row" spacing={1} alignItems="center" mt={1}>
                <Rating
                  value={parseFloat(movie.score)}
                  precision={0.1}
                  readOnly
                  size="small"
                />
                <Typography variant="body2">({movie.score})</Typography>
              </Stack>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* Review Form */}
      <Card elevation={4}>
        <CardContent>
          <Typography variant="h5" align="center" gutterBottom>
            Leave a Review
          </Typography>

          <Stack spacing={2} component="form" onSubmit={handleSubmit}>
            <Rating
              name="score"
              value={reviewData.score}
              precision={1}
              onChange={handleRatingChange}
            />
            <TextField
              name="review"
              label="Optional review"
              multiline
              rows={4}
              value={reviewData.review}
              onChange={handleChange}
              placeholder="Your thoughts about the movie..."
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              endIcon={<SendIcon />}
              disabled={reviewData.score === 0}
            >
              Submit Review
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
};

export default MovieReview;
