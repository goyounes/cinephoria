import React, { useState } from 'react';
import { Button, Stack } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

function ImageUploader({ onFileSelect }) {
  const [imagePreview, setImagePreview] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      onFileSelect(file); // Pass file to parent

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Stack>
      <input
        accept="image/*"
        id="image-upload"
        type="file"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <label htmlFor="image-upload">
        <Button variant="contained" component="span" startIcon={<CloudUploadIcon />}>
          Upload Poster
        </Button>
      </label>

      {imagePreview && (
        <Stack mt={2} alignItems="center">
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
