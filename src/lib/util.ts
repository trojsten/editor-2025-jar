export function getRandomValue<T>(values: T[]): T {
  return Array.from(values)[Math.floor(Math.random() * values.length)];
}

export function getRandomKey<K, T>(map: Map<K, T>): K {
  return Array.from(map.keys())[Math.floor(Math.random() * map.size)];
}

export function getRandomItem<K, T>(map: Map<K, T>): T {
  return Array.from(map.values())[Math.floor(Math.random() * map.size)];
}
