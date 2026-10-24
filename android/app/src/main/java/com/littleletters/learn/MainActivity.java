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

/** An offline Android shell; all JS and images come from app/src/main/assets. */
public final class MainActivity extends Activity {
    private static final String ASSET_BASE = "https://appassets.androidplatform.net/assets/";
    private WebView webView;
    private TextToSpeech speech;
    private volatile boolean speechReady;
    private String queuedSpeech;

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
            if (!url.startsWith(ASSET_BASE)) return denied();
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
