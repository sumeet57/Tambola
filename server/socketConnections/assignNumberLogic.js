export const assignNumbersToPlayers = (players) => {
  const MAX_NUMBER = 90;
  const numbersPool = Array.from({ length: MAX_NUMBER }, (_, i) => i + 1);

  // Step 1: Assign random numbers to players
  players.forEach((player) => {
    player.assign_numbers = [];
    const totalNumbersNeeded = 15 * player.ticket_count;

    while (player.assign_numbers.length < totalNumbersNeeded) {
      const randomIndex = Math.floor(Math.random() * numbersPool.length);
      const randomNumber = numbersPool[randomIndex];

      // Ensure unique numbers within the same player
      if (!player.assign_numbers.includes(randomNumber)) {
        player.assign_numbers.push(randomNumber);
      }
    }
  });

  // Step 2: Find repeated numbers across players
  const numberFrequency = {};
  players.forEach((player) => {
    player.assign_numbers.forEach((number) => {
      numberFrequency[number] = (numberFrequency[number] || 0) + 1;
    });
  });

  const repeatedNumbers = Object.entries(numberFrequency)
    .filter(([_, count]) => count > 1)
    .map(([number]) => parseInt(number));

  // Step 3: Shuffle the repeated numbers
  for (let i = repeatedNumbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [repeatedNumbers[i], repeatedNumbers[j]] = [
      repeatedNumbers[j],
      repeatedNumbers[i],
    ];
  }

  // Step 4: Redistribute repeated numbers
  const usedNumbers = new Set();
  let poolQueue = [...repeatedNumbers];

  players.forEach((player) => {
    player.assign_numbers = player.assign_numbers.map((number) => {
      if (poolQueue.length > 0 && usedNumbers.has(number)) {
        let newNumber;

        do {
          if (poolQueue.length > 0) {
            newNumber = poolQueue.shift(); // Try getting a number from the shuffled pool
          } else {
            // If poolQueue is empty, find a number from numbersPool that is not in player's numbers
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

  // Step 5: Sort each player's numbers for better readability
  players.forEach((player) => {
    player.assign_numbers.sort((a, b) => a - b);
  });

  return players;
};
