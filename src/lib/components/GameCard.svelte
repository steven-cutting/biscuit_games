<script lang="ts">
  import Badge from './Badge.svelte';

  /**
   * One game in the platform's list of them.
   *
   * The most hub-shaped component there is, and the one the front door is made
   * of. A game that can be reached is a link; a game that cannot is not a
   * control at all.
   *
   * The two halves are one choice rather than two options, and the props say so:
   * a ready game owes an `href` and a planned one may not carry one. They were
   * independent before, which admitted two cards that say the wrong thing — a
   * ready game with nowhere to go, drawn as an inert card with nothing
   * explaining why, and a planned game handed a URL that is silently dropped.
   * Neither compiles now, which is cheaper than an arm handling each: a state a
   * caller cannot write needs no branch, and a branch nothing reaches is one
   * nothing covers. `reachable` stays a runtime test, because a consumer
   * writing JavaScript is not held to the type and an `<a>` without an `href`
   * is the thing the paragraph below refuses.
   *
   * That second half is where this departs from the design system, and
   * deliberately. The reference draws a planned game as an `<a>` with no `href`,
   * an `aria-disabled` and the light turned down. An anchor without an `href`
   * has no link role, so `aria-disabled` is not an allowed attribute on it and
   * axe judges that at error level; and `Appearance.@guarantee
   * AnUnavailableControlIsExempt` is spent "only while the control genuinely
   * cannot be operated, never on one that is merely quiet". A game nobody has
   * built yet is not a control that has gone quiet. So nothing is dimmed, the
   * words carry the state, and the whole card stays at the text floor.
   *
   * The border is `--key-untried-rule` rather than the reference's `--rule`: a
   * card the reader can follow is a live control, and its boundary owes
   * `minimum_boundary_contrast` against the page, which the decorative rules do
   * not pay in dark.
   *
   * Hover strengthens the rule rather than darkening the ground, which is the
   * other place this departs from the reference and the more interesting one.
   * `--surface-hover` would put this card's quietest ink somewhere it may not be
   * read: `--text-3` reaches 3.60 against it in light standard, against a floor
   * of 4.5, and it is a reading ink for the quiet grounds only. Raising the meta
   * line to `--text-2` would have bought the ground back at the cost of the ink
   * hierarchy the card is built on, so the ground stays and the rule does the
   * work — which is what this design system says elevation is for anyway.
   *
   * It sets no `box-shadow`. A link is one of the two controls `app.css` never
   * takes the platform's own tap flash from, so the acknowledgement
   * `DirectManipulation.@invariant ATouchIsAcknowledged` asks for is the one the
   * browser already draws, and a ring here would be a second cue for a control
   * that never lost its first.
   */
  let {
    name,
    description,
    href,
    status = 'ready',
    meta
  }: {
    /** The game's own name, cased as the caller writes it. */
    name: string;
    /** One plain line about the game. */
    description: string;
    /** A short tabular line — "5 letters, 6 guesses". Drawn only if given. */
    meta?: string;
  } & (
    | {
        /** Whether there is a game there yet. A game that is ready is the default. */
        status?: 'ready';
        /**
         * Where the game is. A ready game owes one, because a card with nowhere
         * to go is not a link and a game that is built and unreachable is a card
         * saying nothing about why.
         *
         * The caller owes a URL a browser can follow as it stands — an absolute
         * address, or a path already resolved against whatever base the site is
         * served from. A packaged component cannot resolve one itself:
         * `$app/paths` is the consumer's module and importing it here would tie
         * this component to SvelteKit. `svelte:element` is also why no lint rule
         * says so any more, which is the reason it is said here.
         */
        href: string;
      }
    | {
        /** Whether there is a game there yet. `planned` says so in words. */
        status: 'planned';
        /** A planned game is not a control, so there is nowhere for it to go. */
        href?: undefined;
      }
  ) = $props();

  const reachable = $derived(status === 'ready' && href !== undefined);
</script>

<!--
  One element whose tag is the distinction, rather than two branches rendering
  the same snippet. A reachable game is an `<a>`; a planned one is a `<div>`,
  which is to say not a control at all.
-->
<svelte:element this={reachable ? 'a' : 'div'} class="card" href={reachable ? href : undefined}>
  <span class="head">
    <span class="name">{name}</span>
    {#if status === 'planned'}
      <Badge>Not built yet</Badge>
    {/if}
  </span>
  <span class="description">{description}</span>
  {#if meta !== undefined}
    <span class="meta">{meta}</span>
  {/if}
</svelte:element>

<style>
  .card {
    display: grid;
    gap: var(--s-4);
    background: var(--surface);
    border: var(--rule-w) solid var(--key-untried-rule);
    border-radius: var(--radius-card);
    padding: var(--s-6);
    color: var(--text);
    text-decoration: none;
  }

  a.card {
    transition: border-color var(--dur-1) var(--ease);
  }

  a.card:hover {
    border-color: var(--text);
  }

  .head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--s-4);
  }

  .name {
    font-family: var(--font-display);
    font-size: var(--fs-title);
    font-weight: 600;
    letter-spacing: var(--track-title);
  }

  .description {
    color: var(--text-2);
    font-family: var(--font-ui);
    font-size: var(--fs-small);
    line-height: 1.5;
  }

  .meta {
    color: var(--text-3);
    font-family: var(--font-ui);
    font-size: var(--fs-micro);
    font-variant-numeric: var(--figures-tabular);
    letter-spacing: var(--track-label);
    text-transform: uppercase;
  }
</style>
