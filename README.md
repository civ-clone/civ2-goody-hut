# @civ-clone/civ2-goody-hut

What opening a hut gives in Civilization II, the twin of civ1-goody-hut, on the shared goody-hut actions
(`base-goody-hut-*`). civ2-world places the huts; this package decides what happens when one is opened.

- **Who opens one:** a land unit of a civilization. Barbarians, ships and aircraft pass over it.
- **The outcome** (`lib/outcome`): one roll of five, a tribe's city, mercenaries, gold, barbarians or an advance, then
  Civilization II's redirects (OpenCiv2 `unit_enter_hut`). A computer player, or a person one time in three, with
  cities but none on the hut's land mass, gets a tribe's city if it can. Nearer than 4 to a city there are mercenaries
  instead of a city or barbarians. A city needs a fertile square (civ2-world's `fertility`), and a tribe that can't
  found one are nomads (`base-goody-hut-nomads`). There is no advance on turn 0 or once you know Invention, but gold,
  and no nomads once anyone knows Explosives, but gold.
- **What each gives** (`lib/rewards`): 50 gold, or one time in three 25 or 100 by the level, doubled after 1000 AD;
  mercenaries of the best type anyone's advances allow (Horsemen to Riflemen, Archers to Fanatics); the advance at the
  first researchable index from a random one; Settlers with no home city.

## Not yet here

- **Barbarians:** while the game has none (no `Barbarians` rule registered), a hut's barbarians are mercenaries. With
  barbarians, the horde is the barbarians' package's to raise, and Civilization II's early "nothing happens" is too.
- **A tribe's city after 1000 AD** is the size and improvements of any other (size 1, none): Civilization II's is size 1
  to 4 with a Temple and maybe a Marketplace, Granary or Library.
- **Rank:** the game compares a computer player's power rank with the rank of the civilization whose number is the
  worst human's rank; here, with that rank itself.
- **Others on the land mass** are any other civilization's cities and units there, for people and computer players
  alike; the game keeps that record for the computer players.
- The game's random numbers are drawn in its order, but from this game's generator.
