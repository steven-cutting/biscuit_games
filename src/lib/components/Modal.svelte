<script lang="ts">
  import type { Snippet } from 'svelte';

  import IconButton from './IconButton.svelte';

  /**
   * The shell a dialog sits in.
   *
   * A dialog owes the keyboard three things, and this is where all three are
   * made true once for every panel a product builds on it: the dialog takes
   * focus when it opens, Escape closes it, and Tab cycles inside rather than
   * wandering out to the page behind.
   *
   * All three depend on focus staying inside the panel, because the handler is
   * on the panel. A child that removes the control the reader just used leaves
   * focus on the body, and from there Escape reaches nothing and Tab walks the
   * page the dialog has declared hidden. There is no catching that from here:
   * removing a focused element fires no `focusout` for a handler to answer. So
   * a child that swaps a control carries focus across its own swap, which is
   * what `Button`'s bindable `element` is for.
   *
   * Close sits in the header row, which makes it the dialog's first tab stop:
   * the way out is the first thing the keyboard meets. A caller that supplies
   * no `onclose` gets no control that pretends otherwise, and no Escape.
   *
   * The cycling works out which of a caller's controls the keyboard really stops
   * on rather than trusting a selector to say, because the two differ: a radio
   * group is one stop and not one per radio, and a control the layout does not
   * draw is no stop at all. A match of either kind standing last is a Tab that
   * leaves the dialog.
   *
   * `footer` is where a caller's actions go — rule-separated from the body, so
   * a dialog reads as content and then commitment. Optional, because most
   * panels have no action row.
   *
   * Not a native `<dialog>`. jsdom implements neither `showModal` nor `close`,
   * so a component built on it could not be tested where the rest of the suite
   * runs — and an untestable accessible shell is the wrong trade when the
   * behaviour it provides is this small.
   *
   * `document.activeElement` is read directly rather than through a port. It
   * is focus management on the component's own document, not a platform side
   * effect of the kind invariant 3 puts behind one — storage, a clock, the
   * device's preferences — and jsdom implements focus, so the tests drive the
   * real thing rather than a fake. Decision 0014 records the call.
   * `getComputedStyle` is read the same way and on the same grounds: it asks
   * this document what it is drawing, and jsdom resolves the cascade, so the
   * tests drive that too.
   */
  let {
    title,
    onclose,
    children,
    footer
  }: { title: string; onclose?: () => void; children?: Snippet; footer?: Snippet } = $props();

  const titleId = $props.id();

  /*
   * A selector is not the sequential focus order, and the trap needs the order:
   * it wraps only when focus is on the panel's first stop or its last, so a
   * match the keyboard never visits standing at either end means the wrap never
   * fires and the Tab it was there to catch walks out to the page the dialog
   * has declared hidden. What `querySelectorAll` returns is therefore a first
   * pass, narrowed by `tabbable` below rather than trusted.
   *
   * `:disabled` rather than `[disabled]` is the part of that the selector can
   * do for itself: the pseudo-class holds for a control inside a disabled
   * `fieldset` as well as one carrying the attribute, and the keyboard reaches
   * neither.
   *
   * Three of these are not form controls and are stops all the same. A
   * disclosure's own summary and an editable region are ordinary content the
   * browser puts in the tab order; a hidden input is the mirror of both, a
   * control the markup has and the tab order does not, which is why `input`
   * asks not to be one.
   *
   * Two families are left out on purpose. `iframe`, `object`, `embed` and
   * `area[href]` are stops only when something else is true of them — a nested
   * document, a loaded plugin, an image map some image uses — so matching one
   * would put at the end of the list something `focus()` cannot move to, which
   * is the failure the hidden input used to be. And `audio[controls]` and
   * `video[controls]` are stops a browser makes unconditionally, yet nothing
   * that runs here reaches one: user-event walks a list of its own and media is
   * not on it, in the workshop's Chromium as much as in jsdom. They wait for a
   * dialog that needs a player, and for whatever would prove it.
   *
   * One case stays wrong. A `<details>` the caller wrote no `<summary>` for is
   * a stop nothing here can match, its summary being the browser's rather than
   * the document's.
   */
  const FOCUSABLE = [
    'a[href]',
    'button:not(:disabled)',
    'input:not(:disabled):not([type="hidden"])',
    'select:not(:disabled)',
    'textarea:not(:disabled)',
    'details > summary:first-of-type',
    '[contenteditable]:not([contenteditable="false"])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(', ');

  function isRadio(stop: HTMLElement): stop is HTMLInputElement {
    return stop instanceof HTMLInputElement && stop.type === 'radio';
  }

  /*
   * The radios of one group are a single stop between them: the keyboard visits
   * the checked member, or the first of them when none is checked, and passes
   * over the rest. A group is the radios sharing a form owner and a name, which
   * is why the name is asked for first — radios with no name are not a group,
   * each is a stop of its own, and collapsing them would strand every one after
   * the first.
   *
   * `checked` is the property rather than the attribute because the attribute
   * says what the markup arrived with, and this has to answer for the choice
   * the reader has just made.
   *
   * The form owner is half of what makes a group because the HTML specification
   * says so, and no gate here can hold that half: both suites drive
   * `@testing-library/user-event`, which computes the next stop itself rather
   * than pressing Tab, and scopes a group by name alone. Two forms holding a
   * group of one name are two groups to a browser and one to it, so the rule
   * below follows the specification and `docs/reference/testing.md` records that
   * nothing measures the difference.
   */
  function isTheGroupsStop(radio: HTMLInputElement, stops: HTMLElement[]): boolean {
    if (radio.name === '') {
      return true;
    }

    const group = stops.filter(
      (stop): stop is HTMLInputElement =>
        isRadio(stop) && stop.name === radio.name && stop.form === radio.form
    );

    return radio === (group.find((member) => member.checked) ?? group.at(0));
  }

  /*
   * Nothing the layout does not draw is a stop, and neither is anything inside
   * something it does not draw. `display` is not inherited, so an undrawn
   * ancestor has to be walked to; `visibility` is, so a control's own computed
   * value already answers for its ancestors and for the child that sets itself
   * visible again inside a hidden one.
   */
  function isRendered(stop: HTMLElement): boolean {
    if (getComputedStyle(stop).visibility === 'hidden') {
      return false;
    }

    for (let node: Element | null = stop; node !== null; node = node.parentElement) {
      if (getComputedStyle(node).display === 'none') {
        return false;
      }
    }

    return true;
  }

  /*
   * What the selector matched, less everything the keyboard will not stop on.
   *
   * `tabindex="-1"` is asked about here rather than in the list above because
   * it takes a control out of the tab order whatever the control is, and the
   * list would have to repeat the exclusion against every entry to say so.
   */
  function tabbable(stops: HTMLElement[]): HTMLElement[] {
    return stops.filter(
      (stop) =>
        stop.getAttribute('tabindex') !== '-1' &&
        (!isRadio(stop) || isTheGroupsStop(stop, stops)) &&
        isRendered(stop)
    );
  }

  /*
   * Focus goes in on arrival and comes back on the way out. Without the second
   * half, dismissing a panel destroys the element focus was on and the browser
   * falls back to the body: the keyboard gets the reader into the dialog and
   * then loses their place in the page behind it, so the next Tab starts again
   * from the top.
   *
   * An attachment rather than `onMount` over a bound element: the panel arrives
   * here already defined, and the function returned is its cleanup. The opener
   * is checked for still being in the document, because the control that
   * opened a dialog is not always there when it closes.
   */
  function trap(panel: HTMLElement): () => void {
    const opener = document.activeElement;

    panel.focus();

    return () => {
      if (opener instanceof HTMLElement && opener.isConnected) {
        opener.focus();
      }
    };
  }

  function onkeydown(event: KeyboardEvent & { currentTarget: HTMLElement }): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      onclose?.();
      return;
    }
    if (event.key !== 'Tab') {
      return;
    }

    // The handler is on the panel, so the panel is what the event reports as
    // its target — no bound variable, and no arm for one being unset.
    const panel = event.currentTarget;
    const stops = tabbable([...panel.querySelectorAll<HTMLElement>(FOCUSABLE)]);
    const first = stops.at(0);
    const last = stops.at(-1);

    if (first === undefined || last === undefined) {
      return;
    }

    // The panel itself is the starting point, so shift-tabbing off it wraps to
    // the end rather than escaping to whatever is behind the dialog.
    if (event.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
</script>

<div class="overlay">
  <!--
    A dialog is not an interactive element, so it takes no role of its own from
    the browser; the role, the modal flag and the name are stated here, and the
    negative tabindex is what lets it be focused without joining the tab order.
  -->
  <div
    class="panel"
    role="dialog"
    aria-modal="true"
    aria-labelledby={titleId}
    tabindex="-1"
    {@attach trap}
    {onkeydown}
  >
    <div class="head">
      <h2 id={titleId}>{title}</h2>
      {#if onclose !== undefined}
        <IconButton icon="x" label="Close" onclick={onclose} />
      {/if}
    </div>
    <div class="body">
      {@render children?.()}
    </div>
    {#if footer !== undefined}
      <div class="foot">
        {@render footer()}
      </div>
    {/if}
  </div>
</div>

<style>
  .overlay {
    position: fixed;
    inset: 0;
    display: grid;
    place-items: center;
    padding: var(--s-6);
    background: var(--scrim);
    z-index: 10;
  }

  .panel {
    inline-size: min(28rem, 100%);
    max-block-size: 90vh;
    overflow-y: auto;
    border: var(--rule-w) solid var(--rule-strong);
    border-radius: var(--radius-card);
    background: var(--surface);
    color: var(--text);
    box-shadow: var(--lift-dialog);
  }

  /*
   * A calm arrival: a fade and a 4px lift, no scale and no spring, and only
   * while the root says animations are on — `Appearance.animations_active`,
   * written to `data-animations` by whatever hosts the page. The gate is the
   * attribute rather than a zeroed duration, because a 0ms animation still
   * fires its events and can flash its from-frame.
   *
   * The 4px lift is a literal on purpose. It matches `--s-2` by value and not
   * by meaning: that is the spacing scale, and the distance a panel travels to
   * arrive is not a gap. Naming the token here would move the arrival when the
   * scale moved for a reason of its own.
   */
  :global(:root[data-animations='on']) .panel {
    animation: enter var(--dur-3) var(--ease) both;
  }

  @keyframes enter {
    from {
      opacity: 0;
      transform: translateY(4px);
    }

    to {
      opacity: 1;
      transform: none;
    }
  }

  .head {
    display: flex;
    gap: var(--s-5);
    align-items: center;
    justify-content: space-between;
    padding: var(--s-5) var(--s-5) var(--s-5) var(--s-6);
    border-block-end: var(--rule-w) solid var(--rule);
  }

  h2 {
    margin: 0;
    font-family: var(--font-display);
    font-size: var(--fs-title);
    font-weight: 600;
    letter-spacing: var(--track-title);
  }

  .body {
    padding: var(--s-6);
  }

  .foot {
    display: flex;
    gap: var(--s-4);
    flex-wrap: wrap;
    justify-content: flex-end;
    padding: var(--s-5) var(--s-6);
    border-block-start: var(--rule-w) solid var(--rule);
  }
</style>
