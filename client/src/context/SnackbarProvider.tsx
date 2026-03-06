import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { Snackbar, Alert } from "@mui/material";
import type { SnackbarSeverity } from "../types";

interface SnackbarItem {
  key: number;
  message: string;
  severity: SnackbarSeverity;
  onClose: () => void;
}

interface SnackbarContextType {
  showSnackbar: (message: string, severity?: SnackbarSeverity) => void;
}

const SnackbarContext = createContext<SnackbarContextType | null>(null);

const SNACKBARS_TIMEOUT = 4000;

export const SnackbarProvider = ({ children }: { children: ReactNode }) => {
  const [snackbars, setSnackbars] = useState<SnackbarItem[]>([]);

  const showSnackbar = useCallback((message: string, severity: SnackbarSeverity = "info") => {
    const key = Date.now();

    const handleClose = () => {
      setSnackbars((prev) => prev.filter((snack) => snack.key !== key));
    };

    const snackbar: SnackbarItem = {
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

export const useSnackbar = (): ((message: string, severity?: SnackbarSeverity) => void) => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error("useSnackbar must be used within a SnackbarProvider");
  }
  return context.showSnackbar;
};

interface CustomSnackbarProps {
  message: string;
  severity?: SnackbarSeverity;
  onClose?: () => void;
}

const CustomSnackbar = ({ message, severity = "info", onClose }: CustomSnackbarProps) => {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOpen(false);
      onClose?.();
    }, SNACKBARS_TIMEOUT);
    return () => clearTimeout(timer);
  }, [onClose]);

  const handleClose = (_: React.SyntheticEvent | Event, reason?: string) => {
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
