package main
import ("encoding/json";"errors";"fmt";"io";"os";"path/filepath";"strings")
var errCancel=errors.New("Abgebrochen")
func existsDir(p string)bool{s,e:=os.Stat(p);return e==nil&&s.IsDir()}
func rootFolder(chosen string)(string,error){
 p,e:=filepath.Abs(chosen);if e!=nil{return "",e};p,e=filepath.EvalSymlinks(p);if e!=nil{return "",e}
 if !existsDir(p){return "",errors.New("Bitte einen vorhandenen Ordner wählen.")}
 if _,e:=os.Stat(filepath.Join(p,"manifest.json"));e==nil{return "",errors.New("Bitte den Datenordner wählen, nicht den Quellcodeordner.")}
 if filepath.Base(p)!="Clientora"{p=filepath.Join(p,"Clientora")}
 if _,e:=os.Stat(filepath.Join(p,"manifest.json"));e==nil{return "",errors.New("Bitte den Datenordner wählen, nicht den Quellcodeordner.")}
 if e=os.MkdirAll(p,0700);e!=nil{return "",e}
 for _,pair:=range [][2]string{{"Kunden","Musteriler"},{"Sicherungen","Yedekler"},{"Vorlagen","Sablonlar"}}{if !existsDir(filepath.Join(p,pair[1])){if e=os.MkdirAll(filepath.Join(p,pair[0]),0700);e!=nil{return "",e}}}
 return filepath.EvalSymlinks(p)
}
func writeJSON(path string,v any)error{b,e:=json.MarshalIndent(v,"","  ");if e!=nil{return e};return os.WriteFile(path,b,0600)}
func installHelper(c config)error{
 dir:=appDir();if e:=os.MkdirAll(dir,0700);e!=nil{return e}
 target:=filepath.Join(dir,helperName());source,e:=os.Executable();if e!=nil{return e}
 if a,_:=filepath.EvalSymlinks(source);!samePath(a,target){
  src,e:=os.Open(source);if e!=nil{return e};defer src.Close()
  tmp,e:=os.CreateTemp(dir,"helper-*");if e!=nil{return e};name:=tmp.Name();defer os.Remove(name)
  _,e=io.Copy(tmp,src);ce:=tmp.Close();if e!=nil{return e};if ce!=nil{return ce};if e=os.Chmod(name,0700);e!=nil{return e}
  if e=replaceExecutable(name,target);e!=nil{return e}
 }
 if e=writeJSON(filepath.Join(dir,"config.json"),c);e!=nil{return e}
 md:=manifestDir();if e=os.MkdirAll(md,0700);e!=nil{return e};path:=filepath.Join(md,hostName+".json")
 if e=writeJSON(path,map[string]any{"name":hostName,"description":"Clientora – lokale Dokumente öffnen","path":target,"type":"stdio","allowed_origins":[]string{c.Origin}});e!=nil{return e}
 return registerManifest(path)
}
func setup()error{
 old,_:=readConfig(filepath.Join(appDir(),"config.json"))
 useStore:=false
 if idRE.MatchString(storeID){
  choice,e:=extensionStep(true);if e!=nil{return e};useStore=choice
  if useStore{if e=openWeb("https://chromewebstore.google.com/detail/"+storeID);e!=nil{return e};if !confirmStep("Chrome-Erweiterung installieren","Fügen Sie Clientora in Chrome hinzu. Klicken Sie hier erst danach auf Weiter."){return errCancel}}
 }else{if _,e:=extensionStep(false);e!=nil{return e}}
 id:=strings.TrimSuffix(strings.TrimPrefix(old.Origin,"chrome-extension://"),"/")
 if useStore{id=storeID}
 if !useStore||!idRE.MatchString(id){
  var e error
  id,e=askText("Clientora – Erweiterungs-ID","Öffnen Sie chrome://extensions und kopieren Sie die ID Ihrer bereits installierten Clientora-Erweiterung.",id)
  if e!=nil{return e}
 }
 id=strings.TrimSpace(id);if !idRE.MatchString(id){return errors.New("Die Erweiterungs-ID muss aus 32 Buchstaben (a–p) bestehen.")}
 chosen,e:=chooseFolder(old.Root);if e!=nil{return e}
 if !confirmStep("Clientora installieren",fmt.Sprintf("Erweiterungs-ID: %s\nAusgewählter Ordner: %s\n\nLokalen Helfer verbinden? Vorhandene Kundendaten bleiben erhalten.",id,chosen)){return errCancel}
 root,e:=rootFolder(chosen);if e!=nil{return e}
 if e=installHelper(config{Root:root,Origin:"chrome-extension://"+id+"/"});e!=nil{return e}
 alert("Clientora – Installation abgeschlossen","Öffnen Sie die bereits installierte Clientora-Erweiterung in Chrome. Wählen Sie bei Bedarf denselben Datenordner. Erteilen Sie beim ersten Öffnen eines Dokuments die Chrome-Berechtigung.")
 return nil
}
