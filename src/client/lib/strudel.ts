import { StrudelMirror } from "@strudel/codemirror";
import { controls, evalScope } from "@strudel/core";
import { registerSoundfonts } from "@strudel/soundfonts";
import { transpiler } from "@strudel/transpiler";
import {
  getAudioContext,
  initAudioOnFirstClick,
  registerSynthSounds,
  registerZZFXSounds,
  samples,
  webaudioOutput,
} from "@strudel/webaudio";

/**
 * Thin wrapper around the Strudel editor (@strudel/codemirror) so the rest
 * of the app never touches the strudel packages directly. StrudelMirror is
 * the same editor strudel.cc uses, including highlighting of the events
 * that are currently playing.
 */

export interface StrudelEditorOptions {
  /** Element the editor mounts into. */
  root: HTMLElement;
  initialCode: string;
  /** Fires with true/false when playback starts/stops (any source: buttons or keyboard). */
  onPlayStateChange?: (playing: boolean) => void;
  onError?: (message: string) => void;
}

export interface StrudelEditor {
  /** Evaluate the current editor code and start playback. */
  evaluate(): Promise<void>;
  stop(): void;
  /** Replace the editor contents. */
  setCode(code: string): void;
  destroy(): void;
}

/**
 * Load the strudel function scope and the full strudel.cc sound arsenal:
 * synths, ZZFX, GM soundfonts (gm_*) and the standard sample libraries.
 * Shared across editor instances; only ever runs once.
 */
let prebaked: Promise<void> | null = null;

/** Same sample maps strudel.cc loads by default. */
const SAMPLE_LIBRARY_BASE =
  "https://raw.githubusercontent.com/felixroos/dough-samples/main";
const SAMPLE_MAPS = [
  "tidal-drum-machines.json",
  "piano.json",
  "Dirt-Samples.json",
  "EmuSP12.json",
  "vcsl.json",
  "mridangam.json",
];

/** A failed sound bank shouldn't take the whole session down. */
function warnOnError(load: () => unknown, what: string): Promise<unknown> {
  return Promise.resolve()
    .then(load)
    .catch((error: unknown) => {
      console.warn(`[strudel] failed to load ${what}:`, error);
    });
}

function prebake(): Promise<void> {
  prebaked ??= (async () => {
    // Web audio can only start after a user gesture.
    initAudioOnFirstClick();
    await evalScope(
      import("@strudel/core"),
      import("@strudel/mini"),
      import("@strudel/tonal"),
      import("@strudel/webaudio"),
      import("@strudel/soundfonts"),
      controls,
    );
    await Promise.all([
      warnOnError(() => registerSynthSounds(), "synth sounds"),
      warnOnError(() => registerZZFXSounds(), "zzfx sounds"),
      warnOnError(() => registerSoundfonts(), "soundfonts"),
      ...SAMPLE_MAPS.map((map) =>
        warnOnError(() => samples(`${SAMPLE_LIBRARY_BASE}/${map}`), map),
      ),
    ]);
  })();
  return prebaked;
}

export function createStrudelEditor(
  options: StrudelEditorOptions,
): StrudelEditor {
  const mirror = new StrudelMirror({
    root: options.root,
    initialCode: options.initialCode,
    defaultOutput: webaudioOutput,
    getTime: () => getAudioContext().currentTime,
    transpiler,
    prebake,
    // Keep our own (themed) background instead of the editor theme's.
    bgFill: false,
    onToggle: (started) => options.onPlayStateChange?.(started),
    onEvalError: (error) =>
      options.onError?.(error instanceof Error ? error.message : String(error)),
  });

  // Match the app's type scale instead of strudel.cc's defaults.
  mirror.setFontSize(15);
  mirror.setFontFamily('"JetBrains Mono", "Fira Code", ui-monospace, monospace');

  return {
    evaluate: () => mirror.evaluate(),
    stop: () => {
      void mirror.stop();
    },
    setCode: (code) => mirror.setCode(code),
    destroy: () => {
      void mirror.stop();
      mirror.clear();
      mirror.editor.destroy();
    },
  };
}
