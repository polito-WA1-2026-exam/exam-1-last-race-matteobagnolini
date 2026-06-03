import sqlite3 from 'sqlite3';
import crypto from 'crypto';
import { User, Station, Line, Connection, Event, Game } from './models.js';

// Open the database
const db = new sqlite3.Database('last_race.db', (err) => {
  if (err) {
    console.error('Error opening database', err);
  } else {
    console.log('Database connected');
  }
});

// Users DAO

/**
 * Retrieves a user from the database by their username and verifies their password.
 * @param {string} username - The username of the user.
 * @param {string} password - The plaintext password to verify.
 * @returns {Promise<User|boolean>} A Promise that resolves to the User object if found and password is correct, false if not found or incorrect password, or rejects with an error.
 */
export const getUser = (username, password) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM users WHERE username = ?';
    db.get(sql, [username], (err, row) => {
      if (err) { 
        reject(err); 
      }
      else if (row === undefined) { 
        resolve(false); 
      }
      else {
        const user = new User(row.userId, row.username);
        const salt = row.salt;
        crypto.scrypt(password, salt, 64, (err, hashedPassword) => {
          if (err) reject(err);
          if(!crypto.timingSafeEqual(Buffer.from(row.hashedPassword, 'hex'), hashedPassword))
            resolve(false);
          else resolve(user);
        });
      }
    });
  });
};

/**
 * Retrieves a user from the database by their username.
 * @param {string} username - The username of the user to retrieve.
 * @returns {Promise<User|boolean>} A Promise that resolves to the User object if found, false if not found, or rejects with an error.
 */
export const getUserByUsername = (username) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM users WHERE username = ?';
    db.get(sql, [username], (err, row) => {
      if (err) {
        reject(err);
      } else if (row === undefined) {
        resolve(false);
      } else {
        const user = new User(row.userId, row.username, row.hashedPassword, row.salt);
        resolve(user);
      }
    });
  });
};

/**
 * Retrieves a user from the database by their user ID.
 * @param {number|string} id - The ID of the user to retrieve.
 * @returns {Promise<User|boolean>} A Promise that resolves to the User object if found, false if not found, or rejects with an error.
 */
export const getUserById = (id) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM users WHERE userId = ?';
    db.get(sql, [id], (err, row) => {
      if (err) {
        reject(err);
      } else if (row === undefined) {
        resolve(false);
      } else {
        const user = new User(row.userId, row.username, row.hashedPassword, row.salt);
        resolve(user);
      }
    });
  });
};

// Stations DAO

/**
 * Retrieves all available stations from the database.
 * @returns {Promise<Station[]>} A Promise that resolves to an array of Station objects, or rejects with an error.
 */
export const getStations = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM stations';
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        const stations = rows.map((row) => new Station(row.stationId, row.stationName));
        resolve(stations);
      }
    });
  });
};

// Lines DAO

/**
 * Retrieves all available metro lines from the database.
 * @returns {Promise<Line[]>} A Promise that resolves to an array of Line objects, or rejects with an error.
 */
export const getLines = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM metroLines';
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        const lines = rows.map((row) => new Line(row.lineId, row.lineName));
        resolve(lines);
      }
    });
  });
};

// Connections DAO

/**
 * Retrieves all available connections between stations.
 * @returns {Promise<Connection[]>} A Promise that resolves to an array of Connection objects, or rejects with an error.
 */
export const getConnections = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM connections';
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        const connections = rows.map((row) => new Connection(row.startingStationId, row.arrivingStationId, row.metroLineId));
        resolve(connections);
      }
    });
  });
};

// Games DAO

/**
 * Creates a new game entry in the database.
 * @param {number} userId - The ID of the user creating the game.
 * @param {number} startingStationId - The ID of the starting station.
 * @param {number} destinationStationId - The ID of the destination station.
 * @returns {Promise<number>} A Promise that resolves to the ID of the newly created game, or rejects with an error.
 */
export const createGame = (userId, startingStationId, destinationStationId) => {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO games (userId, startingStationId, destinationStationId, status, score) VALUES (?, ?, ?, ?, ?)';
    db.run(sql, [userId, startingStationId, destinationStationId, 'pending', 0], function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.lastID);
      }
    });
  });
};

/**
 * Retrieves a specific game by its ID.
 * @param {number|string} gameId - The ID of the game to retrieve.
 * @returns {Promise<Game|boolean>} A Promise that resolves to the Game object if found, false if not found, or rejects with an error.
 */
export const getGame = (gameId) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM games WHERE gameId = ?';
    db.get(sql, [gameId], (err, row) => {
      if (err) {
        reject(err);
      } else if (row === undefined) {
        resolve(false);
      } else {
        const game = new Game(row.gameId, row.userId, row.startingStationId, row.destinationStationId, row.status, row.score);
        resolve(game);
      }
    });
  });
};

/**
 * Updates an existing game with a new status and score.
 * @param {number|string} gameId - The ID of the game to update.
 * @param {string} status - The new status of the game (e.g., 'completed').
 * @param {number} score - The final score of the game.
 * @returns {Promise<number>} A Promise that resolves to the number of rows changed, or rejects with an error.
 */
export const updateGame = (gameId, status, score) => {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE games SET status = ?, score = ? WHERE gameId = ?';
    db.run(sql, [status, score, gameId], function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.changes);
      }
    });
  });
};

// Scores DAO

/**
 * Retrieves a list of the best scores for all users who have completed games.
 * @returns {Promise<Object[]>} A Promise that resolves to an array of objects containing 'username' and 'bestScore', sorted in descending order by score.
 */
export const getBestScores = () => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT users.username, MAX(games.score) as bestScore
      FROM games
      JOIN users ON games.userId = users.userId
      WHERE games.status = 'completed'
      GROUP BY users.userId
      ORDER BY bestScore DESC
    `;
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows.map(row => ({ username: row.username, bestScore: row.bestScore })));
      }
    });
  });
};

// Events DAO

/**
 * Retrieves all available random events from the database.
 * @returns {Promise<Event[]>} A Promise that resolves to an array of Event objects, or rejects with an error.
 */
export const getEvents = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM events';
    db.all(sql, [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        const events = rows.map((row) => new Event(row.eventId, row.description, row.coins));
        resolve(events);
      }
    });
  });
};
