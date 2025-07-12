export const assignNumbersToPlayers = (players) => {
  players.forEach((player) => {
    if (player.ticketCount != 0) {
      player.assign_numbers = [];
      if (player.ticketCount > 6) {
        player.ticketCount = 6; // Limit to 6 tickets
      }
      const ticketCount = player.ticketCount || 1; // Default to 1 if not provided

      const numbers = assignNumbersToPlayer(ticketCount);

      if (numbers.length > 0) {
        player.assign_numbers = numbers;
      }
    }
  });

  function assignNumbersToPlayer(ticketCount) {
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

    const totalNeeded = 15 * ticketCount;

    const maxDuplicateMap = {
      1: 0,
      2: 0,
      3: 3,
      4: 5,
      5: 6,
      6: 8,
    };

    const maxDuplicates = maxDuplicateMap[ticketCount] ?? 0;

    const playerNumbers = [];
    const numberFreq = {};
    const rangeUsage = new Map();

    const basePerRange = Math.floor(totalNeeded / ranges.length);
    let extra = totalNeeded % ranges.length;

    const perRangeCount = ranges.map(() => {
      const count = basePerRange + (extra > 0 ? 1 : 0);
      extra--;
      return count;
    });

    for (let i = 0; i < ranges.length; i++) {
      const [start, end] = ranges[i];
      const count = perRangeCount[i];

      const rangeNumbers = Array.from(
        { length: end - start + 1 },
        (_, j) => start + j
      );
      let attempts = 0;

      while ((rangeUsage.get(start) || 0) < count && attempts < 200) {
        const num =
          rangeNumbers[Math.floor(Math.random() * rangeNumbers.length)];
        const freq = numberFreq[num] || 0;

        if (maxDuplicates === 0) {
          if (freq > 0) {
            attempts++;
            continue;
          }
        } else {
          const duplicateCount = Object.values(numberFreq).filter(
            (f) => f === 2
          ).length;

          if (freq >= 2) {
            attempts++;
            continue;
          }

          if (freq === 1 && duplicateCount >= maxDuplicates) {
            attempts++;
            continue;
          }
        }

        playerNumbers.push(num);
        numberFreq[num] = freq + 1;
        rangeUsage.set(start, (rangeUsage.get(start) || 0) + 1);
      }
    }

    return playerNumbers.sort((a, b) => a - b);
  }

  return players;
};

import { readFile } from "fs/promises";

export const assignTickets = async (players) => {
  try {
    // Load tickets from tickets.json
    const ticketsData = await readFile("tickets.json", "utf8");
    const tickets = JSON.parse(ticketsData);
    if (tickets.length < 1000) {
      throw new Error("tickets.json must contain 1,000 tickets");
    }

    // Track used ticket indices (1 to 1000) for the session
    const usedIndices = new Set();

    // Calculate total tickets needed
    const totalTicketsNeeded = players.reduce(
      (sum, player) => sum + player.ticketCount,
      0
    );
    if (totalTicketsNeeded > 1000) {
      throw new Error(
        `Requested ${totalTicketsNeeded} tickets, but only 1,000 available`
      );
    }
    if (totalTicketsNeeded > 600) {
      throw new Error(
        `Requested ${totalTicketsNeeded} tickets, but session limit is 600`
      );
    }

    // Assign tickets to each player
    for (let player of players) {
      // player.assignedNumber = {};
      player.assign_numbers = {};
      const maxAttempts = 100;

      if (player.ticketCount > 6) {
        player.ticketCount = 6; // Limit to 6 tickets
      }
      if (player.ticketCount == 0) {
        continue; // Skip players with no tickets
      }

      for (let i = 1; i <= player.ticketCount; i++) {
        let attempts = 0;
        let ticketIndex;

        // Find an unused ticket index
        while (attempts < maxAttempts) {
          ticketIndex = Math.floor(Math.random() * 1000); // 0 to 999
          if (!usedIndices.has(ticketIndex)) {
            usedIndices.add(ticketIndex);
            break;
          }
          attempts++;
          if (attempts === maxAttempts) {
            throw new Error(
              `Failed to find unused ticket for player after ${maxAttempts} attempts`
            );
          }
        }

        // Assign the ticket's 3x9 grid to assignedNumber
        // player.assign_numbers = []
        player.assign_numbers[`${i}`] = tickets[ticketIndex].ticket;
      }
    }

    return players;
  } catch (error) {
    throw new Error(`Error assigning tickets: ${error.message}`);
  }
};
