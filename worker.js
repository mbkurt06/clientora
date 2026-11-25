const BASE={clients:[],next:1,settings:{lang:'auto',theme:'auto',detail:'same',panel:true,restore:true,downloads:'auto',relative:false,dashboardView:'today'},templates:[],vault:null,history:[],trash:[]};
let queue=Promise.resolve();
const run=f=>{const p=queue.then(f);queue=p.catch(console.error);return p};
async function state(){const {data}=await chrome.storage.local.get('data');const s={...BASE,...data,settings:{...BASE.settings,...data?.settings}};if(!s.demoInitialized){s.demoInitialized=true;if(!s.clients.length&&!s.trash.length&&s.next===1)seedDemo(s);await save(s)}return s}
async function maps(){return (await chrome.storage.session.get('windows')).windows||{}}
async function save(s){await chrome.storage.local.set({data:s})}
const id=()=>crypto.randomUUID();
function log(s,cid,text){s.history.unshift({id:id(),cid,text,at:Date.now()});s.history=s.history.slice(0,3000)}
const clean=s=>String(s).normalize('NFKD').replace(/[^\p{L}\p{N}_-]+/gu,'_').replace(/^_+|_+$/g,'').slice(0,70)||'Client';
const urlOK=u=>{try{return ['http:','https:'].includes(new URL(u).protocol)}catch{return false}};
const client=(s,cid)=>{const c=s.clients.find(x=>x.id===cid);if(!c)throw Error('Client not found');return c};
const allowed=['tasks','notes','events','reminders','sites','credentials'];

function seedDemo(s){
 const cases=[
 ['Ahmet Yılmaz','Jobcenter','progress','#4f46e5','Bürgergeld Weiterbewilligung','Jobcenter online follow-up',
 [['Jobcenter','https://www.jobcenter.digital/'],['Arbeitsagentur','https://www.arbeitsagentur.de/'],['BundID','https://id.bund.de/'],['Esslingen','https://www.esslingen.de/'],['Bundesportal','https://verwaltung.bund.de/']],
 ['Check application receipt','Collect account statements','Submit missing documents','Review benefit notice','Call client']],
 ['Ayşe Demir','Wohngeld','missing','#d97706','Housing allowance application','Housing allowance appointment',
 [['Wohngeld information','https://www.bmwsb.bund.de/'],['Esslingen','https://www.esslingen.de/'],['Service-BW','https://www.service-bw.de/'],['Bundesportal','https://verwaltung.bund.de/'],['BundID','https://id.bund.de/']],
 ['Check rental contract','Collect income statements','Complete application form','Request landlord confirmation','Follow up with office']],
 ['Mehmet Kaya','Aufenthalt','waiting','#0891b2','Residence permit renewal','Residence permit consultation',
 [['BAMF','https://www.bamf.de/'],['Esslingen','https://www.esslingen.de/'],['Service-BW','https://www.service-bw.de/'],['Bundesportal','https://verwaltung.bund.de/'],['Auswärtiges Amt','https://www.auswaertiges-amt.de/']],
 ['Review passport expiry','Prepare appointment checklist','Collect insurance evidence','Track application response','Confirm appointment']],
 ['Elif Çelik','Steuer','active','#16a34a','Tax return preparation','Tax document review',
 [['ELSTER','https://www.elster.de/'],['Finanzverwaltung BW','https://finanzamt-bw.fv-bwl.de/'],['BZSt','https://www.bzst.de/'],['Bundesfinanzministerium','https://www.bundesfinanzministerium.de/'],['Gesetze im Internet','https://www.gesetze-im-internet.de/']],
 ['Collect wage statements','Sort deductible expenses','Review tax identification details','Prepare draft return','Review documents with client']],
 ['Deniz Arslan','Familienkasse','done','#db2777','Child benefit application','Child benefit case review',
 [['Familienkasse','https://www.arbeitsagentur.de/familie-und-kinder'],['Familienportal','https://familienportal.de/'],['BundID','https://id.bund.de/'],['Bundesportal','https://verwaltung.bund.de/'],['Service-BW','https://www.service-bw.de/']],
 ['Review application receipt','Check supporting documents','Record decision','File correspondence','Schedule final follow-up']]
 ];
 const now=Date.now(), day=(offset,hour=10)=>{const d=new Date(now);d.setDate(d.getDate()+offset);d.setHours(hour,0,0,0);return d.getTime()};
 const item=(x)=>({id:id(),created:now,...x});
 for(const [i,[name,tag,status,color,subject,appointment,sites,tasks]] of cases.entries()){
 const number=s.next++,c={id:id(),number,name,folder:String(number).padStart(6,'0')+'_'+clean(name),email:'demo'+(i+1)+'@example.invalid',phone:'',status,tags:'DEMO, '+tag,info:'DEMO / TEST — Fiktive Beispieldaten. '+subject+'. No real customer or account.',favorite:i===0,archived:false,demo:true,demoSubject:subject,color,tasks:tasks.map((title,j)=>item({title,description:'DEMO — '+subject,status:j===0||i===4&&j<4?'done':j===1?'progress':j===2?'waiting':'todo',priority:j===2?'high':'normal',due:day(j===0?-3:j===1?-1:j===2?0:j===3?i+1:7),completed:j===0||i===4&&j<4?now:null})),notes:[item({title:'Initial consultation',description:'DEMO — '+subject+'. Client provided preliminary details. Verify all requirements before submitting anything.'}),item({title:'Follow-up note',description:'DEMO — '+tasks[2]+'. No real application has been submitted.'}),item({title:'Document checklist',description:'DEMO — Example files are available in the client folder after selecting local storage.'})],events:[item({title:appointment,description:'DEMO — simulated appointment, not booked.',due:day(i===0?0:i,9+i)}),item({title:'Document review',description:'DEMO — simulated follow-up.',due:day(i+7,14)})],reminders:[item({title:'DEMO — '+tasks[4],description:'Example reminder; no real action required.',due:day(i+1,11),before:15,repeat:'none',done:false,fired:false}),item({title:'DEMO — Weekly case check',description:'Example recurring reminder.',due:day(i+7,15),before:0,repeat:'weekly',done:false,fired:false})],sites:sites.map(([title,url])=>item({title,url})),credentials:[],lastTabs:[],folders:[tag],created:now+i};
 s.clients.push(c);log(s,c.id,'DEMO client created');
 }
 return true;
}

function nextDate(r){const d=new Date(r.due), orig=d.getDate();if(r.repeat==='daily')d.setDate(d.getDate()+1);else if(r.repeat==='weekly')d.setDate(d.getDate()+7);else if(r.repeat==='monthly'){d.setDate(1);d.setMonth(d.getMonth()+1);d.setDate(Math.min(orig,new Date(d.getFullYear(),d.getMonth()+1,0).getDate()))}else if(r.repeat==='yearly')d.setFullYear(d.getFullYear()+1);else return null;return d.getTime()}
async function notifyDue(){const s=await state();let dirty=false;for(const c of s.clients){if(c.archived)continue;for(const r of c.reminders){if(r.done||r.fired||!Number.isFinite(r.due)||r.due-(r.before||0)*60000>Date.now())continue;try{await chrome.notifications.create('rem:'+c.id+':'+r.id,{type:'basic',iconUrl:'icon.png',title:'Clientora · '+c.name,message:r.title,buttons:[{title:'Open / Öffnen / Aç'},{title:'Snooze 1h'}],priority:2});r.fired=true;dirty=true}catch(e){console.warn(e)}}}if(dirty)await save(s)}
async function openDashboard(cid=''){return chrome.tabs.create({url:chrome.runtime.getURL('index.html')+(cid?'#'+encodeURIComponent(cid):'')})}
async function openWorkspace(c,s){const m=await maps();for(const [wid,cid] of Object.entries(m)){if(cid===c.id){try{await chrome.windows.update(Number(wid),{focused:true});return Number(wid)}catch{delete m[wid]}}}const urls=((c.restore??s.settings.restore)&&c.lastTabs?.length?c.lastTabs:c.sites.map(x=>x.url)).filter(urlOK);const w=await chrome.windows.create({url:urls.length?urls:chrome.runtime.getURL('index.html')+'#'+c.id,type:'normal',focused:true});m[w.id]=c.id;await chrome.storage.session.set({windows:m});await chrome.action.setBadgeText({text:String(c.number),tabId:w.tabs?.[0]?.id}).catch(()=>{});return w.id}
async function dispatch(q){if(q.type==='get')return state();if(q.type==='context'){const m=await maps();return m[q.windowId]||null}const s=await state();let c=q.cid?client(s,q.cid):null;let result;
switch(q.type){case 'demo':{if(!s.clients.some(c=>c.demo)&&!s.trash.some(t=>t.kind==='client'&&t.item.demo))seedDemo(s);break}
case 'create':{const name=String(q.name||'').trim();if(!name)throw Error('Name required');const number=s.next++;c={id:id(),number,name,folder:String(number).padStart(6,'0')+'_'+clean(name),email:'',phone:'',status:'active',tags:'',info:'',favorite:false,archived:false,tasks:[],notes:[],events:[],reminders:[],sites:[],credentials:[],lastTabs:[],created:Date.now()};const t=s.templates.find(x=>x.id===q.template);if(t){c.tasks=t.tasks.map(title=>({id:id(),title,status:'todo',priority:'normal'}));c.sites=t.sites.filter(urlOK).map(url=>({id:id(),url,title:url}));c.folders=t.folders}s.clients.push(c);log(s,c.id,'Client created');result=c;break}
case 'edit':for(const k of ['name','email','phone','status','tags','info','favorite','archived','panel','restore','color'])if(Object.hasOwn(q.patch,k))c[k]=q.patch[k];log(s,c.id,'Client updated');break;
case 'deleteClient':s.trash.push({kind:'client',item:c,at:Date.now()});s.clients=s.clients.filter(x=>x.id!==c.id);break;
case 'restoreTrash':{const t=s.trash[q.index];if(!t)break;if(t.kind==='client'){if(!s.clients.some(x=>x.id===t.item.id))s.clients.push(t.item)}else{const target=client(s,t.cid);target[t.kind].push(t.item)}s.trash.splice(q.index,1);break}
case 'add':case 'update':case 'remove':{if(!allowed.includes(q.kind))throw Error('Invalid collection');const a=c[q.kind];if(q.type==='add'){const item={...q.item,id:id(),created:Date.now()};if(q.kind==='sites'&&!urlOK(item.url))throw Error('Invalid URL');a.unshift(item);result=item}else{const i=a.findIndex(x=>x.id===q.itemId);if(i<0)throw Error('Item not found');if(q.type==='remove'){const [item]=a.splice(i,1);s.trash.push({kind:q.kind,cid:c.id,item,at:Date.now()})}else{const item={...a[i],...q.item,id:a[i].id};if(q.kind==='sites'&&!urlOK(item.url))throw Error('Invalid URL');a[i]=item}}log(s,c.id,q.kind+' '+q.type);break}
case 'completeReminder':{const r=c.reminders.find(x=>x.id===q.itemId);if(!r)break;const next=nextDate(r);if(next){r.due=next;r.fired=false}else r.done=true;break}
case 'snooze':{const r=c.reminders.find(x=>x.id===q.itemId);if(r){r.due=Date.now()+q.minutes*60000;r.before=0;r.fired=false}break}
case 'settings':for(const k of Object.keys(BASE.settings))if(Object.hasOwn(q.patch,k))s.settings[k]=q.patch[k];break;
case 'vault':if(s.vault)throw Error('Vault already exists');s.vault=q.vault;break;
case 'template':s.templates.push({...q.item,id:id()});break;
case 'open':return openWorkspace(c,s);
case 'snapshot':{const m=await maps();if(m[q.windowId]!==c.id)throw Error('Wrong workspace');c.lastTabs=(await chrome.tabs.query({windowId:q.windowId})).map(x=>x.url).filter(urlOK);break}
case 'history':log(s,c.id,String(q.text).slice(0,500));break;
case 'import':{const d=q.data;if(!d||!Array.isArray(d.clients)||!Number.isInteger(d.next)||!d.clients.every(x=>typeof x.id==='string'&&typeof x.name==='string'&&typeof x.folder==='string'&&/^[\p{L}\p{N}_-]+$/u.test(x.folder)&&allowed.every(k=>Array.isArray(x[k]))))throw Error('Invalid backup');await save({...BASE,...d,settings:{...BASE.settings,...d.settings}});await chrome.storage.session.remove('windows');return true}
default:throw Error('Unknown operation')}
await save(s);return result??true}
chrome.runtime.onMessage.addListener((q,sender,respond)=>{if(sender.id!==chrome.runtime.id||!sender.url?.startsWith(chrome.runtime.getURL('')))return;run(()=>dispatch(q)).then(value=>respond({ok:true,value}),e=>respond({ok:false,error:e.message}));return true});
chrome.runtime.onInstalled.addListener(()=>{run(state).catch(console.error);chrome.contextMenus.removeAll(()=>chrome.contextMenus.create({id:'client-download',title:'Clientora: save link for this client',contexts:['link']}));chrome.alarms.create('tick',{periodInMinutes:1})});
chrome.runtime.onStartup.addListener(()=>{chrome.alarms.create('tick',{periodInMinutes:1});run(notifyDue)});
chrome.alarms.onAlarm.addListener(a=>{if(a.name==='tick')run(notifyDue)});
chrome.action.onClicked.addListener(async tab=>{const m=await maps();if(m[tab.windowId]){try{await chrome.sidePanel.open({windowId:tab.windowId});return}catch{}}await openDashboard()});chrome.commands.onCommand.addListener(()=>openDashboard());
chrome.windows.onRemoved.addListener(wid=>run(async()=>{const m=await maps();delete m[wid];await chrome.storage.session.set({windows:m})}));
async function snapshotWindow(wid){return run(async()=>{const m=await maps();if(!m[wid])return;const s=await state(),c=s.clients.find(x=>x.id===m[wid]);if(!c||!(c.restore??s.settings.restore))return;try{const urls=(await chrome.tabs.query({windowId:wid})).map(t=>t.url).filter(urlOK);if(urls.length){c.lastTabs=urls;await save(s)}}catch{}})}
chrome.tabs.onUpdated.addListener((tid,change,tab)=>{if(change.status==='complete'||change.url)snapshotWindow(tab.windowId)});chrome.tabs.onRemoved.addListener((tid,info)=>{if(!info.isWindowClosing)snapshotWindow(info.windowId)});chrome.tabs.onMoved.addListener((tid,info)=>snapshotWindow(info.windowId));
chrome.notifications.onClicked.addListener(n=>{if(n.startsWith('rem:'))openDashboard(n.split(':')[1])});chrome.notifications.onButtonClicked.addListener((n,b)=>{if(!n.startsWith('rem:'))return;const [,cid,itemId]=n.split(':');if(b===0)openDashboard(cid);else run(()=>dispatch({type:'snooze',cid,itemId,minutes:60}));chrome.notifications.clear(n)});
chrome.contextMenus.onClicked.addListener((info,tab)=>{if(info.menuItemId!=='client-download'||!tab||!urlOK(info.linkUrl))return;run(async()=>{const m=await maps(),s=await state(),c=s.clients.find(x=>x.id===m[tab.windowId]);if(!c)return;let filename='download';try{filename=decodeURIComponent(new URL(info.linkUrl).pathname.split('/').pop()||'download').replace(/[^\p{L}\p{N}._-]/gu,'_').replace(/^\.+/,'')||'download'}catch{}const auto=s.settings.downloads==='auto'&&s.settings.relative;const opts={url:info.linkUrl,saveAs:!auto,conflictAction:'uniquify'};if(auto)opts.filename='Clientora/Musteriler/'+c.folder+'/05_Indirilenler/'+filename;const downloadId=await chrome.downloads.download(opts);log(s,c.id,'Download requested #'+downloadId);await save(s)})});
