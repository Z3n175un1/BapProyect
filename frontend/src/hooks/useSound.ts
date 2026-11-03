import { useCallback, useRef, useState } from 'react'
import clickSoundUrl from '../audio/universfield-computer-mouse-click-02-383961.mp3'

const SOUND_PREF_KEY = 'login:sound-pref'

/**
 * Control del audio de interacción del Login.
 * Solo se reproduce tras una acción del usuario y respeta la preferencia guardada.
 */
export default function useSound() {
  const [enabled, setEnabled] = useState<boolean>(() => {
    return window.localStorage.getItem(SOUND_PREF_KEY) !== 'disabled'
  })

  const audioRef = useRef<HTMLAudioElement | null>(null)

  const getAudio = useCallback((): HTMLAudioElement => {
    if (!audioRef.current) {
      const audio = new Audio(clickSoundUrl)
      audio.preload = 'auto'
      audio.volume = 0.6
      audioRef.current = audio
    }
    return audioRef.current
  }, [])

  const play = useCallback(() => {
    if (!enabled) return
    const audio = getAudio()
    audio.currentTime = 0
    audio.play().catch(() => {
      /* El navegador bloqueó la reproducción hasta una nueva interacción */
    })
  }, [enabled, getAudio])

  const toggle = useCallback(() => {
    setEnabled((current) => {
      const next = !current
      window.localStorage.setItem(SOUND_PREF_KEY, next ? 'enabled' : 'disabled')
      return next
    })
  }, [])

  return { enabled, play, toggle }
}
