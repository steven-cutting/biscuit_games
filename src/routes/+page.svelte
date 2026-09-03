<script lang="ts">
  import Wordmark from '$lib/components/Wordmark.svelte';

  /*
   * The front door. One page, deliberately: the hub is a skeleton while the
   * design system it owns is the thing worth having. See decision 0011.
   *
   * Every selector below names an element rather than a class, because
   * `svelte-check --fail-on-warnings` turns an unused selector into a failed
   * gate and an element selector cannot go stale.
   */
</script>

<svelte:head>
  <title>Biscuit Games</title>
  <meta
    name="description"
    content="Small, exacting games that run in your browser. No accounts, no telemetry, nothing kept anywhere else."
  />
</svelte:head>

<main>
  <h1><Wordmark /></h1>

  <p>
    Small, exacting games that run in your browser. No accounts, no telemetry, and nothing kept
    anywhere else.
  </p>

  <h2>The games</h2>

  <ul role="list">
    <li>
      <a href="https://pnut.fans/poodl/">Poodl</a> — an unlimited-play word game. Guess a five-letter
      word in six attempts, then play again.
    </li>
  </ul>
</main>

<style>
  main {
    max-inline-size: var(--shell-max);
    margin-inline: auto;
    padding: var(--s-8) var(--shell-pad) var(--s-11);
    color: var(--text);
    font-family: var(--font-ui);
  }

  h1 {
    margin: 0;
    padding-block-end: var(--s-5);
    border-block-end: var(--rule-w) solid var(--rule);
    font-size: inherit;
    font-weight: inherit;
  }

  p {
    margin-block: var(--s-6) 0;
    color: var(--text-2);
    line-height: 1.5;
  }

  h2 {
    margin-block: var(--s-8) 0;
    color: var(--text-3);
    font-family: var(--font-ui);
    font-size: var(--fs-mono-label);
    font-weight: 600;
    letter-spacing: var(--track-label);
    text-transform: uppercase;
  }

  /*
   * `role="list"` on the element above is what keeps this a list. WebKit drops
   * list semantics from a `<ul>` whose markers are removed, so VoiceOver would
   * stop announcing the games as a collection; the role restores what the markup
   * already said. It is redundant only where the marker survives, which is why
   * it sits beside the declaration that removes it.
   */
  ul {
    margin-block: var(--s-4) 0;
    padding: 0;
    list-style: none;
  }

  li {
    padding-block: var(--s-4);
    border-block-end: var(--rule-w) solid var(--rule);
    line-height: 1.5;
  }

  a {
    color: var(--text);
    font-weight: 600;
  }
</style>
