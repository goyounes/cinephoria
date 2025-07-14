import React from 'react';
import { Modal, Box, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const baseStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

const ModalWrapper = ({ open, onClose, children, width = 700 }) => (
  <Modal open={open} onClose={onClose}>
    <Box sx={{ ...baseStyle, width, position: 'relative' }}>
      {/* Close Icon */}
      <IconButton
        onClick={onClose}
        size="small"
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
        }}
        aria-label="close"
      >
        <CloseIcon fontSize="small" />
      </IconButton>

      {children}
    </Box>
  </Modal>
);

export default ModalWrapper;
