/**
 * Minimal type surface for the strudel packages, which ship no TypeScript
 * types. Extend these as more of the Strudel API gets used.
 */

declare module "@strudel/codemirror" {
  export interface StrudelMirrorOptions {
    root: HTMLElement;
    initialCode?: string;
    defaultOutput: unknown;
    getTime: () => number;
    transpiler: unknown;
    prebake: () => Promise<unknown>;
    /** Fill the root background with the editor theme color (default true). */
    bgFill?: boolean;
    onToggle?: (started: boolean) => void;
    onEvalError?: (error: unknown) => void;
    [key: string]: unknown;
  }

  /** CodeMirror-based Strudel editor with playing-event highlighting. */
  export class StrudelMirror {
    constructor(options: StrudelMirrorOptions);
    code: string;
    editor: { destroy(): void };
    evaluate(autostart?: boolean): Promise<void>;
    stop(): Promise<void>;
    setCode(code: string): void;
    setFontSize(size: number): void;
    setFontFamily(family: string): void;
    setLineNumbersDisplayed(enabled: boolean): void;
    setTheme(theme: string): void;
    /** Remove the document-level event listeners. */
    clear(): void;
  }
}

declare module "@strudel/core" {
  export const controls: Record<string, unknown>;
  export function evalScope(...scopes: unknown[]): Promise<unknown>;
}

declare module "@strudel/transpiler" {
  export const transpiler: unknown;
}

declare module "@strudel/soundfonts" {
  /** Register the General MIDI soundfont sounds (gm_*). */
  export function registerSoundfonts(): void;
}

declare module "@strudel/webaudio" {
  export const webaudioOutput: unknown;
  export function getAudioContext(): AudioContext;
  export function initAudioOnFirstClick(): void;
  export function registerSynthSounds(): Promise<unknown>;
  export function registerZZFXSounds(): void;
  /** Load a sample map, e.g. samples("github:tidalcycles/dirt-samples"). */
  export function samples(
    source: string | Record<string, unknown>,
    baseUrl?: string,
  ): Promise<unknown>;
}

declare module "@strudel/mini" {}

declare module "@strudel/tonal" {}
