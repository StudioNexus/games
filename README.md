# The Mystery of the Seven Stars

A small, standalone **Bible knowledge quiz** built with HTML, CSS, and JavaScript. This is a public educational-game demonstration from StudioNexus, not the source repository for Amazing Grace Home Living or its production website.

## What is playable

- Three quiz stages with four questions each, for 12 questions total.
- Ten points per correct answer, with immediate answer feedback.
- A **local top-five scoreboard** saved in the visitor's browser. It is not an online leaderboard, account, or verified achievement.
- Optional synthesized music and effects using Tone.js from a third-party CDN. The quiz remains playable if audio is unavailable.
- No account, payment, backend, analytics, or API key is required.

## Run locally

```sh
python -m http.server 8000
```

Open `http://localhost:8000` and choose **Start Game**. Static hosting that serves `index.html` also works; a currently active public deployment is not asserted here.

To run the gameplay and source safety checks, use Node 22+:

```sh
node --test tests/*.test.mjs
```

## Privacy and security

Names entered for the local scoreboard stay in that browser's storage. Input is rendered as text, not injected into HTML, and stored scores are validated on load. Clearing this site's browser storage clears the scoreboard. Do not enter sensitive personal information as a player name.

This repository is a focused teaching sample. For a larger Bible-study arcade with additional games and mission activities, see [Voice of Jesus Ministry](https://voiceofjesusministry.net/arcade).

See [LICENSE](LICENSE) for repository licensing.
