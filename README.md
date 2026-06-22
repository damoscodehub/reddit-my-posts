# Reddit – My Posts in Subreddit

A Tampermonkey userscript that adds a **"My Posts Here"** button to the Reddit header. Click it on any subreddit to instantly open a searchable list of all your posts in that community — including old ones Reddit's own search buries.

Results are powered by [Arctic Shift](https://arctic-shift.photon-reddit.com), a public Reddit archive with full-text search.

---

## Install

1. Install [Tampermonkey](https://www.tampermonkey.net/) for your browser.
2. Click **[Install script](my_posts_in_subreddit.user.js)** — Tampermonkey will open and prompt you to confirm.

---

## How it works

- The button appears in the header on any `reddit.com/r/*` page.
- On click it detects your username (from the page DOM or `/api/me.json`) and opens an Arctic Shift search pre-filtered to your posts in the current subreddit.
- Username is cached in memory for the session so subsequent clicks are instant.

## Requirements

- Must be logged in to Reddit.
- Works on the current Reddit UI (shreddit / new.reddit.com).

---

## License

[MIT](LICENSE)
