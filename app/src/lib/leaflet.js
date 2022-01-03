export function getBounds(languages) {
  const locations = Object.values(languages).map((v) => v.location);
  return [
    [
      Math.min(...locations.map((v) => v[0])),
      Math.min(...locations.map((v) => v[1])),
    ],
    [
      Math.max(...locations.map((v) => v[0])),
      Math.max(...locations.map((v) => v[1])),
    ],
  ];
}
