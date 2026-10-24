const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

function read(path) { return fs.readFileSync(path, 'utf8'); }

test('universal Android APK keeps old-phone compatibility', () => {
  const gradle = read('android/app/build.gradle');
  const manifest = read('android/app/src/main/AndroidManifest.xml');
  const java = read('android/app/src/main/java/com/littleletters/learn/MainActivity.java');
  const workflow = read('.github/workflows/android-apk.yml');
  const web = read('app.js');
  assert.match(gradle, /minSdk\s+21\b/);
  assert.doesNotMatch(gradle, /dependencies\s*\{/);
  assert.doesNotMatch(manifest, /uses-permission.*INTERNET/i);
  assert.match(java, /setDomStorageEnabled\(true\)/);
  assert.match(java, /TextToSpeech/);
  assert.match(java, /printWorksheet\(\)/);
  assert.match(java, /shouldInterceptRequest/);
  assert.match(java, /setAllowFileAccess\(false\)/);
  assert.match(web, /LittleLettersAndroid\.speak/);
  assert.match(web, /LittleLettersAndroid\.printWorksheet/);
  assert.match(workflow, /assembleDebug/);
  assert.doesNotMatch(workflow, /run:.*(emulator|avdmanager)/);
});
