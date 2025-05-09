class Mutex {
  constructor() {
    this.locks = new Map(); // roomId -> release function
  }

  async lock(key, timeout = 10000) {
    // If there's an existing lock, we must wait for it, but we will time out after a certain period.
    const existing = this.locks.get(key) || Promise.resolve();

    let release;
    const nextLock = new Promise((resolve, reject) => {
      release = () => {
        // Only release if it's the correct lock
        if (this.locks.get(key) === release) {
          this.locks.delete(key);
        } else {
          console.error(
            `[Mutex] 🔴 Lock mismatch! Can't release lock for room: ${key}`
          );
        }
        resolve(); // Resolve the release promise
      };
      setTimeout(
        () => reject(new Error("Lock acquisition timed out")),
        timeout
      ); // Timeout for acquiring the lock
    });

    // Store the lock in the map and chain the promises
    this.locks.set(key, release);

    await existing; // Wait for any previous lock to resolve
    return release;
  }
}

export const roomMutex = new Mutex();
