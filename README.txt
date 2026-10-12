TRIP PLANNER — ALL FEATURES PROJECT

FEATURES INCLUDED
- Responsive professional design for desktop/mobile
- Register, login and logout (password hashes stored with bcrypt)
- Saved trips per account; view and delete saved trips
- Destination search and popular destination cards
- Hotel/stay planning estimates and external Google Maps hotel search
- Google Maps preview, destination search, directions and nearby tourist-place search
- Transport planning guidance
- Group budget calculator with itemized estimates
- 3–7 day itinerary generator; save itinerary/budget to account
- Browser-saved travel checklist
- SQLite-backed local database; health endpoint at /api/health

RUN ON WINDOWS
1. Extract this ZIP into a new folder.
2. Open that extracted folder in VS Code (the folder containing package.json).
3. Open Terminal: Terminal > New Terminal.
4. Run: npm.cmd install
5. When finished, run: npm.cmd start
6. Open http://localhost:5000 in your browser. Keep the terminal open while using the site.

IMPORTANT
- Use the project from this extracted folder, not a parent folder. If npm says package.json is missing, navigate to the folder that contains package.json.
- Do not delete the data folder if you have saved trips.
- Google Maps search is integrated via public links and embedded map; no Google Maps API key is required for this feature.
- Hotel/transport rates shown in the app are illustrative planning estimates. Hotel links search Google Maps; this app does not process payments, make real reservations, or guarantee availability.
- For public internet hosting, use a Node.js host and configure a persistent disk/storage for data/tripplanner.sqlite. The default session configuration is for a local demo; production deployment should set SESSION_SECRET and secure cookie settings under HTTPS. Do not publish database files or secrets.
