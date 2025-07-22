import { Router } from 'express';
const router = Router();
import axios from 'axios';
// const DB_API_URL = "http://localhost:5000/api/v1"

router.post("/complete", async(req, res, next) => {
    console.log(req.body)
    const {screeningId, ticketTypes,paymentToken, userId } = req.body
    console.log(req.body)
    // console.log(cardInfo)
    res.status(200).json(req.body)

})
// router.get("/api/v1/checkout", async (req, res, next) => {
//   const checkoutInfo = req.query.screening_id || null;
//   console.log("Fetching Checkout information from the DB...");
//   try {
//     const data = await dbFunc.getCheckoutInfo(checkoutInfo);

//     res.status(200).json(data);
//   } catch (error) {
//     next(error); // Passes the error to the global error-handling middleware
//   }
// });

// router.post("/api/v1/checkout/complete", async (req, res, next) => {
//   const purchaseInformation = req.body;
//   if (
//     !purchaseInformation.user_email ||
//     !purchaseInformation.user_password ||
//     !purchaseInformation.card_information
//   )
//     throwError("Missing purchase data, creation operation failed", 400);
//   console.log("Processing purchase request...");
//   try {
//     //Extract User id from the email
//     const user_id = await dbFunc.getUserIdByEmail(
//       purchaseInformation.user_email
//     );
//     if (!user_id) throwError("User not found, purchase operation failed", 400);

//     //Check password to validate user
//     const password_check = await dbFunc.CheckPassword(
//       user_id,
//       purchaseInformation.user_password
//     );
//     if (!password_check)
//       throwError("Password is incorrect, purchase operation failed", 400);

//     //Check if the number of non reserved seats is enough for the purchase
//     const available_seats = await dbFunc.getAvailbleSeats(
//       purchaseInformation.screening_id
//     );
//     if (available_seats.length < purchaseInformation.ticketCount)
//       throwError("Not enough available seats, purchase operation failed", 400);
//     console.table(available_seats);
//     //Select the seat_id's to be booked and store them in an array
//     const seatsToBeBooked = available_seats
//       .slice(0, purchaseInformation.ticketCount)
//       .map((seat) => seat.seat_id);

//     //process payment
//     const paymentResult = await processPayment(
//       purchaseInformation.card_information
//     );
//     if (paymentResult.status !== "success")
//       throwError("Payment failed, purchase operation failed", 400);

//     //book the tickets
//     let tickets = [];
//     console.log(seatsToBeBooked);

//     for (let i = 0; i < purchaseInformation.ticketCount; i++) {
//       tickets.push(
//         await dbFunc.bookTicket(
//           purchaseInformation.screening_id,
//           user_id,
//           seatsToBeBooked[i]
//         )
//       );
//     }
//     // seatsToBeBooked.forEach((seat_id) =>  dbFunc.bookTicket(purchaseInformation.screening_id, purchaseInformation.user_id, seat_id) )

//     //Add tickets to the DB
//     // const data = await dbFunc.getCheckoutInfo(checkoutInfo)
//     console.log(tickets);
//     res.status(200).json("Succes !  Tickets_id's --> ");
//   } catch (error) {
//     next(error); // Passes the error to the global error-handling middleware
//   }
// });

export default router;
