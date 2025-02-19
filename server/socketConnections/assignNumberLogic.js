export const assignNumbersToPlayers = (players) => {
  const MAX_NUMBER = 90;
  const numbersPool = Array.from({ length: MAX_NUMBER }, (_, i) => i + 1);

  const ranges = [
    [1, 10],
    [11, 20],
    [21, 30],
    [31, 40],
    [41, 50],
    [51, 60],
    [61, 70],
    [71, 80],
    [81, 90],
  ];

  players.forEach((player) => {
    player.assign_numbers = [];
    const totalNumbersNeeded = 15 * player.ticket_count;
    const rangeCount = {};

    while (player.assign_numbers.length < totalNumbersNeeded) {
      const randomRange = ranges[Math.floor(Math.random() * ranges.length)];
      const start = randomRange[0];
      const end = randomRange[1];

      if (!rangeCount[start]) {
        rangeCount[start] = 0;
      }

      if (rangeCount[start] < 8) {
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
