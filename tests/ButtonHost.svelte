<script lang="ts">
  import type { Snippet } from 'svelte';

  import Button from '../src/lib/components/Button.svelte';

  /**
   * A caller that binds `Button`'s `element`.
   *
   * The binding is the whole of the file. `bind:` is template syntax and a test
   * file has none, so the one prop a consumer reaches through a template is
   * reached here in the shape a consumer writes it: the shape that carries
   * focus across a swap, which `Modal` says nothing outside the child can catch.
   * What the binding delivered goes back through `received`, which is how the
   * suite asserts on every other callback.
   */
  let {
    children,
    received
  }: {
    children: Snippet;
    received: (element: HTMLButtonElement | undefined) => void;
  } = $props();

  let element = $state<HTMLButtonElement | undefined>(undefined);

  // The binding is written after the button exists, so the report is an effect
  // rather than a line of setup, and the last call is the one that carries it.
  $effect(() => {
    received(element);
  });
</script>

<Button bind:element>{@render children()}</Button>
