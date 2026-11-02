<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Engineering notes

- Hero particle shatter is piece-based: `ParticleSim` (src/game/particle-sim.ts) splits the
  surface into ~16 Voronoi shards (nearest-seed clustering) that fly off and tumble rigidly,
  with a 25% dust minority shedding off. Keep feel tuning in the `FEEL` constants; the scene
  layer only reads `sim.pos` each frame.
