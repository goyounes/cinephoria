import { Router } from 'express';
const router = Router();
import { verifyUserJWT } from '../controllers/auth.js'
import { pool } from '../controllers/connect.js';

router.post("/complete", verifyUserJWT, async (req, res, next) => {
    const { screening_id, ticket_types, total_price, card } = req.body;
    const user_id = req.user.user_id;

    const nbrOfTickets = ticket_types.reduce((sum, t) => sum + t.count, 0);
    const computedTotalPrice = ticket_types.reduce((sum, t) => sum + (t.count * parseFloat(t.ticket_type_price)), 0);

    // Validate total price
    if (total_price !== computedTotalPrice) {
        const err = new Error("Total price mismatch")
        err.status = 400
        next(err)
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Lock available seats for this screening
        const getAvailableSeatsQuery = `
            SELECT seats.seat_id
            FROM seats
            JOIN rooms ON seats.room_id = rooms.room_id
            JOIN screenings ON rooms.room_id = screenings.room_id
            WHERE screenings.screening_id = ?
              AND seats.isDeleted = FALSE
              AND seats.seat_id NOT IN (
                  SELECT seat_id FROM tickets WHERE screening_id = ?
              )
            LIMIT ? FOR UPDATE
        `;
        const [seats] = await connection.query(getAvailableSeatsQuery, [screening_id,screening_id,nbrOfTickets]);

        if (seats.length < nbrOfTickets) {
            const err = new Error("Not enough seats available")
            err.status = 400
            next(err)
        }
        // Simulate payment processing delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log("Payment processed");
        // Prepare ticket insert statement
        const insertTicketQuery = `
            INSERT INTO tickets (screening_id, user_id, seat_id, ticket_type_id)
            VALUES (?, ?, ?, ?)
        `;

        // Build and execute insert queries
        let seatIndex = 0;
        for (const ticket_type of ticket_types) {
            for (let i = 0; i < ticket_type.count; i++) {
                const VALUES = [
                    screening_id,
                    user_id,
                    seats[seatIndex].seat_id,
                    ticket_type.type_id
                ];
                await connection.query(insertTicketQuery, VALUES);
                seatIndex++;
            }
        }

        await connection.commit();
        res.status(200).json({
            message: "Booking successful",
            tickets_booked: nbrOfTickets,
            seat_ids: seats.map(s => s.seat_id)
        });

    } catch (error) {
        await connection.rollback();
        console.error("Booking error:", error);
        next(error);
    } finally {
        connection.release();
    }
});
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

// router.post("/api/v1/checkout/complete",verifyUserJWT , async (req, res, next) => {
//   const {screening_id,ticket_types, total_price, card } = req.body;
//   if (!card ) next ( new Error("Missing purchase data, creation operation failed"))

//   console.log("Processing purchase request...");

//   try {
//     //Extract User id from the email
//     const user_id = await 
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
