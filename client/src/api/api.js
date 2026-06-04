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

export { getScores }