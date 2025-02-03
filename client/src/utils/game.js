export const distributeNumbersEqually = (data) => {
  let receivedNumbers = [...new Set(data)]; // Remove duplicates

  const ticketCount = Math.min(3, Math.floor(receivedNumbers.length / 15));
  if (ticketCount < 1) return [];

  const ranges = Array.from({ length: 9 }, () => []); // Create 9 empty buckets for number ranges

  // Step 1: Categorize numbers into their respective ranges
  receivedNumbers.forEach((num) => {
    let rangeIndex = Math.floor((num - 1) / 10);
    ranges[rangeIndex].push(num);
  });

  // Step 2: Distribute numbers across tickets, ensuring at most 3 per range per ticket
  const tickets = Array.from({ length: ticketCount }, () => []);

  let remainingNumbers = [];

  ranges.forEach((rangeNumbers) => {
    rangeNumbers.sort((a, b) => a - b);

    let assignedCount = 0;
    let ticketIndex = 0;

    rangeNumbers.forEach((num) => {
      if (assignedCount >= 3 * ticketCount) {
        remainingNumbers.push(num);
        return;
      }

      if (
        tickets[ticketIndex].length < 15 &&
        tickets[ticketIndex].filter(
          (n) => Math.floor((n - 1) / 10) === Math.floor((num - 1) / 10)
        ).length < 3
      ) {
        tickets[ticketIndex].push(num);
        assignedCount++;
      }

      ticketIndex = (ticketIndex + 1) % ticketCount;
    });
  });

  // Step 3: Fill missing numbers (if any)
  let index = 0;
  tickets.forEach((ticket) => {
    while (ticket.length < 15 && index < remainingNumbers.length) {
      let num = remainingNumbers[index++];
      let rangeCount = ticket.filter(
        (n) => Math.floor((n - 1) / 10) === Math.floor((num - 1) / 10)
      ).length;

      if (rangeCount < 3 && !ticket.includes(num)) {
        ticket.push(num);
      }
    }
  });

  // If tickets are still missing numbers, add any remaining numbers to ensure exactly 15 numbers per ticket
  index = 0;
  tickets.forEach((ticket) => {
    while (ticket.length < 15 && index < receivedNumbers.length) {
      let num = receivedNumbers[index++];
      let rangeCount = ticket.filter(
        (n) => Math.floor((n - 1) / 10) === Math.floor((num - 1) / 10)
      ).length;

      if (rangeCount < 3 && !ticket.includes(num)) {
        ticket.push(num);
      }
    }
  });

  return tickets;
};

export const generateTambolaTicket = (numbers) => {
  if (!Array.isArray(numbers)) {
    throw new Error("Input to generateTambolaTicket must be an array");
  }

  let ticket = Array.from({ length: 3 }, () => Array(9).fill(null));
  let columns = Array.from({ length: 9 }, () => []);

  numbers.forEach((num) => {
    if (typeof num !== "number") {
      throw new Error("All elements in the ticket array must be numbers");
    }
    let colIndex = Math.floor((num - 1) / 10);
    if (colIndex >= 0 && colIndex < columns.length) {
      if (columns[colIndex].length < 3) {
        columns[colIndex].push(num);
      }
    }
  });

  columns.forEach((col) => col.sort((a, b) => a - b));

  let rowCounts = [0, 0, 0]; // To track the number of numbers in each row
  let rowColumnCount = Array.from({ length: 3 }, () => Array(9).fill(0)); // To prevent row overflow in columns

  for (let c = 0; c < 9; c++) {
    let colNumbers = [...columns[c]];
    for (let i = 0; i < colNumbers.length; i++) {
      let availableRows = rowCounts
        .map((count, row) => ({ row, count }))
        .filter(({ row }) => rowCounts[row] < 5 && rowColumnCount[row][c] === 0) // Ensure 5 numbers per row, 1 per column
        .sort((a, b) => a.count - b.count);

      if (availableRows.length === 0) continue;

      let row = availableRows[0].row;
      ticket[row][c] = colNumbers[i];
      rowCounts[row]++;
      rowColumnCount[row][c] = 1;
    }
  }

  // If a row has less than 5 numbers, fill remaining slots
  for (let r = 0; r < 3; r++) {
    let availableCols = [];
    for (let c = 0; c < 9; c++) {
      if (ticket[r][c] === null) availableCols.push(c);
    }

    while (rowCounts[r] < 5 && availableCols.length > 0) {
      let colToFill = availableCols.splice(
        Math.floor(Math.random() * availableCols.length),
        1
      )[0];

      let possibleNumbers = columns[colToFill].filter(
        (num) => !ticket.flat().includes(num)
      );

      if (possibleNumbers.length > 0) {
        ticket[r][colToFill] = possibleNumbers[0];
        rowCounts[r]++;
      }
    }
  }

  return ticket;
};
