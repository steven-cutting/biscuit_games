#!/bin/sh
# Build the package, install it into a throwaway Vite project, and build that.
#
# Everything else in the gate reads this repository's own tree, where the hub
# imports `src/app.css` by relative path and its components by relative path
# too. Neither exercises the `exports` map, the emitted types, the three
# `@font-face` URLs a consumer resolves from inside `node_modules`, or the
# `?raw` icon imports a consumer's Vite has to resolve from `dist/assets/`. A
# broken export map, or a `files` entry that strips the icons, ships green
# without this.
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
# The scaffolder is installed and then run, rather than reached through `npm create`
# or `npx`. Both of those prompt on stdin before fetching a package they do not
# already have, `--yes` does not suppress that prompt, and a runner has no terminal
# to answer it with: on a cold npx cache the publish hangs until the job times out.
# `npm install` never asks. `--no-interactive` keeps the scaffolder off TTY detection
# entirely. The version is pinned for the same reason everything else here is, but it
# is a version string in a script rather than a locked dependency: nothing installs
# create-vite into this repository, so `just lock-check` cannot see this pin and
# moving it is a deliberate edit here or nothing.
mkdir scaffold
(cd scaffold && npm install --no-save --no-audit --no-fund create-vite@9.2.0 >/dev/null)
./scaffold/node_modules/.bin/create-vite consumer \
    --template svelte-ts --no-interactive --no-immediate >/dev/null
cd consumer
# Stdout is dropped and stderr is not: an install that fails for a reason outside
# this repository has to say so rather than abort the release wordlessly.
npm install >/dev/null
npm install "$tarball" >/dev/null

# A consumer takes the components through the package root and the tokens
# through their own specifier: the barrel deliberately does not import the
# stylesheet, so a component that arrived without it would render unstyled.
# `Icon` is the component whose markup arrives through Vite's `?raw`, which is
# the import shape nothing else in the gate resolves. `Button` is here because
# it is the control a consumer reaches for first, so a consumer that cannot
# compile it has nothing worth installing; the assertions below read the icon
# markup and `Wordmark`'s scoped class, not `Button`'s own styles.
rm -f src/App.svelte
cat > src/App.svelte <<'SVELTE'
<script lang="ts">
  import { Button, Icon, Wordmark } from '@steven-cutting/biscuit-games';
  import '@steven-cutting/biscuit-games/app.css';
</script>

<Wordmark />
<Icon name="check" />
<Button variant="primary">Continue</Button>
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

# The icon markup, which arrives as a string inside the JavaScript rather than
# as a stylesheet or a URL: `icons.js` imports each SVG with Vite's `?raw`, and
# the files it names live under `dist/assets/icons/`. A `files` entry that
# stripped them would fail the consumer's build; a resolver that handed back a
# URL instead of the source would build and render an empty span. Only the
# markup itself proves both.
grep -q 'stroke="currentColor"' dist/assets/*.js || { printf 'the icon markup did not ship\n' >&2; exit 1; }

# One Svelte, deduped against the peer. Two rune runtimes in one bundle fail in
# ways that are traced back here hours later, and `npm ls svelte` alone will not say
# so: it exits 0 for any tree npm calls valid, duplicates included. Count the copies
# on disk instead. `--parseable` prints one path per physical install, collapsing
# every deduped reference, so the consumer's own devDependency and this package's
# peer resolving to the same directory is exactly one line. Zero — what a missing
# peer prints — fails here too.
copies=$(npm ls svelte --all --parseable 2>/dev/null | grep -c '/node_modules/svelte$' | tr -d ' ')
[ "$copies" = 1 ] || { printf 'expected 1 svelte install in the consumer, found %s\n' "$copies" >&2; exit 1; }

npx tsc --noEmit --skipLibCheck || { printf 'the emitted types did not resolve\n' >&2; exit 1; }

printf 'the package installs, builds, and arrives whole.\n'
