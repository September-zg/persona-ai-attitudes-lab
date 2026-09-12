# AI-assisted development log

## Phase 1 — specification

- Status: implemented locally; runtime verification pending.
- Decisions: staged implementation, deterministic server-side scoring, minimal data collection, explicit consent and non-diagnostic language.
- Verification: repository inspection completed on 2026-09-12. Node/npm are unavailable in the current shell, so application scaffolding and automated tests are blocked until a runtime is available.


## Phase 3 — local persistence and aggregate view

- Implemented localStorage persistence for completed responses.
- Implemented a research summary view with participant count, dimension means, and item response counts.
- Limitation: browser-local data is not a secure research datastore; authentication, server-side validation, export controls, and cloud persistence remain for a later phase.

## Phase 4 — pilot feedback and export

- Added optional post-assessment usability rating and free-text feedback.
- Added researcher JSON export for locally stored responses and feedback.
- These features support pilot evidence collection but do not replace consent, access control, or a secure production datastore.

## Phase 5 — pilot operations

- Added a participant and researcher operating checklist in `docs/pilot-evaluation.md`.
- The project owner must recruit participants, obtain consent, review feedback, and keep the exported data secure.

## Phase 6 — scoring validation

- Added an independent, dependency-free scoring specification check.
- Verified reverse mapping, means, mixed keyed items, and scale boundaries.
- Browser interaction and end-to-end checks remain pending because this environment has no Node/npm test runner.

## Phase 7 — backend foundation

- Added a dependency-free Python HTTP server with JSON persistence and basic response/feedback/summary endpoints.
- Verified Python syntax and import. The browser UI is not yet wired to these endpoints; this is intentionally a separate next step.

## Phase 8 — API wiring

- Frontend now posts completed responses and feedback to the local server when opened over `http://`.
- Researcher summary fetches server responses when the API is available and falls back to local records if unavailable.
- Local storage remains as a fallback during development.

## Phase 9 — requirements audit fixes

- Added neutral dimension explanations to participant results.
- Fixed researcher wording and JSON export to prefer server data.
- Added duplicate-click protection while a response is being submitted.
- Added payload size, shape, rating, and comment validation plus a write lock to the Python API.

## Phase 10 — dashboard wording and visual review

- Reviewed the dashboard in the local browser after API wiring.
- Changed “participant count” wording to “completed submission count” because the prototype does not collect participant identifiers and cannot deduplicate people.
- Added average-score bars and feedback summaries while keeping small-sample interpretation descriptive.

## Phase 11 — instrument alignment

- Compared the personality item directions with the official Mini-IPIP key.
- Replaced loose paraphrases with closer Chinese translations of the keyed item meanings.
- Kept the translation explicitly labelled as project-authored and unvalidated.
- Re-ran independent scoring checks successfully.

## Phase 12 — empty feedback display

- Fixed the dashboard so an empty comment is explicitly labelled “暂无文字反馈” while rating-only feedback remains counted.

## Phase 13 — feedback row alignment

- Updated the researcher summary so each feedback rating and its corresponding text appear on the same row.
- Empty comments are labelled “无文字意见”.

## Phase 14 — response scale refinement

- Personality items now use accuracy/applicability anchors; AI-attitude items retain agreement anchors.
- Added section-specific instructions: answer as you generally are, not as you wish to be, and select one response per item.
- This preserves the five-point format while aligning response meaning with each construct.

## Phase 15 — small-sample guardrails

- Cronbach α and Pearson correlations now remain hidden until at least 10 complete submissions are available.
- This prevents development/test records from being presented as meaningful psychometric evidence.

## Phase 16 — participant/researcher separation

- Removed the researcher dashboard button from participant-facing result and thank-you pages.
- Added a separate researcher view entry point: `index.html?view=admin`.
- This improves navigation separation; production deployment still requires real authentication for the summary API.

## Phase 17 — dashboard reliability correction

- Fixed Cronbach α inputs to reverse-key keyed items before calculating item variances.
- The earlier negative α values were caused by mixing raw and reverse-keyed item directions in the reliability calculation; they must not be used as final findings.

## Phase 18 — analysis transparency

- Added `docs/analysis-methods.md` describing data grain, scoring, descriptive statistics, α, Pearson correlation, feedback handling, and interpretation limits.
- Added average feedback rating to the researcher summary.

## Phase 19 — researcher summaries

- Added data-grounded personality and AI-attitude section summaries.
- Added a final synthesis statement with submission/feedback counts and explicit non-causal, non-clinical limits.
- Summaries use relative highest/lowest descriptive means and do not label scores as good/bad.

## Phase 20 — final synthesis wording

- Replaced the generic comprehensive-analysis sentence with a data-grounded synthesis of sample counts, highest/lowest dimension summaries, and feedback average.
- Kept explicit limits against causal, population, and clinical interpretation.

## Phase 21 — plain-language construct labels

- Added plain-language definitions for personality and AI-attitude constructs in researcher summaries.
- Clarified conscientiousness, neuroticism, perceived usefulness, trust/adoption, and risk concern without implying good/bad traits or behavior prediction.

## Phase 22 — visible construct glosses

- Added parenthetical plain-language glosses to all dimension labels across results and dashboard views.

## Phase 23 — dashboard reading order

- Moved per-question response distributions directly after the submission and feedback overview.
- Moved dimension averages before the personality and AI-attitude summaries.
- Preserved all three content blocks exactly; scoring and stored data were not modified.
- Verified source heading order and exact block preservation with a Python assertion check. Browser rendering has not yet been verified for this change.

## Phase 24 — construct-first summaries

- Reordered both dashboard insight cards so construct definitions appear before highest/lowest summaries.
- Added a short cue, “先了解各维度含义”, to make the reading order explicit.
- Kept descriptive limitations after each summary.

## Phase 25 — separate highest and lowest lines

- Displayed highest and lowest dimension summaries on separate lines in insight cards and the final synthesis.
- Added spacing and bold labels for easier scanning.

## Phase 26 — remove duplicated synthesis section

- Removed the redundant “综合分析说明” block from the researcher dashboard because its content repeated the personality and AI-attitude summaries above.
- Removed the unused finalSummary calculation; statistical analysis and feedback sections remain.

## Phase 27 — methods and integrated conclusion

- Added plain-language method notes for Cronbach alpha and Pearson correlation, including interpretation limits.
- Added an integrated conclusion section immediately above the feedback summary.
- The conclusion combines descriptive dimension summaries, alpha status, strongest available correlation, and feedback count/average while retaining small-sample and non-causal caveats.

## Phase 28 — interpretive integrated conclusion

- Replaced the integrated conclusion list with narrative interpretation of dimension spread, reliability evidence, strongest correlation, and feedback quality.
- The narrative distinguishes descriptive patterns from exploratory signals and keeps non-causal, small-sample, and non-clinical limits.

## Phase 29 — dimension-level reliability

- Replaced the single combined personality alpha with separate alpha values for each Big Five dimension and each AI-attitude subscale.
- Updated reliability interpretation and warnings to identify affected subscales.
- Added a dashboard note explaining that these values are exploratory and that the personality dimensions should not be combined into one alpha.

## Phase 30 — synthetic validation fixture

- Added ten clearly marked synthetic response records and a non-destructive loader for local validation.
- The fixture encodes reverse-keyed answers so each dimension mean, dimension-level alpha, and cross-dimension Pearson correlation have predictable expected values.
- Documented expected dashboard outputs and the requirement to exclude fixture records from the formal pilot.

## Phase 31 — clarify local versus server clearing

- Renamed the dashboard cleanup button to make clear that it only clears browser-local fallback data.
- Added visible copy explaining that server data in `data.json` is not removed by this button.
- Updated the confirmation message to describe the exact scope of the action.

## Phase 32 — tie-aware summaries

- Prevented the dashboard from labeling arbitrary dimensions as highest or lowest when means are tied.
- Equal means now render as “各维度均值相同” and tied extrema are grouped together.

## Phase 33 — synthetic data warning and home navigation

- Added a visible warning when researcher summaries include records marked `syntheticTest`.
- Fixed the researcher “返回首页” button to navigate to `index.html` instead of reloading the admin query view.

## Phase 34 — final interaction audit fixes

- Moved the synthetic-data warning outside the surrounding paragraph to keep the HTML structure valid.
- Disabled the feedback submission button before the network request to prevent accidental duplicate feedback records.

## Phase 35 — server-side score enforcement

- Added `scoring.py` as the canonical deterministic scoring implementation.
- Updated the server to validate answer ranges and recompute scores from answers, ignoring any client-provided scores.
- Extended scoring specification checks to cover complete-dimension scoring and a changed reverse-keyed answer.

## Phase 36 — save failure visibility

- `send()` now checks HTTP status and returns success/failure.
- Response submission alerts when the server did not confirm persistence while retaining the local copy.
- Feedback submission stays on the form with a visible status when the server does not confirm persistence, preventing a false thank-you state.

## Phase 37 — repository submission alignment

- Added submission-facing documentation files matching the example repository: AI development record, pilot evaluation, technical report, commit guide, data guidance, and tests guidance.
- Added `tests/test_scoring.py` with runnable server-side scoring tests.
- Kept the working frontend files at the repository root because `server.py` serves the root `index.html`; the template's `src/` layout is suggested rather than required.

## Phase 38 — submission structure marker

- Added `src/README.md` to document the current root-based source layout and preserve the no-build local server entry point.
- Re-ran Python compilation, scoring specification checks, and the unittest suite after adding the submission materials.

## Phase 39 — README and test coverage alignment

- Expanded the root README with offline/server run modes, measurement design, scoring formula, missing-data policy, and verification commands.
- Clarified local JSON storage and documented allowed synthetic or anonymized data artifacts.
- Added explicit source-layout and researcher-authentication limitations to `src/README.md`.
- Added minimum/maximum score tests and documented that researcher authorization testing remains unimplemented until authentication exists.

## Phase 40 — researcher API token guard

- Added an optional `ADMIN_TOKEN` environment setting. When configured, `/api/summary` rejects requests without the matching `X-Admin-Token` header.
- Added a researcher login form in the dashboard and sent the token on summary and export requests without placing it in the URL.
- Added automated tests for tokenless local preview and configured-token acceptance/rejection.
- Documented that this is a shared-token guard, not a full account, HTTPS, or audit system.

## Phase 41 — template data artifacts

- Added the clearly labelled synthetic validation fixture and a data dictionary under `data/`.
- Verified both copies contain 10 records and every record is marked `syntheticTest: true`; they must be excluded from real pilot reporting.

## Phase 42 — Chinese project documentation

- Translated the root and directory README content into Chinese while retaining the English filenames required by the repository template.
- Translated source comments, docstrings, and API validation messages into Chinese; programming-language keywords and stable code identifiers remain unchanged so the application continues to run.

## Phase 43 — Chinese submission documents

- Translated the main submission documents for AI development, pilot evaluation, technical reporting, GitHub submission, measurement, and synthetic data into Chinese.
- Kept commands, file paths, protocol names, and required template filenames unchanged so they remain executable and easy to locate.

## Phase 44 — expanded test scenarios

- Added independent scoring scenarios for isolated dimensions, mixed dimension values, illegal data types, and all five uniform score levels.
- Added `data/test-scenarios.md` to list the tested edge cases and distinguish them from real pilot data.
- Re-ran the full test suite: 11 tests passed.

## Phase 45 — interface visual refresh

- Reworked the shared stylesheet to improve the visual hierarchy of the questionnaire and researcher summary.
- Added clearer cards, spacing, table containers, score bars, focus states, responsive layouts, and mobile-friendly answer choices.
- Kept all scoring, storage, and analysis logic unchanged.
- Verified with the scoring examples, Python test suite, and syntax compilation; browser visual comparison still requires a manual refresh of the local page.

## Phase 46 — dashboard detail layout

- Limited long explanatory paragraphs to a readable line width so the summary is easier to scan.
- Replaced inline table scrolling styles with a reusable table container class.
- Turned each feedback entry into a separate bordered row with clearer score and comment alignment, including a mobile layout.

## Phase 47 — participant results layout

- Grouped the participant result cards into “人格特征” and “AI 态度” sections.
- Added a visual score bar and a short reading note so a participant can understand the 1–5 result without reading a dense list.
- Adjusted responsive breakpoints so tablet-sized screens use two columns and narrow phones use one column.
- Verified the complete questionnaire flow through the local browser and confirmed the new result page rendered correctly.

## Phase 48 — consistent flow navigation

- Added a small Chinese section label to the introduction, results, feedback, researcher, and login views.
- Added a two-step progress indicator to the questionnaire so participants can see the current section.
- Grouped the optional feedback form into a dedicated panel with clearer spacing and hierarchy.
- Rechecked the introduction and questionnaire pages in the local browser; no scoring or storage behavior was changed.

## 阶段 49 — 极端计分场景

- Added tests for every item’s boundary value, answer order independence, invalid answer containers, and preservation of fractional dimension means.
- The boundary test explicitly accounts for the different item counts in personality dimensions (4) and AI attitude subscales (2).
- Expanded the automated suite from 11 to 15 tests; all 15 tests and the scoring examples pass.

## 阶段 50 — 计分配置防错

- Added a strict check that the 26 configured item IDs are unique and complete.
- Unknown item IDs are now rejected instead of being silently ignored.
- Added tests for repeated calls and input immutability; the full suite now contains 18 passing tests.
