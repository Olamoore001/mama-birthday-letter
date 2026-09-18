# For Mummy — Digital Birthday Letter

## Folder structure

```
birthday-letter/
├── index.html
├── style.css
├── script.js
└── assets/
    └── background-music.mp3   ← add your own music file here
```

## Adding the music

Drop any `.mp3` file into `assets/` and name it exactly `background-music.mp3`.
If you skip this step the site still works perfectly — it just plays silently.
Keep the track fairly quiet/instrumental; the volume is already automated to
rise and fall at the right emotional beats (softest during the prayer,
warmest during the birthday reveal).

## Editing the personal content

Every message lives directly in `index.html`, wrapped in comments like:

```html
<!-- EDIT LETTER CONTENT HERE -->
...
<!-- END EDIT LETTER CONTENT -->
```

Look for these six spots and replace the sample text with your own words —
you don't need to touch `style.css` or `script.js` at all:

1. `EDIT OPENING TEXT HERE`
2. `EDIT LETTER CONTENT HERE`
3. `EDIT THANK YOU MESSAGE HERE`
4. `EDIT PRAYER HERE`
5. `EDIT BIRTHDAY MESSAGE HERE`
6. `EDIT FINAL MESSAGE HERE`

Each paragraph you add inside those blocks (`<p>...</p>`) will automatically
get its own gentle reveal animation — no extra work needed.

## Running it locally

Just open `index.html` in a browser, or serve the folder with any static
file server. To deploy, drag the whole `birthday-letter` folder into Vercel
(or any static host) — no build step required.
