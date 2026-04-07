# Requirements Document

## Introduction

The analytics dashboard currently shows only lifetime totals (total generations, exports, views). This feature adds time-series aggregation derived from the existing `generatedAt` timestamps on each `Proposal`, and renders a trend chart in the `AnalyticsDashboard` component. Users will be able to see how many proposals were generated per day or per week, making it easy to spot activity trends at a glance. No new backend storage is required — the data is computed client-side from the Zustand `history[]` array, which already carries `generatedAt: string` (ISO datetime) on every proposal.

## Glossary

- **Dashboard**: The `AnalyticsDashboard` React component rendered on the home page.
- **History**: The `history[]` array in the Zustand proposal store, containing all locally-persisted `Proposal` objects.
- **Proposal**: A generated proposal object with a `generatedAt` ISO datetime string field.
- **Time_Series_Aggregator**: The pure function (or hook) responsible for bucketing proposals by date period.
- **Trend_Chart**: The new chart component added to the Dashboard that visualises proposals-per-period data.
- **Period**: A discrete time bucket — either `day` (calendar day) or `week` (ISO week starting Monday).
- **Bucket**: A single data point in the time series: `{ date: string; count: number }`.
- **Granularity**: The user-selected period size — either `"day"` or `"week"`.

## Requirements

### Requirement 1: Time-Series Aggregation

**User Story:** As a developer, I want a pure aggregation function that groups proposals by day or week, so that the chart always reflects the current history without additional API calls.

#### Acceptance Criteria

1. THE Time_Series_Aggregator SHALL accept an array of `Proposal` objects and a `Granularity` value as inputs.
2. WHEN the `Granularity` is `"day"`, THE Time_Series_Aggregator SHALL group proposals into Buckets keyed by `YYYY-MM-DD` (local calendar date derived from `generatedAt`).
3. WHEN the `Granularity` is `"week"`, THE Time_Series_Aggregator SHALL group proposals into Buckets keyed by the ISO date of the Monday that starts the proposal's calendar week.
4. THE Time_Series_Aggregator SHALL return Buckets sorted in ascending chronological order.
5. THE Time_Series_Aggregator SHALL include only Buckets for dates on which at least one proposal exists (no zero-padding for gaps).
6. IF the input array is empty, THEN THE Time_Series_Aggregator SHALL return an empty array.
7. FOR ALL non-empty input arrays, the sum of all Bucket `count` values SHALL equal the length of the input array (conservation property).

### Requirement 2: Granularity Toggle

**User Story:** As a user, I want to switch between daily and weekly views, so that I can zoom in on recent activity or see longer-term trends.

#### Acceptance Criteria

1. THE Dashboard SHALL render a toggle control with exactly two options: `"Day"` and `"Week"`.
2. WHEN the user selects a Granularity option, THE Dashboard SHALL re-render the Trend_Chart using Buckets computed at the selected Granularity.
3. THE Dashboard SHALL default to `"week"` Granularity on initial render.
4. WHILE a Granularity option is active, THE Dashboard SHALL visually distinguish the active option from the inactive option.

### Requirement 3: Trend Chart Rendering

**User Story:** As a user, I want to see a bar chart of proposals over time, so that I can quickly understand generation trends.

#### Acceptance Criteria

1. THE Trend_Chart SHALL render one bar per Bucket, where bar height is proportional to the Bucket `count`.
2. THE Trend_Chart SHALL label the x-axis with human-readable date strings derived from each Bucket's `date` key (e.g. `"Mon 12"` for day view, `"Jan 6"` for week view).
3. THE Trend_Chart SHALL display the numeric `count` value on hover or as a tooltip for each bar.
4. IF the aggregated Bucket array is empty, THEN THE Trend_Chart SHALL render an empty-state message instead of a chart.
5. THE Trend_Chart SHALL be implemented using only libraries already present in the project (no new charting dependency required); a CSS/Tailwind-based bar chart is acceptable.
6. THE Dashboard SHALL place the Trend_Chart in a dedicated `Card` consistent with the existing card styling in `AnalyticsDashboard`.

### Requirement 4: Integration with Existing Store

**User Story:** As a developer, I want the time-series data to be derived reactively from the existing Zustand store, so that the chart updates automatically whenever a proposal is added or removed.

#### Acceptance Criteria

1. THE Dashboard SHALL derive time-series Buckets by passing `history` from the Zustand store directly to the Time_Series_Aggregator on each render.
2. THE Dashboard SHALL NOT introduce a new persisted field in the Zustand store for time-series data.
3. WHEN a proposal is added to `history`, THE Trend_Chart SHALL reflect the updated counts on the next render without requiring a manual refresh.
4. WHEN a proposal is removed from `history`, THE Trend_Chart SHALL reflect the updated counts on the next render without requiring a manual refresh.

### Requirement 5: Aggregator Correctness (Round-Trip & Invariants)

**User Story:** As a developer, I want the aggregation logic to be verifiable through automated tests, so that regressions are caught early.

#### Acceptance Criteria

1. FOR ALL arrays of Proposals with valid `generatedAt` values, the sum of Bucket counts produced by the Time_Series_Aggregator SHALL equal the length of the input array.
2. WHEN the Time_Series_Aggregator is applied twice to the same input with the same Granularity, THE Time_Series_Aggregator SHALL return an equivalent result (idempotence).
3. WHEN proposals share the same calendar day, THE Time_Series_Aggregator SHALL produce exactly one Bucket for that day with a `count` equal to the number of proposals on that day.
4. WHEN proposals span multiple calendar days, THE Time_Series_Aggregator SHALL produce one Bucket per distinct day, each with the correct count.
