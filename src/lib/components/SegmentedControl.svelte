<script lang="ts">
  /**
   * A few exclusive choices, all of them visible at once.
   *
   * Governed by `Fields.@guarantee AGroupOfExclusiveChoicesIsOneStopAndArrowsMoveWithinIt`,
   * and built out of native radios in a `<fieldset>` for exactly that reason.
   * The design system draws buttons wearing `role="radio"` and implements
   * neither half of the clause: every segment is its own tab stop and no arrow
   * key does anything, which is a group a reader can reach and cannot move
   * inside. A radio group is one stop and the arrows move within it because the
   * browser does it, so the guarantee is answered by the markup rather than by
   * a keydown handler that has to be got right.
   *
   * Each radio fills its own segment rather than being hidden behind one. A
   * hidden input takes focus somewhere the reader cannot see it, and
   * `FocusIsVisibleWhereverItLands` asks for an indication a control inherits:
   * `appearance: none` over the whole cell keeps the control real, so
   * `app.css`'s `:focus-visible` traces the segment without this component
   * drawing anything.
   *
   * The taken choice is not taken by colour alone. It carries `checked` in the
   * accessibility tree and a heavier weight in the ink, which is `Button`'s
   * `current` idiom and the same reason it has one — and both are read off one
   * value, because they are two tellings of the same thing. A radio moves the
   * moment it is clicked and `value` written one way is only rewritten when the
   * caller moves it, so a caller that wrote nothing back left the group
   * reporting the new choice and inking the old one. `taken` starts as `value`
   * and follows it whenever the caller moves it; between those, it is the
   * choice the reader made.
   *
   * The `<legend>` names the group and the description is bound to the fieldset,
   * so a reader arriving at any segment hears what the group is for.
   */
  let {
    label,
    description,
    options,
    value,
    onchange
  }: {
    /** What the group of choices is called. Its `<legend>`. */
    label: string;
    /** One short line of consequence, bound to the group. */
    description?: string;
    /** The choices, in the order they are drawn. Values are unique within the group. */
    options: readonly { value: string; label: string }[];
    /** Which one is taken. A value matching no option leaves none taken. */
    value?: string;
    onchange?: (value: string) => void;
  } = $props();

  /*
   * One call, two names derived from it — `$props.id()` may be used once per
   * component. Radios agree on being exclusive by sharing a `name`, so two
   * groups on one page must not share theirs: the id is unique per instance,
   * which is what a caller cannot be asked to supply and what a hard-coded name
   * would break the moment a settings sheet held two of these.
   */
  const uid = $props.id();
  const describedById = `${uid}-description`;
  const group = `${uid}-group`;

  /*
   * Which choice the group is showing. A `$derived` rather than a `$state`
   * seeded from the prop: it recomputes whenever `value` moves, so the caller
   * stays in charge without an effect copying one into the other.
   */
  let taken = $derived(value);
</script>

<fieldset aria-describedby={description === undefined ? undefined : describedById}>
  <legend>{label}</legend>
  {#if description !== undefined}
    <span class="description" id={describedById}>{description}</span>
  {/if}

  <span class="segments">
    {#each options as option (option.value)}
      <label class="segment" class:current={option.value === taken}>
        <input
          type="radio"
          name={group}
          value={option.value}
          checked={option.value === taken}
          onchange={() => {
            taken = option.value;
            onchange?.(option.value);
          }}
        />
        <span class="word">{option.label}</span>
      </label>
    {/each}
  </span>
</fieldset>

<style>
  fieldset {
    display: flex;
    flex-direction: column;
    gap: var(--s-3);
    min-inline-size: 0;
    margin: 0;
    border: 0;
    padding: 0;
  }

  legend {
    padding: 0;
    color: var(--text);
    font-family: var(--font-ui);
    font-size: var(--fs-body);
  }

  .description {
    color: var(--text-2);
    font-family: var(--font-ui);
    font-size: var(--fs-small);
    line-height: 1.4;
  }

  .segments {
    /*
     * The corner an end segment turns: the row's own, less the rule it sits
     * inside. Stated once here and inherited, because two literals a pixel
     * apart drift and this one is a subtraction rather than a figure.
     */
    --segment-radius: calc(var(--radius-card) - var(--rule-w));

    display: inline-flex;
    align-self: start;
    border: var(--rule-w) solid var(--key-untried-rule);
    border-radius: var(--radius-card);
  }

  /*
   * The end segments turn their own corners, and this row deliberately does not
   * clip. `overflow: hidden` is the one-line way to round a strip of fills and
   * was what this had, until a focus ring landed on it: the radio fills its
   * segment exactly, so `app.css`'s `outline-offset: 2px` puts the entire ring
   * outside the row's padding box and the clip ate all of it except the slivers
   * overlapping a neighbour — which read as another divider rather than as
   * focus. `Operation.@guarantee FocusIsVisibleWhereverItLands` is not
   * something a corner is worth. The radio takes the same corners as its
   * segment so the ring traces the shape the reader sees.
   */
  .segment:first-child,
  .segment:first-child input {
    border-start-start-radius: var(--segment-radius);
    border-end-start-radius: var(--segment-radius);
  }

  .segment:last-child,
  .segment:last-child input {
    border-start-end-radius: var(--segment-radius);
    border-end-end-radius: var(--segment-radius);
  }

  /*
   * `display: flex` over the `inline-flex` `app.css` gives a label wrapping a
   * radio, so a segment fills its share of the row; the 44px floor and the
   * pressed ring come from that same rule and are not restated. `position` is
   * what lets the radio cover the cell.
   */
  .segment {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    /*
     * `EveryControlIsAComfortableTarget` asks for the figure in both directions.
     * `app.css` declares only the one down the page, and says why: an on-screen
     * key is the shape that cannot have it across, so a global floor would be a
     * fight `Keyboard` has to lose. A segment is not that shape and has no
     * exemption, so it takes the figure here. 44px is
     * `config.minimum_touch_target` by meaning rather than by coincidence, which
     * is what keeps it a figure rather than a step on the spacing scale — the
     * padding alone leaves a one-letter word 40px across, which is a group
     * worded "S M L" failing a clause a group worded "System Light Dark"
     * passes.
     */
    min-inline-size: 44px;
    padding: 0 var(--s-6);
    color: var(--text-2);
    font-family: var(--font-ui);
    font-size: var(--fs-small);
    transition:
      background-color var(--dur-1) var(--ease),
      color var(--dur-1) var(--ease);
  }

  .segment + .segment {
    border-inline-start: var(--rule-w) solid var(--key-untried-rule);
  }

  /*
   * The control itself, filling its segment and painting nothing. Focus is drawn
   * on it by `app.css`, which is why it is the size of the thing a reader is
   * looking at rather than a pixel parked behind it.
   */
  .segment input {
    position: absolute;
    inset: 0;
    margin: 0;
    border: 0;
    background: transparent;
    appearance: none;
  }

  .word {
    position: relative;
    pointer-events: none;
  }

  /* Never the fill alone: the weight moves with it, and `checked` says so. */
  .current {
    background: var(--text);
    color: var(--text-inverse);
    font-weight: 600;
  }
</style>
