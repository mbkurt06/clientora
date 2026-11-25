package main
import("bytes";"encoding/binary";"encoding/json";"os";"path/filepath";"testing")
func TestScope(t *testing.T){
 root:=t.TempDir();p:=filepath.Join(root,"Kunden","000001_Test");if e:=os.MkdirAll(p,0700);e!=nil{t.Fatal(e)};mark:="12345678-1234-1234-1234-123456789abc";if e:=os.WriteFile(filepath.Join(root,".clientora-filemanager-id"),[]byte(mark),0600);e!=nil{t.Fatal(e)}
 for _,name:=range []string{"Test.docx","Test.exe"}{if e:=os.WriteFile(filepath.Join(p,name),[]byte("test"),0600);e!=nil{t.Fatal(e)}}
 c:=config{Root:root};q:=request{Action:"openFile",Marker:mark,Parts:[]string{"Kunden","000001_Test","Test.docx"}}
 if _,e:=resolve(c,q);e!=nil{t.Fatal(e)}
 for _,bad:=range []string{"..","Test.exe","/tmp","Missing.docx"}{q.Parts[2]=bad;if _,e:=resolve(c,q);e==nil{t.Fatalf("accepted %s",bad)}}
 q.Action="openFolder";q.Parts=q.Parts[:2];if _,e:=resolve(c,q);e!=nil{t.Fatal(e)};q.Marker="wrong";if _,e:=resolve(c,q);e==nil{t.Fatal("accepted marker")}
}
func TestProtocol(t *testing.T){var b bytes.Buffer;raw,_:=json.Marshal(request{Action:"ping"});_ = binary.Write(&b,binary.LittleEndian,uint32(len(raw)));b.Write(raw);q,e:=readMessage(&b);if e!=nil||q.Action!="ping"{t.Fatal(e)};if e=writeMessage(&b,response{OK:true});e!=nil{t.Fatal(e)}}
func TestRoot(t *testing.T){p:=t.TempDir();r,e:=rootFolder(p);if e!=nil||filepath.Base(r)!="Clientora"||!existsDir(filepath.Join(r,"Kunden")){t.Fatal(r,e)};if r2,e:=rootFolder(r);e!=nil||!samePath(r,r2){t.Fatal(r2,e)}}
