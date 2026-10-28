package com.littleletters.learn;
import android.app.Activity;
import android.net.Uri;
public final class LocalCoach {
    private final CoachEvents events;
    public LocalCoach(Activity activity, CoachEvents events) { this.events=events; }
    public String status() { return "{\"supported\":false,\"installed\":false,\"busy\":false,\"message\":\"Install the optional offline-AI APK for local conversation.\"}"; }
    public void importModel(Uri uri) { events.status("Offline AI is not included in this APK."); }
    public void generate(int id, String payload) { events.reply(id,"","Offline AI is not included in this APK."); }
    public void downloadModel() { events.status("Install the offline AI edition to download a local model."); }
    public void cancelDownload() { }
    public void cancel() { }
    public void unload() { }
    public void removeModel() { }
    public void close() { }
}
