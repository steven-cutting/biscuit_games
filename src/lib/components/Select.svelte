<script lang="ts">
  /**
   * A choice from a list too long to draw all of at once.
   *
   * Governed by `Fields` in `docs/specs/operation.allium`, and a native
   * `<select>` because the platform already owes one everything it needs: it is
   * in `app.css`'s 44px floor, `tests/operation.test.ts` measures it there, it
   * takes focus, and the reader's own device draws the list in whatever way that
   * device is best at. `SegmentedControl` is the shape for a few choices worth
   * showing at once; this is the shape for the rest.
   *
   * The label is a real `<label for>` and the description is bound with
   * `aria-describedby`, which is `AFieldIsNamedByALabelBoundToIt` and
   * `AFieldsOwnWordsAreBoundToIt` between them.
   *
   * Its text is `1rem` for the reason `Input`'s is: `config.minimum_field_text_size`
   * is a floor under a field's own text, and `--fs-body` is below it.
   */
  let {
    label,
    description,
    options,
    value,
    onchange
  }: {
    /** The field's name. A real label, bound to the control. */
    label: string;
    /** One short line of consequence, bound to the control. */
    description?: string;
    /** The choices, in the order they are offered. */
    options: readonly { value: string; label: string }[];
    /**
     * Which option is taken. Given none, the first stands taken, because that
     * is what an untouched `<select>` does and nothing here overrides it; taken
     * away after one was given, none is left taken.
     */
    value?: string;
    onchange?: (value: string) => void;
  } = $props();

  /* One call, two ids — `$props.id()` may be used once per component. */
  const uid = $props.id();
  const fieldId = `${uid}-field`;
  const describedById = `${uid}-description`;
</script>

<div class="field">
  <label class="name" for={fieldId}>{label}</label>
  <select
    id={fieldId}
    {value}
    aria-describedby={description === undefined ? undefined : describedById}
    onchange={(event) => onchange?.(event.currentTarget.value)}
  >
    {#each options as option (option.value)}
      <option value={option.value}>{option.label}</option>
    {/each}
  </select>
  {#if description !== undefined}
    <span class="hint" id={describedById}>{description}</span>
  {/if}
</div>

<style>
  .field {
    display: flex;
    flex-direction: column;
    gap: var(--s-3);
  }

  .name {
    color: var(--text);
    font-family: var(--font-ui);
    font-size: var(--fs-body);
  }

  .hint {
    display: flex;
    align-items: center;
    gap: var(--s-2);
    color: var(--text-2);
    font-family: var(--font-ui);
    font-size: var(--fs-small);
    line-height: 1.4;
  }

  select {
    border: var(--rule-w) solid var(--key-untried-rule);
    border-radius: var(--radius-card);
    padding: 0 var(--s-5);
    background: var(--background);
    color: var(--text);
    font-family: var(--font-ui);
    /* `config.minimum_field_text_size`, as in `Input` and for the same reason. */
    font-size: 1rem;
  }
</style>
