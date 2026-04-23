#include "../dsp.h"

void pitch_shift_process(const float* input, float* output, int size, float pitchRatio) {
  (void) pitchRatio;

  for (int i = 0; i < size; ++i) {
    output[i] = input[i];
  }
}
