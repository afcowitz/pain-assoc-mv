Faruma font

style.css already references this folder for the Dhivehi typeface:
  fonts/Faruma.woff2
  fonts/Faruma.ttf

Faruma is Unicode-compliant and is the Maldivian government's standard
Thaana typeface, but it isn't distributed on a public font CDN, so it
needs to be added here manually:

1. Download Faruma (e.g. from RaajjeFonts: https://raajjefonts.github.io/)
2. Convert to .woff2 if you only have a .ttf (e.g. via https://cloudconvert.com/ttf-to-woff2),
   or just keep the .ttf — the CSS already falls back to it.
3. Drop the file(s) into this /fonts folder using the exact names above.

Until the file is added, the site falls back to Noto Sans Thaana
automatically — nothing breaks, it just won't be Faruma yet.
