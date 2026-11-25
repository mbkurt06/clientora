const FS={async db(){return new Promise((res,rej)=>{const r=indexedDB.open('clientora-handles',1);r.onupgradeneeded=()=>r.result.createObjectStore('handles');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})},async get(key='root'){const db=await this.db();return new Promise((res,rej)=>{const t=db.transaction('handles'),r=t.objectStore('handles').get(key);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);t.oncomplete=()=>db.close()})},async put(h,key='root'){const db=await this.db();return new Promise((res,rej)=>{const t=db.transaction('handles','readwrite');t.objectStore('handles').put(h,key);t.oncomplete=()=>{db.close();res()};t.onerror=()=>rej(t.error)})},async choose(){const parent=await showDirectoryPicker({mode:'readwrite'});const root=parent.name==='Clientora'?parent:await parent.getDirectoryHandle('Clientora',{create:true});await this.layoutDir(root,'Kunden','Musteriler');await this.layoutDir(root,'Sicherungen','Yedekler');await this.layoutDir(root,'Vorlagen','Sablonlar');await this.put(root);return root},async root(ask=false){const h=await this.get();if(!h)throw Error('Select Clientora folder in Settings');if(await h.queryPermission({mode:'readwrite'})!=='granted'&&(!ask||await h.requestPermission({mode:'readwrite'})!=='granted'))throw Error('Folder permission required');return h},async client(c,ask=false){const root=await this.root(ask),parent=await this.layoutDir(root,'Kunden','Musteriler');const h=await parent.getDirectoryHandle(c.folder,{create:true});for(const n of ['Dokumente',...(c.folders||[])]){if(validName(n))await h.getDirectoryHandle(n,{create:true})}await this.demoFiles(c,h);await this.copyTemplateAssets(c,h);return h},async path(c,parts,ask=false){let h=await this.client(c,ask);for(const p of parts)h=await h.getDirectoryHandle(p);return h},async entries(h){const list=[];for await(const [name,handle] of h.entries()){let info='';if(handle.kind==='file'){const f=await handle.getFile();info=Math.round(f.size/1024)+' KB · '+new Date(f.lastModified).toLocaleDateString()}list.push({name,handle,info})}return list.sort((a,b)=>a.handle.kind===b.handle.kind?a.name.localeCompare(b.name):a.handle.kind==='directory'?-1:1)},async write(h,file,name=file.name){if(!validName(name))throw Error('Invalid file name');let target=name,i=1;while(true){try{await h.getFileHandle(target);const dot=name.lastIndexOf('.');target=dot>0?name.slice(0,dot)+' ('+i+++')'+name.slice(dot):name+' ('+i+++')'}catch(e){if(e.name==='NotFoundError')break;throw e}}const f=await h.getFileHandle(target,{create:true}),w=await f.createWritable();await w.write(file);await w.close();return target},async copy(source,target,name){if(source.kind==='file')return this.write(target,await source.getFile(),name||source.name);const n=name||source.name;if(!validName(n))throw Error('Invalid name');for await(const [existing] of target.entries())if(existing===n)throw Error('Destination exists');const d=await target.getDirectoryHandle(n,{create:true});for await(const [,h] of source.entries())await this.copy(h,d);return n}};
function validName(s){return typeof s==='string'&&s.trim()===s&&s.length>0&&s.length<180&&!/[\\/:*?"<>|\x00-\x1f]/.test(s)&&!['.','..'].includes(s)&&!/[. ]$/.test(s)&&!/^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(?:\.|$)/i.test(s)}


function demoPDF(lines){
 const esc=s=>Array.from(String(s).replace(/–/g,'-').replace(/—/g,'-')).map(ch=>{const n=ch.charCodeAt(0);if(n>=32&&n<=126)return /[\\()]/.test(ch)?'\\'+ch:ch;return n>=160&&n<=255?'\\'+n.toString(8).padStart(3,'0'):'?'}).join('');
 const stream='BT /F1 12 Tf 48 790 Td 18 TL '+lines.map((l,i)=>(i?'T* ':'')+'('+esc(l)+') Tj').join('\n')+' ET\n';
 const objs=['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [3 0 R] /Count 1 >>','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>','<< /Length '+stream.length+' >>\nstream\n'+stream+'endstream'];
 let pdf='%PDF-1.4\n',offsets=[0];for(let i=0;i<objs.length;i++){offsets.push(pdf.length);pdf+=(i+1)+' 0 obj\n'+objs[i]+'\nendobj\n'}
 const start=pdf.length;pdf+='xref\n0 6\n0000000000 65535 f \n'+offsets.slice(1).map(o=>String(o).padStart(10,'0')+' 00000 n \n').join('')+'trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n'+start+'\n%%EOF\n';return pdf;
}
FS.demoFiles=async function(c,h){
 if(!c.demo)return;
 const marker='demo-files-de-v1:'+c.id,old=await this.get(marker);
 if(old&&await old.isSameEntry(h).catch(()=>false))return;
 const title='CLIENTORA – MUSTER, KEIN ECHTES DOKUMENT',subject=c.demoSubject||'Beispielvorgang';
 const records=[
 ['Dokumente','MUSTER_Antrag.pdf',demoPDF([title,'Übersicht zum Musterantrag','Kundennummer: '+c.number,'Vorgang: '+subject,'Status: Musterentwurf','Es wurde kein Antrag eingereicht.'])],
 ['Dokumente','MUSTER_Eingang.pdf',demoPDF([title,'Beispiel für Schriftverkehr','Kundennummer: '+c.number,'Vorgang: '+subject,'Nur ein Muster, kein amtlicher Bescheid.'])],
 ['Dokumente','MUSTER_Begleitschreiben.txt',title+'\n'+c.name+'\n'+subject+'\nMusterbegleitschreiben. Es wurde keine Nachricht versendet.\n'],
 ['Dokumente','MUSTER_Checkliste.csv','Aufgabe,Status\n'+c.tasks.map(x=>'"'+x.title.replace(/"/g,'""')+'","'+({todo:'Offen',progress:'In Arbeit',waiting:'Wartet',done:'Erledigt'}[x.status]||x.status)+'"').join('\n')+'\n'],
 ['Dokumente','MUSTER_Hinweise.txt',title+'\nAlle Angaben sind frei erfunden. Keine echten Ausweisdokumente oder Zugangsdaten enthalten.\n']
 ];
 for(const [folder,name,body] of records){
 const dir=await h.getDirectoryHandle(folder,{create:true});
 let exists=false;try{await dir.getFileHandle(name);exists=true}catch(e){if(e.name!=='NotFoundError')throw e}
 if(!exists){const file=await dir.getFileHandle(name,{create:true}),w=await file.createWritable();await w.write(body);await w.close()}
 }
 await this.put(h,marker);
};

/* Automatic encrypted metadata snapshots. Key stays in this Chrome profile's IndexedDB. */
const backup64=b=>{let s='';for(let i=0;i<b.length;i+=16384)s+=String.fromCharCode(...b.subarray(i,i+16384));return btoa(s)};
FS.enableBackup=async function(password){
 if(password.length<12)throw Error('Minimum 12 characters');
 await this.root();
 const salt=crypto.getRandomValues(new Uint8Array(16)),enc=new TextEncoder();
 const material=await crypto.subtle.importKey('raw',enc.encode(password),'PBKDF2',false,['deriveKey']);
 const key=await crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:600000,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,['encrypt']);
 await this.put({key,salt:backup64(salt),device:crypto.randomUUID(),last:0,digest:''},'auto-backup');return this.autoBackup(true);
};
FS.backupStatus=async function(){const cfg=await this.get('auto-backup');return cfg?{enabled:true,last:cfg.last||0,error:cfg.error||''}:{enabled:false,last:0,error:''}};
FS.disableBackup=async function(){const job=()=>this.put(null,'auto-backup');return typeof navigator!=='undefined'&&navigator.locks?navigator.locks.request('clientora-auto-backup',job):job()};
FS.autoBackup=async function(force=false){
 const self=this;
 const job=async()=>{
  const cfg=await self.get('auto-backup');if(!cfg)return false;
  if(!force&&Date.now()-(cfg.lastAttempt||0)<60000)return false;
  cfg.lastAttempt=Date.now();
  try{
   const root=await self.root(),{data}=await chrome.storage.local.get('data');if(!data)return false;
   const bytes=new TextEncoder().encode(JSON.stringify(data));
   const digest=backup64(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)));
   const same=cfg.root&&await cfg.root.isSameEntry(root).catch(()=>false);
   if(!force&&same&&cfg.digest===digest){cfg.error='';await self.put(cfg,'auto-backup');return false}
   const iv=crypto.getRandomValues(new Uint8Array(12)),cipher=await crypto.subtle.encrypt({name:'AES-GCM',iv},cfg.key,bytes);
   const payload={version:1,salt:cfg.salt,iv:backup64(iv),cipher:backup64(new Uint8Array(cipher))};
   const date=new Date().toISOString().slice(0,10),dir=await self.layoutDir(root,'Sicherungen','Yedekler');
   const handle=await dir.getFileHandle('Clientora-auto-'+date+'-'+cfg.device+'.clientora',{create:true});
   const writable=await handle.createWritable();try{await writable.write(JSON.stringify(payload));await writable.close()}catch(e){try{await writable.abort()}catch{}throw e}
   cfg.digest=digest;cfg.last=Date.now();cfg.root=root;cfg.error='';await self.put(cfg,'auto-backup');return true;
  }catch(e){cfg.error=String(e.message||e);await self.put(cfg,'auto-backup');throw e}
 };
 return typeof navigator!=='undefined'&&navigator.locks?navigator.locks.request('clientora-auto-backup',job):job();
};

FS.templateDir=async function(tid,create=false){if(!/^[a-zA-Z0-9_-]+$/.test(tid))throw Error('Invalid template ID');const root=await this.root(),base=await this.layoutDir(root,'Vorlagen','Sablonlar');return base.getDirectoryHandle(tid,{create})};
FS.addTemplateFile=async function(tid,file){const dir=await this.templateDir(tid,true);return this.write(dir,file)};
FS.copyTemplateAssets=async function(c,h){for(const asset of c.templateAssets||[]){
 if(!validName(asset.name)||! /^[a-zA-Z0-9_-]+$/.test(asset.templateId))continue;
 const key='template-copy:'+c.id+':'+asset.templateId+':'+asset.name,old=await this.get(key);
 if(old&&await old.isSameEntry(h).catch(()=>false))continue;
 try{const src=await this.templateDir(asset.templateId),file=await(await src.getFileHandle(asset.name)).getFile();const dest=await(await(await h.getDirectoryHandle('Dokumente',{create:true})).getDirectoryHandle('Vorlagen',{create:true})).getDirectoryHandle(asset.templateId,{create:true});
 let exists=false;try{await dest.getFileHandle(asset.name);exists=true}catch(e){if(e.name!=='NotFoundError')throw e}
 if(!exists){const target=await dest.getFileHandle(asset.name,{create:true}),w=await target.createWritable();await w.write(file);await w.close()}
 await this.put(h,key);
 }catch(e){if(e.name==='NotFoundError'){console.warn('Missing template file:',asset.name);continue}throw e}
}};

FS.nativeFolderMarker=async function(root){
 const name='.clientora-filemanager-id';
 let handle;try{handle=await root.getFileHandle(name)}catch(e){if(e.name!=='NotFoundError')throw e;handle=await root.getFileHandle(name,{create:true})}
 const file=await handle.getFile();
 if(file.size>128)throw Error('Invalid Clientora folder marker');
 let marker=(await file.text()).trim();
 if(!marker){marker=crypto.randomUUID();const w=await handle.createWritable();await w.write(marker);await w.close()}
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(marker))throw Error('Invalid Clientora folder marker');
 return marker;
};

FS.layoutDir=async function(root,german,legacy){try{return await root.getDirectoryHandle(legacy)}catch(e){if(e.name!=='NotFoundError')throw e}return root.getDirectoryHandle(german,{create:true})};
