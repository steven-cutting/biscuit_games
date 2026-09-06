<script lang="ts">
  import Explainer from '../src/lib/components/Explainer.svelte';
  import Tile from '../src/lib/components/Tile.svelte';

  /**
   * A caller for `Explainer`, because its rows pair a snippet with a sentence
   * and a `.ts` file cannot write a snippet. The words here are one game's, which
   * is the point: the component supplies the shape and never a sentence.
   *
   * The two sentences are props so that a test can hand in the same one twice.
   * Nothing requires a game's sentences to differ, and the list was once keyed by
   * them.
   */
  let {
    first = 'Correct — right letter, right place. Marker bar.',
    second = 'Present — right letter, wrong place. Shorter marker bar.'
  }: { first?: string; second?: string } = $props();
</script>

{#snippet exact()}
  <Tile content="C" mark={{ name: 'exact', description: 'correct' }} />
{/snippet}
{#snippet present()}
  <Tile content="R" mark={{ name: 'present', description: 'in the word, wrong place' }} />
{/snippet}

<Explainer
  rows={[
    { show: exact, says: first },
    { show: present, says: second }
  ]}
>
  <p>Guess the word in 6 attempts.</p>
  {#snippet footnote()}
    <p>Your statistics are saved in this browser.</p>
  {/snippet}
</Explainer>
