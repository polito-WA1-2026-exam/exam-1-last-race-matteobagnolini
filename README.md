# Exam #N: "Exam Title"
## Student: s360263 Bagnolini Matteo 

## React Client Application Routes

- Route `/`: page content and purpose
- Route `/something/:param`: page content and purpose, param specification
- ...

## API Server

### Authentication

- POST `/api/session/login`

    - Description: perform the login of a user.
    - Request body:
    ```json
    {
        "username": "torino_runner",
        "password": "password123!"
    }
    ```
    - Response body:
    ```json
    {
        "userId": "1",
        "username": "torino_runner"
    }
    ```
    - Status codes: `200 OK`, `400 Bad Request`, `401 Unauthorized` , `500 Internal Server Error`

- GET `/api/session/current`
    - Description: return information about the current logged user.
    - Response body:
    ```json
    {
        "userId": "1",
        "username": "torino_runner"
    }
    ```
    - Status codes: `200 OK`, `401 Unauthorized`, `500 Internal Server Error`

- POST `/api/session/logout`
    - Description: logout the current logged user.
    - Status codes: `200 OK`, `401 Unauthorized`, `500 Internal Server Error`

### Stations

- GET `/api/stations`
    - Description: return a list of all available stations
    - Response body:
    ```json
    [
        {
            "stationId": "1",
            "stationName": "Piazza Statuto"
        },
        {
            "stationId": "2",
            "stationName": "Porta Susa"
        }
    ]
    ```
    - Status codes: `200 OK`, `401 Unauthorized`, `500 Internal Server Error`

### Metro Lines

- GET `/api/lines`
    - Description: return a list of all available metro lines
    - Response body:
    ```json
    [
        {
            "lineId": "1",
            "lineName": "Line 1 - Red"
        },
        {
            "lineId": "2",
            "lineName": "Line 2 - Blue"
        }
    ]
    ```
    - Status codes: `200 OK`, `401 Unauthorized`, `500 Internal Server Error`

### Connections

- GET `/api/connections`
    - Description: return a list of connections between any two stations
    - Response body:
    ```json
    [
        {
            "startingStationId": "1",
            "arrivingStationId": "2",
            "metroLineId": "1"
        }
    ]
    ```
    - Status codes: `200 OK`, `401 Unauthorized`, `500 Internal Server Error`

### Route

- POST `/api/route`
    - Description: sends a user created route, which is an ordered list of stations. The response contains if the route is valid/invalid, the final score and an ordered list of the corresponding events.
    - Request body:
    ```json
    [
        {
            "stationId": "1",
        },
        {
            "stationId": "2",
        }
    ]
    ```
    - Response body:
    ```json
    {
        "valid": true,
        "finalScore": 24,
        "events": [
            {
                "eventId": "1",
                "description": "Pickpocketed near Piazza Castello! You lost your emergency stash.",
                "coin": -4
            }
        ]
    }
    ```
    - Status codes: `200 OK`, `400 Bad Request`, `401 Unauthorized`, `500 Internal Server Error`

### Games

- POST `/api/games/setup`
    - Description: setup a new game, returning an object with the starting station and destination station.
    - Response body:
    ```json
    {
        "startingStationId": "1",
        "destinationStationId": "5",
    }
    ```
    - Status codes: `201 Created`, `401 Unauthorized`, `500 Internal Server Error`

- GET `/api/games/scores`
    - Description: returns a list of objects representing the best score for each user.
    - Response body:
    ```json
    [
        { "username": "torino_runner", "bestScore": 24 },
        { "username": "mole_explorer", "bestScore": 0 }
    ]
    ```
    - Status codes: `200 OK`, `401 Unauthorized`, `500 Internal Server Error`

## Database Tables

- Table `users` - contains userId, username, hashedPassword, salt
- Table `stations` - contains stationId, stationName
- Table `metroLines` - contains lineId, lineName
- Table `connections` - contains startingStationId, arrivingStationId, metroLineId
- Table `events` - contains eventId, description, coins
- Table `games` - contains gameId, userId, startingStationId, destinationStationId, status, score 

## Main React Components

- `ListOfSomething` (in `List.js`): component purpose and main functionality
- `GreatButton` (in `GreatButton.js`): component purpose and main functionality
- ...

(only _main_ components, minor ones may be skipped)

## Screenshot

![Screenshot](./img/screenshot.jpg)

## Users Credentials

- torino_runner, password123!
- mole_explorer, password1234!
- piazza_walker, password12345!

## Use of AI Tools
Briefly describe whether you used any AI tools (e.g., ChatGPT, GitHub Copilot, Claude) while working on this project, for which purposes (e.g., clarifying concepts, debugging, generating code), and how you verified or adapted their output.
If you did not use any AI tools, simply state so.
