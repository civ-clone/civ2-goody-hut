import City from '@civ-clone/core-city/City';
import Tile from '@civ-clone/core-world/Tile';
/**
 * The 45 squares around a city whose fertility the game lowers below 8 (OpenCiv2 `src/auto/city.cpp`
 *  `city_refresh_area_tiles`, the first 45 entries of the city tile offset tables in `src/data/gamedata.cpp`,
 *  richardpenman/civ2@49f26ec), as [Δx, Δy] in Civilization II's coordinates: x counts half squares (each row's squares
 *  are 2 apart, odd rows shifted by 1). The city's 21 squares, then a ring of 24 beyond them.
 */
export declare const cityAreaOffsets: [number, number][];
/** Whether `tile` is one of the 45 squares around `city` (wrapping east to west, as `map_wrap_x` does). */
export declare const inCityArea: (tile: Tile, city: City) => boolean;
export default inCityArea;
