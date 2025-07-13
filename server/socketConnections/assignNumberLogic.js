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

    // Initialize array of available set indices (1 to 1000)
    const availableSetIndices = Array.from({ length: 1000 }, (_, i) => i + 1);

    // Calculate total sets needed
    const totalSetsNeeded = players.length;
    if (totalSetsNeeded > 999) {
      throw new Error("Too many players, only 999 tickets available");
    }

    // Assign tickets to each player
    for (let player of players) {
      player.assign_numbers = {};
      if (player.ticketCount > 6) {
        player.ticketCount = 6; // Limit to 6 tickets
      }
      if (player.ticketCount == 0) {
        continue; // Skip players with no tickets
      }

      // Select a random set index from available indices
      if (availableSetIndices.length === 0) {
        throw new Error("No available sets remaining for assignment");
      }
      const randomIndex = Math.floor(
        Math.random() * availableSetIndices.length
      );
      const ticketIndex = availableSetIndices[randomIndex];
      availableSetIndices.splice(randomIndex, 1); // Remove the used index

      const ticketSet = tickets[ticketIndex];
      for (let i = 0; i < player.ticketCount; i++) {
        player.assign_numbers[i + 1] = ticketSet[i];
      }
    }

    return players;
  } catch (error) {
    throw new Error(`Error assigning tickets: ${error.message}`);
  }
};
