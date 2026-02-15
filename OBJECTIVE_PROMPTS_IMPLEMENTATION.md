# Objective Section Suggested Prompts Implementation

## Overview
Implemented "Suggested Prompts" in the Objective section of SOAP notes to standardize data entry for metrics like Pain Score and Range of Motion. This allows practitioners to quickly add structured data which is then formatted into the Objective text for automatic metric extraction.

## Changes Made

### 1. Components Updated
- `peer-care-connect/src/components/session/LiveSOAPNotes.tsx` (Live Recording Tab)
- `peer-care-connect/src/components/session/SOAPNotesTemplate.tsx` (Templates Tab)

### 2. New UI Features
Added a "Suggested Prompts" section above the "Objective Findings" textarea with:

#### Pain Score (VAS)
- **Interface**: Dropdown selection (0-10)
- **Functionality**: 
  - Selecting a value automatically adds "Pain Score (VAS): X/10" to the Objective text.
  - If a pain score already exists in the standard format, it updates the existing value.
  - Includes labels for pain levels (No Pain, Mild, Moderate, Severe, Worst Pain).

#### Range of Motion (ROM)
- **Interface**: 
  - Text input for "Movement" (e.g., "Shoulder Flexion")
  - Number input for "Degrees"
  - "+" Button to add
- **Functionality**:
  - Clicking add appends "ROM: [Movement] [Degrees]°" to the Objective text.
  - Clears inputs after adding for rapid entry of multiple measurements.

## User Flow
1. Practitioner navigates to "Objective" tab in SOAP notes.
2. Uses "Suggested Prompts" to select Pain Score or enter ROM.
3. System formats this data and inserts it into the main text area.
4. Practitioner can still manually edit the text area if needed.
5. When saving, the standardized text format ensures reliable "Automatic Metric Extraction" for the client's progress tracking.

## Technical Details
- Used `Select` component for Pain Score to ensure standard 0-10 input.
- Used regex to find and replace existing Pain Score entries to prevent duplicates.
- Added necessary imports (`Select`, `Input`, `Label`, `Plus` icon) to both components.

