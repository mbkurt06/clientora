package main
import("os";"os/exec";"path/filepath";"strings")
func appDir()string{h,_:=os.UserHomeDir();return filepath.Join(h,"Library","Application Support","Clientora","Native")}
func manifestDir()string{h,_:=os.UserHomeDir();return filepath.Join(h,"Library","Application Support","Google","Chrome","NativeMessagingHosts")}
func helperName()string{return "clientora-helper"}
func replaceExecutable(src,dst string)error{return os.Rename(src,dst)}
func registerManifest(string)error{return nil}
func openLocal(p string,folder bool)error{args:=[]string{p};if folder{args=[]string{"-a","Finder",p}};return exec.Command("/usr/bin/open",args...).Run()}
func openWeb(url string)error{return exec.Command("/usr/bin/open",url).Run()}
func script(s string,args ...string)(string,error){a:=append([]string{"-e",s,"--"},args...);out,e:=exec.Command("/usr/bin/osascript",a...).Output();if e!=nil{return "",errCancel};return strings.TrimSpace(string(out)),nil}
func extensionStep(store bool)(bool,error){
 if !store{_,e:=script("display dialog \"Clientora ist noch nicht im Chrome Web Store veröffentlicht. Verwenden Sie Ihre bereits installierte Erweiterung.\" buttons {\"Abbrechen\", \"Überspringen\"} default button \"Überspringen\" cancel button \"Abbrechen\" with title \"Clientora – Chrome-Erweiterung\"");return false,e}
 s,e:=script("button returned of (display dialog \"Chrome-Erweiterung hinzufügen oder vorhandene Installation verwenden.\" buttons {\"Abbrechen\", \"Überspringen\", \"Web Store öffnen\"} default button \"Web Store öffnen\" cancel button \"Abbrechen\" with title \"Clientora\")");return s=="Web Store öffnen",e
}
func askText(title,msg,value string)(string,error){return script("on run argv\nreturn text returned of (display dialog (item 2 of argv) default answer (item 3 of argv) with title (item 1 of argv) buttons {\"Abbrechen\", \"Weiter\"} default button \"Weiter\" cancel button \"Abbrechen\")\nend run",title,msg,value)}
func chooseFolder(previous string)(string,error){if previous!=""&&existsDir(previous){return script("on run argv\nreturn POSIX path of (choose folder with prompt \"Clientora-Datenordner auswählen\" default location (POSIX file (item 1 of argv)))\nend run",previous)};return script("POSIX path of (choose folder with prompt \"Clientora-Datenordner oder übergeordneten Ordner auswählen\")")}
func confirmStep(title,msg string)bool{_,e:=script("on run argv\ndisplay dialog (item 2 of argv) with title (item 1 of argv) buttons {\"Abbrechen\", \"Weiter\"} default button \"Weiter\" cancel button \"Abbrechen\"\nend run",title,msg);return e==nil}
func alert(title,msg string){_,_=script("on run argv\ndisplay dialog (item 2 of argv) with title (item 1 of argv) buttons {\"OK\"} default button \"OK\"\nend run",title,msg)}
