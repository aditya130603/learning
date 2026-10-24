# Little Letters 🌈

A mobile-friendly English vocabulary app for Class 1 learners.

**Live site (after Pages is enabled):** https://aditya130603.github.io/learning/

## Features

- A–Z picture words: start with 3 familiar words, later move to 5.
- Listen and repeat: browser text-to-speech when available.
- Three games: picture recognition, choosing words, spelling with letter tiles.
- Printable A4 worksheets: trace, missing letters, write from pictures.
- Parent view: tracks heard words, words built from tiles, and handwriting checked on paper.
- No accounts, analytics, paid APIs or backend. Progress saves in this browser only.
- Responsive for mobile, tablet and desktop.

## Learning method

10 minutes daily: **look → listen → say → recognise → build → write**.
Learning to build a word from tiles is not independent handwriting. Parents can mark handwriting practice separately.

**Letter X:** Few age-appropriate words begin with X. The first two are **x-ray** and **xylophone**. **Box**, **fox**, and **six** are clearly marked as ending-X words.

## Run locally

Open index.html in any modern web browser. No install is needed.

## Publish on GitHub Pages

1. Open repository **Settings → Pages**.
2. Under **Build and deployment**, choose **GitHub Actions**.
3. A workflow automatically deploys when main is updated.
4. Visit https://aditya130603.github.io/learning/

If Pages has not been enabled, the deployment may fail until step 2 is completed.

## Files

index.html — entrypoint  
styles.css — interface and printable worksheet layout  
words.js — vocabulary bank (26 × 5 words)  
app.js — lessons, games, worksheets, saved progress  
icon.svg — favicon  
.github/workflows/pages.yml — deployment

This is original practice material, not official CBSE content. Pictures are emojis and speech depends on device support.