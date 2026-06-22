async function getScores() {
    try {
        const response = await fetch('http://localhost:3001/api/games/scores', {
        method: 'GET',
        credentials: 'include'
    })

        if (response.ok) {
            const scores = await response.json()
            return scores
        } else {
            // 4xx or 5xx status code
            throw new Error('HTTP error in getQuestions, code=' + response.status)
        }
    } catch (ex) {
        // handle network errors + parsing errors
        throw new Error("Network error", { cause: ex })
    }
}

async function getStations() {
    try {
        const response = await fetch('http://localhost:3001/api/stations', {
        method: 'GET',
        credentials: 'include'
    })

        if (response.ok) {
            const stations = await response.json()
            return stations
        } else {
            // 4xx or 5xx status code
            throw new Error('HTTP error in getQuestions, code=' + response.status)
        }
    } catch (ex) {
        // handle network errors + parsing errors
        throw new Error("Network error", { cause: ex })
    }
}

async function getConnections() {
    try {
        const response = await fetch('http://localhost:3001/api/connections', {
        method: 'GET',
        credentials: 'include'
    })

        if (response.ok) {
            const connections = await response.json()
            return connections
        } else {
            // 4xx or 5xx status code
            throw new Error('HTTP error in getQuestions, code=' + response.status)
        }
    } catch (ex) {
        // handle network errors + parsing errors
        throw new Error("Network error", { cause: ex })
    }
}

async function getLines() {
    try {
        const response = await fetch('http://localhost:3001/api/lines', {
        method: 'GET',
        credentials: 'include'
    })

        if (response.ok) {
            const lines = await response.json()
            return lines
        } else {
            // 4xx or 5xx status code
            throw new Error('HTTP error in getQuestions, code=' + response.status)
        }
    } catch (ex) {
        // handle network errors + parsing errors
        throw new Error("Network error", { cause: ex })
    }
}

async function setupGame() {
    try {
        const response = await fetch('http://localhost:3001/api/games/setup', {
        method: 'POST',
        credentials: 'include'
    })

        if (response.ok) {
            const gameStations = await response.json()
            return gameStations
        } else {
            // 4xx or 5xx status code
            throw new Error('HTTP error in getQuestions, code=' + response.status)
        }
    } catch (ex) {
        // handle network errors + parsing errors
        throw new Error("Network error", { cause: ex })
    }
}

async function submitRoute(gameId, route) {
    try {
        const response = await fetch(`http://localhost:3001/api/games/${gameId}/route`, {
        method: 'POST',
        body: JSON.stringify({
            route
        }),
        headers: {
                'Content-Type': 'application/json'
            },
        credentials: 'include'
    })

        if (response.ok) {
            const gameResult = await response.json()
            return gameResult
        } else {
            // 4xx or 5xx status code
            throw new Error('HTTP error in getQuestions, code=' + response.status)
        }
    } catch (ex) {
        // handle network errors + parsing errors
        throw new Error("Network error", { cause: ex })
    }
}

export { getScores, getStations, getConnections, getLines, setupGame, submitRoute }