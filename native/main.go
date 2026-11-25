package main

import (
 "encoding/binary"
 "encoding/json"
 "errors"
 "fmt"
 "io"
 "os"
 "path/filepath"
 "regexp"
 "runtime"
 "strings"
)
const hostName = "com.clientora.filemanager"
const helperVersion = "0.1.12"
// Set at release build time only after the official Web Store listing exists.
var storeID string
var idRE = regexp.MustCompile("^[a-p]{32}$")
var markerRE = regexp.MustCompile("^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$")
var allowed = map[string]bool{".docx":true,".doc":true,".odt":true,".rtf":true,".pdf":true,".xlsx":true,".xls":true,".ods":true,".pptx":true,".ppt":true,".odp":true,".txt":true,".csv":true,".png":true,".jpg":true,".jpeg":true,".gif":true,".webp":true,".bmp":true,".tif":true,".tiff":true}
type config struct {Root string `json:"root"`; Origin string `json:"origin"`}
type request struct {Action string `json:"action"`; Marker string `json:"marker"`; Parts []string `json:"parts"`}
type response struct {OK bool `json:"ok"`; Error string `json:"error,omitempty"`; Version string `json:"version,omitempty"`}
func readConfig(path string)(config,error){var c config;b,e:=os.ReadFile(path);if e==nil{e=json.Unmarshal(b,&c)};return c,e}
func readMessage(r io.Reader)(request,error){var q request;var size uint32;if e:=binary.Read(r,binary.LittleEndian,&size);e!=nil{return q,e};if size==0||size>65536{return q,errors.New("Ungültige Nachricht")};b:=make([]byte,size);if _,e:=io.ReadFull(r,b);e!=nil{return q,e};return q,json.Unmarshal(b,&q)}
func writeMessage(w io.Writer,r response)error{b,e:=json.Marshal(r);if e!=nil{return e};if e=binary.Write(w,binary.LittleEndian,uint32(len(b)));e!=nil{return e};_,e=w.Write(b);return e}
func safePart(p string)bool{if p==""||p=="."||p==".."||len(p)>255||strings.ContainsAny(p,"\/:*?"<>|")||strings.HasSuffix(p,".")||strings.HasSuffix(p," "){return false};for _,r:=range p{if r<32{return false}};return true}
func inside(root,target string)bool{rel,e:=filepath.Rel(root,target);return e==nil&&rel!=".."&&!strings.HasPrefix(rel,".."+string(os.PathSeparator))&&!filepath.IsAbs(rel)}
func samePath(a,b string)bool{if runtime.GOOS=="windows"{return strings.EqualFold(a,b)};return a==b}
func resolve(c config,q request)(string,error){
 if q.Action!="openFolder"&&q.Action!="openFile"{return "",errors.New("Unbekannte Aktion")}
 if !markerRE.MatchString(q.Marker)||len(q.Parts)<2||len(q.Parts)>64||(q.Parts[0]!="Kunden"&&q.Parts[0]!="Musteriler"){return "",errors.New("Ungültiger Kundenordner")}
 for _,p:=range q.Parts{if !safePart(p){return "",errors.New("Ungültiger Pfad")}}
 root,e:=filepath.EvalSymlinks(c.Root);if e!=nil{return "",e};mark:=filepath.Join(root,".clientora-filemanager-id");st,e:=os.Lstat(mark);if e!=nil||!st.Mode().IsRegular()||st.Size()>128{return "",errors.New("Ordnerkennung fehlt")}
 b,e:=os.ReadFile(mark);if e!=nil||strings.TrimSpace(string(b))!=q.Marker{return "",errors.New("Falscher Datenordner. Clientora Setup erneut ausführen.")}
 target:=root;for _,p:=range q.Parts{target=filepath.Join(target,p);actual,e:=filepath.EvalSymlinks(target);if e!=nil||!samePath(actual,target)||!inside(root,actual){return "",errors.New("Pfad außerhalb des Kundenordners oder Verknüpfung")}}
 info,e:=os.Stat(target);if e!=nil{return "",e}
 if q.Action=="openFolder"&&!info.IsDir(){return "",errors.New("Kein Ordner")}
 if q.Action=="openFile"&&(len(q.Parts)<3||!info.Mode().IsRegular()||!allowed[strings.ToLower(filepath.Ext(target))]){return "",errors.New("Nicht unterstützter Dateityp")}
 return target,nil
}
func native(origin string,r io.Reader,w io.Writer){
 res:=response{Version:helperVersion};c,e:=readConfig(filepath.Join(appDir(),"config.json"))
 if e==nil&&c.Origin!=origin{e=errors.New("Erweiterung nicht autorisiert")}
 if e==nil{var q request;q,e=readMessage(r);if e==nil&&q.Action!="ping"{var p string;p,e=resolve(c,q);if e==nil{e=openLocal(p,q.Action=="openFolder")}}}
 if e!=nil{res.Error=e.Error()}else{res.OK=true};_ = writeMessage(w,res)
}
func main(){
 if len(os.Args)>1&&strings.HasPrefix(os.Args[1],"chrome-extension://"){native(os.Args[1],os.Stdin,os.Stdout);return}
 if e:=setup();e!=nil&&!errors.Is(e,errCancel){alert("Clientora – Einrichtung fehlgeschlagen",e.Error());fmt.Fprintln(os.Stderr,e);os.Exit(1)}
}
