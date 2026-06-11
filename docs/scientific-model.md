# Scientific Model

The scene uses real astronomical relationships where they affect motion, while
normalizing scale and time so the Solar System remains readable and
interactive.

## Physically based data

- planetary orbital periods and eccentricities;
- approximate perihelion directions from JPL orbital elements;
- prograde planetary motion around the Sun;
- sidereal axial rotation periods;
- retrograde axial rotation of Venus;
- approximate axial tilts;
- satellite orbital periods and prograde motion;
- synchronous rotation of the modeled major satellites.

The Sun uses an approximate equatorial rotation period. Its real surface
rotates differentially, so there is no single rotation period for every
latitude.

## Visual normalization

- body radii are enlarged relative to orbital distances;
- Saturn's ring radii are scaled with the planet rather than with orbital
  distances;
- orbital distances are compressed and are not mutually proportional;
- animation time is accelerated;
- satellite animation uses compressed period ratios so fast moons remain
  observable;
- initial orbital phases are chosen for composition rather than calculated for
  the current date;
- orbital inclinations and precession are not modeled yet;
- the texture orientation is illustrative and does not represent the current
  astronomical longitude.

## Direction convention

Prograde motion is counterclockwise when viewed from above the north side of
the Solar System. Three.js uses a positive Y rotation in the opposite visual
direction for objects placed on the positive X axis, so satellite orbit groups
use a negative Y rotation to preserve the astronomical convention.

## Sources

- [JPL approximate positions of the planets](https://ssd.jpl.nasa.gov/planets/approx_pos.html)
- [NASA Mercury facts](https://science.nasa.gov/mercury/facts/)
- [NASA Venus facts](https://science.nasa.gov/venus/venus-facts/)
- [NASA Earth facts](https://science.nasa.gov/earth/facts/)
- [NASA Mars facts](https://science.nasa.gov/mars/facts/)
- [NASA Jupiter facts](https://science.nasa.gov/jupiter/facts/)
- [NASA Jupiter moons](https://science.nasa.gov/jupiter/moons/)
- [NASA Saturn facts](https://science.nasa.gov/saturn/facts/)
- [NASA Titan overview](https://science.nasa.gov/saturn/moons/titan/)
- [NASA Moon facts](https://science.nasa.gov/moon/facts/)
- [NASA Phobos overview](https://science.nasa.gov/mars/moons/phobos/)
- [NASA Deimos overview](https://science.nasa.gov/mars/moons/deimos/)
- [NASA Sun facts](https://science.nasa.gov/sun/facts/)
