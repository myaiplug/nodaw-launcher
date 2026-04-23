#ifndef NODAW_DSP_H
#define NODAW_DSP_H

typedef struct {
  float* input;
  float* output;
  float time_ratio;
  float pitch_ratio;
  int input_size;
  int output_size;
} DSPFrame;

void init_engine(int sampleRate);
void process_frame(DSPFrame* frame);

int get_input_ptr(void);
int get_output_ptr(void);
int get_frame_ptr(void);

void phase_vocoder_process(const float* input, float* output, int size, float timeRatio, float pitchRatio);
void wsola_process(const float* input, float* output, int size, float timeRatio);
void granular_process(const float* input, float* output, int size, float timeRatio);
void pitch_shift_process(const float* input, float* output, int size, float pitchRatio);

float unwrap_phase(float phase);
void apply_hann_window(float* buffer, int size);

#endif
