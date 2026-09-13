export function calculateHaversineDistance(
  originLatitude: number,
  originLongitude: number,
  destinationLatitude: number,
  destinationLongitude: number,
): number {
  const earthRadiusInKm = 6371;

  const latitudeDifference = convertDegreesToRadians(
    destinationLatitude - originLatitude,
  );
  const longitudeDifference = convertDegreesToRadians(
    destinationLongitude - originLongitude,
  );

  const haversineFactor =
    Math.sin(latitudeDifference / 2) * Math.sin(latitudeDifference / 2) +
    Math.cos(convertDegreesToRadians(originLatitude)) *
      Math.cos(convertDegreesToRadians(destinationLatitude)) *
      Math.sin(longitudeDifference / 2) *
      Math.sin(longitudeDifference / 2);

  const angularDistance =
    2 * Math.atan2(Math.sqrt(haversineFactor), Math.sqrt(1 - haversineFactor));

  return earthRadiusInKm * angularDistance;
}

function convertDegreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}
