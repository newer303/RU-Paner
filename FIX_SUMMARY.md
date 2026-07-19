Fixed the main issue: app/page.tsx was incorrectly overwritten with login page code instead of being the main application layout. Restored the correct application homepage with all tabs (home, calendar, roadmap, courses, planner, degree, notify) and proper sidebar navigation.

Also cleaned up the login page:
- Fixed deprecated React.FormEvent usage
- Removed unused handleGoogleSignIn function (inline instead)
- Removed complex interaction tracking that was preventing auto-submit (as requested to "fix back")
- Kept basic login functionality intact

The application should now:
1. Show the correct homepage at http://localhost:3000 instead of a login form
2. Properly navigate to /login when authentication is needed
3. Allow manual login without interference from auto-fill behaviors (though basic browser auto-fill may still occur)