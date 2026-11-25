# Clientora v0.1.1 — local-first Chrome extension

**Deneysel ilk sürüm.** Gerçek veya hassas müşteri verisi girmeden önce sahte verilerle test edin. Chrome 116+ / güncel Chromium önerilir. Sunucu veya npm kurulumu gerektirmez.

## Kurulum / Installation / Installation

1. ZIP arşivini açın. `manifest.json` dosyasının bulunduğu `clientora` klasörünü bulun.
2. Chrome'da `chrome://extensions` adresini açın.
3. Geliştirici modunu (Entwicklermodus / Developer mode) etkinleştirin.
4. Paketlenmemiş öğe yükle (Entpackte Erweiterung laden / Load unpacked) ile klasörü seçin.
5. Araç çubuğuna Clientora simgesini sabitleyin. Simgeye tıklayın; müşteri penceresinde simge sağ paneli açmayı dener. Alt+Shift+C ana sayfayı açar.
6. Ayarlar > Belgeler ile yerel ana klasörün üst dizinini seçin. Clientora alt klasörünü kendisi oluşturur. Klasör erişimini gerektiğinde yeniden verin.

## v0.1.1
- Ana sayfada kompakt istatistikler ve varsayılan Bugün ajandası (randevu, görev, hatırlatma, geciken görev).
- Bugün / 7 gün / hafta / ay / kapalı seçenekleri kalıcı ayar olarak kaydedilir; tam Takvim sekmesi bağımsızdır.
- Güncellemek için mevcut eklenti klasöründeki dosyaları değiştirin ve chrome://extensions sayfasından Yenile düğmesine basın. Eklentiyi kaldırmayın.

## İşlevler
- Tam sayfa yönetim merkezi, müşteri detay sayfası, müşteriye özgü Chrome penceresi ve sağ panel.
- Müşteri bilgileri, renkler, favori, durum, etiket, arşiv, çöp kutusu, notlar, görevler ve tarihli randevular; genel ve müşteri takvimi.
- Tekrarlı hatırlatma, bildirim, bir saat erteleme; Chrome açıkken dakikalık kontrol. Chrome kapalıyken bildirim garanti değildir. Yeniden açıldığında bekleyen hatırlatmalar kontrol edilir.
- Web sitesi listeleri, son sekme URL'lerini saklama, müşteri şablonları (görevler, siteler, alt klasörler), işlem geçmişi. Son sekmeler yeniden açılabilir, ancak Chrome geçmişi veya oturum çerezleri müşteri bazında ayrılmaz.
- Türkçe, Almanca, İngilizce; Chrome UI dili varsayılan, desteklenmezse İngilizce. Sistem teması ve elle seçim. Bazı teknik uyarılar İngilizce kalabilir.
- Yerel klasörler: `Clientora/Musteriler/000001_Ad_Soyad/` ve standart alt klasörler. Dosya listeleme, yükleme, sürükle-bırak, alt klasör, önizleme (PDF/resim), kopyalama, taşıma, yeniden adlandırma, silme. Diğer dosya türleri indirilerek açılır. Klasör adı sabittir; müşteri adı değişince otomatik yeniden adlandırılmaz. Belge silme kalıcıdır.
- Parola kasası: PBKDF2-SHA256 600.000 iterasyon, rastgele salt, AES-GCM 256 bit, her kayda rastgele IV, müşteri kimliğine bağlı AAD. Ana parola kaydedilmez, kasa beş dakika sonra kilitlenir. Aktif müşteri ve tam origin eşleşmesi, kullanıcı onayı ve site izni ile tek bir belirgin giriş formuna doldurma. Giriş formu otomatik gönderilmez. Chrome'un kendi parola yöneticisi bağımsızdır.
- Parolalı metadata dışa aktarma / geri yükleme. Belgeleri ayrıca yedekleyin. Eklentiyi kaldırmak Chrome'daki metadata ve kasa verisini kaybettirebilir; yerel klasörler kalır. Yedek parola ve kasa parolasını kaybetmeyin.

## İndirme yönlendirmesi ve oturum sınırları
Chrome downloads API, sıradan indirmelerde kaynak sekme/pencere kimliğini vermez ve yalnızca Chrome varsayılan indirme klasörüne göre göreli hedef kabul eder. Bu sürümde **müşteri penceresinde bağlantıya sağ tıklayıp Clientora seçildiğinde** müşteri kesin olarak bilinir. `Clientora` klasörü Chrome'un gerçek indirme dizininin hemen altında ise Ayarlar'daki ilgili kutuyu işaretleyin; otomatik hedef `Clientora/Musteriler/<müşteri>/05_Indirilenler/` olur. Başka bir klasör seçilirse kayıt konumu sorulur. Normal indirmeleri Belgeler > Dosya ekle ile elle aktarın. Chrome indirme klasörüne göre konumu doğrulamadan kutuyu açmayın. Bu sürüm normal tarayıcı indirmelerini otomatik olarak müşteriye atamaz.

**Çerezler, localStorage, IndexedDB ve oturumlar normal Chrome profili içinde ortaktır.** Müşteriye özgü pencere güvenlik izolasyonu değildir. Yanlış hesaba işlem yapmamak için web sitesindeki aktif kullanıcıyı mutlaka kontrol edin. Aynı siteye farklı müşterilerle eşzamanlı giriş için ayrı Chrome profilleri kullanın. Eklenti, farklı müşterilere parola önerisini kendi kasasında ayrı tutar. Parola doldurma yalnızca sağ panelden açık kullanıcı eylemiyle yapılır. Otomatik panel açma Chrome kullanıcı etkileşimi kısıtına takılabilir; araç çubuğu simgesinden açın. Tarayıcı yeniden başlarsa müşteri penceresi eşlemesini yeniden oluşturmak için müşteri detayından çalışma alanını açın.

## Test durumu
- `node --check` tüm JS dosyalarında geçer; manifest JSON geçerli.
- `node tests/smoke.cjs` müşteri kayıtlarının ayrılması, görev durumu, kasa şifreleme/çözme, yanlış müşteri kimliği ile çözmenin reddi, tekrar eden hatırlatma hesaplaması.
- Gerçek Chrome'da uzantı yükleme, dosya izinleri, şifre doldurma, bildirimler ve indirme akışı ayrıca denenmeli. Güvenlik denetimi yapılmamıştır; üretim kullanımı için hazır değildir.
- Eksikler: normal indirme otomasyonu, tam oturum izolasyonu, otomatik zamanlanmış şifreli yedekleme, bütün belgelerde global arama, not şablonları, bağımsız başvuru kaydı, yerel uygulamayla doğrudan açma, tam çeviri, tüm geçmişin yakalanması, görev-belge ilişkilendirme. Dosyaları tamamen yerel tutan bu MVP bunları henüz sağlamaz.

## English / Deutsch
Load this directory as an unpacked extension in `chrome://extensions`. Use dummy data for testing. Client records and credentials are local; cookies and website sessions are shared within the Chrome profile. Standard downloads cannot reliably be assigned to a client. See the Turkish instructions above for the context-menu download workflow and security limitations.

Diesen Ordner in `chrome://extensions` als entpackte Erweiterung laden. Nur Testdaten verwenden. Kundendaten und Passworttresor sind lokal; Cookies und Webseiten-Sitzungen sind innerhalb eines Chrome-Profils gemeinsam. Normale Downloads können nicht zuverlässig einem Kunden zugeordnet werden. Siehe die Hinweise oben zur Download-Funktion und Sicherheit.
