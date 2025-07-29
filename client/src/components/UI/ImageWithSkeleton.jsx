import React, { useState, useEffect } from 'react';
import { Skeleton, Box } from '@mui/material';

const ImageWithSkeleton = ({ src, alt, width = 100, height = 150, sx }) => {
  const [loaded, setLoaded] = useState(false);
  const [hideSkeleton, setHideSkeleton] = useState(false);

  useEffect(() => {
    if (loaded) {
      const fadeOutTimer = setTimeout(() => {
        setHideSkeleton(true);
      }, 150); // match transition duration

      return () => clearTimeout(fadeOutTimer);
    } else {
      setHideSkeleton(false);
    }
  }, [loaded]);

  return (
    <Box
      sx={{
        width,
        height,
        position: 'relative',
        borderRadius: 1,
        overflow: 'hidden',
        ...sx,
      }}
    >
      {/* Skeleton on top */}
      {!hideSkeleton && (
        <Skeleton
          variant="rectangular"
          width={width}
          height={height}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            borderRadius: 1,
            transition: 'opacity 0.15s ease',
            opacity: loaded ? 0 : 1,
            pointerEvents: 'none',
            bgcolor: 'background.paper',
          }}
        />
      )}

      {/* Image below */}
      <Box
        component="img"
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        sx={{
          width,
          height,
          borderRadius: 1,
          objectFit: 'cover',
          transition: 'opacity 0.15s ease',
          opacity: loaded ? 1 : 0,
          display: 'block',
          filter: 'none',
        }}
      />
    </Box>
  );
};

export default ImageWithSkeleton;
