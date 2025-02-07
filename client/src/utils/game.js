export const distributeNumbersEqually = (data) => {
  let arr = [...data];

  let ticketSize = 15;
  let maxNumbersAllowed = Math.floor(arr.length / ticketSize) * ticketSize; // Max valid numbers
  arr = arr.slice(0, maxNumbersAllowed); // Remove extra numbers

  let ticketCount = Math.ceil(arr.length / ticketSize);
  let tickets = Array.from({ length: ticketCount }, () => []);

  let ticketIndex = 0;
  for (let i = 0; i < arr.length; i++) {
    tickets[ticketIndex].push(arr[i]);
    ticketIndex = (ticketIndex + 1) % ticketCount;
  }

  console.log(tickets);
  return tickets;
};
// export const generateTambolaTickets = (numbers) => {
//   if (!Array.isArray(numbers)) {
//     throw new Error("Input to generateTambolaTickets must be an array");
//   }
//   let ticketCount = Math.min(3, Math.floor(numbers.length / 15));
//   let tickets = [];
//   let usedNumbers = new Set();
//   let extraNumbers = [];

//   for (let t = 0; t < ticketCount; t++) {
//     let ticket = Array.from({ length: 3 }, () => Array(9).fill(null));
//     let columns = Array.from({ length: 9 }, () => []);
//     let remainingNumbers = [];

//     numbers.forEach((num) => {
//       if (typeof num !== "number" || usedNumbers.has(num)) return;
//       let colIndex = Math.floor((num - 1) / 10);
//       if (columns[colIndex].length < 3) {
//         columns[colIndex].push(num);
//         usedNumbers.add(num);
//       } else {
//         remainingNumbers.push(num);
//       }
//     });

//     columns.forEach((col) => col.sort((a, b) => a - b));

//     let rowCounts = [0, 0, 0];
//     let rowColumnCount = Array.from({ length: 3 }, () => Array(9).fill(0));

//     for (let c = 0; c < 9; c++) {
//       let colNumbers = [...columns[c]];
//       for (let i = 0; i < colNumbers.length; i++) {
//         let availableRows = rowCounts
//           .map((count, row) => ({ row, count }))
//           .filter(
//             ({ row }) => rowCounts[row] < 5 && rowColumnCount[row][c] === 0
//           )
//           .sort((a, b) => a.count - b.count);

//         if (availableRows.length === 0) {
//           extraNumbers.push(colNumbers[i]);
//           continue;
//         }

//         let row = availableRows[0].row;
//         ticket[row][c] = colNumbers[i];
//         rowCounts[row]++;
//         rowColumnCount[row][c] = 1;
//       }
//     }

//     for (let r = 0; r < 3; r++) {
//       let availableCols = [];
//       for (let c = 0; c < 9; c++) {
//         if (ticket[r][c] === null) availableCols.push(c);
//       }

//       while (rowCounts[r] < 5 && availableCols.length > 0) {
//         let colToFill = availableCols.splice(
//           Math.floor(Math.random() * availableCols.length),
//           1
//         )[0];

//         let possibleNumbers = numbers.filter(
//           (num) =>
//             !usedNumbers.has(num) && Math.floor((num - 1) / 10) === colToFill
//         );

//         if (possibleNumbers.length > 0) {
//           ticket[r][colToFill] = possibleNumbers.shift();
//           usedNumbers.add(ticket[r][colToFill]);
//           rowCounts[r]++;
//         } else if (extraNumbers.length > 0) {
//           ticket[r][colToFill] = extraNumbers.pop();
//           rowCounts[r]++;
//         }
//       }
//     }

//     // Ensure any remaining extra numbers are placed in rows needing more numbers
//     for (let r = 0; r < 3; r++) {
//       while (rowCounts[r] < 5 && extraNumbers.length > 0) {
//         let emptyCols = ticket[r]
//           .map((num, idx) => (num === null ? idx : -1))
//           .filter((idx) => idx !== -1);
//         if (emptyCols.length === 0) break;

//         let colToFill = emptyCols[Math.floor(Math.random() * emptyCols.length)];
//         ticket[r][colToFill] = extraNumbers.pop();
//         rowCounts[r]++;
//       }
//     }

//     tickets.push(ticket);
//   }

//   return tickets;
// };

export const generateTambolaTickets = (numbers) => {
  if (!Array.isArray(numbers)) {
    throw new Error("Input to generateTambolaTickets must be an array");
  }

  let ticketCount = Math.min(3, Math.floor(numbers.length / 15));
  let tickets = [];
  let usedNumbers = new Set();
  let extraNumbers = [];

  for (let t = 0; t < ticketCount; t++) {
    let ticket = Array.from({ length: 3 }, () => Array(9).fill(null));
    let columns = Array.from({ length: 9 }, () => []);

    numbers.forEach((num) => {
      if (typeof num !== "number" || usedNumbers.has(num)) return;
      let colIndex = Math.floor((num - 1) / 10);
      if (columns[colIndex].length < 3) {
        columns[colIndex].push(num);
        usedNumbers.add(num);
      } else {
        extraNumbers.push(num); // Store extra numbers but don't place them
      }
    });

    columns.forEach((col) => col.sort((a, b) => a - b));

    let rowCounts = [0, 0, 0];
    let rowColumnCount = Array.from({ length: 3 }, () => Array(9).fill(0));

    for (let c = 0; c < 9; c++) {
      let colNumbers = [...columns[c]];
      for (let i = 0; i < colNumbers.length; i++) {
        let availableRows = rowCounts
          .map((count, row) => ({ row, count }))
          .filter(
            ({ row }) => rowCounts[row] < 5 && rowColumnCount[row][c] === 0
          )
          .sort((a, b) => a.count - b.count);

        if (availableRows.length === 0) {
          continue;
        }

        let row = availableRows[0].row;
        ticket[row][c] = colNumbers[i];
        rowCounts[row]++;
        rowColumnCount[row][c] = 1;
      }
    }

    tickets.push(ticket);
  }

  for (let t = 0; t < ticketCount; t++) {
    let ticket = tickets[t];
    let extraNumbersCopy = [...extraNumbers];

    for (let r = 0; r < 3; r++) {
      let numbersInRow = ticket[r].filter((num) => num !== null);
      if (numbersInRow.length === 5) continue;
      if (numbersInRow.length < 5) {
        let emptyCols = ticket[r]
          .map((num, idx) => (num === null ? idx : -1))
          .filter((idx) => idx !== -1);
        while (numbersInRow.length < 5 && extraNumbersCopy.length > 0) {
          let colToFill = emptyCols.shift();
          ticket[r][colToFill] = extraNumbersCopy.shift();
          numbersInRow.push(ticket[r][colToFill]);
        }
      }
      if (extraNumbersCopy.length === 0) break;
    }
    if (extraNumbersCopy.length === 0) break;
  }

  return tickets;
};

// let receivedNumbers = [...new Set(data)]; // Remove duplicates from input

//   // Ensure we have enough numbers to form tickets
//   const ticketCount = Math.min(3, Math.floor(receivedNumbers.length / 15));
//   if (ticketCount < 1) return [];

//   const ranges = Array.from({ length: 9 }, () => []); // Create 9 empty range buckets

//   // Step 1: Categorize numbers into their respective ranges
//   receivedNumbers.forEach((num) => {
//     let rangeIndex = Math.floor((num - 1) / 10); // Determine range
//     ranges[rangeIndex].push(num);
//   });

//   // Step 2: Determine the max numbers per ticket per range (capped at 3)
//   const maxPerRangePerTicket = ranges.map((range) =>
//     Math.min(3, Math.max(1, Math.floor(range.length / ticketCount)))
//   );

//   // Step 3: Distribute numbers across tickets ensuring balance
//   const tickets = Array.from({ length: ticketCount }, () => []);
//   const assignedNumbers = new Set(); // Track assigned numbers to prevent duplication
//   const remainingNumbers = [];

//   ranges.forEach((rangeNumbers, rangeIndex) => {
//     let assigned = Array(ticketCount).fill(0); // Track how many numbers assigned per ticket in this range
//     rangeNumbers.sort((a, b) => a - b); // Sort range numbers for consistency

//     rangeNumbers.forEach((num) => {
//       let ticketIndex = assigned.findIndex(
//         (count) => count < maxPerRangePerTicket[rangeIndex]
//       );

//       if (ticketIndex !== -1 && !assignedNumbers.has(num)) {
//         tickets[ticketIndex].push(num);
//         assignedNumbers.add(num);
//         assigned[ticketIndex]++;
//       } else {
//         remainingNumbers.push(num); // Store remaining numbers for redistribution
//       }
//     });
//   });

//   // Step 4: Ensure each ticket has exactly 15 numbers
//   let extraNumbers = remainingNumbers.filter(
//     (num) => !assignedNumbers.has(num)
//   );

//   // If a ticket has less than 15 numbers, fill it with extra numbers
//   tickets.forEach((ticket) => {
//     while (ticket.length < 15 && extraNumbers.length > 0) {
//       let num = extraNumbers.pop();
//       if (!ticket.includes(num)) {
//         ticket.push(num);
//         assignedNumbers.add(num);
//       }
//     }
//   });

//   // If some tickets still have < 15 numbers (rare case), pull numbers from tickets with > 15
//   while (tickets.some((ticket) => ticket.length < 15)) {
//     for (let i = 0; i < ticketCount; i++) {
//       let ticket = tickets[i];

//       if (ticket.length < 15) {
//         for (let j = 0; j < ticketCount; j++) {
//           if (tickets[j].length > 15) {
//             let movedNum = tickets[j].pop();
//             ticket.push(movedNum);
//           }
//           if (ticket.length === 15) break;
//         }
//       }
//     }
//   }

//   return tickets.slice(0, 3); // Ensure we only return 3 tickets
