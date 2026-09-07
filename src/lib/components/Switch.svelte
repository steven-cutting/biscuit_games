<script lang="ts">
  /**
   * A setting that is either on or off.
   *
   * Governed by `Fields` in `docs/specs/operation.allium`. The whole `<label>`
   * is the row and the row is the control: `app.css` floors a label wrapping a
   * checkbox at 44px and draws the pressed ring on it, and
   * `EveryControlIsAComfortableTarget` grants the figure to the label that
   * contains the control precisely because the label is what the finger is aimed
   * at. So the name and its line of consequence sit inside the label rather than
   * beside it, which is also what `AFieldIsNamedByALabelBoundToIt` asks for.
   *
   * The track is the checkbox, not a decoration next to one. The design system
   * hides the real control and draws a `<span>` in its place, which would put
   * focus on something a reader cannot see — `app.css`'s `:focus-visible` is
   * drawn where focus lands, and focus lands on the input. `appearance: none`
   * keeps the control real and lets it be the track, so the focus indication
   * arrives without this component asking for one, which is what
   * `FocusIsVisibleWhereverItLands` means by inherited.
   *
   * State is carried three ways and colour is the least of them: the knob's
   * position, the word beside it, and `checked` in the accessibility tree.
   * `AppearanceNeverCarriesMeaningAlone` needs the first two and admits no
   * exemption. The word is `aria-hidden` for the reason `Marker`'s bar is — a
   * reader told "Animations, switch, on" does not need "On" read to them again,
   * and a name that changed as the control was worked would be a different
   * control each time.
   *
   * It sets no `box-shadow`: the ring on the row is `app.css`'s and a component
   * that painted its own would take it away.
   */
  let {
    label,
    description,
    checked = false,
    disabled = false,
    onchange
  }: {
    /** The setting's name. Bound to the control, and the whole of what it is called. */
    label: string;
    /** One short line of consequence. Bound as the control's description. */
    description?: string;
    checked?: boolean;
    disabled?: boolean;
    onchange?: (checked: boolean) => void;
  } = $props();

  /* One call, two ids — `$props.id()` may be used once per component. */
  const uid = $props.id();
  const nameId = `${uid}-name`;
  const describedById = `${uid}-description`;
</script>

<label class="row">
  <span class="words">
    <span class="name" id={nameId}>{label}</span>
    {#if description !== undefined}
      <span class="description" id={describedById}>{description}</span>
    {/if}
  </span>

  <span class="setting">
    <span class="state" aria-hidden="true">{checked ? 'On' : 'Off'}</span>
    <input
      class="track"
      type="checkbox"
      role="switch"
      {checked}
      {disabled}
      aria-labelledby={nameId}
      aria-describedby={description === undefined ? undefined : describedById}
      onchange={(event) => onchange?.(event.currentTarget.checked)}
    />
  </span>
</label>

<style>
  /*
   * `display: flex` overrides the `inline-flex` `app.css` gives every label
   * wrapping a checkbox, because a settings row spans its container rather than
   * sitting in a line of them. The 44px floor and the pressed ring come from
   * that same rule and are not restated here.
   */
  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--s-5);
    inline-size: 100%;
  }

  .words {
    display: flex;
    flex-direction: column;
    gap: var(--s-1);
  }

  .name {
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

  .setting {
    display: inline-flex;
    flex: 0 0 auto;
    align-items: center;
    gap: var(--s-4);
  }

  .state {
    color: var(--text-2);
    font-family: var(--font-ui);
    font-size: var(--fs-small);
    font-variant-numeric: var(--figures-tabular);
    /*
     * Wide enough for the longer of the two words, so the track does not step
     * sideways as the setting is worked. 26px matches no token and is the width
     * of "Off" at `--fs-small`, which is a measurement of the type rather than a
     * step on any scale.
     */
    min-inline-size: 26px;
    text-align: end;
  }

  /*
   * 44 by 26, with an 18px knob inset by 3. The 44 coincides with
   * `operation.allium`'s `config.minimum_touch_target` by value and not by
   * meaning: the target is the row, which `app.css` floors, and this is the
   * width of a drawing. The 2px radius coincides with `--s-1` the same way.
   */
  .track {
    position: relative;
    flex: 0 0 auto;
    inline-size: 44px;
    block-size: 26px;
    margin: 0;
    border: var(--rule-w) solid var(--key-untried-rule);
    border-radius: 2px;
    background: transparent;
    appearance: none;
    transition:
      background-color var(--dur-1) var(--ease),
      border-color var(--dur-1) var(--ease);
  }

  .track::before {
    content: '';
    position: absolute;
    inset-block-start: 3px;
    inset-inline-start: 3px;
    inline-size: 18px;
    block-size: 18px;
    border-radius: 2px;
    background: var(--key-untried-rule);
    transition:
      inset-inline-start var(--dur-1) var(--ease),
      background-color var(--dur-1) var(--ease);
  }

  .track:checked {
    border-color: var(--text);
    background: var(--text);
  }

  .track:checked::before {
    inset-inline-start: 22px;
    background: var(--text-inverse);
  }

  /*
   * `AnUnavailableControlIsExempt`: the dim is how unavailability reads and it is
   * held to none of the figures, while `disabled` keeps saying so in the
   * accessibility tree and the knob keeps saying so by where it sits.
   */
  .track:disabled {
    border-color: var(--rule);
  }

  .track:disabled::before {
    background: var(--rule);
  }

  .row:has(.track:disabled) .name,
  .row:has(.track:disabled) .description,
  .row:has(.track:disabled) .state {
    color: var(--text-disabled);
  }
</style>
