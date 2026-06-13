<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1aGi35dU_zWMh4qr4N8-BV_ECsb-wgVUX

## Firebase Configuration

This app uses an automatically provisioned Firebase project for authentication and database storage.

Configuration is managed via `firebase-applet-config.json`, which is bootstrapped by AI Studio. Firestore Security Rules are managed in `firestore.rules`.

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
