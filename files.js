const FS={async db(){return new Promise((res,rej)=>{const r=indexedDB.open('clientora-handles',1);r.onupgradeneeded=()=>r.result.createObjectStore('handles');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})},async get(key='root'){const db=await this.db();return new Promise((res,rej)=>{const t=db.transaction('handles'),r=t.objectStore('handles').get(key);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);t.oncomplete=()=>db.close()})},async put(h,key='root'){const db=await this.db();return new Promise((res,rej)=>{const t=db.transaction('handles','readwrite');t.objectStore('handles').put(h,key);t.oncomplete=()=>{db.close();res()};t.onerror=()=>rej(t.error)})},async choose(){const parent=await showDirectoryPicker({mode:'readwrite'});const root=parent.name==='Clientora'?parent:await parent.getDirectoryHandle('Clientora',{create:true});await root.getDirectoryHandle('Musteriler',{create:true});await root.getDirectoryHandle('Yedekler',{create:true});await root.getDirectoryHandle('Sablonlar',{create:true});await this.put(root);return root},async root(ask=false){const h=await this.get();if(!h)throw Error('Select Clientora folder in Settings');if(await h.queryPermission({mode:'readwrite'})!=='granted'&&(!ask||await h.requestPermission({mode:'readwrite'})!=='granted'))throw Error('Folder permission required');return h},async client(c,ask=false){const root=await this.root(ask),parent=await root.getDirectoryHandle('Musteriler',{create:true});const h=await parent.getDirectoryHandle(c.folder,{create:true});for(const n of ['01_Kimlik_Belgeleri','02_Basvurular','03_Gelen_Belgeler','04_Gonderilen_Belgeler','05_Indirilenler','06_Diger',...(c.folders||[])]){if(validName(n))await h.getDirectoryHandle(n,{create:true})}await this.demoFiles(c,h);return h},async path(c,parts,ask=false){let h=await this.client(c,ask);for(const p of parts)h=await h.getDirectoryHandle(p);return h},async entries(h){const list=[];for await(const [name,handle] of h.entries()){let info='';if(handle.kind==='file'){const f=await handle.getFile();info=Math.round(f.size/1024)+' KB · '+new Date(f.lastModified).toLocaleDateString()}list.push({name,handle,info})}return list.sort((a,b)=>a.handle.kind===b.handle.kind?a.name.localeCompare(b.name):a.handle.kind==='directory'?-1:1)},async write(h,file,name=file.name){if(!validName(name))throw Error('Invalid file name');let target=name,i=1;while(true){try{await h.getFileHandle(target);const dot=name.lastIndexOf('.');target=dot>0?name.slice(0,dot)+' ('+i+++')'+name.slice(dot):name+' ('+i+++')'}catch(e){if(e.name==='NotFoundError')break;throw e}}const f=await h.getFileHandle(target,{create:true}),w=await f.createWritable();await w.write(file);await w.close();return target},async copy(source,target,name){if(source.kind==='file')return this.write(target,await source.getFile(),name||source.name);const n=name||source.name;if(!validName(n))throw Error('Invalid name');for await(const [existing] of target.entries())if(existing===n)throw Error('Destination exists');const d=await target.getDirectoryHandle(n,{create:true});for await(const [,h] of source.entries())await this.copy(h,d);return n}};
function validName(s){return typeof s==='string'&&s.trim()===s&&s.length>0&&s.length<180&&!/[\\/:*?"<>|\x00-\x1f]/.test(s)&&!['.','..'].includes(s)&&!/[. ]$/.test(s)&&!/^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(?:\.|$)/i.test(s)}


function demoPDF(lines){
 const esc=s=>String(s).normalize('NFKD').replace(/[^\x20-\x7e]/g,'?').replace(/[\\()]/g,'\\$&');
 const stream='BT /F1 12 Tf 48 790 Td 18 TL '+lines.map((l,i)=>(i?'T* ':'')+'('+esc(l)+') Tj').join('\n')+' ET\n';
 const objs=['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [3 0 R] /Count 1 >>','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>','<< /Length '+stream.length+' >>\nstream\n'+stream+'endstream'];
 let pdf='%PDF-1.4\n',offsets=[0];for(let i=0;i<objs.length;i++){offsets.push(pdf.length);pdf+=(i+1)+' 0 obj\n'+objs[i]+'\nendobj\n'}
 const start=pdf.length;pdf+='xref\n0 6\n0000000000 65535 f \n'+offsets.slice(1).map(o=>String(o).padStart(10,'0')+' 00000 n \n').join('')+'trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n'+start+'\n%%EOF\n';return pdf;
}
FS.demoFiles=async function(c,h){
 if(!c.demo)return;
 const marker='demo-files:'+c.id,old=await this.get(marker);
 if(old&&await old.isSameEntry(h).catch(()=>false))return;
 const title='CLIENTORA DEMO - NOT A REAL DOCUMENT',subject=c.demoSubject||'Example case';
 const records=[
 ['02_Basvurular','DEMO_Antrag.pdf',demoPDF([title,'Sample application overview','Client ID: '+c.number,'Case: '+subject,'Status: draft example','No application has been submitted.'])],
 ['03_Gelen_Belgeler','DEMO_Eingang.pdf',demoPDF([title,'Sample correspondence','Client ID: '+c.number,'Case: '+subject,'Example only - not an official notice.'])],
 ['04_Gonderilen_Belgeler','DEMO_Begleitschreiben.txt',title+'\n'+c.name+'\n'+subject+'\nExample cover letter. No message has been sent.\n'],
 ['05_Indirilenler','DEMO_Checkliste.csv','Task,Status\n'+c.tasks.map(x=>'"'+x.title.replace(/"/g,'""')+'","'+x.status+'"').join('\n')+'\n'],
 ['06_Diger','DEMO_Hinweise.txt',title+'\nAll data is fictional. No identity documents or real credentials are included.\n']
 ];
 for(const [folder,name,body] of records){
 const dir=await h.getDirectoryHandle(folder,{create:true});
 let exists=false;try{await dir.getFileHandle(name);exists=true}catch(e){if(e.name!=='NotFoundError')throw e}
 if(!exists){const file=await dir.getFileHandle(name,{create:true}),w=await file.createWritable();await w.write(body);await w.close()}
 }
 await this.put(h,marker);
};
