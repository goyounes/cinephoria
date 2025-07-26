import { Dialog, Button, DialogActions, DialogContent, DialogTitle, Stack, TextField, CircularProgress } from '@mui/material';
import {useState } from 'react'
import { displayCustomAlert } from '../../components/UI/CustomSnackbar';
import { validateCardExpiryDate } from '../../utils';
import axios from '../../api/axiosInstance.js';
import { useNavigate } from 'react-router-dom';


const PaymentDialog = ({ open, onClose, cardInfo, setCardInfo, snackbars, setSnackbars, order }) => {
   const navigate = useNavigate()
   const [isProcessing, setIsProcessing] = useState(false);

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

      // Validate Expiry date
      try {
         const expiryValidation = validateCardExpiryDate(cardInfo.expiry);
         if (!expiryValidation.valid) {
         throw new Error(expiryValidation.reason === "expired" ? "Card expired" : "Expiration date is invalid");
         }
      } catch (error) {
         displayCustomAlert(
            snackbars,
            setSnackbars,
            `Failed during validating payment information: ${error.response?.data?.error?.message || error.message || "Something went wrong"}`,
            "error");
         setIsProcessing(false);
         return;
      }
      // call backend to process the chekout
      try {
         await new Promise((res) => setTimeout(res, 1000));
         await axios.post("/api/checkout/complete", {...order,card: cardInfo}, {withCredentials: true } );
      } catch (error) {
         displayCustomAlert(
            snackbars,
            setSnackbars,
            `Failed during Backend Processing: ${error.response?.data?.error?.message || error.message || "Something went wrong"}`,
            "error");
         setIsProcessing(false);
         return;
      }
      // If we reach here, all steps succeeded
      displayCustomAlert(snackbars, setSnackbars, "Payment successful!", "success");
      setIsProcessing(false);
      onClose();
      setTimeout(() => {
        navigate("/auth/account")
      },1000)

   };


   return (
      <Dialog open={open} onClose={onClose} fullWidth>
         <DialogTitle>Enter Card Information</DialogTitle>
         <DialogContent>
         <Stack spacing={2} mt={1}>
            <TextField
               label="Card Number"
               variant="outlined"
               autoComplete="cc-number"
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
            {isProcessing ? `Processing...` : "Submit Payment"}
            </Button>
         </DialogActions>
      </Dialog>
   );
   };


export default PaymentDialog