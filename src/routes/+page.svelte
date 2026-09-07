<script lang="ts">
  import CardLabel from '$lib/components/CardLabel.svelte';
  import GameCard from '$lib/components/GameCard.svelte';
  import HeaderBar from '$lib/components/HeaderBar.svelte';

  /*
   * The front door. One page, deliberately: decision 0011's one-route shape
   * stands, and decision 0017 is why the page now renders the platform's own
   * components instead of describing them. A hub whose front page did not use
   * the design system it holds was the arrangement decision 0001 exists to end,
   * one storey up from where decision 0014 found it.
   *
   * `HeaderBar` sets no padding of its own, so the route supplies the gutter and
   * the two share one column.
   *
   * `HeaderBar` carries the page's `<h1>` — it draws the lockup as the heading
   * itself — so there is no heading here, and `CardLabel` is the `<h2>` beneath
   * it. Two `<h1>`s is what this page had for about a minute.
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

<div class="page">
  <HeaderBar />

  <main>
    <p>
      Small, exacting games that run in your browser. No accounts, no telemetry, and nothing kept
      anywhere else.
    </p>

    <CardLabel>The games</CardLabel>

    <!--
      `role="list"` is what keeps this a list. WebKit drops list semantics from a
      `<ul>` whose markers are removed, so VoiceOver would stop announcing the
      games as a collection; the role restores what the markup already said. It
      is redundant only where the marker survives, which is why it sits beside
      the declaration that removes it.
    -->
    <ul role="list">
      <li>
        <GameCard
          name="poodl"
          description="An unlimited-play word game. Guess a five-letter word in six attempts, then play again."
          href="https://pnut.fans/poodl/"
          meta="5 letters, 6 guesses"
        />
      </li>
      <li>
        <GameCard name="pawjong" description="A tile-matching game." status="planned" />
      </li>
    </ul>
  </main>
</div>

<style>
  /*
   * The header and the page share one column. `HeaderBar` sets no padding of its
   * own — it is chrome a game frames for itself — so the gutter is here, and the
   * rule it draws stops where the content does rather than running to the edges
   * of a screen the content never reaches.
   */
  .page {
    max-inline-size: var(--shell-max);
    margin-inline: auto;
    padding-inline: var(--shell-pad);
  }

  main {
    padding-block: var(--s-8) var(--s-11);
    color: var(--text);
    font-family: var(--font-ui);
  }

  p {
    margin-block: 0 var(--s-8);
    color: var(--text-2);
    line-height: 1.5;
  }

  ul {
    display: grid;
    gap: var(--s-5);
    margin-block: var(--s-5) 0;
    padding: 0;
    list-style: none;
  }
</style>
