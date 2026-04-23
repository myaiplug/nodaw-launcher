#include "dsp.h"

#define MAX_BUFFER (48000 * 10)

static int currentSampleRate = 48000;
static float input_buffer[MAX_BUFFER];
static float output_buffer[MAX_BUFFER];
static DSPFrame shared_frame;

void init_engine(int sampleRate) {
  currentSampleRate = sampleRate;
  shared_frame.input = input_buffer;
  shared_frame.output = output_buffer;
  shared_frame.time_ratio = 1.0f;
  shared_frame.pitch_ratio = 1.0f;
  shared_frame.input_size = 0;
  shared_frame.output_size = 0;
}

void process_frame(DSPFrame* frame) {
  (void) currentSampleRate;

  if (frame == 0 || frame->input == 0 || frame->output == 0 || frame->input_size <= 0) {
    return;
  }

  phase_vocoder_process(frame->input, frame->output, frame->input_size, frame->time_ratio, frame->pitch_ratio);
}

int get_input_ptr(void) {
  return (int) input_buffer;
}

int get_output_ptr(void) {
  return (int) output_buffer;
}

int get_frame_ptr(void) {
  return (int) &shared_frame;
}
