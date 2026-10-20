(() => {
  'use strict';
  const path=location.pathname.replace(/\.html$/i,'').replace(/\/$/,'');
  if (!/^\/articles\/[a-z0-9-]{1,90}$/.test(path) || !crypto?.randomUUID) return;
  const title=document.querySelector('main h1')?.textContent?.trim();
  if(!title) return;
  const url='/api/article-analytics';
  const key='haraita:article-analytics-session';
  let sessionId;
  try { sessionId=sessionStorage.getItem(key); if(!sessionId){sessionId=crypto.randomUUID();sessionStorage.setItem(key,sessionId)} }
  catch { sessionId=crypto.randomUUID() }
  const visitId=crypto.randomUUID();
  const entry=(() => {
    try {
      if(!document.referrer) return 'direct_or_unknown';
      const r=new URL(document.referrer);
      if(r.origin!==location.origin){return /google\.|bing\.|yahoo\.|duckduckgo\./i.test(r.hostname)?'search':'external'}
      const p=r.pathname.replace(/\.html$/i,'').replace(/\/$/,'');
      if(p==='/guide') return 'guide_home';
      if(/^\/articles\/[a-z0-9-]+$/.test(p)) return 'other_article';
      if(p===''||p==='/index'||/^\/stations\//.test(p)) return 'station_map';
    }catch{}
    return 'direct_or_unknown';
  })();
  let maxScroll=0, activeMs=0, lastTick=performance.now(), ended=false, next='unknown';
  // 表示中のタブの時間を計測。フォーカス判定による0秒の取りこぼしを避ける。
  let wasActive=!document.hidden;
  // 25/50/75/100%に初めて到達したタイミングで保存する。
  const milestones=[25,50,75,100];
  let lastMilestone=0;
  let started=false;
  const scroll=()=>{
    const doc=document.scrollingElement || document.documentElement;
    const viewport=window.innerHeight || document.documentElement.clientHeight;
    const extent=Math.max(0,doc.scrollHeight-viewport);
    const position=Math.max(0,window.scrollY ?? doc.scrollTop ?? 0);
    const fraction=extent<=0?100:Math.min(100,Math.floor(position/extent*100));
    maxScroll=Math.max(maxScroll,fraction);

    // スクロールイベントでは毎回通信しない。新しい到達段階だけ1回送る。
    const reached=milestones.filter((n)=>maxScroll>=n).pop() || 0;
    if(started && !ended && reached>lastMilestone){
      lastMilestone=reached;
      tick();
      send(payload('update'));
    }
  };
  const tick=()=>{
    const now=performance.now();
    if(wasActive) activeMs+=Math.min(16000,Math.max(0,now-lastTick));
    lastTick=now;
    wasActive=!document.hidden;
  };
  const payload=(eventType)=>({eventType,visitId,sessionId,articlePath:path,articleTitle:title.slice(0,100),maxScrollPercent:maxScroll,activeSeconds:Math.min(1800,Math.floor(activeMs/1000)),entrySource:entry,nextPageType:next});
  const send=(obj,beacon=false)=>{
    const data=JSON.stringify(obj);
    if(beacon && navigator.sendBeacon){try {if(navigator.sendBeacon(url,new Blob([data],{type:'application/json'})))return}catch{}}
    fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:data,keepalive:beacon,credentials:'same-origin'}).catch(()=>{});
  };
  const update=()=>{if(ended)return;tick();scroll();send(payload('update'))};
  const finish=()=>{if(ended)return;tick();scroll();ended=true;send(payload('end'),true)};
  const classify=(a)=>{
    try{
      const u=new URL(a.href,location.href);
      if(u.origin!==location.origin)return {link:'other_external',next:'external'};
      const p=u.pathname.replace(/\.html$/i,'').replace(/\/$/,'');
      if(p==='/guide')return {link:'guide_home',next:'guide_home'};
      if(/^\/articles\/[a-z0-9-]+$/.test(p))return {link:'other_article',next:'other_article'};
      if(p===''||p==='/index'||/^\/stations\//.test(p))return {link:'station_map',next:'station_map'};
      return {link:'other_internal',next:'other_internal'};
    }catch{return {link:'other_external',next:'unknown'}}
  };
  document.addEventListener('click',(ev)=>{
    const a=ev.target.closest?.('a[href]');
    if(!a)return;
    const cls=classify(a);
    const kind=a.closest('.references') && cls.link==='other_external'?'reference':cls.link;
    send({eventType:'click',clickId:crypto.randomUUID(),visitId,sessionId,articlePath:path,linkType:kind},true);
    // Only a same-tab navigation indicates that this page is being left.
    if(a.target!=='_blank' && !ev.ctrlKey && !ev.metaKey && !ev.shiftKey && !ev.altKey && !ev.defaultPrevented){
      const dest=new URL(a.href,location.href);
      if(dest.pathname!==location.pathname)next=cls.next;
    }
  },{capture:true});
  addEventListener('scroll',scroll,{passive:true});
  document.addEventListener('visibilitychange',()=>{tick();if(document.hidden)update()});
  addEventListener('focus',tick);
  addEventListener('blur',tick);
  addEventListener('pagehide',finish);
  scroll();send(payload('start'));
  started=true;
  // 開始直後の位置復元にも対応する。
  scroll();
  const interval=setInterval(()=>{if(ended){clearInterval(interval);return}tick();scroll();if(!document.hidden)send(payload('update'))},15000);
})();
