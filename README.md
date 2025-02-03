# Tambola Multiplayer Game

A realtime Multiplayer game using websocket/MERN

## API Endpoints (Backend)

### User Endpoints

- **Login**: `POST /api/user/login`

  - Request body: `{ name, phoneno, password }`
  - Description: Login with name, phone number, and password.

- **Register**: `POST /api/user/register`

  - Request body: `{ name, phoneno, password }`
  - Description: Register with name, phone number, and password.

- **Find User**: `POST /api/user/find`
  - Request body: `{ userid }` (stored in local storage)
  - Description: Find and receive user data.

### Host Endpoints

- **Login**: `POST /api/host/login`

  - Request body: `{ name, phoneno, password }`
  - Description: Login with name, phone number, and password.

- **Register**: `POST /api/host/register`

  - Request body: `{ name, phoneno, password }`
  - Description: Register with name, phone number, and password.

- **Invite Player**: `POST /api/host/invite`
  - Request body: `{ name: playername, roomid, points }`
  - Description: Invite the player and offer them points which will be deducted from the host.

### Game Endpoints

- **Deduct Points**: `POST /api/game/points`

  - Request body: `{ id, points }` (host/user both acceptable)
  - Description: Deduct points from player data for their ticket.

- **Check Invitation**: `POST /api/game/invited`

  - Request body: `{ name, roomid }` (phone number can be used as primary identifier)
  - Description: Check if the player is invited or not.

- **Check Points Availability**: `POST /api/game/available`

  - Request body: `{ id, ticket }`
  - Description: Check if the points are available to deduct.

- **Get Player Data**: `POST /api/game/player`
  - Request body: `{ id }` (host/user both acceptable)
  - Description: Return player data.

## Environments Variables

PORT=3000

MONGO_URI={databaseURL/Name}
