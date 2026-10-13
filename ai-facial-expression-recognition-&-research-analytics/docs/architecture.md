# System Architecture & Technical Specifications

## 1. Architectural Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                     Presentation Layer                          │
│   React 19 · Vite · Tailwind CSS v4 · Plus Jakarta Sans         │
│   21 Modular Research Views · Accessible Data Visualization     │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│                   Computer Vision Subsystem                     │
│   HTML5 Canvas Pixel Engine · 2D Laplacian Convolution          │
│   Luminance & Exposure Histograms · Facial Landmark Geometric   │
│   FACS Action Unit (AU) Activation Profiling                    │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│               Inference & Uncertainty Engine                    │
│   Calibrated Softmax Distribution · Temperature Scaling         │
│   Abstention Policy Threshold (Default 42%)                     │
│   Savitzky-Golay & Exponential Moving Average (EMA) Smoothing   │
└───────────────────────────────┬─────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│               Local Storage & Privacy Subsystem                 │
│   Local-First In-Memory Buffer · Zero Raw Video Retention       │
│   Automated Retention Expiry Purge · Tamper-Evident Audit Trail │
└─────────────────────────────────────────────────────────────────┘
```

## 2. Core Processing Workflows

### 2.1 Live Camera Pipeline
1. User clicks **Launch Live Feed** (Camera NEVER auto-activates).
2. MediaDevices API requests user consent with explicit permissions banner.
3. Stream frames sampled at throttled rate (10 FPS default).
4. Discrete 2D Laplacian filter computes focus variance ($\sigma^2$).
5. Face bounding box, landmarks, and Action Units computed and projected onto overlay canvas.
6. Calibrated softmax probabilities computed. If top probability $< 0.42$, output marked as `Uncertain / Abstained`.
7. Stopping stream or navigating away immediately terminates media tracks and releases hardware.

### 2.2 Temporal Video File Pipeline
1. Video file uploaded and validated for format (MP4/WebM) and size ($< 50$MB).
2. Processing job enqueued in background scheduler.
3. Frame extraction steps across video timeline at configurable sampling intervals (100ms - 1000ms).
4. Frame predictions timestamped and assembled into continuous time-series.
5. User can toggle Savitzky-Golay polynomial smoothing to remove sensor jitter while preserving peak micro-movements.
6. Session stored locally according to configured retention policy.
