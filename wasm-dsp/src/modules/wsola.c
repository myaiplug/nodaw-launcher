#include "../dsp.h"

int find_best_offset(float* buffer, int start, int windowSize) {
  (void) buffer;
  (void) start;
  (void) windowSize;
  return start;
}

void wsola_process(const float* input, float* output, int size, float timeRatio) {
  (void) timeRatio;

  for (int i = 0; i < size; ++i) {
    output[i] = input[i];
  }
}
