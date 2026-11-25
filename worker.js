if(typeof importScripts==='function')importScripts('files.js');
const BASE={clients:[],next:1,settings:{lang:'auto',theme:'auto',detail:'same',panel:true,restore:true,downloads:'auto',relative:false,dashboardView:'today'},templates:[],vault:null,history:[],trash:[]};
let queue=Promise.resolve();
const run=f=>{const p=queue.then(f);queue=p.catch(console.error);return p};
async function state(){const {data}=await chrome.storage.local.get('data');const s={...BASE,...data,settings:{...BASE.settings,...data?.settings}};let changed=false;if(!s.demoInitialized){s.demoInitialized=true;if(!s.clients.length&&!s.trash.length&&s.next===1)seedDemo(s);changed=true}if(!s.templatePresetsInitialized||!Array.isArray(s.defaultFields)||s.clients.some(c=>!Array.isArray(c.fields)||!Array.isArray(c.documents)))changed=true;upgradeSchema(s);if(changed)await save(s);return s}
async function maps(){return (await chrome.storage.session.get('windows')).windows||{}}
async function save(s){await chrome.storage.local.set({data:s})}
const id=()=>crypto.randomUUID();
function log(s,cid,text){s.history.unshift({id:id(),cid,text,at:Date.now()});s.history=s.history.slice(0,3000)}
const clean=s=>String(s).normalize('NFKD').replace(/[^\p{L}\p{N}_-]+/gu,'_').replace(/^_+|_+$/g,'').slice(0,70)||'Client';
const urlOK=u=>{try{return ['http:','https:'].includes(new URL(u).protocol)}catch{return false}};
const client=(s,cid)=>{const c=s.clients.find(x=>x.id===cid);if(!c)throw Error('Client not found');return c};
const allowed=['tasks','notes','events','reminders','sites','credentials','documents'];

const fieldTypes=['text','textarea','date','number','email','tel','url'];
const standardFields=[['birthDate','date'],['nationality','text'],['maritalStatus','text'],['preferredLanguage','text'],['occupation','text'],['contactPreference','text']];
const norm=v=>String(v||'').trim().normalize('NFKC').toLowerCase();
const requiredText=(v,max=300)=>{const t=String(v||'').trim();if(!t||t.length>max)throw Error('Invalid name or title');return t};
function fieldDef(x){return {label:requiredText(x.label,100),type:fieldTypes.includes(x.type)?x.type:'text'}}
function appendField(a,x,withValue=false){const d=fieldDef(x);let old=a.find(y=>norm(y.label)===norm(d.label));if(!old){old={id:id(),...d,...(withValue?{value:''}:{})};a.push(old)}return old}
function normalizeTemplate(t){return {...t,fields:Array.isArray(t.fields)?t.fields:[],tasks:Array.isArray(t.tasks)?t.tasks.map(x=>typeof x==='string'?{title:x}:x):[],sites:Array.isArray(t.sites)?t.sites.map(x=>typeof x==='string'?{title:x,url:x}:x):[],documents:Array.isArray(t.documents)?t.documents:[],folders:Array.isArray(t.folders)?t.folders:[],assets:Array.isArray(t.assets)?t.assets:[]}}
function normalizeClient(c){c.fields=Array.isArray(c.fields)?c.fields:[];c.documents=Array.isArray(c.documents)?c.documents:[];c.templateIds=Array.isArray(c.templateIds)?c.templateIds:[];c.templateAssets=Array.isArray(c.templateAssets)?c.templateAssets:[];c.folders=Array.isArray(c.folders)?c.folders:[];for(const [label,type] of standardFields)appendField(c.fields,{label,type},true);return c}
const local=(en,de,tr)=>{const l=(chrome.i18n?.getUILanguage?.()||'en').slice(0,2);return l==='de'?de:l==='tr'?tr:en};
function builtInTemplates(){const T=local;
const make=(id,name,fields,documents,sites,tasks,folders)=>normalizeTemplate({id,name,fields:fields.map(([label,type])=>({label,type})),documents:documents.map(title=>({title})),sites:sites.map(([title,url])=>({title,url})),tasks:tasks.map(title=>({title})),folders,assets:[]});
return [
make('preset-jobcenter',T('Jobcenter / benefits','Jobcenter / Bürgergeld','Jobcenter / sosyal yardım'),[[T('Client reference number','Kundennummer','Müşteri numarası'),'text'],[T('BG number','BG-Nummer','BG numarası'),'text']], [T('Identity document','Ausweisdokument','Kimlik belgesi'),T('Rental contract','Mietvertrag','Kira sözleşmesi'),T('Income evidence','Einkommensnachweise','Gelir belgeleri'),T('Bank statements','Kontoauszüge','Banka dökümleri')],[['Jobcenter','https://www.jobcenter.digital/'],['Arbeitsagentur','https://www.arbeitsagentur.de/'],['BundID','https://id.bund.de/']],[T('Confirm required documents','Benötigte Unterlagen prüfen','Gerekli belgeleri doğrula'),T('Prepare application','Antrag vorbereiten','Başvuruyu hazırla'),T('Follow up','Bearbeitungsstand prüfen','Sonucu takip et')],['Jobcenter']),
make('preset-job',T('Job search','Arbeitssuche','İş arama'),[[T('Desired job','Wunschberuf','Hedef meslek'),'text'],[T('Qualifications','Qualifikationen','Nitelikler'),'textarea'],[T('Availability','Verfügbarkeit','Çalışmaya uygunluk'),'text'],[T('Preferred location','Wunschort','Tercih edilen bölge'),'text']], [T('CV','Lebenslauf','Özgeçmiş'),T('Certificates','Zeugnisse','Diploma ve sertifikalar'),T('Cover letter','Anschreiben','Ön yazı')],[['BA Jobsuche','https://www.arbeitsagentur.de/jobsuche/'],['Indeed','https://de.indeed.com/'],['StepStone','https://www.stepstone.de/'],['LinkedIn','https://www.linkedin.com/jobs/']],[T('Review CV','Lebenslauf prüfen','Özgeçmişi kontrol et'),T('Find matching vacancies','Passende Stellen suchen','Uygun ilanları bul'),T('Track applications','Bewerbungen verfolgen','Başvuruları takip et')],['Bewerbungen','Lebenslauf']),
make('preset-home',T('Housing search','Wohnungssuche','Ev arama'),[[T('Household size','Haushaltsgröße','Hane kişi sayısı'),'number'],[T('Rooms','Zimmeranzahl','Oda sayısı'),'number'],[T('Maximum warm rent','Maximale Warmmiete','Azami sıcak kira'),'number'],[T('Preferred area','Wunschgebiet','Tercih edilen bölge'),'text'],[T('Move-in date','Einzugsdatum','Taşınma tarihi'),'date']], [T('Income evidence','Einkommensnachweise','Gelir belgeleri'),T('Tenant self-disclosure','Mieterselbstauskunft','Kiracı bilgi formu'),T('WBS if applicable','WBS falls erforderlich','Gerekiyorsa WBS')],[['ImmoScout24','https://www.immobilienscout24.de/'],['Immowelt','https://www.immowelt.de/'],['Kleinanzeigen','https://www.kleinanzeigen.de/']],[T('Define search criteria','Suchkriterien festlegen','Arama kriterlerini belirle'),T('Contact landlords','Vermieter kontaktieren','Ev sahipleriyle iletişime geç'),T('Track viewings','Besichtigungen verfolgen','Ev randevularını takip et')],['Wohnungssuche','Wohnungsangebote']),
make('preset-residence',T('Residence permit','Aufenthaltstitel','Oturum izni'),[[T('Permit expiry','Ablaufdatum','Geçerlilik sonu'),'date'],[T('Reference number','Aktenzeichen','Dosya numarası'),'text']],[T('Passport','Reisepass','Pasaport'),T('Current permit','Aktueller Aufenthaltstitel','Mevcut oturum kartı'),T('Appointment confirmation','Terminbestätigung','Randevu onayı')],[['BAMF','https://www.bamf.de/'],['Service-BW','https://www.service-bw.de/']],[T('Check authority requirements','Anforderungen der Behörde prüfen','Kurumun şartlarını kontrol et'),T('Prepare appointment','Termin vorbereiten','Randevuyu hazırla')],['Aufenthalt'])
]}
function upgradeSchema(s){
 s.defaultFields=Array.isArray(s.defaultFields)?s.defaultFields:[];
 s.templates=(s.templates||[]).map(normalizeTemplate);
 if(!s.templatePresetsInitialized){s.templatePresetsInitialized=true;for(const t of builtInTemplates())if(!s.templates.some(x=>x.id===t.id))s.templates.push(t)}
 for(const c of s.clients)normalizeClient(c);
 return s;
}
function addTemplateEntry(t,kind,x){
 if(kind==='fields'){appendField(t.fields,x);return}
 if(kind==='sites'){const url=requiredText(x.url,2000);if(!urlOK(url))throw Error('Invalid URL');if(!t.sites.some(y=>y.url===url))t.sites.push({title:requiredText(x.title||url),url});return}
 if(kind==='tasks'||kind==='documents'){const title=requiredText(x.title);if(!t[kind].some(y=>norm(y.title)===norm(title)))t[kind].push({title});return}
 if(kind==='folders'){const name=requiredText(x.name,100);if(!validTemplateName(name))throw Error('Invalid folder name');if(!t.folders.includes(name))t.folders.push(name);return}
 if(kind==='assets'){const name=requiredText(x.name,170);if(!validTemplateName(name))throw Error('Invalid file name');if(!t.assets.some(y=>y.name===name))t.assets.push({name});return}
 throw Error('Invalid template item');
}
function validTemplateName(n){return typeof n==='string'&&n.trim()===n&&n.length>0&&n.length<180&&!/[\\/:*?"<>|\x00-\x1f]/.test(n)&&!['.','..'].includes(n)&&!/[. ]$/.test(n)&&!/^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(?:\.|$)/i.test(n)}
function applyTemplate(c,t){
 normalizeClient(c);
 for(const x of t.fields)appendField(c.fields,x,true);
 for(const x of t.tasks)if(!c.tasks.some(y=>norm(y.title)===norm(x.title)))c.tasks.push({id:id(),title:x.title,status:'todo',priority:'normal',created:Date.now()});
 for(const x of t.documents)if(!c.documents.some(y=>norm(y.title)===norm(x.title)))c.documents.push({id:id(),title:x.title,status:'missing',created:Date.now()});
 for(const x of t.sites)if(urlOK(x.url)&&!c.sites.some(y=>y.url===x.url))c.sites.push({id:id(),title:x.title,url:x.url,created:Date.now()});
 for(const n of t.folders)if(validTemplateName(n)&&!c.folders.includes(n))c.folders.push(n);
 for(const x of t.assets)if(validTemplateName(x.name)&&!c.templateAssets.some(y=>y.templateId===t.id&&y.name===x.name))c.templateAssets.push({templateId:t.id,name:x.name});
 if(!c.templateIds.includes(t.id))c.templateIds.push(t.id);
}
function getTemplate(s,tid){const t=s.templates.find(x=>x.id===tid);if(!t)throw Error('Template not found');return t}


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
 const number=s.next++,c={id:id(),number,name,folder:String(number).padStart(6,'0')+'_'+clean(name),email:'demo'+(i+1)+'@example.invalid',phone:'',street:'DEMO Musterstraße '+(i+1),postalCode:'00000',city:'DEMO Musterstadt',country:'Deutschland',status,tags:'DEMO, '+tag,info:'DEMO / TEST — Fiktive Beispieldaten. '+subject+'. No real customer or account.',favorite:i===0,archived:false,demo:true,demoSubject:subject,color,tasks:tasks.map((title,j)=>item({title,description:'DEMO — '+subject,status:j===0||i===4&&j<4?'done':j===1?'progress':j===2?'waiting':'todo',priority:j===2?'high':'normal',due:day(j===0?-3:j===1?-1:j===2?0:j===3?i+1:7),completed:j===0||i===4&&j<4?now:null})),notes:[item({title:'Initial consultation',description:'DEMO — '+subject+'. Client provided preliminary details. Verify all requirements before submitting anything.'}),item({title:'Follow-up note',description:'DEMO — '+tasks[2]+'. No real application has been submitted.'}),item({title:'Document checklist',description:'DEMO — Example files are available in the client folder after selecting local storage.'})],events:[item({title:appointment,description:'DEMO — simulated appointment, not booked.',due:day(i===0?0:i,9+i)}),item({title:'Document review',description:'DEMO — simulated follow-up.',due:day(i+7,14)})],reminders:[item({title:'DEMO — '+tasks[4],description:'Example reminder; no real action required.',due:day(i+1,11),before:15,repeat:'none',done:false,fired:false}),item({title:'DEMO — Weekly case check',description:'Example recurring reminder.',due:day(i+7,15),before:0,repeat:'weekly',done:false,fired:false})],sites:sites.map(([title,url])=>item({title,url})),credentials:[],lastTabs:[],folders:[tag],created:now+i};
 s.clients.push(c);log(s,c.id,'DEMO client created');
 }
 return true;
}

function nextDate(r){const d=new Date(r.due), orig=d.getDate();if(r.repeat==='daily')d.setDate(d.getDate()+1);else if(r.repeat==='weekly')d.setDate(d.getDate()+7);else if(r.repeat==='monthly'){d.setDate(1);d.setMonth(d.getMonth()+1);d.setDate(Math.min(orig,new Date(d.getFullYear(),d.getMonth()+1,0).getDate()))}else if(r.repeat==='yearly')d.setFullYear(d.getFullYear()+1);else return null;return d.getTime()}
async function notifyDue(){const s=await state();let dirty=false;for(const c of s.clients){if(c.archived)continue;for(const r of c.reminders){if(r.done||r.fired||!Number.isFinite(r.due)||r.due-(r.before||0)*60000>Date.now())continue;try{await chrome.notifications.create('rem:'+c.id+':'+r.id,{type:'basic',iconUrl:'icon.png',title:'Clientora · '+c.name,message:r.title,buttons:[{title:'Open / Öffnen / Aç'},{title:'Snooze 1h'}],priority:2});r.fired=true;dirty=true}catch(e){console.warn(e)}}}if(dirty)await save(s)}
async function openDashboard(cid=''){return chrome.tabs.create({url:chrome.runtime.getURL('index.html')+(cid?'#'+encodeURIComponent(cid):'')})}
async function openWorkspace(c,s){const m=await maps();for(const [wid,cid] of Object.entries(m)){if(cid===c.id){try{await chrome.windows.update(Number(wid),{focused:true});return Number(wid)}catch{delete m[wid]}}}const urls=((c.restore??s.settings.restore)&&c.lastTabs?.length?c.lastTabs:c.sites.map(x=>x.url)).filter(urlOK);const w=await chrome.windows.create({url:urls.length?urls:chrome.runtime.getURL('index.html')+'#'+c.id,type:'normal',focused:true});m[w.id]=c.id;await chrome.storage.session.set({windows:m});await chrome.action.setBadgeText({text:String(c.number),tabId:w.tabs?.[0]?.id}).catch(()=>{});return w.id}
async function dispatch(q){if(q.type==='get')return state();if(q.type==='context'){const m=await maps();return m[q.windowId]||null}if(q.type==='pendingTemplateSite'){const key='template-site:'+q.token;const x=(await chrome.storage.session.get(key))[key];await chrome.storage.session.remove(key);return x||null}const s=await state();let c=q.cid?client(s,q.cid):null;let result;
switch(q.type){case 'demo':{if(!s.clients.some(c=>c.demo)&&!s.trash.some(t=>t.kind==='client'&&t.item.demo))seedDemo(s);break}
case 'create':{const name=String(q.name||'').trim();if(!name)throw Error('Name required');const number=s.next++;c={id:id(),number,name,folder:String(number).padStart(6,'0')+'_'+clean(name),email:String(q.email||''),phone:String(q.phone||''),street:String(q.street||''),postalCode:String(q.postalCode||''),city:String(q.city||''),country:String(q.country||''),status:'active',tags:'',info:'',favorite:false,archived:false,tasks:[],notes:[],events:[],reminders:[],sites:[],credentials:[],lastTabs:[],created:Date.now()};normalizeClient(c);for(const x of s.defaultFields)appendField(c.fields,x,true);const t=s.templates.find(x=>x.id===q.template);if(t)applyTemplate(c,t);s.clients.push(c);log(s,c.id,'Client created');result=c;break}
case 'edit':for(const k of ['name','email','phone','street','postalCode','city','country','status','tags','info','favorite','archived','panel','restore','color'])if(Object.hasOwn(q.patch,k))c[k]=q.patch[k];log(s,c.id,'Client updated');break;
case 'archiveClient':case 'deleteClient':{if(!c.archived){c.archived=true;c.archivedAt=Date.now();log(s,c.id,'Client archived');}break}
case 'reactivateClient':{if(c.archived){c.archived=false;c.reactivatedAt=Date.now();if(c.status==='done')c.status='active';log(s,c.id,'Client reactivated');}break}
case 'fieldValues':{if(!Array.isArray(q.values))throw Error('Invalid field values');for(const x of q.values){const field=c.fields.find(y=>y.id===x.id);if(!field)throw Error('Field not found');field.value=String(x.value??'').slice(0,20000)}log(s,c.id,'Client fields updated');break}
case 'restoreTrash':{const t=s.trash[q.index];if(!t)break;if(t.kind==='client'){if(!s.clients.some(x=>x.id===t.item.id))s.clients.push(t.item)}else{const target=client(s,t.cid);target[t.kind].push(t.item)}s.trash.splice(q.index,1);break}
case 'add':case 'update':case 'remove':{if(!allowed.includes(q.kind))throw Error('Invalid collection');const a=c[q.kind];if(q.type==='add'){const item={...q.item,id:id(),created:Date.now()};if(q.kind==='sites'&&!urlOK(item.url))throw Error('Invalid URL');a.unshift(item);result=item}else{const i=a.findIndex(x=>x.id===q.itemId);if(i<0)throw Error('Item not found');if(q.type==='remove'){const [item]=a.splice(i,1);s.trash.push({kind:q.kind,cid:c.id,item,at:Date.now()})}else{const item={...a[i],...q.item,id:a[i].id};if(q.kind==='sites'&&!urlOK(item.url))throw Error('Invalid URL');a[i]=item}}log(s,c.id,q.kind+' '+q.type);break}
case 'completeReminder':{const r=c.reminders.find(x=>x.id===q.itemId);if(!r)break;const next=nextDate(r);if(next){r.due=next;r.fired=false}else r.done=true;break}
case 'snooze':{const r=c.reminders.find(x=>x.id===q.itemId);if(r){r.due=Date.now()+q.minutes*60000;r.before=0;r.fired=false}break}
case 'settings':for(const k of Object.keys(BASE.settings))if(Object.hasOwn(q.patch,k))s.settings[k]=q.patch[k];break;
case 'vault':if(s.vault)throw Error('Vault already exists');s.vault=q.vault;break;
case 'template':{const t=normalizeTemplate({id:id(),name:requiredText(q.item.name,100)});for(const kind of ['fields','tasks','documents','sites','folders'])for(const x of q.item[kind]||[])addTemplateEntry(t,kind,kind==='folders'?{name:x}:kind==='tasks'||kind==='documents'?(typeof x==='string'?{title:x}:x):kind==='sites'?(typeof x==='string'?{url:x,title:x}:x):x);s.templates.push(t);result=t;break}
case 'templateApply':{const t=getTemplate(s,q.tid);applyTemplate(c,t);log(s,c.id,'Template applied: '+t.name);result=c;break}
case 'templateEntry':{const t=getTemplate(s,q.tid);addTemplateEntry(t,q.kind,q.item);break}
case 'templateRename':getTemplate(s,q.tid).name=requiredText(q.name,100);break;
case 'templateRemoveEntry':{const t=getTemplate(s,q.tid);if(!['fields','tasks','documents','sites','folders','assets'].includes(q.kind)||!Number.isInteger(q.index)||q.index<0||q.index>=t[q.kind].length)throw Error('Invalid item');t[q.kind].splice(q.index,1);break}
case 'fieldAdd':{const field=appendField(c.fields,q.item,true);if(q.item.value!==undefined&&!field.value)field.value=String(q.item.value).slice(0,20000);if(q.defaultField)appendField(s.defaultFields,field);result=field;break}
case 'fieldValue':{const field=c.fields.find(x=>x.id===q.fieldId);if(!field)throw Error('Field not found');field.value=String(q.value??'').slice(0,20000);break}
case 'fieldDefault':{const field=c.fields.find(x=>x.id===q.fieldId);if(!field)throw Error('Field not found');appendField(s.defaultFields,field);break}
case 'fieldDefaultAdd':appendField(s.defaultFields,q.item);break;
case 'fieldDefaultRemove':s.defaultFields=s.defaultFields.filter(x=>x.id!==q.fieldId);break;
case 'fieldRemove':c.fields=c.fields.filter(x=>x.id!==q.fieldId||standardFields.some(y=>y[0]===x.label));break;
case 'open':return openWorkspace(c,s);
case 'snapshot':{const m=await maps();if(m[q.windowId]!==c.id)throw Error('Wrong workspace');c.lastTabs=(await chrome.tabs.query({windowId:q.windowId})).map(x=>x.url).filter(urlOK);break}
case 'history':log(s,c.id,String(q.text).slice(0,500));break;
case 'import':{const d=q.data;if(!d||!Array.isArray(d.clients)||!Number.isInteger(d.next)||!d.clients.every(x=>typeof x.id==='string'&&typeof x.name==='string'&&typeof x.folder==='string'&&/^[\p{L}\p{N}_-]+$/u.test(x.folder)&&allowed.filter(k=>k!=='documents').every(k=>Array.isArray(x[k]))))throw Error('Invalid backup');await save(upgradeSchema({...BASE,...d,settings:{...BASE.settings,...d.settings}}));await chrome.storage.session.remove('windows');return true}
default:throw Error('Unknown operation')}
await save(s);return result??true}
chrome.runtime.onMessage.addListener((q,sender,respond)=>{if(sender.id!==chrome.runtime.id||!sender.url?.startsWith(chrome.runtime.getURL('')))return;run(()=>dispatch(q)).then(value=>respond({ok:true,value}),e=>respond({ok:false,error:e.message}));return true});
chrome.runtime.onInstalled.addListener(()=>{run(state).catch(console.error);chrome.contextMenus.removeAll(()=>{chrome.contextMenus.create({id:'client-download',title:'Clientora: save link for this client',contexts:['link']});chrome.contextMenus.create({id:'template-page',title:local('Clientora: Add page to template','Clientora: Seite zur Vorlage hinzufügen','Clientora: Sayfayı şablona ekle'),contexts:['page','link']})});chrome.alarms.create('tick',{periodInMinutes:1})});
chrome.runtime.onStartup.addListener(()=>{chrome.alarms.create('tick',{periodInMinutes:1});run(async()=>{await notifyDue();if(typeof FS!=='undefined')try{await FS.autoBackup()}catch(e){console.warn('Automatic backup:',e.message)}})});
chrome.alarms.onAlarm.addListener(a=>{if(a.name==='tick')run(async()=>{await notifyDue();if(typeof FS!=='undefined')try{await FS.autoBackup()}catch(e){console.warn('Automatic backup:',e.message)}})});
chrome.action.onClicked.addListener(async tab=>{const m=await maps();if(m[tab.windowId]){try{await chrome.sidePanel.open({windowId:tab.windowId});return}catch{}}await openDashboard()});chrome.commands.onCommand.addListener(()=>openDashboard());
chrome.windows.onRemoved.addListener(wid=>run(async()=>{const m=await maps();delete m[wid];await chrome.storage.session.set({windows:m})}));
async function snapshotWindow(wid){return run(async()=>{const m=await maps();if(!m[wid])return;const s=await state(),c=s.clients.find(x=>x.id===m[wid]);if(!c||!(c.restore??s.settings.restore))return;try{const urls=(await chrome.tabs.query({windowId:wid})).map(t=>t.url).filter(urlOK);if(urls.length){c.lastTabs=urls;await save(s)}}catch{}})}
chrome.tabs.onUpdated.addListener((tid,change,tab)=>{if(change.status==='complete'||change.url)snapshotWindow(tab.windowId)});chrome.tabs.onRemoved.addListener((tid,info)=>{if(!info.isWindowClosing)snapshotWindow(info.windowId)});chrome.tabs.onMoved.addListener((tid,info)=>snapshotWindow(info.windowId));
chrome.notifications.onClicked.addListener(n=>{if(n.startsWith('rem:'))openDashboard(n.split(':')[1])});chrome.notifications.onButtonClicked.addListener((n,b)=>{if(!n.startsWith('rem:'))return;const [,cid,itemId]=n.split(':');if(b===0)openDashboard(cid);else run(()=>dispatch({type:'snooze',cid,itemId,minutes:60}));chrome.notifications.clear(n)});
chrome.contextMenus.onClicked.addListener((info,tab)=>{if(info.menuItemId==='template-page'){const u=info.linkUrl||info.pageUrl||tab?.url;if(!urlOK(u))return;const url=new URL(u);url.username='';url.password='';url.search='';url.hash='';const token=id();chrome.storage.session.set({['template-site:'+token]:{title:info.linkUrl?url.hostname:(tab?.title||url.hostname),url:url.href}}).then(()=>chrome.tabs.create({url:chrome.runtime.getURL('index.html')+'#template-site:'+token})).catch(console.error);return}if(info.menuItemId!=='client-download'||!tab||!urlOK(info.linkUrl))return;run(async()=>{const m=await maps(),s=await state(),c=s.clients.find(x=>x.id===m[tab.windowId]);if(!c)return;let filename='download';try{filename=decodeURIComponent(new URL(info.linkUrl).pathname.split('/').pop()||'download').replace(/[^\p{L}\p{N}._-]/gu,'_').replace(/^\.+/,'')||'download'}catch{}const auto=s.settings.downloads==='auto'&&s.settings.relative;const opts={url:info.linkUrl,saveAs:!auto,conflictAction:'uniquify'};if(auto)opts.filename='Clientora/Musteriler/'+c.folder+'/05_Indirilenler/'+filename;const downloadId=await chrome.downloads.download(opts);log(s,c.id,'Download requested #'+downloadId);await save(s)})});
