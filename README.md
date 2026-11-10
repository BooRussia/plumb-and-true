# Plumb & True

An interactive 3D field guide to hanging doors, built with Three.js.

**Live site:** https://boorussia.github.io/plumb-and-true/

Ten door types, each with a step-by-step 3D install, troubleshooting simulations with live gap readings, and a myth quiz:

- Prehung interior, exterior inswing, exterior outswing, double (French), slab in an existing jamb
- Sliding glass patio, bypass closet, pocket, barn, bifold

## Build

The site is a single `index.html` assembled from the files in `src/`:

```sh
sh build.sh
```

No dependencies to install. Three.js loads from cdnjs and the fonts from Google Fonts.
