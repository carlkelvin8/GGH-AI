# Requirements Document

## Introduction

This feature adds per-section revision history to the proposal editor. Currently, saving a section edit permanently overwrites the previous content with no way to recover it. The revision history feature stores every saved version of a section as an immutable snapshot (`{ content, editedAt }`), allowing users to browse past revisions and roll back to any prior version. History is persisted in the Zustand store (localStorage) and synced to the SQLite database via the existing Prisma-backed API.

## Glossary

- **Section**: A single entry in a proposal's `sections` array, identified by a UUID, with a `title` and `content`.
- **Revision**: An immutable snapshot of a section's content at a point in time, represented as `{ content: string, editedAt: string }` (ISO 8601 timestamp).
- **Revision_History**: The ordered array of Revisions for a given Section, newest first.
- **Revision_Store**: The Zustand store (`proposal-store.ts`) responsible for managing proposal and revision state.
- **Revision_Panel**: The UI component that displays the Revision_History for a Section and allows rollback.
- **Rollback**: The act of replacing a Section's current content with the content from a selected Revision.
- **ProposalSection**: The TypeScript type defined in `src/features/proposal/types.ts` representing a single section.

---

## Requirements

### Requirement 1: Store Revision History on Save

**User Story:** As a proposal author, I want every saved edit to a section to be recorded, so that I can access previous versions if I make a mistake.

#### Acceptance Criteria

1. WHEN a user saves an edited section, THE Revision_Store SHALL append a new Revision containing the previous content and the current UTC timestamp to that section's Revision_History before applying the new content.
2. THE Revision_Store SHALL maintain Revision_History entries in descending chronological order (newest first).
3. THE Revision_Store SHALL preserve Revision_History across page reloads via localStorage persistence.
4. IF a section has never been edited, THEN THE Revision_Store SHALL return an empty array for that section's Revision_History.
5. THE Revision_Store SHALL cap Revision_History at 50 entries per section, discarding the oldest entry when the limit is exceeded.

---

### Requirement 2: Extend the ProposalSection Type

**User Story:** As a developer, I want the ProposalSection type to carry its own revision history, so that revisions travel with the section through the entire data pipeline.

#### Acceptance Criteria

1. THE ProposalSection SHALL include an optional `revisions` field typed as an array of `{ content: string, editedAt: string }`.
2. WHEN a ProposalSection is created without a `revisions` field, THE system SHALL treat the field as an empty array.
3. THE Revision_Store SHALL validate ProposalSection data against the updated Zod schema on read and write.

---

### Requirement 3: Persist Revision History to the Database

**User Story:** As a proposal author, I want my revision history to survive a browser cache clear, so that I can recover old content even after losing local state.

#### Acceptance Criteria

1. WHEN a proposal is saved to the API, THE API SHALL serialize the full `sections` array — including each section's `revisions` field — as the `sections` JSON blob in the Prisma `Proposal` model.
2. WHEN a proposal is loaded from the API, THE API SHALL deserialize the `sections` JSON blob and return each section's `revisions` array intact.
3. IF the stored `sections` JSON does not contain a `revisions` field for a section, THEN THE API SHALL return an empty array for that section's `revisions` field (backward-compatible migration).

---

### Requirement 4: Display Revision History in the UI

**User Story:** As a proposal author, I want to view the revision history for a section, so that I can compare past versions before deciding to roll back.

#### Acceptance Criteria

1. WHEN a section has at least one Revision, THE Revision_Panel SHALL display a list of past revisions, each showing a human-readable relative timestamp (e.g. "2 hours ago") and a truncated content preview (first 120 characters).
2. WHEN a section has zero Revisions, THE Revision_Panel SHALL display an empty-state message indicating no history is available.
3. THE Revision_Panel SHALL be accessible from the section editor via a clearly labelled "History" control.
4. WHILE the Revision_Panel is open, THE Revision_Panel SHALL highlight the currently active (most recent) revision.

---

### Requirement 5: Roll Back to a Previous Revision

**User Story:** As a proposal author, I want to restore a section to a previous version, so that I can undo unwanted changes.

#### Acceptance Criteria

1. WHEN a user selects a Revision and confirms the rollback, THE Revision_Store SHALL set the section's current content to the selected Revision's content.
2. WHEN a rollback is performed, THE Revision_Store SHALL record the pre-rollback content as a new Revision in the section's Revision_History, preserving the full audit trail.
3. WHEN a rollback is performed, THE Revision_Panel SHALL close and the section editor SHALL display the restored content.
4. IF a user dismisses the rollback confirmation without confirming, THEN THE Revision_Store SHALL leave the section's content and Revision_History unchanged.

---

### Requirement 6: Expose a Rollback Action in the Store

**User Story:** As a developer, I want a dedicated `rollbackSection` action in the Zustand store, so that rollback logic is centralised and testable.

#### Acceptance Criteria

1. THE Revision_Store SHALL expose a `rollbackSection(sectionId: string, revisionIndex: number)` action.
2. WHEN `rollbackSection` is called with a valid `sectionId` and `revisionIndex`, THE Revision_Store SHALL apply the rollback and update both `currentProposal` and the matching entry in `history`.
3. IF `rollbackSection` is called with an invalid `sectionId` or an out-of-range `revisionIndex`, THEN THE Revision_Store SHALL leave state unchanged.
4. THE Revision_Store SHALL expose a `getSectionRevisions(sectionId: string)` selector that returns the Revision_History array for the given section, or an empty array if none exists.
