export interface NormalizeAudioOptions {
  targetPeak?: number;
  maxGain?: number;
  minPeak?: number;
  referencePercentile?: number;
}

const DEFAULT_TARGET_PEAK = 0.9;
const DEFAULT_MAX_GAIN = 8;
const DEFAULT_MIN_PEAK = 0.01;
const DEFAULT_REFERENCE_PERCENTILE = 0.95;

export function getSpeechRecordingConstraints(): MediaStreamConstraints {
  return {
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      channelCount: { ideal: 1 },
    },
  };
}

export function normalizeAudioSamples(
  samples: Float32Array,
  options: NormalizeAudioOptions = {}
): Float32Array {
  const targetPeak = options.targetPeak ?? DEFAULT_TARGET_PEAK;
  const maxGain = options.maxGain ?? DEFAULT_MAX_GAIN;
  const minPeak = options.minPeak ?? DEFAULT_MIN_PEAK;
  const referencePercentile = options.referencePercentile ?? DEFAULT_REFERENCE_PERCENTILE;

  const amplitudes = new Float32Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    amplitudes[i] = Math.abs(samples[i]);
  }

  amplitudes.sort();
  const referenceIndex = Math.min(
    amplitudes.length - 1,
    Math.ceil((amplitudes.length - 1) * referencePercentile)
  );
  const referencePeak = amplitudes[referenceIndex] ?? 0;

  if (referencePeak < minPeak || referencePeak >= targetPeak) {
    return samples;
  }

  const gain = Math.min(targetPeak / referencePeak, maxGain);
  if (gain <= 1) {
    return samples;
  }

  const normalized = new Float32Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    normalized[i] = Math.max(-1, Math.min(1, samples[i] * gain));
  }

  return normalized;
}
