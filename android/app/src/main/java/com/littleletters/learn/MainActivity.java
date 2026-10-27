package com.littleletters.learn;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.content.Context;
import android.os.Bundle;
import android.print.PrintAttributes;
import android.print.PrintManager;
import android.speech.tts.TextToSpeech;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Locale;
import java.util.ArrayList;
import android.speech.RecognizerIntent;
import android.speech.tts.UtteranceProgressListener;
import org.json.JSONObject;

/** An offline Android shell; all JS and images come from app/src/main/assets. */
public final class MainActivity extends Activity {
    private static final String ASSET_BASE = "https://appassets.androidplatform.net/assets/";
    private WebView webView;
    private TextToSpeech speech;
    private volatile boolean speechReady;
    private String queuedSpeech;
    private volatile String coachEndpoint = "";
    private int recognitionGeneration = -1;
    private static final int VOICE_REQUEST = 4601;
    private void js(String code) { runOnUiThread(() -> { if(webView != null) webView.evaluateJavascript(code, null); }); }
    private void speechEnded(String id) {
        if(id != null && id.startsWith("coach:")) js("window.SpeakingCompanion && window.SpeakingCompanion.nativeSpeechEnd(" + id.substring(6) + ")");
    }

    @Override
    public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().setStatusBarColor(0xff725ad8);
        getWindow().setNavigationBarColor(0xfff6f4fc);
        webView = new WebView(this);
        webView.setBackgroundColor(0xfff6f4fc);
        setContentView(webView);
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setJavaScriptCanOpenWindowsAutomatically(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setDefaultTextEncodingName("UTF-8");
        webView.addJavascriptInterface(new NativeBridge(), "LittleLettersAndroid");
        webView.setWebViewClient(new LocalAssetClient());
        speech = new TextToSpeech(this, status -> {
            if (status == TextToSpeech.SUCCESS && speech != null) {
                int result = speech.setLanguage(Locale.forLanguageTag("en-IN"));
                if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED) {
                    speech.setLanguage(Locale.US);
                }
                speech.setSpeechRate(0.80f);
                speech.setOnUtteranceProgressListener(new UtteranceProgressListener() {
                    @Override public void onStart(String id) { }
                    @Override public void onDone(String id) { speechEnded(id); }
                    @Override public void onError(String id) { speechEnded(id); }
                });
                speechReady = true;
                if (queuedSpeech != null) {
                    speech.speak(queuedSpeech, TextToSpeech.QUEUE_FLUSH, null, "word");
                    queuedSpeech = null;
                }
            }
        });
        webView.loadUrl(ASSET_BASE + "index.html");
    }

    private final class LocalAssetClient extends WebViewClient {
        @Override
        public boolean shouldOverrideUrlLoading(WebView view, String url) {
            if(url.startsWith(ASSET_BASE)) return false;
            openApprovedLink(url);
            return true;
        }

        @Override
        public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
            String url = request.getUrl().toString();
            if (url.startsWith(ASSET_BASE)) return false;
            if (request.isForMainFrame()) openApprovedLink(url);
            return true;
        }

        @Override
        public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
            String url = request.getUrl().toString();
            if (!url.startsWith(ASSET_BASE)) {
                // Never permit remote scripts, navigation or arbitrary subresources.
                if (url.equals(coachEndpoint) && ("POST".equals(request.getMethod()) || "OPTIONS".equals(request.getMethod()))) return null;
                return denied();
            }
            String path = request.getUrl().getPath();
            if (path == null || !path.startsWith("/assets/")) return denied();
            String name = path.substring("/assets/".length());
            if (name.isEmpty() || name.contains("..") || name.contains("\\")) return denied();
            try {
                InputStream stream = getAssets().open(name);
                return new WebResourceResponse(mimeType(name), "UTF-8", stream);
            } catch (IOException ex) {
                return denied();
            }
        }

        private WebResourceResponse denied() {
            return new WebResourceResponse("text/plain", "UTF-8", new ByteArrayInputStream(new byte[0]));
        }

        private String mimeType(String name) {
            if (name.endsWith(".html")) return "text/html";
            if (name.endsWith(".css")) return "text/css";
            if (name.endsWith(".js")) return "application/javascript";
            if (name.endsWith(".svg")) return "image/svg+xml";
            if (name.endsWith(".png")) return "image/png";
            if (name.endsWith(".webp")) return "image/webp";
            if (name.endsWith(".webmanifest")) return "application/manifest+json";
            if (name.endsWith(".json")) return "application/json";
            return "application/octet-stream";
        }
    }

    private void openApprovedLink(String url) {
        if (url == null || !url.startsWith("https://aditya130603.github.io/learning/")) return;
        runOnUiThread(() -> {
            try { startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url))); }
            catch (Exception ignored) { }
        });
    }

    private final class NativeBridge {
        @JavascriptInterface public void configureCoach(String endpoint) {
            if(endpoint == null) return;
            Uri uri = Uri.parse(endpoint);
            if("https".equals(uri.getScheme()) && uri.getHost() != null && uri.getUserInfo() == null && "/v1/coach".equals(uri.getPath()) && uri.getQuery() == null) coachEndpoint = endpoint;
        }
        @JavascriptInterface public void stopSpeech() { runOnUiThread(() -> { queuedSpeech = null; if(speech != null) speech.stop(); }); }
        @JavascriptInterface public void speakCompanion(String text, int id) {
            if(text == null || text.length() > 2400) return;
            runOnUiThread(() -> {
                if(speech == null || !speechReady) { js("window.SpeakingCompanion.nativeSpeechEnd("+id+")"); return; }
                speech.stop(); speech.speak(text, TextToSpeech.QUEUE_FLUSH, null, "coach:"+id);
            });
        }
        @JavascriptInterface public void listen(int id) {
            runOnUiThread(() -> {
                recognitionGeneration = id;
                if(speech != null) speech.stop();
                Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
                intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
                intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, "en-IN");
                intent.putExtra(RecognizerIntent.EXTRA_PROMPT, "Speak English. You can edit the transcript before sending.");
                intent.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1);
                try { startActivityForResult(intent, VOICE_REQUEST); }
                catch(Exception e) { voiceResult(id, "", "Voice recognition is unavailable. Type your reply instead."); }
            });
        }
        @JavascriptInterface public void stopListening() { runOnUiThread(() -> { recognitionGeneration = -1; finishActivity(VOICE_REQUEST); }); }

        @JavascriptInterface
        public void speak(String text) {
            if (text == null || text.length() > 160) return;
            runOnUiThread(() -> {
                if (!speechReady || speech == null) {
                    queuedSpeech = text;
                    return;
                }
                speech.stop();
                speech.speak(text, TextToSpeech.QUEUE_FLUSH, null, "word");
            });
        }

        @JavascriptInterface
        public void shareChallenge(String url) {
            if (url == null || !url.startsWith("https://aditya130603.github.io/learning/#")) return;
            runOnUiThread(() -> {
                try {
                    Intent share = new Intent(Intent.ACTION_SEND);
                    share.setType("text/plain");
                    share.putExtra(Intent.EXTRA_TEXT, url);
                    startActivity(Intent.createChooser(share, "Share with a trusted friend"));
                } catch (Exception ignored) { }
            });
        }

        @JavascriptInterface
        public void printWorksheet() {
            runOnUiThread(() -> {
                if (webView == null) return;
                PrintManager manager = (PrintManager) getSystemService(Context.PRINT_SERVICE);
                if (manager != null) {
                    manager.print("Little Letters Worksheet",
                            webView.createPrintDocumentAdapter("Little Letters Worksheet"),
                            new PrintAttributes.Builder()
                                    .setMediaSize(PrintAttributes.MediaSize.ISO_A4)
                                    .build());
                }
            });
        }
    }

    private void voiceResult(int id, String text, String error) {
        js("window.SpeakingCompanion && window.SpeakingCompanion.nativeResult(" + id + "," + JSONObject.quote(text) + "," + JSONObject.quote(error) + ")");
    }
    @Override protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if(requestCode != VOICE_REQUEST || recognitionGeneration < 0) return;
        int id=recognitionGeneration; recognitionGeneration=-1;
        ArrayList<String> results=data == null ? null : data.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS);
        if(resultCode == RESULT_OK && results != null && !results.isEmpty()) voiceResult(id, results.get(0), "");
        else voiceResult(id, "", "No speech received or recognition cancelled. Try again or type.");
    }
    @Override protected void onStop() {
        if(speech != null) speech.stop();
        super.onStop();
    }
    @Override
    public void onBackPressed() {
        if (webView == null) {
            super.onBackPressed();
            return;
        }
        webView.evaluateJavascript(
            "(function(){var h=document.querySelector('.mobile-nav [data-nav=\"home\"]');" +
            "if(!h)return false;if(h.classList.contains('active'))return false;" +
            "h.click();return true;})()",
            value -> { if (!"true".equals(value)) finish(); });
    }

    @Override
    protected void onDestroy() {
        speechReady = false;
        if (speech != null) {
            speech.stop();
            speech.shutdown();
            speech = null;
        }
        if (webView != null) {
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }
}
