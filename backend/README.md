# Optional online conversation and sentence feedback

Requires Node 22+, an HTTPS reverse proxy, a provider supporting Chat Completions JSON output, and a provider key. This is not deployed automatically and no credentials are included. Offline lessons remain usable without it.

1. On your server, set the variables in `.env.example` using a private environment file or service manager. Set `COACH_MODEL` to a model supported by your account and `COACH_PROVIDER_KEY` to its secret. Generate a separate long random `COACH_DEVICE_TOKENS` value for each device; comma-separate multiple tokens. The app receives only its device token, never the provider key.
2. Start `node --env-file=/private/path/coach.env backend/server.mjs`. It binds localhost port 8787 by default. Keep the environment file outside the repository and web root.
3. Put TLS in front of `/v1/coach`, proxying to `127.0.0.1:8787`. Disable request-body/access-header logging. Limit request bodies to 24 KB at the proxy and rate-limit unauthenticated traffic there. Allow only the intended website origins through `COACH_ORIGINS`; Android's asset origin is already in the example.
4. In the app, Home → Learners & settings → Companion setup, enter `https://YOUR_HOST/v1/coach`, that device's access token, and enable the learner/parent permission and external-processing consent. Save settings.
5. Test text conversation first, then device recognition and voice playback. Select a model with JSON mode and `max_completion_tokens` support; the app handles invalid provider output as unavailable.

Routes: POST `/v1/coach` for conversation, or the same route with `operation: "evaluate"` for separate grammar/task/style feedback. Provider endpoint defaults to `https://api.openai.com/v1/chat/completions`. Reference: https://developers.openai.com/api/reference/resources/chat/subresources/completions/methods/create . The endpoint and model can be changed through server environment variables, not app code.

Text and enabled learning goals/mistakes are processed by the configured AI provider. Android/browser recognition may send audio to its speech provider; installed offline recognition/voices are device-dependent. No audio is uploaded to this backend. Device tokens are local application storage, so treat them as revocable access credentials. Uninstalling/clearing app data can erase local session history.

The service caps each device at 120 requests per UTC day by default, one in-flight request per token, 900 generated tokens per request, bounded recent history, 20-second provider timeout and 25-second client timeout. Limits count provider failures too, to bound retries. Counters are in memory and reset on service restart; for multi-instance or public deployment use a shared persistent quota store and provision/revoke device tokens through an authenticated account system. Do not distribute one global device token in a public APK.

Recurring cost depends on model pricing, context length and use. No fixed price or free/offline AI conversation is promised. Recognition → edited transcript → request → response → TTS is turn-based; it is slower than full-duplex streaming but simpler to interrupt and avoids self-recognition. No provider request has been made using real credentials during this upgrade.
