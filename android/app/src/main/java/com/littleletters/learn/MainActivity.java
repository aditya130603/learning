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
import android.speech.SpeechRecognizer;
import android.speech.RecognitionListener;
import android.speech.tts.Voice;
import android.os.Build;
import android.Manifest;
import android.content.pm.PackageManager;
import android.speech.tts.UtteranceProgressListener;
import org.json.JSONObject;

/** An offline Android shell; all JS and images come from app/src/main/assets. */
public final class MainActivity extends Activity {
    private static final String ASSET_BASE = "https://appassets.androidplatform.net/assets/";
    private WebView webView;
    private TextToSpeech speech;
    private volatile boolean speechReady;
    private LocalCoach localCoach;
    private SpeechRecognizer localRecognizer;
    private int offlineRecognitionId = -1;
    private static final int MODEL_REQUEST = 4602;
    private static final int MICROPHONE_REQUEST = 4603;
    private String queuedSpeech;
    private volatile String coachEndpoint = "";
    private volatile String companionVoices = "[]";
    private String defaultCompanionVoice = "";
    private String selectedCompanionVoice = "";
    private float companionPitch = 1f;
    private int recognitionGeneration = -1;
    private static final int VOICE_REQUEST = 4601;
    private void js(String code) { runOnUiThread(() -> { if(webView != null) webView.evaluateJavascript(code, null); }); }
    private void speechEnded(String id) {
        if(id != null && id.startsWith("coach:")) js("window.SpeakingCompanion && window.SpeakingCompanion.nativeSpeechEnd(" + id.substring(6) + ")");
    }

    @Override
    public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().setStatusBarColor(0xfff8f7f3);
        getWindow().setNavigationBarColor(0xfff8f7f3);
        if(android.os.Build.VERSION.SDK_INT >= 23) getWindow().getDecorView().setSystemUiVisibility(android.view.View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);
        webView = new WebView(this);
        webView.setBackgroundColor(0xfff8f7f3);
        setContentView(webView);
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setJavaScriptCanOpenWindowsAutomatically(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setDefaultTextEncodingName("UTF-8");
        localCoach = new LocalCoach(this, new CoachEvents() {
            @Override public void status(String message) { js("window.SpeakingCompanion && window.SpeakingCompanion.localStatus("+JSONObject.quote(message)+")"); }
            @Override public void reply(int id, String text, String error) { js("window.SpeakingCompanion && window.SpeakingCompanion.localReply("+id+","+JSONObject.quote(text)+","+JSONObject.quote(error)+")"); }
        });
        webView.addJavascriptInterface(new NativeBridge(), "LittleLettersAndroid");
        webView.setWebViewClient(new LocalAssetClient());
        speech = new TextToSpeech(this, status -> {
            if (status == TextToSpeech.SUCCESS && speech != null) {
                int result = speech.setLanguage(Locale.forLanguageTag("en-IN"));
                if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED) {
                    speech.setLanguage(Locale.US);
                }
                if (BuildConfig.OFFLINE_COACH) {
                    Voice local = null;
                    if(speech.getVoices()!=null) for(Voice v : speech.getVoices()) {
                        if(!v.isNetworkConnectionRequired() && "en".equals(v.getLocale().getLanguage())) { local=v; break; }
                    }
                    if(local == null || speech.setVoice(local) != TextToSpeech.SUCCESS) return;
                }
                speech.setSpeechRate(0.80f);
                speech.setOnUtteranceProgressListener(new UtteranceProgressListener() {
                    @Override public void onStart(String id) { }
                    @Override public void onDone(String id) { speechEnded(id); }
                    @Override public void onError(String id) { speechEnded(id); }
                });
                org.json.JSONArray voices = new org.json.JSONArray();
                if(speech.getVoices()!=null) for(Voice v:speech.getVoices()) if("en".equals(v.getLocale().getLanguage()) && (!BuildConfig.OFFLINE_COACH || !v.isNetworkConnectionRequired())) {
                    try { voices.put(new JSONObject().put("id",v.getName()).put("label",v.getLocale().toLanguageTag()+" · "+v.getName())); } catch(Exception ignored) { }
                }
                companionVoices=voices.toString();
                if(speech.getVoice()!=null)defaultCompanionVoice=speech.getVoice().getName();
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
        @JavascriptInterface public void downloadOfflineModel() { if(localCoach!=null)localCoach.downloadModel(); }
        @JavascriptInterface public void cancelModelDownload() { if(localCoach!=null)localCoach.cancelDownload(); }
        @JavascriptInterface public String companionVoices() { return companionVoices; }
        @JavascriptInterface public void selectCompanionVoice(String id, String character) {
            runOnUiThread(() -> { selectedCompanionVoice=id == null ? "" : id; companionPitch="arjun".equals(character)?0.94f:1.06f; });
        }
        @JavascriptInterface public String offlineStatus() { return localCoach == null ? "{}" : localCoach.status(); }
        @JavascriptInterface public boolean isOfflineBuild() { return BuildConfig.OFFLINE_COACH; }
        @JavascriptInterface public void importOfflineModel() {
            runOnUiThread(() -> {
                Intent intent=new Intent(Intent.ACTION_OPEN_DOCUMENT);
                intent.addCategory(Intent.CATEGORY_OPENABLE); intent.setType("*/*");
                try { startActivityForResult(intent, MODEL_REQUEST); }
                catch(Exception e) { js("window.SpeakingCompanion.localStatus('No file picker is available on this phone.')"); }
            });
        }
        @JavascriptInterface public void generateOffline(int id, String payload) { if(localCoach!=null && payload!=null && payload.length()<12000) localCoach.generate(id,payload); }
        @JavascriptInterface public void cancelOffline() { if(localCoach!=null) localCoach.cancel(); }
        @JavascriptInterface public void unloadOffline() { if(localCoach!=null) localCoach.unload(); }
        @JavascriptInterface public void removeOfflineModel() { if(localCoach!=null) localCoach.removeModel(); }
        @JavascriptInterface public void listenOffline(int id) { runOnUiThread(() -> startLocalRecognition(id)); }
        @JavascriptInterface public void configureCoach(String endpoint) {
            if(endpoint == null || BuildConfig.OFFLINE_COACH) return;
            Uri uri = Uri.parse(endpoint);
            if("https".equals(uri.getScheme()) && uri.getHost() != null && uri.getUserInfo() == null && "/v1/coach".equals(uri.getPath()) && uri.getQuery() == null) coachEndpoint = endpoint;
        }
        @JavascriptInterface public void stopSpeech() { runOnUiThread(() -> { queuedSpeech = null; if(speech != null) speech.stop(); }); }
        @JavascriptInterface public void speakCompanion(String text, int id) {
            if(text == null || text.length() > 2400) return;
            runOnUiThread(() -> {
                if(speech == null || !speechReady) { js("window.SpeakingCompanion.nativeSpeechEnd("+id+");window.SpeakingCompanion.localStatus(\"No installed offline English voice is ready. Read the reply or install an English voice in Android settings.\")"); return; }
                speech.stop();
                if(speech.getVoices()!=null) for(Voice v:speech.getVoices()) if(v.getName().equals(selectedCompanionVoice.isEmpty()?defaultCompanionVoice:selectedCompanionVoice) && "en".equals(v.getLocale().getLanguage()) && (!BuildConfig.OFFLINE_COACH || !v.isNetworkConnectionRequired())) { speech.setVoice(v); break; }
                speech.setPitch(companionPitch); speech.setSpeechRate(0.88f);
                speech.speak(text, TextToSpeech.QUEUE_FLUSH, null, "coach:"+id);
            });
        }
        @JavascriptInterface public void listen(int id) {
            runOnUiThread(() -> {
                if(BuildConfig.OFFLINE_COACH) { startLocalRecognition(id); return; }
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
        @JavascriptInterface public void stopListening() { runOnUiThread(() -> { recognitionGeneration = -1; offlineRecognitionId = -1; if(localRecognizer!=null) { localRecognizer.cancel(); localRecognizer.destroy(); localRecognizer=null; } finishActivity(VOICE_REQUEST); }); }

        @JavascriptInterface
        public void speak(String text) {
            if (text == null || text.length() > 160) return;
            runOnUiThread(() -> {
                if (!speechReady || speech == null) {
                    queuedSpeech = text;
                    return;
                }
                speech.stop();
                speech.setPitch(1f);speech.setSpeechRate(0.80f);
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

    private void startLocalRecognition(int id) {
        offlineRecognitionId=id;
        if(Build.VERSION.SDK_INT<31 || !SpeechRecognizer.isOnDeviceRecognitionAvailable(this)) {
            voiceResult(id,"","Offline speech recognition is not installed on this phone. Type instead; no cloud recognizer will be used."); return;
        }
        if(checkSelfPermission(Manifest.permission.RECORD_AUDIO)!=PackageManager.PERMISSION_GRANTED) {
            requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO},MICROPHONE_REQUEST); return;
        }
        if(speech!=null) speech.stop();
        if(localRecognizer!=null) { localRecognizer.destroy(); localRecognizer=null; }
        try {
            localRecognizer=SpeechRecognizer.createOnDeviceSpeechRecognizer(this);
            localRecognizer.setRecognitionListener(new RecognitionListener() {
                @Override public void onReadyForSpeech(Bundle params) { }
                @Override public void onBeginningOfSpeech() { }
                @Override public void onRmsChanged(float rms) { }
                @Override public void onBufferReceived(byte[] bytes) { }
                @Override public void onEndOfSpeech() { }
                @Override public void onPartialResults(Bundle results) { }
                @Override public void onEvent(int type,Bundle params) { }
                @Override public void onError(int error) { if(offlineRecognitionId==id) { offlineRecognitionId=-1; voiceResult(id,"","Offline recognition failed ("+error+"). Check installed English speech support, or type instead."); } }
                @Override public void onResults(Bundle results) {
                    if(offlineRecognitionId!=id) return; offlineRecognitionId=-1;
                    ArrayList<String> list=results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                    voiceResult(id,list!=null&&!list.isEmpty()?list.get(0):"","Check the transcript before sending.");
                }
            });
            Intent intent=new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
            intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL,RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
            intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE,"en-IN");
            intent.putExtra(RecognizerIntent.EXTRA_PREFER_OFFLINE,true);
            localRecognizer.startListening(intent);
        } catch(Exception e) { voiceResult(id,"","Offline recognition could not start. Type instead."); }
    }
    @Override public void onRequestPermissionsResult(int requestCode,String[] permissions,int[] results) {
        super.onRequestPermissionsResult(requestCode,permissions,results);
        if(requestCode!=MICROPHONE_REQUEST || offlineRecognitionId<0) return;
        int id=offlineRecognitionId;
        if(results.length>0 && results[0]==PackageManager.PERMISSION_GRANTED) startLocalRecognition(id);
        else { offlineRecognitionId=-1; voiceResult(id,"","Microphone permission denied. You can type your reply."); }
    }
    private void voiceResult(int id, String text, String error) {
        js("window.SpeakingCompanion && window.SpeakingCompanion.nativeResult(" + id + "," + JSONObject.quote(text) + "," + JSONObject.quote(error) + ")");
    }
    @Override protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if(requestCode == MODEL_REQUEST) {
            if(resultCode == RESULT_OK && data != null && data.getData() != null && localCoach != null) localCoach.importModel(data.getData());
            return;
        }
        if(requestCode != VOICE_REQUEST || recognitionGeneration < 0) return;
        int id=recognitionGeneration; recognitionGeneration=-1;
        ArrayList<String> results=data == null ? null : data.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS);
        if(resultCode == RESULT_OK && results != null && !results.isEmpty()) voiceResult(id, results.get(0), "");
        else voiceResult(id, "", "No speech received or recognition cancelled. Try again or type.");
    }
    @Override protected void onStop() {
        if(localCoach!=null) localCoach.unload();
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
        if(localRecognizer!=null) { localRecognizer.destroy(); localRecognizer=null; }
        if(localCoach!=null) { localCoach.close(); localCoach=null; }
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
