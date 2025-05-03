export const distributeNumbersEqually = (data) => {
  const ticketSize = 15;
  const ticketCount = Math.floor(data.length / ticketSize);
  const totalNeeded = ticketCount * ticketSize;
  const arr = [...data].slice(0, totalNeeded);

  const ranges = [
    [1, 9],
    [10, 19],
    [20, 29],
    [30, 39],
    [40, 49],
    [50, 59],
    [60, 69],
    [70, 79],
    [80, 90],
  ];

  const rangeLimitPerTicket = {
    1: 2,
    2: 4,
    3: 6,
    4: 8,
    5: 10,
    6: 12,
  };
  const maxPerRange = rangeLimitPerTicket[ticketCount] || 12;

  const getRangeIndex = (num) => (num === 90 ? 8 : Math.floor(num / 10));

  // Shuffle the array to randomize distribution
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  const tickets = Array.from({ length: ticketCount }, () => []);
  const ticketSets = Array.from({ length: ticketCount }, () => new Set());
  const rangeCountPerTicket = Array.from({ length: ticketCount }, () =>
    Array(9).fill(0)
  );

  const used = new Set();

  // Phase 1: Try to obey range limits
  for (let number of arr) {
    const rangeIndex = getRangeIndex(number);

    const ticketOrder = Array.from({ length: ticketCount }, (_, i) => i).sort(
      () => Math.random() - 0.5
    );

    for (let t of ticketOrder) {
      if (
        !ticketSets[t].has(number) &&
        tickets[t].length < ticketSize &&
        rangeCountPerTicket[t][rangeIndex] < Math.min(maxPerRange, 3)
      ) {
        tickets[t].push(number);
        ticketSets[t].add(number);
        rangeCountPerTicket[t][rangeIndex]++;
        used.add(number);
        break;
      }
    }
  }

  // Phase 2: Fill underfilled tickets with remaining numbers (ignore range limits now)
  const remaining = arr.filter((n) => !used.has(n));

  for (let t = 0; t < ticketCount; t++) {
    let i = 0;
    while (tickets[t].length < ticketSize && i < remaining.length) {
      const num = remaining[i];
      if (!ticketSets[t].has(num)) {
        tickets[t].push(num);
        ticketSets[t].add(num);
        used.add(num);
      }
      i++;
    }
  }

  // Sort each ticket
  tickets.forEach((ticket) => ticket.sort((a, b) => a - b));

  return tickets;
};

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

      // **Updated column index logic for the new range**
      let colIndex = Math.floor(num / 10);
      if (num === 90) colIndex = 8; // Ensure 90 is placed in the last column

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

  // **Sort each column in ascending order**
  tickets.forEach((ticket) => {
    for (let c = 0; c < 9; c++) {
      let colNumbers = [];
      for (let r = 0; r < 3; r++) {
        if (ticket[r][c] !== null) {
          colNumbers.push(ticket[r][c]);
        }
      }
      colNumbers.sort((a, b) => a - b);

      let index = 0;
      for (let r = 0; r < 3; r++) {
        if (ticket[r][c] !== null) {
          ticket[r][c] = colNumbers[index++];
        }
      }
    }
  });

  return tickets;
};
