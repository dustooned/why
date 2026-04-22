// Sound module for generated tones, per-character voice clips, and question-aware looping music.
(function attachSoundModule() {
  const questionAssetsById = window.WhyManifest.questionAssetsById;
  let audioContext;
  const characterVoiceSources = {};
  const activeCharacterBlips = new Set();
  const musicSources = {};
  let activeMusic;
  let activeMusicPath = "";
  let musicFadeFrame = 0;
  let activeToneNodes;

  const AUDIO_SETTINGS = {
    sfx: {
      path: "assets/audio/sfx",
      characterInterval: 2,
      characterVolume: 0.010,
      characterPlaybackRate: 1,
      toneVolumeScale: 0.75,
      questionToneOverlap: false
    },
    music: {
      path: "assets/audio/music/ambient.wav",
      volume: 0.05,
      playbackRate: 1,
      loop: true,
      fadeDurationMs: 500
    }
  };

  const soundPresets = {
    spark: { type: "triangle", startHz: 320, endHz: 180, peak: 0.08, duration: 0.14 },
    glass: { type: "sine", startHz: 520, endHz: 300, peak: 0.05, duration: 0.18 },
    hollow: { type: "triangle", startHz: 180, endHz: 72, peak: 0.14, duration: 0.22 },
    thud: { type: "sawtooth", startHz: 110, endHz: 48, peak: 0.18, duration: 0.18 }
  };

  function getAudioContext() {
    audioContext = audioContext || new AudioContext();
    return audioContext;
  }

  function playQuestionTone(soundName = "hollow") {
    const context = getAudioContext();
    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const preset = soundPresets[soundName] || soundPresets.hollow;
    const tonePeak = preset.peak * AUDIO_SETTINGS.sfx.toneVolumeScale;

    oscillator.type = preset.type;
    oscillator.frequency.setValueAtTime(preset.startHz, now);
    oscillator.frequency.exponentialRampToValueAtTime(preset.endHz, now + preset.duration);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(tonePeak, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + preset.duration);

    if (!AUDIO_SETTINGS.sfx.questionToneOverlap && activeToneNodes) {
      try {
        activeToneNodes.oscillator.stop();
      } catch (error) {}
      activeToneNodes = null;
    }

    oscillator.connect(gain).connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + preset.duration + 0.02);
    activeToneNodes = { oscillator, gain };
    oscillator.addEventListener("ended", () => {
      if (activeToneNodes && activeToneNodes.oscillator === oscillator) {
        activeToneNodes = null;
      }
    });
  }

  const DEFAULT_VOICE_PATH = `${AUDIO_SETTINGS.sfx.path}/room-shift.wav`;

  function getCharacterVoiceSource(voiceName = "default") {
    const manifestEntry = questionAssetsById[voiceName];
    const voicePath = manifestEntry ? `${AUDIO_SETTINGS.sfx.path}/${manifestEntry.voice}` : DEFAULT_VOICE_PATH;

    if (!characterVoiceSources[voiceName]) {
      const audio = new Audio(voicePath);
      audio.preload = "auto";
      audio.volume = AUDIO_SETTINGS.sfx.characterVolume;
      audio.addEventListener("error", () => {
        console.warn(`Why could not load character voice: ${voicePath}`);
      });
      characterVoiceSources[voiceName] = audio;
    }

    return characterVoiceSources[voiceName];
  }

  function playCharacterBlip(voiceName = "default") {
    const source = getCharacterVoiceSource(voiceName);
    const blip = source.cloneNode();
    blip.volume = AUDIO_SETTINGS.sfx.characterVolume;
    blip.playbackRate = AUDIO_SETTINGS.sfx.characterPlaybackRate;
    activeCharacterBlips.add(blip);
    blip.addEventListener("ended", () => {
      activeCharacterBlips.delete(blip);
    });
    blip.addEventListener("pause", () => {
      activeCharacterBlips.delete(blip);
    });
    blip.play().catch(() => {});
  }

  function stopCharacterBlips() {
    activeCharacterBlips.forEach((blip) => {
      blip.pause();
      blip.currentTime = 0;
    });
    activeCharacterBlips.clear();
  }

  function shouldPlayCharacterBlip(visibleCharacterCount) {
    const interval = Math.max(1, AUDIO_SETTINGS.sfx.characterInterval);
    return visibleCharacterCount % interval === 0;
  }

  function getMusicPath(questionId) {
    const manifestEntry = questionAssetsById[questionId];
    const musicFile = manifestEntry && manifestEntry.music ? manifestEntry.music : "";
    return musicFile ? `assets/audio/music/${musicFile}` : AUDIO_SETTINGS.music.path;
  }

  function getMusicSource(path = AUDIO_SETTINGS.music.path) {
    if (!musicSources[path]) {
      const audio = new Audio(path);
      audio.preload = "auto";
      audio.loop = AUDIO_SETTINGS.music.loop;
      audio.volume = 0;
      audio.playbackRate = AUDIO_SETTINGS.music.playbackRate;
      audio.addEventListener("error", () => {
        console.warn(`Why could not load music track: ${path}`);
      });
      musicSources[path] = audio;
    }

    musicSources[path].loop = AUDIO_SETTINGS.music.loop;
    musicSources[path].playbackRate = AUDIO_SETTINGS.music.playbackRate;
    return musicSources[path];
  }

  function resetMusicSource(music) {
    if (!music) {
      return;
    }

    music.pause();
    music.currentTime = 0;
    music.volume = 0;
  }

  function getLoudestPlayingMusic(excludedMusic) {
    const playingMusic = Object.values(musicSources).filter((music) => {
      return music !== excludedMusic && !music.paused;
    });

    if (playingMusic.length === 0) {
      return null;
    }

    return playingMusic.reduce((loudest, music) => {
      return music.volume > loudest.volume ? music : loudest;
    });
  }

  function crossfadeMusic(nextMusic) {
    const previousMusic =
      activeMusic && activeMusic !== nextMusic && !activeMusic.paused
        ? activeMusic
        : getLoudestPlayingMusic(nextMusic);
    const fadeDuration = Math.max(0, AUDIO_SETTINGS.music.fadeDurationMs);
    const fadeStart = performance.now();
    const targetVolume = AUDIO_SETTINGS.music.volume;

    if (musicFadeFrame) {
      window.cancelAnimationFrame(musicFadeFrame);
      musicFadeFrame = 0;
    }

    Object.values(musicSources).forEach((music) => {
      if (music !== previousMusic && music !== nextMusic) {
        resetMusicSource(music);
      }
    });

    nextMusic.currentTime = 0;
    nextMusic.volume = fadeDuration > 0 ? 0 : targetVolume;
    nextMusic.play().catch(() => {});
    activeMusic = nextMusic;

    if (!previousMusic || previousMusic === nextMusic || fadeDuration === 0) {
      if (previousMusic && previousMusic !== nextMusic) {
        resetMusicSource(previousMusic);
      }

      nextMusic.volume = targetVolume;
      return;
    }

    function step(now) {
      const progress = Math.min((now - fadeStart) / fadeDuration, 1);
      nextMusic.volume = targetVolume * progress;
      previousMusic.volume = targetVolume * (1 - progress);

      if (progress < 1) {
        musicFadeFrame = window.requestAnimationFrame(step);
        return;
      }

      resetMusicSource(previousMusic);
      nextMusic.volume = targetVolume;
      musicFadeFrame = 0;
    }

    musicFadeFrame = window.requestAnimationFrame(step);
  }

  function startAmbientMusic(questionId) {
    const musicPath = getMusicPath(questionId);
    const music = getMusicSource(musicPath);

    if (activeMusicPath === musicPath && activeMusic && !activeMusic.paused) {
      return;
    }

    activeMusicPath = musicPath;
    crossfadeMusic(music);
  }

  function stopAmbientMusic() {
    if (musicFadeFrame) {
      window.cancelAnimationFrame(musicFadeFrame);
      musicFadeFrame = 0;
    }

    if (!activeMusic) {
      return;
    }

    Object.values(musicSources).forEach(resetMusicSource);
  }

  window.WhySound = {
    AUDIO_SETTINGS,
    playQuestionTone,
    playCharacterBlip,
    stopCharacterBlips,
    shouldPlayCharacterBlip,
    startAmbientMusic,
    stopAmbientMusic,
    DEFAULT_VOICE_PATH
  };
})();
