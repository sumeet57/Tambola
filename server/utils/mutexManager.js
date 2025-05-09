import { roomMutex } from "./mutex.js";

export async function withRoomLock(
  roomId,
  callback,
  { rejectIfBusy = false, timeout = 10000 } = {} // Added timeout option
) {
  if (rejectIfBusy && roomMutex.locks.has(roomId)) {
    return "Room is currently busy"; // Return a message instead of blocking
  }

  const release = await roomMutex.lock(roomId, timeout); // Ensure lock acquisition doesn't block forever

  if (!release) {
    return "Could not acquire lock, try again later"; // Timeout response if lock acquisition fails
  }

  try {
    return await callback();
  } finally {
    release(); // Always release the lock
  }
}
