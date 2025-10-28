import { useEffect, useRef, useState } from 'react';
import Sound from 'react-native-sound';
import { getSound, preloadSound } from '../../utils/soundManager';

export const useSound = (filename: string) => {
  const sound = useRef<Sound | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // ✅ Immediately check cache on first render
  const cached = getSound(filename);
  if (cached && !sound.current) {
    sound.current = cached;
    if (!isLoaded) setIsLoaded(true);
  }

  useEffect(() => {
    let s = getSound(filename);
    if (s) {
      sound.current = s;
      if (!isLoaded) setIsLoaded(true);
      console.log(`✅ Sound ready instantly from cache: ${filename}`);
      return;
    }

    // Load if not cached
    preloadSound(filename).then(() => {
      s = getSound(filename);
      if (s) {
        sound.current = s;
        setIsLoaded(true);
      }
    });
  }, [filename]);

  const play = () => {
    const s = sound.current;
    if (s) {
      // ✅ Play instantly even if React state hasn't re-rendered yet
      console.log('▶️ Playing sound instantly');
      s.stop(() => {
        s.play(success => {
          if (!success) console.log('❌ Playback failed');
        });
      });
    } else {
      console.log('⚠️ Sound not loaded yet');
    }
  };

  const stop = () => {
    sound.current?.stop();
  };

  return { play, stop, isLoaded };
};
