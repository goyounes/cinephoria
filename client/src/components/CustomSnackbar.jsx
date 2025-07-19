import React, { useState, useEffect } from "react";
import { Snackbar, Alert } from "@mui/material";

// 1. CustomSnackbar Component
const CustomSnackbar = ({ message, severity = "info", onClose }) => {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOpen(false);
      onClose?.();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const handleClose = (_, reason) => {
    if (reason !== "clickaway") {
      setOpen(false);
      onClose?.();
    }
  };

  return (
    <Snackbar
      open={open}
      onClose={handleClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
    >
      <Alert
        onClose={handleClose}
        severity={severity}
        variant="filled"
        sx={{ width: "100%" }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

// 2. Utility function to trigger a new snackbar
export const displayCustomAlert = (snackbars, setSnackbars, message, severity = "info") => {
  const newSnackbar = (
    <CustomSnackbar
      key={Date.now()}
      message={message}
      severity={severity}
      onClose={() => {
        setSnackbars((snacks) => snacks.filter((_, i) => i !== 0));
      }}
    />
  );

  setSnackbars([...snackbars, newSnackbar]);
};

export default CustomSnackbar;