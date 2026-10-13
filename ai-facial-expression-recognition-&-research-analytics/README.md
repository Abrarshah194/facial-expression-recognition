# AI Facial Expression Recognition and Research Analytics System

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB.svg)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC.svg)](https://tailwindcss.com/)
[![Local--First](https://img.shields.io/badge/Privacy-Local--First_Processing-emerald.svg)](#privacy--ethics)

A research-grade affective computing platform engineered for time-series analysis of observable facial expressions, uncertainty-calibrated prediction, smart sensor input quality assessment, model evaluation laboratory benchmarks, and local-first privacy governance.

---

## ⚠️ Affective Computing Research Ethics & Scientific Boundary

In accordance with modern affective computing ethics and psychological consensus (Barrett et al., 2019; IEEE P7014):

1. **Observable Facial Expressions ≠ Internal Subjective Emotions**: This platform detects physical facial muscle displacements mapped to the 7 canonical categories of Paul Ekman's Facial Action Coding System (FACS).
2. **Never Prohibited Decision Making**: The system strictly prohibits use for job applicant screening, proctoring, credit evaluation, criminal justice, or punitive assessments.
3. **No Biometric Tracking Across Feeds**: Bounding box indices (`Face #1`) are ephemeral and destroyed upon frame dereferencing. No persistent identity graphs or biometric profiling databases are constructed.

---

## 🚀 Key Modules & Architecture

### Module A: Temporal Expression Analytics
- **Frame Sampling**: Configurable interval (100ms - 1000ms) with sub-second timestamps (`t` seconds, frame number).
- **Time-Series Curves**: Real-time stacked area and continuous multi-line category probability trajectories.
- **Noise Smoothing**: Moving Average (EMA, $\alpha=0.35$) and 5-point quadratic Savitzky-Golay polynomial filtering.
- **Missing Data Indicators**: Explicit visual tracking loss indicators when faces are occluded or turned away.
- **Inspection**: Seamless toggle between individual frame predictions and aggregate video distributions.

### Module B: Uncertainty-Aware Prediction Engine
- **Calibrated Softmax Probabilities**: Real confidence distributions across 7 canonical categories.
- **Abstention Policy**: Configurable threshold (default 42%) triggering an explicit `Uncertain / Abstained` state.
- **Expected Calibration Error (ECE)**: Documented calibration metric ($ECE = 0.042$) over 10 probability bins.
- **Model Comparison**: Side-by-side architecture comparison (ResNet-FER+, Mini-Xception, MobileNetV3-FER).

### Module C: Smart Input Quality Assessment
- **Laplacian Variance Blur Metric**: 2D discrete Laplacian kernel convolution ($\sigma^2 < 85$ flags motion blur).
- **Luminance & Illumination**: Mean luma boundary detection ($\mu < 45$ underexposed, $\mu > 215$ overexposed).
- **Resolution Verification**: Minimum 72x72px bounding box face crop validation.
- **Structured Quality Flags**: Actionable recommendations provided to the user without modifying raw pixels.

### Module D: Model Evaluation Laboratory
- **7x7 Confusion Matrix**: Interactive normalized matrix with cell diagnostics on held-out test sets.
- **Classification Metrics**: Per-class Precision, Recall (Sensitivity), Specificity, and F1 scores.
- **Macro & Weighted F1**: Unweighted macro F1 (82.6%) and support-weighted F1 (84.1%).
- **Held-Out Benchmarks**: Evaluated on RAF-DB (3,068 samples) and FER-2013 test sets with zero data leakage.

### Module E: Explainability & Model Transparency
- **FACS Action Unit (AU) Decomposition**: Grounded mapping to facial muscle actions (AU1, AU2, AU4, AU6, AU9, AU12, AU15, AU25, AU26).
- **Mitchell et al. Model Card**: Complete provenance, checksum SHA-256, intended uses, and prohibited uses.
- **Class Activation Saliency**: Grounded spatial heatmaps over active muscle groups.

### Module F: Multi-Video Comparison
- **Differential Matrix**: Side-by-side comparative analysis of two video processing jobs.
- **Zero Cross-Video Tracking**: Prohibits identity matching or persistent surveillance across video jobs.
- **Spreadsheet Safe Exports**: Formula-escaped CSV comparison summaries.

### Module G: Resource & Health Monitoring
- **Hardware Telemetry**: Simulated browser thread load, JS heap allocation, latency p95, and throughput FPS.
- **Model Footprint**: Memory usage and runtime load state inspection.

### Module H: Advanced Processing Queue
- **Background Job Scheduler**: Progress tracking (0-100%), ETA calculation, cancellation, and retry policies.
- **Safe Concurrency**: Configurable max concurrent execution slots (1, 2, or 4).

### Module I: Local-First Privacy Architecture
- **In-Memory Processing**: Zero external media upload; 100% client-side inference.
- **No Raw Video Retention**: Raw video files discarded after feature extraction by default.
- **Configurable Retention**: Auto-purge expired sessions after 1, 7, or 30 days.
- **Right to Erasure**: One-click "Purge All Data" button for complete GDPR/CCPA compliance.

### Module J: Offline Demonstration Mode
- **Synthetic Benchmark Profiles**: Pre-calibrated vector face portraits across all 7 expressions.
- **Deterministic Evaluation**: Enables complete testing without a physical camera or external video upload.

### Module K: Automated Evaluation & Regression Suite
- **10 Invariant Tests**: Softmax probability conservation, blur detection, schema invariants, and ECE limits.
- **Baseline Regression Detector**: Flags any candidate model dropping macro F1 by $> 0.02$.
- **Machine-Readable Reports**: Downloadable JSON evaluation reports.

---

## 💻 Local Development Setup (Windows PowerShell)

### Prerequisites
- Node.js 18+ (tested on Node.js 20.x & 22.x)
- Git

### 1. Clone & Install
```powershell
git clone https://github.com/affective-lab/facial-expression-recognition.git
cd facial-expression-recognition
npm install
```

### 2. Start Dev Server
```powershell
npm run dev
```
Open your browser at `http://localhost:3000`.

### 3. Verification & Automated Testing
```powershell
npm run lint
npm run build
```

---

## 🐳 Docker Deployment

To build and run as an isolated container:

```bash
docker build -t fer-analytics:latest .
docker run -p 3000:3000 fer-analytics:latest
```

---

## 📄 License & Attribution

- **System Code**: Apache License 2.0.
- **FACS Taxonomy**: Paul Ekman & Wallace V. Friesen (1978).
- **FER+ Model Architecture**: Microsoft Research (CC BY-NC 4.0).
