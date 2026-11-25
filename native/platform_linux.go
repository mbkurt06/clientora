package main
import("os";"os/exec";"path/filepath";"strings")
func appDir()string{h,_:=os.UserHomeDir();d:=os.Getenv("XDG_DATA_HOME");if d==""{d=filepath.Join(h,".local","share")};return filepath.Join(d,"clientora","native")}
func manifestDir()string{h,_:=os.UserHomeDir();d:=os.Getenv("XDG_CONFIG_HOME");if d==""{d=filepath.Join(h,".config")};return filepath.Join(d,"google-chrome","NativeMessagingHosts")}
func helperName()string{return "clientora-helper"}
func replaceExecutable(src,dst string)error{return os.Rename(src,dst)}
func registerManifest(string)error{return nil}
func openLocal(p string,folder bool)error{c:=exec.Command("xdg-open",p);if e:=c.Start();e!=nil{return e};return c.Process.Release()}
func openWeb(url string)error{return openLocal(url,false)}
func zen(args ...string)(string,error){b,e:=exec.Command("zenity",args...).Output();if e!=nil{return "",errCancel};return strings.TrimSpace(string(b)),nil}
func extensionStep(store bool)(bool,error){if !store{_,e:=zen("--question","--title=Clientora","--text=Clientora ist noch nicht im Web Store veröffentlicht. Bereits installierte Erweiterung verwenden?","--ok-label=Überspringen");return false,e};r,e:=zen("--list","--radiolist","--title=Clientora – Chrome-Erweiterung","--column=Auswahl","--column=Aktion","TRUE","Web Store öffnen","FALSE","Überspringen");return r=="Web Store öffnen",e}
func askText(title,msg,value string)(string,error){return zen("--entry","--title="+title,"--text="+msg,"--entry-text="+value)}
func chooseFolder(prev string)(string,error){args:=[]string{"--file-selection","--directory","--title=Clientora-Datenordner auswählen"};if prev!=""{args=append(args,"--filename="+prev+"/")};return zen(args...)}
func confirmStep(title,msg string)bool{_,e:=zen("--question","--title="+title,"--text="+msg,"--ok-label=Weiter","--cancel-label=Abbrechen");return e==nil}
func alert(title,msg string){_,_=zen("--info","--title="+title,"--text="+msg)}
