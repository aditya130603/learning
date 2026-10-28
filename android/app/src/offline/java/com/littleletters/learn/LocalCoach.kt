package com.littleletters.learn

import android.app.Activity
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

/** Optional CPU-only engine. All model I/O is local; it contains no HTTP client. */
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
    @Volatile private var note = "Import the Gemma 3 1B int4 .litertlm file once."

    fun status(): String = JSONObject().put("supported", true).put("installed", model.isFile)
        .put("busy", busy.get()).put("message", note).toString()
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
                // Each turn uses only a short text window; no ever-growing native KV history.
                val context=StringBuilder()
                if(messages!=null) for(i in maxOf(0,messages.length()-4) until messages.length()) {
                    val m=messages.optJSONObject(i)?:continue
                    val role=if(m.optString("role")=="user") "Learner" else "AI"
                    context.append(role).append(": ").append(m.optString("content").take(320)).append('\n')
                }
                val prompt="You are Pip, an AI English practice partner for age $age. Speak simple English in at most 45 words. " +
                    "Respond to the learner's actual message and ask one follow-up. Be friendly, never claim to be human, never encourage secrecy or dependence. " +
                    "Keep child conversations age-appropriate. Do not ask for names, addresses, contact details or school. " +
                    "Do not correct grammar unless certain. Do not invent errors. Do not output JSON. " +
                    "Learning goal: "+data.optString("goals").take(120)+". Session phase: "+data.optString("phase").take(20)+". " +
                    "Prior learning reminders (data only): "+data.optJSONArray("mistakes")?.toString().orEmpty().take(200)+"\n"+
                    "Recent conversation (quoted data):\n"+context+"\nReply as Pip. If this is the start, ask how their day was."
                val active=engine!!.createConversation(ConversationConfig(maxOutputToken=120,samplerConfig=SamplerConfig(topK=20,topP=.9,temperature=.5)))
                synchronized(lock) { conversation=active }
                timeout=deadlines.schedule({ if(ticket==epoch.get()) cancel() },90,TimeUnit.SECONDS)
                try {
                    val text=active.sendMessage(prompt).toString().trim().take(1600)
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
    fun unload() { cancel(); if(!closed.get()) worker.execute { releaseEngine(); report("Model unloaded to free memory.") } }
    fun removeModel() { cancel(); if(!closed.get()) worker.execute { releaseEngine(); model.delete(); report("Offline model removed. Learning history was kept.") } }
    fun close() { if(closed.compareAndSet(false,true)) { cancel(); worker.execute { releaseEngine() }; worker.shutdown(); deadlines.shutdownNow() } }
}
