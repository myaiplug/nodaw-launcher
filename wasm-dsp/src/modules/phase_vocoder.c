#include "../dsp.h"

void phase_vocoder_process(const float* input, float* output, int size, float timeRatio, float pitchRatio) {
  (void) timeRatio;
  (void) pitchRatio;

  for (int i = 0; i < size; ++i) {
    output[i] = input[i];
  }
}
