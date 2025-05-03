export const assignNumbersToPlayers = (players) => {
  players.forEach((player) => {
    player.assign_numbers = [];
    if (player.ticketCount > 6) {
      player.ticketCount = 6; // Limit to 6 tickets
    }
    const ticketCount = player.ticketCount || 1; // Default to 1 if not provided

    const numbers = assignNumbersToPlayer(ticketCount);

    if (numbers.length > 0) {
      player.assign_numbers = numbers;
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
      3: 2,
      4: 3,
      5: 4,
      6: 5,
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
