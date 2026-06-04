export function User(id, username) {
  this.id = id;
  this.username = username;
}

export function Station(id, name) {
  this.stationId = id;
  this.stationName = name;
}

export function Line(id, name) {
  this.lineId = id;
  this.lineName = name;
}

export function Connection(startingStationId, arrivingStationId, metroLineId) {
  this.startingStationId = startingStationId;
  this.arrivingStationId = arrivingStationId;
  this.metroLineId = metroLineId;
}

export function Event(id, description, coins) {
  this.eventId = id;
  this.description = description;
  this.coins = coins;
}

export function Game(id, userId, startingStationId, destinationStationId, status, score) {
  this.id = id;
  this.userId = userId;
  this.startingStationId = startingStationId;
  this.destinationStationId = destinationStationId;
  this.status = status;
  this.score = score;
}
