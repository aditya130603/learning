// Run against a local HTTP server. Requires Playwright; no Android emulator.
const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.UI_BROWSER?{executablePath:process.env.UI_BROWSER}:{}),args:['--no-sandbox']});
 try {for(const offline of [false,true]){
 const page=await browser.newPage({viewport:{width:360,height:740}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(offline=>{localStorage.setItem('little-letters-mayhem-v1',JSON.stringify({age:'18+',finished:{}}));if(offline)window.LittleLettersAndroid={isOfflineBuild:()=>true,offlineStatus:()=>JSON.stringify({installed:false,message:'Model not installed.'}),cancelOffline(){},unloadOffline(){}};},offline);
 await page.goto(process.env.UI_URL||'http://localhost:8123');
 await page.getByRole('heading',{name:'A little English, every day.'}).waitFor();
 assert.doesNotMatch(await page.locator('.mobile-nav').innerText(),/ABC/);
 const setup=page.getByRole('button',{name:'Set up AI companion',exact:true});
 const box=await setup.boundingBox();assert(box.y+box.height<660,'Setup should appear above bottom navigation');
 await setup.click();await page.getByRole('heading',{name:'Choose your companion'}).waitFor();
 if(offline)assert.equal(await page.getByRole('button',{name:'Download & enable · 345 MB',exact:true}).count(),1);
 else assert.equal(await page.locator('#coach-url').count(),1);
 await page.locator('.mobile-nav [data-nav="settings"]').click();
 assert.equal(await page.locator('#wm-letter').isVisible(),false);
 await page.locator('.mobile-nav [data-nav="home"]').click();
 await page.getByRole('button',{name:'Continue practice →'}).click();
 assert.equal(await page.locator('h1').innerText(),'Everyday routines');
 await page.locator('.mobile-nav [data-nav="talk"]').click();
 await page.getByRole('button',{name:'Set up AI companion',exact:true}).click();
 await page.setViewportSize({width:320,height:640});
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal overflow');
 assert.deepEqual(errors,[]);await page.close();
 }console.log('Adult home, routing, standard/offline setup, small-screen overflow: PASS (native bridge mocked).');}
 finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1)});
