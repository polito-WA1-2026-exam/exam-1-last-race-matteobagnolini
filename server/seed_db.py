import sqlite3

def populate_database(db_name="last_race.db"):
    # Connect to SQLite (this creates the file if it doesn't exist)
    conn = sqlite3.connect(db_name)
    cursor = conn.cursor()

    # 1. Create Tables
    print("Creating tables...")
    cursor.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            userId INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            hashedPassword TEXT NOT NULL,
            salt TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS stations (
            stationId INTEGER PRIMARY KEY AUTOINCREMENT,
            stationName TEXT UNIQUE NOT NULL
        );

        CREATE TABLE IF NOT EXISTS metroLines (
            lineId INTEGER PRIMARY KEY AUTOINCREMENT,
            lineName TEXT UNIQUE NOT NULL
        );

        CREATE TABLE IF NOT EXISTS connections (
            startingStationId INTEGER,
            arrivingStationId INTEGER,
            metroLinedId INTEGER,
            FOREIGN KEY(startingStationId) REFERENCES stations(stationId),
            FOREIGN KEY(arrivingStationId) REFERENCES stations(stationId),
            FOREIGN KEY(metroLinedId) REFERENCES metroLines(lineId)
        );

        CREATE TABLE IF NOT EXISTS events (
            eventId INTEGER PRIMARY KEY AUTOINCREMENT,
            description TEXT NOT NULL,
            coins INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS games (
            gameId INTEGER PRIMARY KEY AUTOINCREMENT,
            score INTEGER NOT NULL,
            userId INTEGER,
            FOREIGN KEY(userId) REFERENCES users(userId)
        );
    """)

    # 2. Define the Network Data
    stations = [
        "Piazza Statuto", "Porta Susa", "Piazza Castello", "Porta Nuova", "Lingotto",
        "Parco Pellerina", "Campidoglio", "Mole Antonelliana", "Vanchiglia",
        "Stadio Olimpico", "Politecnico", "Crocetta", "Parco del Valentino",
        "Mirafiori", "Quadrilatero Romano", "Gran Madre"
    ]

    lines = [
        ("Line 1 - Red", ["Piazza Statuto", "Porta Susa", "Piazza Castello", "Porta Nuova", "Lingotto"]),
        ("Line 2 - Blue", ["Parco Pellerina", "Campidoglio", "Porta Susa", "Piazza Castello", "Mole Antonelliana", "Vanchiglia"]),
        ("Line 3 - Green", ["Stadio Olimpico", "Politecnico", "Crocetta", "Porta Nuova", "Parco del Valentino"]),
        ("Line 4 - Yellow", ["Mirafiori", "Politecnico", "Quadrilatero Romano", "Piazza Castello", "Gran Madre"])
    ]

    # 3. Insert Stations
    print("Populating stations...")
    cursor.executemany(
        "INSERT OR IGNORE INTO stations (stationName) VALUES (?)", 
        [(station,) for station in stations]
    )

    # Fetch station IDs into a dictionary for easy connection mapping
    cursor.execute("SELECT stationName, stationId FROM stations")
    station_map = dict(cursor.fetchall())

    # 4. Insert Lines and Connections
    print("Populating lines and connections...")
    for line_name, station_sequence in lines:
        # Insert the line
        cursor.execute("INSERT OR IGNORE INTO metroLines (lineName) VALUES (?)", (line_name,))
        
        # Get the line ID
        cursor.execute("SELECT lineId FROM metroLines WHERE lineName = ?", (line_name,))
        line_id = cursor.fetchone()[0]

        # Create connections (Bidirectional: A->B and B->A)
        for i in range(len(station_sequence) - 1):
            station_a = station_sequence[i]
            station_b = station_sequence[i + 1]
            
            id_a = station_map[station_a]
            id_b = station_map[station_b]

            # Insert Forward Direction
            cursor.execute("""
                INSERT INTO connections (startingStationId, arrivingStationId, metroLinedId) 
                VALUES (?, ?, ?)
            """, (id_a, id_b, line_id))

            # Insert Reverse Direction
            cursor.execute("""
                INSERT INTO connections (startingStationId, arrivingStationId, metroLinedId) 
                VALUES (?, ?, ?)
            """, (id_b, id_a, line_id))

    # 5. Insert Events
    
    events_data = [
        ("Pickpocketed near Piazza Castello! You lost your emergency stash.", -4),
        ("Sciopero (Transit Strike)! You had to buy an expensive surface taxi.", -3),
        ("Ticket Inspector! Fumbled to find your pass and got a minor fine.", -2),
        ("Doors closed in your face. Missed the train and dropped some change.", -1),
        ("Quiet journey. You enjoyed the view of the Alps as you surfaced.", 0),
        ("Found a dropped coin while waiting at the Lingotto platform.", 1),
        ("Helped a tourist find the Mole Antonelliana. They gave you a tip!", 2),
        ("Juventus won! Cheering crowds dropped spare change in the rush.", 3),
        ("Returned a lost wallet at Porta Susa. You received a generous reward!", 4),
        ("Buskers playing local folk music. You feel inspired and energized.", 1),
        ("Wrong platform. You had to pay an exit fare to switch sides.", -2),
        ("Perfect timing! You caught the train right as the doors opened.", 2)
    ]

    print("Populating events...")
    cursor.executemany(
        "INSERT INTO events (description, coins) VALUES (?, ?)", 
        events_data
    )
    
    # 5. Insert Users (At least 3 users)
    print("Populating users...")
    users_data = [
        ("torino_runner", "f9e8ea94aa1c655ecb413c67a418c46c9849f3eb0f0c5d493adae662e78175d1a8b63ae2dc925084acc4132d3e247092c86b7d269a586e72eb53bdabb52a33c8", "fc36a591fcdc5b3c"),
        ("mole_explorer", "659f837c314fd0ca2d014b30601e4d99c36e48aaef45ceeb31af1f6884139c8ba2b45101d62932b91a61db9ceb4645a54d6ed1d9606fd4ffc671bf29913351dc", "2bccaf5de0e56826"),
        ("piazza_walker", "8cb24c3e59efb43ac1eb023f37d22256abf2438b87e4a89b9bee5e3d40f383e1cda2d7cbeec51f8e25a071f5db09a7be5c5a3992f62901c12f672e04c0667368", "06366098eca19f57")
    ]
    
    cursor.executemany(
        "INSERT OR IGNORE INTO users (username, hashedPassword, salt) VALUES (?, ?, ?)", 
        users_data
    )

    # Fetch user IDs dynamically to associate them with games correctly
    cursor.execute("SELECT username, userId FROM users")
    user_map = dict(cursor.fetchall())

    # 6. Insert Games (At least 2 of the registered users have played)
    print("Populating games...")
    games_data = [
        # 'torino_runner' plays 2 games
        (10, user_map["torino_runner"]),
        (24, user_map["torino_runner"]),
        
        # 'mole_explorer' plays 1 game
        (0, user_map["mole_explorer"])
        
        # 'piazza_walker' hasn't played any games yet
    ]

    cursor.executemany(
        "INSERT INTO games (score, userId) VALUES (?, ?)", 
        games_data
    )

    # Commit and close
    conn.commit()
    conn.close()
    print(f"Database successfully populated at {db_name}!")

if __name__ == "__main__":
    populate_database()