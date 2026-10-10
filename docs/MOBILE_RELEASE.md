# Life Leveling mobile release

The React client is packaged as a cross-platform Capacitor app. The generated `client/android` and `client/ios` projects are checked in so the same app can be built for Google Play and the Apple App Store.

## Before building a release

1. Deploy the Node API and MongoDB to a production service with HTTPS, backups, monitoring, and secrets configured server-side. Never ship the Groq or JWT secret in the client.
2. Copy `client/.env.example` to `client/.env.production` and set `VITE_API_URL` to the real HTTPS API base, ending in `/api`. The production bundle rejects localhost API URLs.
3. Set the backend `CLIENT_URL` to the deployed web origin(s), comma separated. Capacitor origins are allowed for native requests.
4. Publish a privacy policy and account/data deletion instructions at stable public URLs. Review the draft at `docs/PRIVACY_POLICY_DRAFT.md` with the actual operator contact and retention practices before publishing it.
5. Create Google Play Console and Apple Developer accounts, complete identity and tax/banking steps, and prepare store screenshots, iOS screenshots, age/content ratings, and accurate data-safety/privacy declarations. Account deletion is available in **Settings → Delete account** and requires the current password.

## Android (Google Play)

Requirements: Node.js 22+, Android Studio 2025.2.1 or newer, Android SDK, and a Google Play developer account. From `client`:

```sh
npm ci
npm run mobile:sync
npx cap open android
```

In Android Studio, test on real devices, set the production version code/name, configure the Play App Signing upload key, and create a signed Android App Bundle (`.aab`). Upload it to an internal testing track first, complete the Play listing and Data safety form, then promote reviewed releases. Keep the signing/upload key private and backed up.

## iOS (Apple App Store)

Requirements: macOS with Xcode 26 or newer and an Apple Developer account. From `client` on a Mac:

```sh
npm ci
npm run mobile:sync
npx cap open ios
```

In Xcode, select the `App` target, set the production bundle version and signing team, verify the bundle identifier `com.lifeleveling.app` is available to you, test on supported iPhones, archive, and upload through App Store Connect. Complete App Privacy, age rating, export compliance, screenshots, and support/privacy URLs before review.

## Known release inputs

- Production API domain, database hosting, and uptime/backup operations are not part of this repository.
- The app identifier is `com.lifeleveling.app`; change it before the first submission if you do not control that namespace. Treat it as permanent after release.
- Store accounts, signing certificates/keys, screenshots, listing copy, and legal contact details must be supplied by the publisher. App icon source and native icon assets are included in the project.
- Store approval is determined by Google and Apple. A successful local build does not guarantee approval.
