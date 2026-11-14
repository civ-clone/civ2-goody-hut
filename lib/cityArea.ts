import City from '@civ-clone/core-city/City';
import Tile from '@civ-clone/core-world/Tile';

/**
 * The 45 squares around a city whose fertility the game lowers below 8 (OpenCiv2 `src/auto/city.cpp`
 *  `city_refresh_area_tiles`, the first 45 entries of the city tile offset tables in `src/data/gamedata.cpp`,
 *  richardpenman/civ2@49f26ec), as [Δx, Δy] in Civilization II's coordinates: x counts half squares (each row's squares
 *  are 2 apart, odd rows shifted by 1). The city's 21 squares, then a ring of 24 beyond them.
 */
export const cityAreaOffsets: [number, number][] = [
  [1, -1],
  [2, 0],
  [1, 1],
  [0, 2],
  [-1, 1],
  [-2, 0],
  [-1, -1],
  [0, -2],
  [2, -2],
  [2, 2],
  [-2, 2],
  [-2, -2],
  [1, -3],
  [3, -1],
  [3, 1],
  [1, 3],
  [-1, 3],
  [-3, 1],
  [-3, -1],
  [-1, -3],
  [0, 0],
  [4, 0],
  [-4, 0],
  [0, 4],
  [0, -4],
  [1, -5],
  [2, -4],
  [3, -3],
  [4, -2],
  [5, -1],
  [5, 1],
  [4, 2],
  [3, 3],
  [2, 4],
  [1, 5],
  [-1, 5],
  [-2, 4],
  [-3, 3],
  [-4, 2],
  [-5, 1],
  [-5, -1],
  [-4, -2],
  [-3, -3],
  [-2, -4],
  [-1, -5],
];

const offsets = new Set(cityAreaOffsets.map(([dx, dy]) => `${dx},${dy}`));

/** Whether `tile` is one of the 45 squares around `city` (wrapping east to west, as `map_wrap_x` does). */
export const inCityArea = (tile: Tile, city: City): boolean => {
  const centre = city.tile(),
    width = 2 * tile.map().width();
  let dx = 2 * tile.x() + (tile.y() & 1) - (2 * centre.x() + (centre.y() & 1));

  if (dx > width / 2) {
    dx -= width;
  }

  if (dx < -width / 2) {
    dx += width;
  }

  return offsets.has(`${dx},${tile.y() - centre.y()}`);
};

export default inCityArea;
