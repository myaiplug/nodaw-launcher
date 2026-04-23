#include <math.h>

float unwrap_phase(float phase) {
  while (phase < (float) -M_PI) phase += 2.0f * (float) M_PI;
  while (phase > (float) M_PI) phase -= 2.0f * (float) M_PI;
  return phase;
}

void apply_hann_window(float* buffer, int size) {
  for (int i = 0; i < size; ++i) {
    const float w = 0.5f * (1.0f - cosf((2.0f * (float) M_PI * i) / (float) size));
    buffer[i] *= w;
  }
}
