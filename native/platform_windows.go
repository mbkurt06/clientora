package main
import("os";"os/exec";"path/filepath";"strings";"syscall";"unsafe";"encoding/base64";"encoding/binary";"unicode/utf16";"fmt")
func appDir()string{return filepath.Join(os.Getenv("LOCALAPPDATA"),"Clientora","Native")}
func manifestDir()string{return appDir()}
func helperName()string{return "clientora-helper.exe"}
func replaceExecutable(src,dst string)error{if e:=os.Remove(dst);e!=nil&&!os.IsNotExist(e){return e};return os.Rename(src,dst)}
func registerManifest(path string)error{return exec.Command("reg.exe","add","HKCU\\Software\\Google\\Chrome\\NativeMessagingHosts\\"+hostName,"/ve","/t","REG_SZ","/d",path,"/f").Run()}
func shellOpen(p,verb string)error{v,e:=syscall.UTF16PtrFromString(verb);if e!=nil{return e};f,e:=syscall.UTF16PtrFromString(p);if e!=nil{return e};proc:=syscall.NewLazyDLL("shell32.dll").NewProc("ShellExecuteW");r,_,_:=proc.Call(0,uintptr(unsafe.Pointer(v)),uintptr(unsafe.Pointer(f)),0,0,1);if r<=32{return fmt.Errorf("Datei konnte nicht geöffnet werden (%d)",r)};return nil}
func openLocal(p string,folder bool)error{return shellOpen(p,"open")}
func openWeb(url string)error{return shellOpen(url,"open")}
func ps(code string,args ...string)(string,error){
 u:=utf16.Encode([]rune("[Console]::OutputEncoding=[System.Text.UTF8Encoding]::new($false); Add-Type -AssemblyName System.Windows.Forms; Add-Type -AssemblyName Microsoft.VisualBasic; "+code));b:=make([]byte,len(u)*2);for i,x:=range u{binary.LittleEndian.PutUint16(b[i*2:],x)}
 c:=exec.Command("powershell.exe","-NoProfile","-NonInteractive","-STA","-EncodedCommand",base64.StdEncoding.EncodeToString(b));c.SysProcAttr=&syscall.SysProcAttr{HideWindow:true};c.Env=os.Environ();for i,a:=range args{c.Env=append(c.Env,fmt.Sprintf("CLIENTORA_ARG_%d=%s",i,a))};out,e:=c.Output();if e!=nil{return "",errCancel};return strings.TrimSpace(string(out)),nil
}
func extensionStep(store bool)(bool,error){if !store{_,e:=ps("$f=New-Object System.Windows.Forms.Form; $f.Text='Clientora – Chrome-Erweiterung'; $f.Width=480; $f.Height=180; $f.StartPosition='CenterScreen'; $l=New-Object System.Windows.Forms.Label; $l.Text='Noch nicht im Web Store veröffentlicht. Bereits installierte Erweiterung verwenden.'; $l.AutoSize=$false; $l.SetBounds(16,16,430,60); $f.Controls.Add($l); $b=New-Object System.Windows.Forms.Button; $b.Text='Überspringen'; $b.SetBounds(300,90,140,32); $b.DialogResult='OK'; $f.Controls.Add($b); $f.AcceptButton=$b; $r=$f.ShowDialog(); if($r -ne 'OK'){exit 1}; Write-Output $r");return false,e};r,e:=ps("$r=[System.Windows.Forms.MessageBox]::Show('Ja: Web Store öffnen. Nein: Bereits installiert – Überspringen.','Clientora','YesNoCancel'); if($r -eq 'Cancel'){exit 1}; Write-Output $r");return r=="Yes",e}
func askText(title,msg,value string)(string,error){return ps("$r=[Microsoft.VisualBasic.Interaction]::InputBox($env:CLIENTORA_ARG_1,$env:CLIENTORA_ARG_0,$env:CLIENTORA_ARG_2); if(!$r){exit 1}; Write-Output $r",title,msg,value)}
func chooseFolder(prev string)(string,error){return ps("$d=New-Object System.Windows.Forms.FolderBrowserDialog; $d.Description='Clientora-Datenordner oder übergeordneten Ordner auswählen'; if($env:CLIENTORA_ARG_0){$d.SelectedPath=$env:CLIENTORA_ARG_0}; if($d.ShowDialog() -ne 'OK'){exit 1}; Write-Output $d.SelectedPath",prev)}
func confirmStep(title,msg string)bool{r,e:=ps("$r=[System.Windows.Forms.MessageBox]::Show($env:CLIENTORA_ARG_1,$env:CLIENTORA_ARG_0,'OKCancel'); Write-Output $r",title,msg);return e==nil&&r=="OK"}
func alert(title,msg string){_,_=ps("[void][System.Windows.Forms.MessageBox]::Show($env:CLIENTORA_ARG_1,$env:CLIENTORA_ARG_0)",title,msg)}
