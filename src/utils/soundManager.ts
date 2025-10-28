import Sound from 'react-native-sound';

Sound.setCategory('Playback');

const soundCache: Record<string, Sound> = {};

export const preloadSound = (filename: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (soundCache[filename]) {
      resolve();
      return;
    }

    const s = new Sound(filename, Sound.MAIN_BUNDLE, error => {
      if (error) {
        console.log('❌ Failed to preload sound:', error);
        reject(error);
      } else {
        soundCache[filename] = s;
        console.log('✅ Preloaded sound:', filename);
        resolve();
      }
    });
  });
};

export const getSound = (filename: string): Sound | null => {
  return soundCache[filename] || null;
};
