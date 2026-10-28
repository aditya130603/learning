package com.littleletters.learn

import android.app.Activity
import android.app.DownloadManager
import android.content.Context
import java.security.MessageDigest
import android.app.ActivityManager
import android.net.Uri
import com.google.ai.edge.litertlm.*
import org.json.JSONObject
import java.io.File
import java.io.FileOutputStream
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicBoolean
import java.util.concurrent.atomic.AtomicInteger

/** CPU inference is local. Only the pinned model is downloaded via Android DownloadManager. */
class LocalCoach(private val activity: Activity, private val events: CoachEvents) {
    private val worker = Executors.newSingleThreadExecutor()
    private val deadlines = Executors.newSingleThreadScheduledExecutor()
    private val epoch = AtomicInteger(0)
    private val busy = AtomicBoolean(false)
    private val closed = AtomicBoolean(false)
    private val model = File(activity.filesDir, "companion-int4.litertlm")
    private val lock = Any()
    @Volatile private var engine: Engine? = null
    @Volatile private var conversation: Conversation? = null
    private val downloads = activity.getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
    private val prefs = activity.getSharedPreferences("coach-download", Context.MODE_PRIVATE)
    private val downloading = AtomicBoolean(false)
    @Volatile private var progress = 0
    @Volatile private var note = "Download the voice companion model once."
    companion object {
        const val MODEL_URL = "https://huggingface.co/litert-community/Qwen3-0.6B/resolve/e6bb3e4a1eb3f663153f0c1c12b735d64be657a7/Qwen3-0.6B_dynamic_wi4b32_afp32.litertlm"
        const val MODEL_BYTES = 344671744L
        const val MODEL_SHA256 = "03e7da1eb1108b50dffaa9bb52cc7bcbad2eb0c66ca990267f480c1e545d2856"
    }
    init {
        val saved = prefs.getLong("id", -1)
        if(saved != -1L) { busy.set(true); downloading.set(true); worker.execute { monitorDownload(saved) } }
    }
    fun downloadModel() {
        if(closed.get() || !busy.compareAndSet(false,true)) { report("An operation is already in progress."); return }
        downloading.set(true)
        worker.execute {
            try {
                releaseEngine()
                check(activity.filesDir.usableSpace > 800_000_000L) { "Free at least 800 MB of storage, then try again." }
                val file = File(activity.getExternalFilesDir(null), "coach-download.litertlm")
                file.delete()
                val request = DownloadManager.Request(Uri.parse(MODEL_URL))
                    .setTitle("Word Mayhem · offline companion")
                    .setDescription("Downloading once for private, on-device conversations")
                    .setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
                    .setAllowedOverMetered(true).setAllowedOverRoaming(false)
                    .setDestinationInExternalFilesDir(activity, null, "coach-download.litertlm")
                val id = downloads.enqueue(request)
                prefs.edit().putLong("id", id).apply()
                monitorDownload(id)
            } catch(e: Exception) { downloading.set(false); busy.set(false); report(e.message ?: "Download could not start. Tap to retry.") }
        }
    }
    private fun monitorDownload(id: Long) {
        val temp = File(activity.filesDir, "companion-download.tmp")
        var retain = false
        try {
            while(true) {
                if(closed.get()) { retain=true; return } // Android continues; reconnect on next launch.
                check(prefs.getLong("id",-1)==id) { "Download cancelled." }
                var status = DownloadManager.STATUS_FAILED
                var reason = 0
                downloads.query(DownloadManager.Query().setFilterById(id)).use { cursor ->
                    check(cursor != null && cursor.moveToFirst()) { "Download is unavailable. Tap Download to retry." }
                    status=cursor.getInt(cursor.getColumnIndexOrThrow(DownloadManager.COLUMN_STATUS))
                    reason=cursor.getInt(cursor.getColumnIndexOrThrow(DownloadManager.COLUMN_REASON))
                    val bytes=cursor.getLong(cursor.getColumnIndexOrThrow(DownloadManager.COLUMN_BYTES_DOWNLOADED_SO_FAR))
                    progress=((bytes*100)/MODEL_BYTES).toInt().coerceIn(0,100)
                }
                if(status==DownloadManager.STATUS_SUCCESSFUL) break
                check(status!=DownloadManager.STATUS_FAILED) { "Download failed (Android code $reason). Check storage and internet, then retry." }
                report(if(status==DownloadManager.STATUS_PAUSED) "Download paused by Android. It will resume when a connection is available." else "Downloading · $progress%. You can leave the app; Android will continue.")
                Thread.sleep(1200)
            }
            report("Checking the downloaded model…")
            val source=File(activity.getExternalFilesDir(null),"coach-download.litertlm")
            check(source.length()==MODEL_BYTES) { "Download size check failed. Please retry." }
            val digest=MessageDigest.getInstance("SHA-256")
            source.inputStream().use { input -> FileOutputStream(temp).use { output ->
                val buffer=ByteArray(262144)
                while(true) {
                    if(closed.get()) { retain=true; return }
                    check(prefs.getLong("id",-1)==id) { "Download cancelled." }
                    val n=input.read(buffer);if(n<0)break
                    digest.update(buffer,0,n);output.write(buffer,0,n)
                }
                output.fd.sync()
            } }
            check(digest.digest().joinToString("") { "%02x".format(it) } == MODEL_SHA256) { "The model failed its integrity check. Please download again." }
            check(prefs.getLong("id",-1)==id) { "Download cancelled." }
            check(temp.renameTo(model)) { "Could not install the model. Your previous model was kept." }
            prefs.edit().putString("model","qwen3-0.6b-int4").apply()
            report("Ready for offline conversation.")
        } catch(e: Exception) { report(e.message ?: "Download failed. Tap to retry.") }
        finally {
            temp.delete()
            if(!retain) { downloads.remove(id); if(prefs.getLong("id",-1)==id)prefs.edit().remove("id").apply() }
            downloading.set(false);busy.set(false)
            if(!closed.get())report(note)
        }
    }
    fun cancelDownload() {
        val id=prefs.getLong("id",-1)
        prefs.edit().remove("id").apply()
        if(id != -1L)downloads.remove(id)
        report("Download cancelled. Tap Download to start again.")
    }

    fun status(): String = JSONObject().put("supported", true).put("installed", model.isFile)
        .put("busy", busy.get()).put("downloading",downloading.get()).put("progress",progress).put("model",prefs.getString("model","imported")).put("message", note).toString()
    private fun report(message: String) { note=message; if(!closed.get()) events.status(message) }
    private fun freeMemory(): Long {
        val info=ActivityManager.MemoryInfo()
        (activity.getSystemService(Activity.ACTIVITY_SERVICE) as ActivityManager).getMemoryInfo(info)
        return info.availMem
    }
    fun importModel(uri: Uri) {
        if(closed.get() || !busy.compareAndSet(false,true)) { report("Wait for the current operation to finish."); return }
        val ticket=epoch.incrementAndGet()
        report("Copying model into private storage. Keep this screen open.")
        worker.execute {
            val temp=File(activity.filesDir,"companion-import.tmp")
            try {
                releaseEngine()
                check(activity.filesDir.usableSpace>900_000_000L) { "Free at least 900 MB of internal storage before import." }
                var copied=0L
                activity.contentResolver.openInputStream(uri).use { input ->
                    requireNotNull(input) { "Could not read the selected model." }
                    FileOutputStream(temp).use { output ->
                        val buffer=ByteArray(262144)
                        while(true) {
                            check(ticket==epoch.get() && !closed.get()) { "Import cancelled." }
                            val n=input.read(buffer); if(n<0) break
                            copied+=n; check(copied<=800_000_000L) { "Choose the small int4 model (under 800 MB), not an int8 or larger model." }
                            output.write(buffer,0,n)
                        }
                        output.fd.sync()
                    }
                }
                check(copied>100_000_000L) { "This is too small to be the supported model. Select the downloaded .litertlm file." }
                check(ticket==epoch.get()) { "Import cancelled." }
                check(temp.renameTo(model)) { "Could not save model. The previous model was retained." }
                prefs.edit().putString("model","imported").apply()
                report("Model imported. Its format will be checked when you start a conversation.")
            } catch(e: Exception) { report(e.message ?: "Model import failed.") }
            finally { temp.delete(); busy.set(false); report(note) }
        }
    }
    fun generate(id: Int, payload: String) {
        if(closed.get()) return
        if(!busy.compareAndSet(false,true)) { events.reply(id,"","The local model is still working. Stop it or wait."); return }
        val ticket=epoch.incrementAndGet()
        worker.execute {
            var timeout: java.util.concurrent.ScheduledFuture<*>? = null
            try {
                check(model.isFile) { "Import the offline model first." }
                val data=JSONObject(payload)
                val age=data.optString("age","18+")
                check(age in listOf("4-6","7-9","10-13","14-17","18+")) { "Choose a learner age first." }
                if(engine==null) {
                    check(freeMemory()>1_250_000_000L) { "Not enough free RAM to safely load the model. Close other apps and try again. Ordinary lessons still work." }
                    report("Loading the local model. First load can take a while.")
                    Engine.setNativeMinLogSeverity(LogSeverity.ERROR)
                    val candidate=Engine(EngineConfig(modelPath=model.absolutePath,backend=Backend.CPU(threadCount=2),maxNumTokens=2048,cacheDir=activity.cacheDir.absolutePath))
                    try { candidate.initialize(); engine=candidate } catch(t: Throwable) { if(candidate.isInitialized()) candidate.close(); throw t }
                }
                check(ticket==epoch.get()&&!closed.get()) { "Cancelled." }
                val messages=data.optJSONArray("messages")
                // Preserve actual roles. Never ask a completion model to continue a dialogue script.
                val companion=if(data.optString("character")=="arjun") "Arjun" else "Mira"
                val history=mutableListOf<Message>()
                if(messages!=null) for(i in maxOf(0,messages.length()-4) until messages.length()-1) {
                    val m=messages.optJSONObject(i)?:continue
                    val text=m.optString("content").take(320)
                    if(m.optString("role")=="user") history.add(Message.user(text))
                    else if(!Regex("(?i)(learner|user|mira|arjun):").containsMatchIn(text)) history.add(Message.model(text))
                }
                val latest=messages?.optJSONObject(messages.length()-1)?.optString("content")?.take(320)
                val prompt=if(latest.isNullOrBlank()) "Help me practise English. Ask me one short question." else latest
                val instruction="You are $companion, a friendly AI English tutor. Answer the user's latest message in two short sentences. Ask a relevant follow-up question." +
                    if(age!="18+") " Use child-safe topics. Never request personal information." else ""
                val active=engine!!.createConversation(ConversationConfig(systemInstruction=Contents.of(instruction),initialMessages=history,extraContext=mapOf("enable_thinking" to false),thinkingConfig=ThinkingConfig(enableThinking=false,thinkingTokenBudget=0),maxOutputToken=64,samplerConfig=SamplerConfig(topK=1,topP=.9,temperature=0.0)))
                synchronized(lock) { conversation=active }
                timeout=deadlines.schedule({ if(ticket==epoch.get()) cancel() },30,TimeUnit.SECONDS)
                try {
                    val text=active.sendMessage(Message.user(prompt)).toString().trim().take(1600)
                    check(ticket==epoch.get()&&!closed.get()) { "The local reply was stopped or timed out. Try a shorter message." }
                    check(text.isNotEmpty()) { "The local model returned no reply. Try again." }
                    events.reply(id,text,"")
                } finally {
                    synchronized(lock) { conversation=null; active.close() }
                }
                report("Offline model ready. No conversation was sent online.")
            } catch(t: Throwable) {
                if(!closed.get()) events.reply(id,"",if(t is OutOfMemoryError) "Memory was exhausted. Close other apps; this phone may not support the model." else t.message ?: "Local inference failed. Check the model and free memory.")
                releaseEngine()
            } finally { timeout?.cancel(false); busy.set(false) }
        }
    }
    fun cancel() { epoch.incrementAndGet(); synchronized(lock) { try { conversation?.cancelProcess() } catch(_:Exception) {} } }
    private fun releaseEngine() { try { engine?.let { if(it.isInitialized()) it.close() } } catch(_:Exception) {} finally { engine=null } }
    fun unload() { if(downloading.get()) return; cancel(); if(!closed.get()) worker.execute { releaseEngine(); report("Model unloaded to free memory.") } }
    fun removeModel() { cancelDownload(); cancel(); if(!closed.get()) worker.execute { releaseEngine(); model.delete(); report("Offline model removed. Learning history was kept.") } }
    fun close() { if(closed.compareAndSet(false,true)) { cancel(); worker.execute { releaseEngine() }; worker.shutdown(); deadlines.shutdownNow() } }
}
