// Real browser checks only. No Android emulator, speech service, or model inference.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),{spawn}=require('node:child_process');
(async()=>{fs.mkdirSync('/tmp/launch-ui',{recursive:true});const server=spawn('python3',['-m','http.server','8123','--bind','127.0.0.1'],{stdio:'ignore'});let browser;
try{for(let i=0;i<40;i++){try{await fetch('http://127.0.0.1:8123');break;}catch{await new Promise(r=>setTimeout(r,100));}}
browser=await chromium.launch({headless:true,executablePath:process.env.UI_BROWSER||'/usr/bin/google-chrome',args:['--no-sandbox']});
for(const age of ['4-6','7-9','10-13','14-17','18+'])for(const width of age==='18+'?[320,390,768]:[390]){
 const page=await browser.newPage({viewport:{width,height:844},reducedMotion:'reduce'}),errors=[],missing=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)missing.push(r.url());});
 await page.addInitScript(age=>localStorage.setItem('little-letters-mayhem-v1',JSON.stringify({age,finished:{}})),age);
 const tag=age.replace('+','plus')+'-'+width;
 try{
 await page.goto('http://127.0.0.1:8123');await page.locator('.ls-feature').waitFor();await page.screenshot({path:'/tmp/launch-ui/'+tag+'-home.png',fullPage:true});
 assert.equal(await page.locator('.ls-root .companion-home').count(),0);
 const overflow=async()=>assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'horizontal overflow '+tag);
 await overflow();await page.locator('.ls-nav [data-nav="adult-catalog"]').click();await page.locator('#ls-search').fill(age==='4-6'||age==='7-9'?'apple':'resilient');await page.locator('.ls-word-card').first().click();await page.locator('.ls-carousel').waitFor();await page.screenshot({path:'/tmp/launch-ui/'+tag+'-lesson.png',fullPage:true});await overflow();
 await page.locator('[data-ls="slide:1"]').click();assert(await page.locator('.ls-carousel').evaluate(el=>el.scrollLeft>0));
 await page.locator('[data-ls="understand"]').click();const choice=await page.evaluate(()=>LaunchStudio.ui().choices.findIndex(w=>w.id===LaunchStudio.ui().word.id));await page.locator('[data-ls="choose:'+choice+'"]').click();await page.locator('[data-ls="recall"]').click();
 if(age==='4-6'){await page.locator('[data-ls="reveal"]').click();await page.locator('[data-ls="oral-yes"]').click();}
 else{const word=await page.evaluate(()=>LaunchStudio.ui().word.word);await page.locator('#ls-answer').fill(word);await page.locator('[data-ls="check"]').click();await page.locator('[data-ls="use"]').click();if(age==='7-9'){const order=await page.evaluate(()=>{const u=LaunchStudio.ui(),used=new Set();return u.word.example.split(' ').map(t=>{const i=u.tokens.findIndex((x,i)=>x===t&&!used.has(i));used.add(i);return i;});});for(const i of order)await page.locator('[data-ls="tile:'+i+'"]').click();await page.locator('[data-ls="order"]').click();}else await page.locator('#ls-answer').fill('The resilient team tried again after the setback.');}
 await page.locator('[data-ls="finish"]').click();await page.getByRole('heading',{name:'A little practice, well spent'}).waitFor();await page.reload();await page.locator('.ls-feature').waitFor();assert(await page.evaluate(()=>Object.keys(LaunchStudio.stats().words).length>=1));
 for(const dest of ['review','settings','talk','home']){await page.locator('.ls-nav [data-nav="'+dest+'"]').click();await overflow();await page.screenshot({path:'/tmp/launch-ui/'+tag+'-'+dest+'.png',fullPage:true});if(dest==='settings'){await page.getByRole('button',{name:'Save preferences'}).click();}}
 await page.getByText('More ways to practise',{exact:true}).click();await page.locator('[data-nav="action-lab"]').click();await page.locator('[data-ls="action-next"]').click();await page.screenshot({path:'/tmp/launch-ui/'+tag+'-action.png',fullPage:true});await overflow();
 await page.evaluate(()=>WordMayhemBack());await page.locator('.ls-feature').waitFor();
 await page.evaluate(()=>document.documentElement.style.fontSize='24px');await overflow();
 assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);console.log('PASS',tag);
 }catch(e){await page.screenshot({path:'/tmp/launch-ui/FAIL-'+tag+'.png',fullPage:true});throw e;}finally{await page.close();}
}
}finally{if(browser)await browser.close();server.kill();}})().catch(e=>{console.error(e);process.exit(1)});
