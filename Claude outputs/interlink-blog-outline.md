# Blog content plan: Interlink deployment story

You said you'll rewrite this in your own voice, so this is deliberately raw: the angle, the structure, and the real facts/numbers/quotes to hang each section on. Don't polish it here, just pull from it.

---

## Why a generic "how I deployed my app" post won't work

Most student deployment posts read the same: "I used Docker, here's my Dockerfile, I used Render, the end." That's a changelog, not a story, and it reads exactly like a thousand other tutorial recaps. What makes yours different is that you have a genuinely good, specific, slightly ironic throughline sitting right there in what actually happened: **almost every single bug you hit was some flavor of "it works on my machine, but not anywhere else."** Six completely different bugs, one root cause, told through your actual debugging process. That's a real thesis, not a listicle.

---

## The angle (pick one, or blend)

**Option A — recommended: "The ghost jar file"**
Open with the most vivid, specific detail you have: an earlier version of the team's backend Dockerfile had one line — `COPY target/demo-0.0.1-SNAPSHOT.jar app.jar` — that copied a file that, provably, never existed anywhere Render could see it. Not "a bug," a *file that was never there*. That's a great cold open: concrete, a little funny, immediately makes the reader curious how a whole deployment attempt was built around a file that didn't exist. Then zoom out: this turns out to be the same failure mode, in disguise, six different times.

**Option B — "Six 'works on my machine' bugs, ranked by how much they broke my brain"**
A structured countdown/ranking format. More listicle-shaped, easier to write fast, less literary but very readable and shareable.

**Option C — "What deploying a group project taught me that four years of coursework didn't"**
Leans into the internship-portfolio angle: framed for people evaluating your practical engineering judgment (recruiters, hiring panels), not just other students. Less about the bugs individually, more about the debugging *process* and decisions (why Static Site over Docker for the frontend, why build in a real Linux environment instead of guessing, etc.) as evidence of how you think.

Given you're actively applying for SWE/BA/PM internships, Option A's storytelling hooks a general reader, but weaving in a short section using Option C's framing (see "Section 6" below) gives the post double duty as portfolio content, not just a diary entry.

---

## Working titles (pick or remix)

- "The Jar File That Never Existed: What Deploying a Real App Actually Taught Me"
- "Six Bugs, One Root Cause: Deploying Interlink to the Real World"
- "It Works On My Machine — Deploying Interlink Proved That Wrong, Six Times"
- "From `localhost` to Live: The Debugging Diary Nobody Warns You About"

---

## Section-by-section content to include

### 1. The setup (short — 2-3 sentences of content, not paragraphs)
- What Interlink/SyncX is: a full recruitment-platform group project, Spring Boot 3.4.4 + Java 21 backend, React 19 + Vite 7 frontend, Supabase for Postgres/Auth/Storage
- It's a graded university team project (University of Moratuwa, BSc IT & Management) — real stakes, real teammates, not a toy tutorial
- One line establishing the stakes: it ran fine locally for months; nobody had actually gotten it live

### 2. The cold open — the ghost jar file
- Show the actual broken line from the old Dockerfile: `COPY target/demo-0.0.1-SNAPSHOT.jar app.jar`
- The twist: `target/` was gitignored, no `.jar` was ever committed — so this Dockerfile could never work on a server that clones fresh from GitHub
- The real reason it happened: it works perfectly fine if *you* build the jar locally first and then build the Docker image on your own machine — Docker just looks at whatever's on disk, `.gitignore` never enters into it. It only breaks the moment something else (a cloud build server) builds the image instead of you
- Name the lesson explicitly: "reproducible" doesn't mean "worked once on my laptop" — it means it works for someone, or something, that has never touched your machine

### 3. The fix that actually reproduces the build
- Contrast: your working Dockerfile builds the `.jar` *inside* the container itself, from source, using a two-stage build (Maven+JDK stage → slim JRE-only stage)
- Explain briefly why two stages: compile with the heavy toolchain, then throw that away and ship only the ~200MB result, not the ~600MB+ build environment
- Tie back to the thesis: this is the fix for "works on my machine" — nothing about the final image depends on what state your laptop happens to be in

### 4. The bugs that all turned out to be the same bug in disguise
Use these as short vignettes, each 3-5 sentences: what broke, the actual error text, the real cause, the fix. Real specifics to use:

- **The database password that was right and wrong at the same time.** Docker container failed with `password authentication failed for user "postgres"`. The `.env` file had a stale password. IntelliJ's Run Configuration had the correct one — and macOS lets Terminal and IntelliJ each hold a *different* value for the same environment variable name, silently. Lesson: "I checked, they're the same" can be wrong when two programs are checking different envs.
- **The case-sensitivity bug that only exists on Linux.** Render's build kept failing on things like `Could not resolve './pages/CAPages/ShortlistedCandidates'`. Turns out 12 import statements across the codebase had slightly-wrong capitalization (`CAPages` vs actual folder `CApages`, `AuthContext` vs actual `Authcontext.jsx`, `ChatBot.png` vs actual `Chatbot.png`, and more) — invisible on a Mac, because macOS's filesystem treats those as the same name; fatal on Linux, which doesn't. Good detail: instead of fixing these one at a time through slow failed Render deploys, you built a real disposable Linux environment to catch every mismatch in one pass.
- **The npm install that silently built the wrong app.** A known npm bug (`npm/cli#4828`): a lockfile generated on one OS/chip architecture can leave the wrong native binaries (`@rollup/rollup-linux-arm64-gnu`, etc.) missing on a different one. Not a code bug at all — a reminder that "npm install" isn't actually deterministic across machines the way people assume.
- **The Google sign-in that redirected to a computer that isn't yours.** After choosing a Google account, the page died with `bad_oauth_state` trying to load `localhost:3000` — a placeholder default in Supabase's Auth settings, never updated after going live. Good beat: the fix was blocked again by a *second* layer — your account only had "Developer" access on the shared Supabase project, so the field was literally greyed out, and you needed someone else's permission to finish your own fix.

### 5. The tradeoff you made on purpose (shows judgment, not just bug-fixing)
- Explain the Web Service vs Static Site decision: the backend needed to be a real always-running Docker container (Render Web Service); the frontend is just compiled files, so it went out as a Static Site instead — free, and it never sleeps, unlike the backend
- Mention the free-tier tradeoff you're actively managing: Render sleeps a free Web Service after 15 minutes idle, and your backend takes ~3 minutes to fully cold-boot on the free tier's slim CPU, so you set up a free external "keep-alive" pinger (UptimeRobot, every 5 minutes) to stop that from ever happening — and even that has a limit (750 free instance-hours per workspace per month, which one always-on service just barely fits inside)
- This section is what makes the post feel like engineering, not just "I fixed some errors" — deliberate tradeoffs under real constraints (money, sleep behavior, team access)

### 6. What this actually taught you (short closing section, ties to Option C)
- The recurring pattern across almost every bug: something that was true and invisible on your machine (a password, a filename's exact case, a pre-built file, a default setting) turned out not to be true anywhere else
- Optional stronger closing line: coursework teaches you to make something work once; shipping it teaches you to make it work for someone who has never touched your setup
- If you want the internship-portfolio angle explicit: one closing sentence connecting this to what you look for in your own future work — reproducibility, not just "it ran"

---

## Tone notes (to keep it un-generic when you rewrite)

- Keep the real error text and real numbers in — `bad_oauth_state`, `184 seconds`, `12 files`, `750 hours`, `15 minutes`, `401`. Specificity is what makes this not sound like every other "I learned Docker" post.
- Avoid the generic "deployment is hard but rewarding!" framing — let the ghost-jar-file irony and the specific bugs carry the "hard" part instead of stating it outright.
- It's fine (good, even) to admit things you didn't know going in — that's what makes the "works on my machine" thesis land, rather than reading like a highlight reel.
- Don't explain Docker/Render/CORS from scratch in the post itself — assume a technical reader, or link out to a glossary/explainer instead of pausing the story to define terms.
