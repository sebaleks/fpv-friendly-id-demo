# BlueMark FPV Work Allocation

Source: interview answers pasted on 2026-05-02. `team/interview_results/` currently contains only its README, so this plan uses the pasted answers as the active interview record.

Team assistant folders:

- `team/sebastian/` - Sebastian
- `team/arpit/` - Arpit
- `team/nicholas/` - Nicholas
- `team/birger/` - Birger

## Sebastian

- Assigned role: Project coordinator, demo integrator, and detection support.
- Why this fits: Sebastian has the most available time, is comfortable with Python and data science, and should keep integration decisions coherent.
- Primary responsibilities: Keep scope controlled, maintain docs, coordinate handoffs, define demo acceptance criteria, support detection/noise work.
- Secondary responsibilities: Help with test clips, simple scripts, dashboard copy, and final judging flow.
- Owns: `README.md`, `HANDOFF.md`, `docs/`, `team/work_allocation.md`, `team/sebastian/`, future integration notes.
- Coordinates with: Arpit on dashboard/API needs, Nicholas on detector outputs, Birger on domain accuracy and pitch framing.
- Avoid unless coordinated: Deep frontend architecture, complex backend rewrites, teammate-owned suggestion files.
- First 3 tasks:
  1. Convert storyboard into a strict 3-minute demo script.
  2. Define the exact dashboard status states and operator-facing copy.
  3. Create a final integration checklist before feature work starts.

## Arpit

- Assigned role: Frontend/dashboard and app architecture lead.
- Why this fits: Arpit has deep engineering experience, strong frontend background, backend/API experience, and expert Git comfort.
- Primary responsibilities: Own the dashboard UX, state display, app shell, frontend/backend interface shape, and review integration quality.
- Secondary responsibilities: Help define API contracts, keep the repo shippable, support Git workflow and PR reviews.
- Owns: `team/arpit/`, future dashboard files, future API contract docs, future frontend app structure.
- Coordinates with: Nicholas on detector result schema, Sebastian on demo flow and copy, Birger on domain language.
- Avoid unless coordinated: Reframing the mission/pitch, changing detector behavior without Nicholas, editing Sebastian coordination docs without handoff.
- First 3 tasks:
  1. Draft the minimal dashboard screen layout and status model.
  2. Define the frontend contract for detector output.
  3. Set a simple Git workflow for fast hackathon collaboration.

## Nicholas

- Assigned role: Detection, simulation, and technical prototype lead.
- Why this fits: Nicholas has strong ML/data science, image denoising, full-stack, Python, TypeScript, statistics, and hackathon experience.
- Primary responsibilities: Own marker detection approach, video/noise simulation plan, confidence/status logic, and technical feasibility.
- Secondary responsibilities: Support backend/API wiring, advise on model-free versus ML-based detection tradeoffs, help debug integration.
- Owns: `team/nicholas/`, future detector files, future simulation files, future technical validation notes.
- Coordinates with: Arpit on detector output schema, Sebastian on demo acceptance criteria, Birger on domain realism.
- Avoid unless coordinated: Major dashboard UX decisions, final pitch language, broad repo restructuring.
- First 3 tasks:
  1. Propose the simplest marker/detector design that can survive degraded video.
  2. Define `Friendly Verified`, `Unknown`, `Corrupted`, and `Possible Spoof` detection criteria.
  3. Identify the minimum sample assets needed to prove the demo.

## Birger

- Assigned role: Technical advisor and domain/pitch reviewer.
- Why this fits: Birger has limited coding time and is not a major coder, but brings domain knowledge that can keep the demo credible.
- Primary responsibilities: Review problem framing, validate domain language, advise on realistic operator concerns, support Q&A.
- Secondary responsibilities: Suggest demo scenarios, review storyboard, help identify what sounds unrealistic or unsafe.
- Owns: `team/birger/`, future domain notes, pitch review notes, scenario feedback.
- Coordinates with: Sebastian on problem statement and pitch, Arpit on dashboard wording, Nicholas on realistic signal/degradation assumptions.
- Avoid unless coordinated: Source code, package/dependency changes, detector implementation, frontend implementation.
- First 3 tasks:
  1. Review `docs/problem_statement.md` for domain credibility.
  2. Add 3 realistic demo scenarios and what an operator would care about.
  3. Review final pitch for safety and non-operational framing.

## Shared Interfaces

- Detector to dashboard: status, confidence, reason, frame/time reference.
- Demo assets to detector: clean feed, marked feed, degraded feed, malformed marker example.
- Storyboard to implementation: exact sequence, expected visible status, human-in-the-loop warning.
- Safety review: all public-facing language must keep the project as a simulated deconfliction aid.
