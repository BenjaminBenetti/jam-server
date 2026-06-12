import { StrudelMirror } from "@strudel/codemirror";
import { controls, evalScope } from "@strudel/core";
import { transpiler } from "@strudel/transpiler";
import {
  getAudioContext,
  initAudioOnFirstClick,
  registerSynthSounds,
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
  destroy(): void;
}

/**
 * Load the strudel function scope, synth sounds and the drum sample library.
 * Shared across editor instances; only ever runs once.
 */
let prebaked: Promise<void> | null = null;

function prebake(): Promise<void> {
  prebaked ??= (async () => {
    // Web audio can only start after a user gesture.
    initAudioOnFirstClick();
    await evalScope(
      import("@strudel/core"),
      import("@strudel/mini"),
      import("@strudel/tonal"),
      import("@strudel/webaudio"),
      controls,
    );
    await Promise.all([
      registerSynthSounds(),
      samples("github:tidalcycles/dirt-samples"),
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
    destroy: () => {
      void mirror.stop();
      mirror.clear();
      mirror.editor.destroy();
    },
  };
}
