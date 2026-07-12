# Private Live2D asset mount

Model binaries, textures, sounds, character artwork, and Live2D Cubism Core are
not distributed in this repository. Put assets that you are licensed to use in
`private-assets/live2d/`; Docker Compose mounts that directory at
`/app/public/live2d` at runtime.

Expected paths for the default registry are:

```text
private-assets/live2d/
  core/live2dcubismcore.min.js
  atri/atri_8.model3.json
  companions/murasame/Murasame.model3.json
  companions/allium/ariu/ariu.model3.json
```

You may instead update `lib/live2d/characterRegistry.ts` and
`lib/companions/companionRegistry.ts` to reference your own model layout. Only
use original, commissioned, or explicitly licensed web assets. The UI falls
back to a static companion state when model loading fails.
