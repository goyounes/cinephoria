import { Dialog, Button, DialogActions, DialogContent, DialogTitle, Stack, TextField, CircularProgress } from '@mui/material';
import {useState } from 'react'
import { displayCustomAlert } from '../../../components/UI/CustomSnackbar';
import { validateCardExpiryDate } from '../../../utils';
import axios from 'axios';

const PaymentDialog = ({ open, onClose, cardInfo, setCardInfo, snackbars, setSnackbars, order }) => {
   const [isProcessing, setIsProcessing] = useState(false);
   const [operation, setOperation] = useState(""); 

   const handleInputChange = (field) => (event) => {
      let value = event.target.value;
      if (field === "number") {
         value = value.replace(/\D/g, "").slice(0, 16);
         value = value.replace(/(.{4})/g, "$1 ").trim();
      }
      if (field === "cvv") {
         value = value.replace(/\D/g, "").slice(0, 3);
      }
      if (field === "expiry") {
         value = value.replace(/\D/g, "").slice(0, 4);
         if (value.length >= 3) {
         value = value.replace(/(\d{2})(\d{1,2})/, "$1/$2");
         }
      }
      setCardInfo((prev) => ({
         ...prev,
         [field]: value,
      }));
   };

   const handleSubmitPayment = async () => {
      if (!order || order.ticket_types.every(t => t.count === 0)) {
         displayCustomAlert(snackbars, setSnackbars, "No tickets selected", "error");
         return;
      }

      if (isProcessing) return;
      setIsProcessing(true);
      setOperation("");

      try {
         setOperation("validating payment information");
         const expiryValidation = validateCardExpiryDate(cardInfo.expiry);
         if (!expiryValidation.valid) {
         throw new Error(expiryValidation.reason === "expired" ? "Card expired" : "Expiration date is invalid");
         }
      } catch (error) {
         displayCustomAlert(
            snackbars,
            setSnackbars,
            `Failed during ${operation}: ${error.response?.data?.error?.message || error.message || "Something went wrong"}`,
            "error");
         setIsProcessing(false);
         return;
      }

      try {
         setOperation("Backend Processing");
         await new Promise((res) => setTimeout(res, 1000));
         await axios.post("/api/checkout/complete", {...order,card: cardInfo}, {withCredentials: true } );
         // throw new Error("Could not assign seats");
      } catch (error) {
         displayCustomAlert(
            snackbars,
            setSnackbars,
            `Failed during ${operation}: ${error.response?.data?.error?.message || error.message || "Something went wrong"}`,
            "error");
         setIsProcessing(false);
         return;
      }
      // If we reach here, all steps succeeded
      displayCustomAlert(snackbars, setSnackbars, "Payment successful!", "success");
      setIsProcessing(false);
      onClose();
   };


   return (
      <Dialog open={open} onClose={onClose} fullWidth>
         <DialogTitle>Enter Card Information</DialogTitle>
         <DialogContent>
         <Stack spacing={2} mt={1}>
            <TextField
               label="Card Number"
               variant="outlined"
               fullWidth
               value={cardInfo.number}
               onChange={handleInputChange("number")}
            />
            <TextField
               label="Expiration Date (MM/YY)"
               variant="outlined"
               fullWidth
               value={cardInfo.expiry}
               onChange={handleInputChange("expiry")}
            />
            <TextField
               label="CVV"
               variant="outlined"
               fullWidth
               value={cardInfo.cvv}
               onChange={handleInputChange("cvv")}
               type="password"
            />
         </Stack>
         </DialogContent>
         <DialogActions>
            <Button onClick={onClose}>Cancel</Button>
            <Button
            variant="contained"
            onClick={handleSubmitPayment}
            disabled={isProcessing}
            startIcon={isProcessing ? <CircularProgress color="inherit" size={20} /> : null}
            >
            {isProcessing ? `${operation}...` : "Submit Payment"}
            </Button>
         </DialogActions>
      </Dialog>
   );
   };


export default PaymentDialog