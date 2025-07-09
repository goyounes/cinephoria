import React, { useState } from 'react';
import { Button, Box, Typography, Stack } from '@mui/material';

function ImageUploader() {
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Stack >
      <input
        accept="image/*"
        id="image-upload"
        type="file"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <label htmlFor="image-upload">
        <Button variant="contained" component="span">
          Upload Image
        </Button>
      </label>

      {imagePreview && (
        <Stack mt={2} alignItems="center">
          {/* <Typography variant="subtitle2" gutterBottom>
            {imageFile?.name}
          </Typography> */}
          <img
            src={imagePreview}
            alt="Uploaded preview"
            style={{
              width: 80,
              objectFit: 'cover',
              borderRadius: 8,
              border: '1px solid #ccc',
            }}
          />
        </Stack>
      )}
    </Stack>
  );
}

export default ImageUploader;
