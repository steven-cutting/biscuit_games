<script lang="ts">
  import Icon from './Icon.svelte';

  /**
   * A single line of text the reader writes.
   *
   * Governed by `Fields` in `docs/specs/operation.allium`. The label is a real
   * `<label for>`, and the placeholder is never the name: a placeholder is gone
   * the moment the reader types, so a name carried there disappears exactly when
   * the field is in use — which is what `AFieldIsNamedByALabelBoundToIt` says
   * and why both may be given at once.
   *
   * `hint` is bound with `aria-describedby`, so the line under the field reaches
   * a reader who arrived at the field without seeing the page. It carries both
   * the helper and the refusal, because they are the same line saying different
   * things and a field with two of them would say one of them to nobody.
   *
   * A refusal is reported rather than only drawn. `aria-invalid` is the report,
   * the sentence is the words, and the glyph beside it is the shape — three
   * tellings, none of them a colour, because there is no error ink here to
   * reach for. That is deliberate: this design system has no destructive variant
   * either, and a red that existed only for this would be a state carried by hue
   * in a palette that has spent none on one. The rule thickens instead.
   *
   * The field sets `font-size: 1rem`. That figure is
   * `operation.allium`'s `config.minimum_field_text_size`, mirrored in
   * `src/lib/config.ts`, and it is not `--fs-body`: that token is 0.9375rem, and
   * `app.css`'s `font: inherit` only reaches the 16px body when nothing between
   * sets a size — a field inside anything that sets `--fs-body` would be 15px
   * and a mobile browser would magnify the page on focus.
   * `stories/Input.stories.svelte` measures the rendered figure, because jsdom's
   * own default input font is already 16px and an assertion there would pass
   * whether or not any of this were true.
   */
  let {
    label,
    hint,
    invalid = false,
    value = '',
    placeholder,
    oninput
  }: {
    /** The field's name. A real label, bound to the control. */
    label: string;
    /** The helper line, or the sentence saying what the field will not take. */
    hint?: string;
    /** Whether the field is being refused. Reported, not only inked. */
    invalid?: boolean;
    value?: string;
    /** A hint about the shape of an answer. Never the name. */
    placeholder?: string;
    oninput?: (value: string) => void;
  } = $props();

  /*
   * One call and two ids derived from it: `$props.id()` may be used once per
   * component, and a field with a bound hint needs to name two elements.
   */
  const uid = $props.id();
  const fieldId = `${uid}-field`;
  const hintId = `${uid}-hint`;
</script>

<div class="field">
  <label class="name" for={fieldId}>{label}</label>
  <input
    id={fieldId}
    type="text"
    {value}
    {placeholder}
    aria-invalid={invalid ? 'true' : undefined}
    aria-describedby={hint === undefined ? undefined : hintId}
    oninput={(event) => oninput?.(event.currentTarget.value)}
  />
  {#if hint !== undefined}
    <span class="hint" id={hintId}>
      {#if invalid}
        <Icon name="circle-alert" size={16} />
      {/if}
      {hint}
    </span>
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

  input {
    border: var(--rule-w) solid var(--key-untried-rule);
    border-radius: var(--radius-card);
    padding: 0 var(--s-5);
    background: var(--background);
    color: var(--text);
    font-family: var(--font-ui);
    /*
     * `config.minimum_field_text_size` in rem, and a literal on purpose: it
     * coincides with no token — `--fs-body` is 0.9375rem — and it is a floor a
     * specification states rather than a step on the type scale.
     */
    font-size: 1rem;
  }

  /* The rule thickens; the glyph and the sentence carry the rest. */
  input[aria-invalid='true'] {
    border-width: var(--rule-w-strong);
  }
</style>
