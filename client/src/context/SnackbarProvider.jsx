import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { Snackbar, Alert } from "@mui/material";


const SnackbarContext = createContext();


export const SnackbarProvider = ({ children }) => {
  const [snackbars, setSnackbars] = useState([]);

  const showSnackbar = useCallback((message, severity = "info") => {
    const key = Date.now();

    const handleClose = () => {
      setSnackbars((prev) => prev.filter((snack) => snack.key !== key));
    };

    const snackbar = {
      key,
      message,
      severity,
      onClose: handleClose,
    };

    setSnackbars((prev) => [...prev, snackbar]);
  }, []);

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      
      {snackbars.map(({ key, message, severity, onClose }) => (
        <CustomSnackbar
          key={key}
          message={message}
          severity={severity}
          onClose={onClose}
        />
      ))}
    </SnackbarContext.Provider>
  );
};

// Hook to use snackbar trigger
export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error("useSnackbar must be used within a SnackbarProvider");
  }
  return context.showSnackbar;
};

// Snackbar Component
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
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
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
