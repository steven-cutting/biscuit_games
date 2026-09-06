<script lang="ts">
  import Explainer from '../src/lib/components/Explainer.svelte';
  import Tile from '../src/lib/components/Tile.svelte';

  /**
   * A caller for `Explainer`, because its rows pair a snippet with a sentence
   * and a `.ts` file cannot write a snippet. The words here are one game's, which
   * is the point: the component supplies the shape and never a sentence.
   */
</script>

{#snippet exact()}
  <Tile content="C" mark={{ name: 'exact', description: 'correct' }} />
{/snippet}
{#snippet present()}
  <Tile content="R" mark={{ name: 'present', description: 'in the word, wrong place' }} />
{/snippet}

<Explainer
  rows={[
    { show: exact, says: 'Correct — right letter, right place. Marker bar.' },
    { show: present, says: 'Present — right letter, wrong place. Shorter marker bar.' }
  ]}
>
  <p>Guess the word in 6 attempts.</p>
  {#snippet footnote()}
    <p>Your statistics are saved in this browser.</p>
  {/snippet}
</Explainer>
