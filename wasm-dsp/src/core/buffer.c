#include <string.h>

void copy_buffer(const float* input, float* output, int size) {
  memcpy(output, input, (size_t) size * sizeof(float));
}

void clear_buffer(float* buffer, int size) {
  memset(buffer, 0, (size_t) size * sizeof(float));
}
