import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import session from 'express-session';

// Import DAO functions
import * as dao from './dao.js';
import * as gameService from './gameService.js';

// Initialize the Express app
const app = express();
const port = 3001;

// Middlewares
app.use(express.json());
app.use(morgan('dev'));

// CORS setup
const corsOptions = {
  origin: 'http://localhost:5173',
  optionsSuccessState: 200,
  credentials: true
};
app.use(cors(corsOptions));

// Passport Local Strategy for Authentication
passport.use(new LocalStrategy(async function verify(username, password, cb) {
  try {
    const user = await dao.getUser(username, password);
    if (!user) {
      return cb(null, false, { message: 'Incorrect username or password.' });
    }
    return cb(null, user);
  } catch (err) {
    return cb(err);
  }
}));

passport.serializeUser((user, cb) => {
  cb(null, user);
});

passport.deserializeUser((user, cb) => {
  return cb(null, user);
});

// Session setup
app.use(session({
  secret: "last-race-secret",
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.authenticate('session'));

// Custom middleware to check if user is logged in
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: 'Not authorized' });
};

/* ========================================================================= */
/*                               API ROUTES                                  */
/* ========================================================================= */

// --- Authentication ---

// POST /api/session/login
app.post('/api/session/login', passport.authenticate('local'), (req, res) => {
  // If we reach here, authentication succeeded
  res.status(200).json({ userId: req.user.id, username: req.user.username });
});

// GET /api/session/current
app.get('/api/session/current', isLoggedIn, (req, res) => {
  res.status(200).json({ userId: req.user.id, username: req.user.username });
});

// DELETE /api/session/logout
app.delete('/api/session/logout', isLoggedIn, (req, res) => {
  req.logout(() => {
    res.status(200).end();
  });
});

// --- Stations, Lines, Connections ---

// GET /api/stations
app.get('/api/stations', isLoggedIn, async (req, res) => {
  try {
    const stations = await dao.getStations();
    res.status(200).json(stations);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve stations' });
  }
});

// GET /api/lines
app.get('/api/lines', isLoggedIn, async (req, res) => {
  try {
    const lines = await dao.getLines();
    res.status(200).json(lines);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve lines' });
  }
});

// GET /api/connections
app.get('/api/connections', isLoggedIn, async (req, res) => {
  try {
    const connections = await dao.getConnections();
    res.status(200).json(connections);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve connections' });
  }
});

// --- Games ---

// POST /api/games/setup
app.post('/api/games/setup', isLoggedIn, async (req, res) => {
  try {
    const stations = await dao.getStations();
    const connections = await dao.getConnections();
    const { startingStationId, destinationStationId } = await gameService.setupGame(stations, connections);
    const gameId = await dao.createGame(req.user.id, startingStationId, destinationStationId);
    const gameData = { gameId: gameId, startingStationId: startingStationId, destinationStationId: destinationStationId }
    res.status(201).json(gameData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Failed to setup game' });
  }
});

// POST /api/games/:gameId/route
app.post('/api/games/:gameId/route', isLoggedIn, async (req, res) => {
  try {
    const gameId = req.params.gameId;
    const route = req.body;

    if (!Array.isArray(route) || route.length < 2) {
      await dao.updateGame(gameId, 'completed', 0);
      return res.status(400).json({ error: 'Invalid route format.' });
    }

    const game = await dao.getGame(gameId);
    
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    if (game.userId !== req.user.id) {
      return res.status(404).json({ error: 'Game not found for current user' });
    }

    if (game.status !== 'pending') {
      return res.status(400).json({ error: 'Game is already completed' });
    }

    const connections = await dao.getConnections();
    const availableEvents = await dao.getEvents();
    const evaluationRes = gameService.evaluateRoute(game, connections, availableEvents, route);

    const isValid = evaluationRes.valid;
    const finalScore = evaluationRes.finalScore;
    const triggeredEvents = evaluationRes.events;

    await dao.updateGame(gameId, 'completed', finalScore);

    res.status(200).json({
      valid: isValid,
      finalScore: finalScore,
      events: triggeredEvents,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process route' });
  }
});

// GET /api/games/scores
app.get('/api/games/scores', isLoggedIn, async (req, res) => {
  try {
    const scores = await dao.getBestScores();
    res.status(200).json(scores);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve scores' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
