// mutex.js

class Mutex {
  constructor() {
    this.locks = new Map(); // roomId -> Promise chain
  }

  async lock(key) {
    const existing = this.locks.get(key) || Promise.resolve();

    let release;
    const nextLock = new Promise((resolve) => {
      release = () => {
        // Only remove if it's the last lock
        if (this.locks.get(key) === nextLock) {
          this.locks.delete(key);
        }
        resolve();
      };
    });

    this.locks.set(
      key,
      existing.then(() => nextLock)
    );
    await existing; // Wait for previous lock to resolve
    return release;
  }
}

export const roomMutex = new Mutex();
