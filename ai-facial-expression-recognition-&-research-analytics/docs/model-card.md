# Formal Model Card: ResNet-FER+ (v2.4.1)

Based on Mitchell et al. (2019) Model Cards for Model Reporting.

## 1. Model Details
- **Model Name**: ResNet-FER+ (v2.4.1)
- **Architecture**: ResNet-18 with residual channel attention and depthwise convolutional downsampling.
- **Parameters**: 11.2 Million parameters.
- **Weights Size**: 44.8 MB (FP32 precision).
- **Cryptographic Checksum (SHA-256)**: `8f7a4e21b069d31f2388c94025ad50982567df4802c611481b957e84451a9e32`
- **License**: Creative Commons Attribution-NonCommercial 4.0 (CC BY-NC 4.0).
- **Active Maintainer**: Affective Analytics Research Group.

## 2. Intended Use
- **Primary Domain**: Affective computing research, human-computer interaction (HCI) usability analysis, and cognitive science laboratory experiments.
- **Voluntary Setting**: The model is intended only for consensual, voluntary user testing where participants are informed of facial expression estimation.
- **Out-of-Scope / Prohibited**:
  - Employee productivity or candidate hiring evaluations.
  - Proctoring, lie detection, or interrogative veracity assessment.
  - Clinical psychiatric or neurological diagnosis.
  - Public biometric surveillance or continuous unauthorized monitoring.

## 3. Data & Training Provenance
- **Training Corpus**: Microsoft FER+ dataset (Barsoum et al., 2016), re-annotated by 10 independent crowd workers to form probability distribution targets.
- **Preprocessing**:
  - Face alignment to canonical 224x224 crop based on eye coordinates.
  - Grayscale conversion and CLAHE local contrast normalization.
  - Zero-mean unit-variance scaling $[-1.0, 1.0]$.
- **Held-Out Evaluation Split**: Real-world Affective Faces Database (RAF-DB) held-out partition ($N=3,068$) strictly isolated to prevent training leakage.

## 4. Evaluation Metrics
- **Top-1 Accuracy**: 84.3%
- **Macro F1 Score**: 82.6%
- **Weighted F1 Score**: 84.1%
- **Expected Calibration Error (ECE)**: 0.042 (Calibrated on 10 probability bins).
- **Mean Inference Latency**: 16.4 ms on standard x86 CPU.

## 5. Output Categories
1. Happy
2. Sad
3. Angry
4. Surprise
5. Fear
6. Disgust
7. Neutral
8. **Uncertain / Abstained** (Triggered when max softmax probability $< 0.42$ or when input quality is degraded).

## 6. Ethical Caveats & Environmental Boundaries
- **Observable Expression ≠ Emotion**: Observable facial displacements (e.g. smile via zygomaticus major contraction) do not guarantee positive internal subjective emotion.
- **Lighting & Pose Sensitivity**: Yaw angles $> 45^\circ$ or extreme shadows ($\mu < 45$) degrade classification precision by up to 12%. Input quality diagnostics must be inspected before drawing experimental conclusions.
