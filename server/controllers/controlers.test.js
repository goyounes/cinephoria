import '../config/env.js';

import { getCinemas, getRooms, getSeats } from "./cinemas.js";
import { addMovie, getGenres, getMovies, getMoviesWithGenres } from "./movies.js";
import { getScreeningQualities, getScreenings, getUpcomingScreenings } from "./screenings.js";
import { getRemainingSeats, getTickets } from "./tickets.js";
import { getUser, getUsers } from "./users.js";


// console.table(await getCinemas());
// console.table(await getRooms());
// console.table(await getSeats());

// console.table(await getMovies());
// console.table(await getMoviesWithGenres());
// console.table(await getGenres());

// console.table(await getAllScreenings());
// console.table(await getUpcomingScreenings());
// console.table(await getScreenings());
// console.table(await getScreeningQualities());

// console.table(await getTickets());
// console.table(await getCheckoutInfo(1));

console.table(await getUsers());
console.table(await getUser(1));

// console.log(await addMovie());
console.log(await getRemainingSeats(2))
process.exit(0);