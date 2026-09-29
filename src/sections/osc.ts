/**
 * OSC, in and out.
 *
 * VRCNext only speaks OSC on Windows; elsewhere the bridge's `osc` service carries it, and the
 * same calls work either way. An old bridge has neither, so every entry point guards on
 * `available` rather than assuming. A plugin that throws here is one that looks broken.
 */

import type { Ctx, State } from '../state.js';

export function installOsc(ctx: Ctx, state: State): void {
  if (!ctx.osc.available) {
    state.log('[osc] No OSC on this setup; skipping.');
    return;
  }
  ctx.osc.connect();

  ctx.osc.onParam((event) => {
    state.oscParamCount += 1;
    if (ctx.settings.get('verbosity') === 'loud') {
      state.log(`[osc] ${event.name} = ${String(event.value)}`);
    }
  });

  ctx.osc.onAvatarChange((event) => {
    state.log(`[osc] avatar ${event.avatarId} with ${String(event.parameters.length)} parameters`);
  });
}

/** Sends the configured parameter. Shared by the dashboard button and the HTTP route. */
export function pulseOsc(ctx: Ctx): string {
  if (!ctx.osc.available) return 'OSC unavailable on this setup';
  const name = ctx.settings.get('oscParameter');
  const value = ctx.settings.get('oscValue');
  ctx.osc.send(name, 'int', value);
  return `${name} = ${String(value)}`;
}
