export const assignNumbersToPlayers = (players) => {
  // Step 1: Assign random numbers to players
  const MAX_NUMBER = 90;
  const numbersPool = Array.from({ length: MAX_NUMBER }, (_, i) => i + 1);

  players.forEach((player) => {
    player.assign_numbers = [];
    const totalNumbersNeeded = 15 * player.ticket_count;

    while (player.assign_numbers.length < totalNumbersNeeded) {
      const randomIndex = Math.floor(Math.random() * numbersPool.length);
      const randomNumber = numbersPool[randomIndex];

      // validating the random number (uniuqe number)
      if (!player.assign_numbers.includes(randomNumber)) {
        player.assign_numbers.push(randomNumber);
      }
    }
  });

  // Step 2: Find repeated numbers across all the players
  // bacially we are finding the frequency of each number in numberFrequency object
  const numberFrequency = {};
  players.forEach((player) => {
    player.assign_numbers.forEach((number) => {
      numberFrequency[number] = (numberFrequency[number] || 0) + 1;
    });
  });

  // this willl give the repeating number which repeated more than 1 times
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
  const poolQueue = [...repeatedNumbers];

  players.forEach((player) => {
    player.assign_numbers = player.assign_numbers.map((number) => {
      if (poolQueue.length > 0 && usedNumbers.has(number)) {
        const newNumber = poolQueue.shift();
        usedNumbers.add(newNumber);
        return newNumber;
      }
      usedNumbers.add(number);
      return number;
    });
  });

  return players;
};
