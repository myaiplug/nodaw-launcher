#include "../dsp.h"

void granular_process(const float* input, float* output, int size, float timeRatio) {
  (void) timeRatio;

  for (int i = 0; i < size; ++i) {
    output[i] = input[i];
  }
}
