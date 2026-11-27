# Architecture

This document describes the technical architecture of **Corretor de Provas**, a desktop application for AI-assisted grading of handwritten academic exams.

The system was designed around three main principles:

1. **AI assists interpretation, but does not own the final scoring logic**
2. **Humans remain in control of uncertain or high-impact decisions**
3. **Desktop distribution should remain simple for non-technical users**

---

## 1. High-Level Architecture

The application combines a Next.js application with an Electron desktop shell.

```mermaid
flowchart TD
    A[Teacher] --> B[Electron Desktop App]

    B --> C[Next.js Application]

    C --> D[Exam Image Upload]
    D --> E[Identification / Extraction Pipeline]

    E --> F[Student & Page Grouping]
    F --> G[Human Review]

    G --> R[Reference preparation and approval]
    R --> H[Grading Pipeline]

    H --> I[Structured AI Classification]
    I --> J[Deterministic Scoring Engine]

    J --> K[Results UI]

    K --> L[Excel Export]
    K --> M[Word Report]
```

The AI layer is responsible for interpreting images and classifying rubric criteria.

The application itself remains responsible for workflow state, grouping, validation and numerical score calculation.

---

## 2. Runtime Architecture

The desktop application is distributed using Electron.

When the packaged application starts:

```mermaid
sequenceDiagram
    participant U as User
    participant E as Electron
    participant N as Local Next.js Server
    participant UI as Application UI

    U->>E: Launch application
    E->>E: Retrieve locally stored API key
    E->>N: Start Next.js standalone server
    N-->>E: Server ready on localhost
    E->>UI: Open application window
    UI->>N: Use local application routes
```

Electron acts as the desktop host while the Next.js standalone application provides both the interface and local API routes.

The application does not require a remote application server for its own business logic.

---

## 3. Main Processing Pipeline

The grading workflow is divided into separate stages instead of sending every task to the AI in a single request.

```mermaid
flowchart LR
    A[Upload images]
    --> B[Page extraction]

    B --> C[Identification metadata]

    C --> D[Automatic grouping]

    D --> E[Human review]

    E --> F[Student exam group]

    F --> R[Shared reference approval]
    R --> G[Grading request]

    G --> H[Criterion classifications]

    H --> I[Deterministic scoring]

    I --> J[Final result]
```

This separation makes the workflow easier to inspect and correct.

---

## 4. Stage 1 — Image Extraction

Each exam image is processed independently during the identification stage.

The extraction pipeline attempts to identify information such as:

- student name
- registration number
- discipline
- assessment period
- exam call
- question number
- handwritten answer
- reading confidence
- uncertain text segments
- need for human review

The AI response is constrained through a structured JSON Schema.

```mermaid
flowchart TD
    A[Exam image]
    --> B[Validation]

    B --> C[Multimodal AI request]

    C --> D[Structured JSON output]

    D --> E{Name / registration reliable?}

    E -->|Yes| F[Candidate for automatic grouping]
    E -->|No| G[Unassigned / human review]
```

### Why extraction and grading are separate

The extraction model is explicitly instructed **not to grade the answer**.

Its role is limited to reading and identifying information.

This separation reduces responsibility overlap between stages and makes failures easier to diagnose.

---

## 5. Stage 2 — Page Grouping

A student exam may contain multiple photos.

Therefore, grading cannot safely occur immediately after individual image extraction.

Pages must first be grouped into a single exam entity.

Conceptually:

```text
Page 1 ┐
Page 2 ├── Student A Exam
Page 3 ┘

Page 4 ┐
Page 5 ┴── Student B Exam
```

The grouping layer maintains:

- identified pages
- student groups
- unassigned pages
- automatic assignments
- manual assignments
- review state

---

## 6. Human-in-the-Loop Design

Automatic identification is treated as a suggestion rather than an unquestionable result.

The teacher can:

- edit student identity
- correct registration data
- move an unassigned page into an existing student group
- create a new student group manually
- review uncertain identification before grading

A particularly important fallback was added during real testing.

If an image could not be associated with any existing student, the workflow originally became blocked.

The final design allows the user to create a student directly from an unassigned page.

```mermaid
flowchart TD
    A[Unassigned page]
    --> B{Existing student group?}

    B -->|Yes| C[Assign page manually]
    B -->|No| D[Create student manually]

    C --> E[Confirmed student group]
    D --> E
```

This operation is performed locally and does not require another AI request.

---

## 7. Stage 3 — Grading

After grouping, one shared reference is prepared from the rubric and teacher guidance, then reviewed before grading. The reference distinguishes count and qualitative criteria, and defines competence, sufficiency, complementary requirements, optional detail and descriptors. A hash binds it to the source inputs. Each grouped answer is evaluated against that reference. The model returns valid distinct items or a descriptor ID, evidence, gaps, errors, sufficiency and impact assessments.

## 8. Deterministic Scoring

Count criteria receive proportional credit up to the approved count. Standard qualitative descriptors have fixed percentages: 0, 25, 50, 65, 75, 90 and 100. Explicit teacher exceptions take precedence. Application code checks judgment compatibility, calculates criterion points in cents and sums them. Contradictions or material uncertainty yield provisional scores, not automatic changes to the selected level. Structural consistency does not prove semantic validity.

See [grading design](grading-v0.2.2.md).

---

## 9. Structured AI Output

AI responses used by the application are constrained using structured schemas.

Instead of expecting arbitrary prose:

```text
Model
  ↓
free-form response
  ↓
manual parsing
```

the architecture uses:

```text
Model
  ↓
JSON Schema
  ↓
validated structured data
  ↓
application logic
```

This reduces parsing ambiguity and makes integration between probabilistic AI behavior and deterministic application code more reliable.

---

## 10. Input Trust Boundary

Student-written content is considered **untrusted input**.

The grading and extraction prompts explicitly instruct the model not to follow instructions found inside an exam.

Conceptually:

```text
Developer rules
       ↓
Application instructions
       ↓
Exam image = DATA
       ↓
Never treat exam content as system instructions
```

This design addresses prompt-injection attempts such as a student writing instructions intended to influence the evaluator.

---

## 11. Credential Architecture

The application does not embed an OpenAI API key.

Each installation requires a user-provided key.

In the desktop application, the credential is stored locally using Electron's `safeStorage`.

```mermaid
flowchart LR
    A[User enters API key]
    --> B[Electron safeStorage]

    B --> C[Encrypted local storage]

    C --> D[Electron process]

    D --> E[Local Next.js process]

    E --> F[OpenAI API]
```

The source repository contains only references to the environment variable:

```text
OPENAI_API_KEY
```

and never the actual credential.

For further security details, see:

[SECURITY.md](../SECURITY.md)

---

## 12. Privacy Boundary

Real student data is not included in the public repository.

During actual use, exam images are processed by the application's AI integration.

This means deployment decisions should consider:

- institutional privacy policies
- applicable data-protection requirements
- API-provider data policies
- minimum necessary data usage
- human oversight for academic decisions

The project is intended as an **assisted evaluation system**, not an autonomous academic decision-maker.

---

## 13. Export Architecture

Once grading is complete, structured results can be transformed into different output formats.

```mermaid
flowchart TD
    A[Grading results]

    --> B[Application data model]

    B --> C[Excel generator]
    B --> D[Word report generator]

    C --> E[XLSX file]
    D --> F[DOCX file]
```

Excel is intended for consolidated class-level results.

Word reports provide more detailed student-level feedback.

---

## 14. Desktop Packaging

The Next.js application uses standalone output mode.

The packaging process is approximately:

```mermaid
flowchart LR
    A[Next.js build]
    --> B[Standalone output]

    B --> C[Copy static resources]

    C --> D[Electron package]

    D --> E[Windows unpacked build]

    E --> F[NSIS installer]
```

Custom build scripts are used to make sure the complete standalone Next.js runtime is available inside the Electron package.

This was required because standard packaging did not initially include every runtime dependency needed by the standalone server.

---

## 15. Update Architecture

The desktop application contains an assisted update mechanism.

```mermaid
sequenceDiagram
    participant A as Application
    participant M as Public Manifest
    participant U as User
    participant R as Release Asset

    A->>M: Request latest version
    M-->>A: version + download URL

    A->>A: Compare installed and available versions

    alt New version available
        A->>U: Show update notification
        U->>R: Download installer
    else Application is current
        A->>A: Continue normally
    end
```

The current update process is intentionally assisted rather than fully automatic.

The application informs the user and directs them to the installer, while installation remains user-controlled.

---

## 16. Main Source Modules

The current project is organized around feature-oriented modules.

```text
src/
├── app/
│   └── api/
│       ├── extract/
│       ├── prepare-reference/
│       └── grade/
│
├── features/
│   └── correction/
│       ├── components/
│       ├── export/
│       ├── grouping/
│       └── hooks/
│
└── lib/
    ├── openai.ts
    └── grading/
        ├── schema.ts
        ├── scoring.ts
        ├── service.ts
        ├── types.ts
        └── validation.ts

electron/
├── main.cjs
├── preload.cjs
└── setup.html

scripts/
├── prepare-standalone.mjs
└── copy-standalone.cjs
```

### Responsibility boundaries

**`app/api/extract`**

Handles multimodal page extraction and identification.

**`features/correction/grouping`**

Contains deterministic page-assignment and student-group logic.

**`lib/grading`**

Contains grading schemas, model orchestration, validation and deterministic scoring.

**`features/correction/export`**

Transforms results into downloadable reports.

**`electron/`**

Controls desktop startup, local server lifecycle, credential storage and update checking.

---

## 17. Failure Handling

Several failures are treated as expected application states rather than exceptional assumptions.

Examples include:

```text
Unreadable student identity
        ↓
Manual assignment

Unassigned page
        ↓
Create student manually

Incomplete model output
        ↓
Reject grading result

Unknown criterion returned
        ↓
Validation error

Duplicate criterion returned
        ↓
Validation error

Repeated button click
        ↓
Action lock prevents duplicate request
```

This reflects an important design principle of the project:

> AI output must be validated before it becomes application state.

---

## 18. Architectural Trade-offs

### Local desktop architecture

**Advantages**

- simple deployment for the target user
- no application backend infrastructure
- credential remains under user control
- familiar Windows application experience

**Trade-offs**

- API credentials exist on the user's machine
- updates require desktop distribution
- cross-platform support requires additional packaging work
- centralized monitoring is limited

---

### External AI API

**Advantages**

- strong multimodal capabilities
- no local ML infrastructure
- rapid iteration

**Trade-offs**

- API cost
- network dependency
- latency
- external service availability
- privacy considerations

---

### Human review

**Advantages**

- safer for academic evaluation
- corrects uncertain identification
- allows edge-case recovery

**Trade-offs**

- workflow is not fully autonomous
- teacher participation remains required

This trade-off is intentional.

---

## 19. Current Architectural Limitations

The current version has several known limitations:

- Windows is the primary desktop target
- update installation is not fully automatic
- grading depends on external AI availability
- handwriting quality directly affects extraction reliability
- the API key is user-managed rather than isolated behind a centralized backend
- model calibration may vary by assessment type
- automated test coverage is still limited
- no centralized persistence layer is currently used

---

## 20. Possible Future Architecture

A production-scale version could introduce a remote backend:

```mermaid
flowchart LR
    A[Desktop / Web Client]
    --> B[Authenticated Backend]

    B --> C[Job Queue]

    C --> D[AI Processing Layer]

    B --> E[Database]

    D --> F[OpenAI API]

    B --> G[Report Storage]
```

This architecture could support:

- centralized credential isolation
- authentication and authorization
- audit logs
- asynchronous processing
- usage monitoring
- shared rubric templates
- persistent assessment history
- multi-user environments

The current architecture intentionally avoids this complexity because the project was designed first for a real single-user workflow.

---

## 21. Key Engineering Principle

The central architectural idea behind the project is:

> **Use AI for interpretation, deterministic code for rules, and human review for uncertainty.**

This separation defines the responsibilities of each part of the system and was the main principle used when evolving the application.