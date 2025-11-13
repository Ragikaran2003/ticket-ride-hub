// ==================== Helper Functions ====================

// ⏱ Add minutes to a given time (HH:mm)
export const addMinutesToTime = (time, minutesToAdd) => {
  if (!time) return '--:--';
  const [hours, minutes] = time.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + Math.round(minutesToAdd);
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMinutes = totalMinutes % 60;
  return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
};

// 🕒 Format time safely (removes seconds/decimals)
export const formatTime = (time) => {
  if (!time) return '--:--';
  const [h, m] = time.split(':').map((v) => parseInt(v.split('.')[0]) || 0);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

// 🚄 Convert distance & speed to time (minutes)
export const calculateTimeToNextStation = (distance, speed) => {
  if (!distance || !speed) return 0;
  return Math.round((distance / speed) * 60);
};

// 🕰️ Calculate total duration between two times
export const calculateTravelDuration = (start, end) => {
  if (!start || !end)
    return { hours: 0, minutes: 0, display: '--:--', totalMinutes: 0 };

  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  let diff = eh * 60 + em - (sh * 60 + sm);
  if (diff < 0) diff += 24 * 60; // overnight travel

  const hours = Math.floor(diff / 60);
  const minutes = diff % 60;
  return { hours, minutes, display: `${hours}h ${minutes}m`, totalMinutes: diff };
};

// Default waiting time (constant)
export const STATION_WAITING_TIME = 10;

// ==================== Main Calculations ====================

// 📍 Calculate arrival/departure times for route stations
export const calculateStationTimes = (startTime, speed, stations) => {
  if (!startTime || !stations?.length) return stations;

  const result = [...stations];
  const trainSpeed = parseFloat(speed) || 60;

  // First station
  result[0] = {
    ...result[0],
    arrivalTime: formatTime(startTime),
    departureTime: formatTime(startTime),
  };

  // Remaining stations
  for (let i = 0; i < result.length - 1; i++) {
    const distance = result[i].distanceToNext || 0;
    if (!distance) continue;

    const travelMinutes = calculateTimeToNextStation(distance, trainSpeed);
    const arrival = addMinutesToTime(result[i].departureTime, travelMinutes);
    const departure = addMinutesToTime(arrival, STATION_WAITING_TIME);

    result[i + 1] = {
      ...result[i + 1],
      arrivalTime: formatTime(arrival),
      departureTime: formatTime(departure),
    };
  }

  return result;
};

// 🧮 Total travel time including waiting
export const calculateTotalTravelTime = (stations, speed) => {
  if (!stations?.length || !speed)
    return { hours: 0, minutes: 0, display: '--:--', totalMinutes: 0 };

  let total = 0;
  for (let i = 0; i < stations.length - 1; i++) {
    const distance = stations[i].distanceToNext || 0;
    if (!distance) continue;

    total += calculateTimeToNextStation(distance, speed);
    if (i < stations.length - 2) total += STATION_WAITING_TIME;
  }

  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return { hours, minutes, display: `${hours}h ${minutes}m`, totalMinutes: total };
};

// 🚆 Calculate times using ACTUAL train route data
export const calculateTrainTimesWithActualData = (train) => {
  if (!train?.complete_route?.length)
    return {
      departureTime: formatTime(train?.start_time),
      arrivalTime: formatTime(train?.start_time),
      travelDuration: { display: '--:--', hours: 0, minutes: 0 },
      travelTime: '--:--',
    };

  const route = train.complete_route;
  const { origin_seq, destination_seq, start_time, speed } = train;

  let currentTime = start_time;

  // Calculate up to origin
  if (origin_seq > 1) {
    for (let i = 0; i < origin_seq - 1; i++) {
      const d = route[i].distance_to_next || 0;
      if (d > 0) currentTime = addMinutesToTime(currentTime, calculateTimeToNextStation(d, speed));
      if (i < origin_seq - 2)
        currentTime = addMinutesToTime(currentTime, STATION_WAITING_TIME);
    }
  }

  const originDeparture = currentTime;
  let destinationArrival = originDeparture;
  let totalMinutes = 0;

  // Calculate from origin → destination
  for (let i = origin_seq - 1; i < destination_seq - 1; i++) {
    const d = route[i].distance_to_next || 0;
    if (d > 0) {
      const t = calculateTimeToNextStation(d, speed);
      destinationArrival = addMinutesToTime(destinationArrival, t);
      totalMinutes += t;
    }
    if (i < destination_seq - 2) {
      destinationArrival = addMinutesToTime(destinationArrival, STATION_WAITING_TIME);
      totalMinutes += STATION_WAITING_TIME;
    }
  }

  const duration = calculateTravelDuration(originDeparture, destinationArrival);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  return {
    departureTime: formatTime(originDeparture),
    arrivalTime: formatTime(addMinutesToTime(destinationArrival, STATION_WAITING_TIME)),
    travelDuration: duration,
    travelTime: `${hours}h ${mins}m`,
  };
};
