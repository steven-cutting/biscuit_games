#!/bin/sh
# Build the package, install it into a throwaway Vite project, and build that.
#
# Everything else in the gate reads this repository's own tree, where the hub
# imports `src/app.css` by relative path and its components through `$lib`.
# Neither exercises the `exports` map, the emitted types, or the three
# `@font-face` URLs a consumer resolves from inside `node_modules`. A broken
# export map ships green without this.
#
# Needs the network, so `just check` does not run it. It works entirely inside a
# temporary directory and leaves this worktree untouched.
set -eu

root=$(cd "$(dirname "$0")/.." && pwd)
workspace=$(mktemp -d)
trap 'rm -rf "$workspace"' EXIT

printf '==> packing\n'
tarball=$(cd "$root" && npm pack --pack-destination "$workspace" --silent | tail -n 1)
tarball="$workspace/$tarball"
test -f "$tarball" || { printf 'npm pack produced no tarball\n' >&2; exit 1; }

printf '==> scaffolding a consumer\n'
cd "$workspace"
npm create vite@latest consumer -- --template svelte-ts >/dev/null 2>&1
cd consumer
npm install >/dev/null 2>&1
npm install "$tarball" >/dev/null 2>&1

# A consumer takes the components through the package root and the tokens
# through their own specifier: the barrel deliberately does not import the
# stylesheet, so a component that arrived without it would render unstyled.
rm -f src/App.svelte
cat > src/App.svelte <<'SVELTE'
<script lang="ts">
  import { Wordmark } from '@steven-cutting/biscuit-games';
  import '@steven-cutting/biscuit-games/app.css';
</script>

<Wordmark />
SVELTE

printf '==> building\n'
npm run build >/dev/null 2>&1 || { printf 'the consumer build failed\n' >&2; exit 1; }

printf '==> asserting what arrived\n'
css=$(ls dist/assets/*.css)

# Three faces, not two: a missing one means a @font-face URL did not resolve
# from node_modules, which is the failure this whole script exists to catch and
# the one that would otherwise reach a player as a silent system fallback.
faces=$(find dist/assets -name '*.woff2' | wc -l | tr -d ' ')
[ "$faces" = 3 ] || { printf 'expected 3 typefaces in the build, found %s\n' "$faces" >&2; exit 1; }

grep -q -- '--brand-warm' "$css" || { printf 'the token vocabulary did not ship\n' >&2; exit 1; }
grep -q '@font-face' "$css" || { printf 'the @font-face blocks did not ship\n' >&2; exit 1; }

# The component's scoped styles. Their absence is what a wrong `sideEffects`
# would produce, and it fails silently: the wordmark renders, unstyled.
grep -q '\.lockup' "$css" || { printf "the component's scoped styles were dropped\n" >&2; exit 1; }

# One Svelte, deduped against the peer. Two rune runtimes in one bundle fail in
# ways that are traced back here hours later.
npm ls svelte >/dev/null 2>&1 || { printf 'the svelte peer did not dedupe\n' >&2; exit 1; }

npx tsc --noEmit --skipLibCheck || { printf 'the emitted types did not resolve\n' >&2; exit 1; }

printf 'the package installs, builds, and arrives whole.\n'
