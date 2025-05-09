import { roomMutex } from "./mutex.js";

export async function withRoomLock(roomId, callback) {
  const release = await roomMutex.lock(roomId); // acquire lock
  try {
    return await callback(); // run protected logic
  } finally {
    release(); // release lock
  }
}
