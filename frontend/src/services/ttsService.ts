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

    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = options.rate ?? 1.05
      utterance.pitch = options.pitch ?? 1
      utterance.volume = options.volume ?? 1

      if (options.voice) {
        utterance.voice = options.voice
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
