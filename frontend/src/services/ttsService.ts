/**
 * ttsService — TTS abstraction layer
 *
 * MVP: wraps the browser speechSynthesis API.
 * speak() returns a Promise that resolves when the utterance finishes,
 * making it safe to await before transitioning to the next voice state.
 *
 * To upgrade to Gemini TTS or ElevenLabs, replace only this file.
 * No UI component or hook should import speechSynthesis directly.
 */

export interface TTSOptions {
  rate?: number
  pitch?: number
  volume?: number
  /** Prefer a specific voice. Pass a voice from getVoices(). */
  voice?: SpeechSynthesisVoice | null
  /** If true, prefer a British English voice (Alfred-style). Uses first matching voice when available. */
  preferBritishVoice?: boolean
  onStart?: () => void
  onEnd?: () => void
  onError?: () => void
}

class TTSService {
  private utterance: SpeechSynthesisUtterance | null = null
  private readonly supported: boolean

  constructor() {
    this.supported = typeof window !== 'undefined' && 'speechSynthesis' in window
  }

  get isSupported(): boolean {
    return this.supported
  }

  /**
   * Speak text aloud. Resolves when the utterance finishes.
   * Rejects if the browser fires an error event.
   * If TTS is not supported, resolves immediately (silent no-op).
   */
  speak(text: string, options: TTSOptions = {}): Promise<void> {
    if (!this.supported) return Promise.resolve()

    this.cancel()

    // Chrome may start speechSynthesis paused; resume ensures audio plays
    try {
      window.speechSynthesis.resume()
    } catch {
      /* ignore */
    }

    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = options.rate ?? 1.05
      utterance.pitch = options.pitch ?? 1
      utterance.volume = options.volume ?? 1

      if (options.voice) {
        utterance.voice = options.voice
      } else {
        const voice = options.preferBritishVoice ? this.getBritishVoice() : this.getDefaultLocalVoice()
        if (voice) utterance.voice = voice
      }

      utterance.onstart = () => options.onStart?.()

      utterance.onend = () => {
        this.utterance = null
        options.onEnd?.()
        resolve()
      }

      utterance.onerror = (event) => {
        this.utterance = null
        // 'interrupted' fires when cancel() is called — treat as non-error
        if (event.error === 'interrupted' || event.error === 'canceled') {
          resolve()
        } else {
          options.onError?.()
          reject(new Error(`TTS error: ${event.error}`))
        }
      }

      this.utterance = utterance
      window.speechSynthesis.speak(utterance)
    })
  }

  /**
   * Play a short listen-ready cue (beep) so the user knows the mic is active.
   * Uses Web Audio API; no-op if unsupported.
   */
  playListenReadyCue(): void {
    if (typeof window === 'undefined') return
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AC) return
    try {
      const ctx = new AC()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = 880
      osc.type = 'sine'
      gain.gain.setValueAtTime(0.15, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.08)
    } catch {
      /* ignore */
    }
  }

  /** Stop current speech immediately. */
  cancel(): void {
    if (!this.supported) return
    window.speechSynthesis.cancel()
    this.utterance = null
  }

  /** List available voices. Voices load asynchronously on first call in some browsers. */
  getVoices(): SpeechSynthesisVoice[] {
    if (!this.supported) return []
    return window.speechSynthesis.getVoices()
  }

  /**
   * Prefer a local/native voice (avoids Chrome Google online voice bugs).
   */
  getDefaultLocalVoice(): SpeechSynthesisVoice | null {
    const voices = this.getVoices()
    return voices.find((v) => v.localService) ?? voices[0] ?? null
  }

  /**
   * Prefer a British English voice (Alfred-style). Returns first matching voice.
   * Prefers local/native voices over Google online voices for reliability.
   */
  getBritishVoice(): SpeechSynthesisVoice | null {
    const voices = this.getVoices()
    const british = voices.filter(
      (v) =>
        v.lang.startsWith('en-GB') &&
        (v.localService ?? true) // Prefer local to avoid Chrome Google voice bugs
    )
    return british[0] ?? voices.find((v) => v.lang.startsWith('en-GB')) ?? null
  }

  /**
   * Wait for voices to load (needed in Chrome where getVoices() returns []
   * on the first synchronous call).
   */
  waitForVoices(): Promise<SpeechSynthesisVoice[]> {
    if (!this.supported) return Promise.resolve([])

    return new Promise((resolve) => {
      const voices = window.speechSynthesis.getVoices()
      if (voices.length > 0) {
        resolve(voices)
      } else {
        window.speechSynthesis.onvoiceschanged = () => {
          resolve(window.speechSynthesis.getVoices())
        }
      }
    })
  }
}

export const ttsService = new TTSService()
