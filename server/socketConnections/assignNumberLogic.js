export const assignNumbersToPlayers = (players) => {
  const MAX_NUMBER = 90;
  const numbersPool = Array.from({ length: MAX_NUMBER }, (_, i) => i + 1);

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

  players.forEach((player) => {
    player.assign_numbers = [];
    const totalNumbersNeeded = 15 * player.ticket_count;
    const rangeCount = {};

    const maxPerRange =
      {
        1: 2, // Max 2 numbers per range for ticket count = 1
        2: 5, // Max 5 numbers per range for ticket count = 2
        3: 8, // Max 8 numbers per range for ticket count = 3
      }[player.ticket_count] || 8;

    while (player.assign_numbers.length < totalNumbersNeeded) {
      const randomRange = ranges[Math.floor(Math.random() * ranges.length)];
      const start = randomRange[0];
      const end = randomRange[1];

      if (!rangeCount[start]) {
        rangeCount[start] = 0;
      }

      if (rangeCount[start] < maxPerRange) {
        const rangeNumbers = Array.from(
          { length: end - start + 1 },
          (_, i) => start + i
        );

        const availableNumbers = rangeNumbers.filter(
          (num) => !player.assign_numbers.includes(num)
        );

        if (availableNumbers.length > 0) {
          const numberToAdd =
            availableNumbers[
              Math.floor(Math.random() * availableNumbers.length)
            ];

          player.assign_numbers.push(numberToAdd);
          rangeCount[start] += 1;
        }
      }
    }
  });

  const numberFrequency = {};
  players.forEach((player) => {
    player.assign_numbers.forEach((number) => {
      numberFrequency[number] = (numberFrequency[number] || 0) + 1;
    });
  });

  const repeatedNumbers = Object.entries(numberFrequency)
    .filter(([_, count]) => count > 1)
    .map(([number]) => parseInt(number));

  for (let i = repeatedNumbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [repeatedNumbers[i], repeatedNumbers[j]] = [
      repeatedNumbers[j],
      repeatedNumbers[i],
    ];
  }

  const usedNumbers = new Set();
  let poolQueue = [...repeatedNumbers];

  players.forEach((player) => {
    player.assign_numbers = player.assign_numbers.map((number) => {
      if (poolQueue.length > 0 && usedNumbers.has(number)) {
        let newNumber;

        do {
          if (poolQueue.length > 0) {
            newNumber = poolQueue.shift();
          } else {
            const availableNumbers = numbersPool.filter(
              (num) =>
                !usedNumbers.has(num) && !player.assign_numbers.includes(num)
            );
            newNumber =
              availableNumbers.length > 0 ? availableNumbers[0] : number;
          }
        } while (player.assign_numbers.includes(newNumber));

        usedNumbers.add(newNumber);
        return newNumber;
      }

      usedNumbers.add(number);
      return number;
    });
  });

  players.forEach((player) => {
    player.assign_numbers.sort((a, b) => a - b);
  });

  return players;
};
