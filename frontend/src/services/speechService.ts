/**
 * speechService — STT abstraction layer
 *
 * MVP: wraps the browser Web Speech API (SpeechRecognition).
 * To upgrade to Deepgram or AssemblyAI, replace only this file.
 * No UI component or hook should import SpeechRecognition directly.
 */

export type STTErrorCode =
  | 'not-supported'
  | 'not-allowed'
  | 'no-speech'
  | 'network'
  | 'aborted'
  | 'audio-capture'
  | 'unknown'

export interface STTResult {
  transcript: string
  isFinal: boolean
}

export interface STTOptions {
  lang?: string
  continuous?: boolean
  interimResults?: boolean
  onResult: (result: STTResult) => void
  onEnd: () => void
  onError: (code: STTErrorCode, message: string) => void
}

// Augment Window for browsers that use the webkit prefix
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition
    webkitSpeechRecognition: typeof SpeechRecognition
  }
}

class SpeechService {
  private recognition: SpeechRecognition | null = null
  private readonly supported: boolean

  constructor() {
    this.supported =
      typeof window !== 'undefined' &&
      !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  }

  get isSupported(): boolean {
    return this.supported
  }

  start(options: STTOptions): void {
    if (!this.supported) {
      options.onError('not-supported', 'Speech recognition is not supported in this browser.')
      return
    }

    // Stop any existing session before starting a new one
    this.abort()

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SR()

    recognition.lang = options.lang ?? 'en-US'
    recognition.continuous = options.continuous ?? false
    recognition.interimResults = options.interimResults ?? true

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const results = Array.from(event.results)
      const last = results[results.length - 1]
      options.onResult({
        transcript: last[0].transcript,
        isFinal: last.isFinal,
      })
    }

    recognition.onend = () => {
      this.recognition = null
      options.onEnd()
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const code = (event.error as STTErrorCode) ?? 'unknown'
      const messages: Record<STTErrorCode, string> = {
        'not-supported': 'Speech recognition is not supported.',
        'not-allowed': 'Microphone permission was denied.',
        'no-speech': 'No speech was detected. Please try again.',
        network: 'A network error occurred during speech recognition.',
        aborted: 'Speech recognition was aborted.',
        'audio-capture': 'No microphone was found.',
        unknown: 'An unknown speech recognition error occurred.',
      }
      options.onError(code, messages[code] ?? messages.unknown)
    }

    recognition.start()
    this.recognition = recognition
  }

  stop(): void {
    this.recognition?.stop()
    this.recognition = null
  }

  abort(): void {
    this.recognition?.abort()
    this.recognition = null
  }
}

export const speechService = new SpeechService()
