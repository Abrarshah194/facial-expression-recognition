# Local-First Privacy Architecture & Governance

## 1. Local Processing Architecture
All video decoding, frame extraction, facial landmark localization, and neural expression classification execute **locally within the client browser runtime**:
- No video feeds or images are ever transmitted to remote cloud endpoints.
- Network activity is restricted strictly to local resources.

## 2. Zero Raw-Video Retention by Default
- During camera streaming and video file processing, raw image frames are processed in-memory and immediately released for garbage collection.
- Persistent session storage records only:
  - Timestamp offsets ($t$ seconds)
  - Estimated discrete category probabilities
  - Action Unit intensity scores
  - Optical quality diagnostic flags
- Raw media caching is disabled by default and requires explicit administrator opt-in.

## 3. Ephemeral Biometrics Policy
- Face bounding box indices (`Face #1`, `Face #2`) are ephemeral numerical tags for rendering bounding box overlays within a single video frame.
- **Strict Prohibition**: The system does NOT extract 128-d or 512-d facial biometric embeddings, does NOT query facial recognition databases, and does NOT perform re-identification or tracking across video jobs.

## 4. Configurable Retention & Automatic Purge
- Users can configure data retention periods of 1 Day, 7 Days, or 30 Days.
- Sessions exceeding the retention cutoff are automatically expunged from local storage on application startup.
- The **Privacy Center** provides a one-click &quot;Purge All Data&quot; function to immediately remove all local analysis artifacts.

## 5. Security & Formula Injection Protections
- All CSV report exports sanitize spreadsheet formula characters (`=`, `+`, `-`, `@`) with prepended apostrophes to prevent CSV formula injection when opening research archives in Microsoft Excel or Google Sheets.
