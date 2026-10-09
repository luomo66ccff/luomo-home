import { createRequire } from 'node:module';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const require = createRequire(new URL('../package.json', import.meta.url));
const { chromium } = require('playwright');
const [url, label, variant='normal', runsArg='3', phaseArg='4'] = process.argv.slice(2);
const folder = fileURLToPath(new URL('../output/playwright/mobile-scroll/', import.meta.url));
mkdirSync(folder,{recursive:true});
if(!url || !label || existsSync(folder+label+'.json')) throw Error('Supply URL and unused label');
const browser = await chromium.launch({channel:process.env.PLAYWRIGHT_CHANNEL||'msedge',headless:true});
const results=[];
const percentile=(values,q)=>{const a=[...values].sort((a,b)=>a-b);return a[Math.floor(a.length*q)]??0;};
const metrics=async cdp=>Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m=>[m.name,m.value]));
async function touchScroll(cdp, direction) {
  for(let swipe=0;swipe<4;swipe++) {
    const origin=direction==='down'?650:200, sign=direction==='down'?-1:1;
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:190,y:origin}]});
    const started=performance.now();
    for(let step=1;step<=25;step++) {
      await new Promise(resolve=>setTimeout(resolve,Math.max(0,step*(1000/30)-(performance.now()-started))));
      await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:190,y:origin+sign*step*15}]});
    }
    await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    await new Promise(resolve=>setTimeout(resolve,50));
  }
}
try {
  for(let run=0;run<Number(runsArg);run++) {
    const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,reducedMotion:'no-preference',colorScheme:'dark'});
    await context.addInitScript(({variant})=>{
      window.__scrollStats={frames:[],tasks:[],scrolls:[],discarded:[],visibility:[]};
      document.addEventListener('DOMContentLoaded',()=>{
        for(const section of document.querySelectorAll('#main > section')) {
          section.addEventListener('contentvisibilityautostatechange',event=>window.__scrollStats.visibility.push({at:performance.now(),id:section.id,skipped:event.skipped,scrollY}));
        }
      });
      let previous;
      const frame=now=>{if(previous!==undefined)window.__scrollStats.frames.push({at:now,dt:now-previous});previous=now;if(now<90000)requestAnimationFrame(frame);}; requestAnimationFrame(frame);
      new PerformanceObserver(list=>{for(const e of list.getEntries())window.__scrollStats.tasks.push({at:e.startTime,duration:e.duration});}).observe({type:'longtask',buffered:true});
      document.addEventListener('scroll',()=>window.__scrollStats.scrolls.push({at:performance.now(),y:scrollY}),{passive:true});
      if(variant==='no-scroll-ui') {
        const add=window.addEventListener;
        window.addEventListener=function(type,listener,options){if(type==='scroll'){window.__scrollStats.discarded.push(String(listener));return;}return add.call(this,type,listener,options);};
      }
    },{variant});
    const page=await context.newPage(); const errors=[];page.on('pageerror',e=>errors.push(e.message));
    const cdp=await context.newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate',{rate:6});await cdp.send('Network.enable');await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});await cdp.send('Performance.enable');
    await page.goto(url,{waitUntil:'domcontentloaded',timeout:45000});
    await page.waitForFunction(()=>performance.now()>8000&&!document.documentElement.dataset.boot,null,{timeout:45000});
    await page.evaluate(()=>document.fonts.ready);
    await page.evaluate(()=>{window.__scrollStats.geometry=Array.from(document.querySelectorAll('#main > section'),s=>({id:s.id,top:s.getBoundingClientRect().top,height:s.getBoundingClientRect().height,nodes:s.querySelectorAll('*').length,warmed:s.dataset.homeWarmed??null,contentVisibility:getComputedStyle(s).contentVisibility}));});
    if(variant==='no-blur')await page.addStyleTag({content:'*{filter:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important}'});
    if(variant==='services-visible')await page.addStyleTag({content:'#services{content-visibility:visible!important}'});
    if(variant==='pause-warm-all')await page.addStyleTag({content:'#main > section{content-visibility:visible!important}'});
    if(variant==='no-scroll-ui')await page.locator('header').first().evaluate(el=>{el.dataset.scrolled='true';});
    if(variant==='pause'||variant==='pause-warm-all') await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});
    await page.waitForTimeout(250);
    const tracing=run===0;
    if(tracing)await cdp.send('Tracing.start',{categories:'devtools.timeline,blink.user_timing',transferMode:'ReturnAsStream'});
    const phases=[];
    for(const [index,direction] of ['down','up','down','up'].slice(0,Number(phaseArg)).entries()) {
      const startMetric=await metrics(cdp);
      const start=await page.evaluate(index=>{performance.mark('scroll-start-'+index);return performance.now();},index);
      await touchScroll(cdp,direction);
      const end=await page.evaluate(index=>{performance.mark('scroll-end-'+index);return performance.now();},index);
      const endMetric=await metrics(cdp);
      const y=await page.evaluate(()=>scrollY);
      if(direction==='down'? y<1000 : y>350) throw Error('Touch replay did not cross the intended scene boundary: '+y);
      await page.evaluate(y=>{window.__scrollStats.lastVerifiedY=y;},y);
      phases.push({index,direction,start,end,scrollY:y,metrics:Object.fromEntries(['TaskDuration','ScriptDuration','LayoutDuration','RecalcStyleDuration'].map(k=>[k,(endMetric[k]??0)-(startMetric[k]??0)]))});
      await page.waitForTimeout(250);
    }
    const raw=await page.evaluate(()=>window.__scrollStats);
    for(const p of phases) {
      const frames=raw.frames.filter(f=>f.at>=p.start&&f.at<p.end).map(f=>f.dt);
      const tasks=raw.tasks.filter(t=>t.at>=p.start&&t.at<p.end);
      p.frameP95Ms=percentile(frames,.95);p.maxFrameMs=Math.max(0,...frames);p.gapsOver50ms=frames.filter(t=>t>50).length;p.frames=frames.length;
      p.blockingMs=tasks.reduce((sum,t)=>sum+Math.max(0,t.duration-50),0);p.maxLongTaskMs=Math.max(0,...tasks.map(t=>t.duration));
    }
    if(tracing) {
      const complete=new Promise(resolve=>cdp.once('Tracing.tracingComplete',resolve));await cdp.send('Tracing.end');const{stream}=await complete;let trace='';
      while(true){const p=await cdp.send('IO.read',{handle:stream});trace+=p.base64Encoded?Buffer.from(p.data,'base64').toString():p.data;if(p.eof)break;}await cdp.send('IO.close',{handle:stream});
      writeFileSync(folder+label+'-trace.json',trace);
      const events=JSON.parse(trace).traceEvents;
      for(const phase of phases) {
        const from=events.find(e=>e.name==='scroll-start-'+phase.index)?.ts,to=events.find(e=>e.name==='scroll-end-'+phase.index)?.ts;
        const timings={};const work=events.filter(e=>e.ph==='X'&&e.ts>=from&&e.ts<to&&['Paint','PrePaint','Layout','UpdateLayoutTree','FunctionCall','EvaluateScript','RasterTask'].includes(e.name));
        for(const e of work)timings[e.name]=(timings[e.name]??0)+(e.dur??0)/1000;
        phase.traceMs=timings;phase.slowest=work.sort((a,b)=>(b.dur??0)-(a.dur??0)).slice(0,6).map(e=>({name:e.name,durationMs:(e.dur??0)/1000,args:e.args}));
      }
    }
    const result={run,phases,raw,errors};results.push(result);
    console.log(JSON.stringify({label,run,phases:phases.map(({slowest,...p})=>p),errors}));
    await context.close();
  }
}finally{await browser.close();}
writeFileSync(folder+label+'.json',JSON.stringify({url,label,variant,conditions:{viewport:'390x844',dpr:2,cpu:'6x',input:'CDP dispatchTouchEvent, four finger strokes per phase',fingerDistancePx:1500,nominalSpeedPxPerSecond:450,firstRunTraced:true,scrollPositionVerified:true},results},null,2)+'\n');
