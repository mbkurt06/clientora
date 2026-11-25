# Clientora v0.1.6 — local-first Chrome extension

**Deneysel ilk sürüm.** Gerçek veya hassas müşteri verisi girmeden önce sahte verilerle test edin. Chrome 116+ / güncel Chromium önerilir. Sunucu veya npm kurulumu gerektirmez.

## Kurulum / Installation / Installation

1. ZIP arşivini açın. `manifest.json` dosyasının bulunduğu `clientora` klasörünü bulun.
2. Chrome'da `chrome://extensions` adresini açın.
3. Geliştirici modunu (Entwicklermodus / Developer mode) etkinleştirin.
4. Paketlenmemiş öğe yükle (Entpackte Erweiterung laden / Load unpacked) ile klasörü seçin.
5. Araç çubuğuna Clientora simgesini sabitleyin. Simgeye tıklayın; müşteri penceresinde simge sağ paneli açmayı dener. Alt+Shift+C ana sayfayı açar.
6. Ayarlar > Belgeler ile yerel ana klasörün üst dizinini seçin. Clientora alt klasörünü kendisi oluşturur. Klasör erişimini gerektiğinde yeniden verin.

## v0.1.6 — Dialog kapatma ve varsayılan alanlar
- Dialog dışına tıklama ile kapatma; Escape ve Vazgeç desteği. Kaydetme devam ederken yanlışlıkla kapatma engellenir.
- İlk altı hazır ek alan da düzenlenebilir varsayılan alan tanımlarına taşındı. Üç nokta menüsünden veya Ayarlar > Standard-Kundenfelder bölümünden varsayılan ekleme/çıkarma. Mevcut müşterilerin değerleri ve şablonlar korunur. Müşteriden alan silme ayrı işlemdir; yeni müşteriye yalnız etkin varsayılanlar eklenir.

## v0.1.5 — Kompakt müşteri bilgileri ve arşiv
- Müşteri bilgileri sola hizalandı. Ek alanlar doğrudan düzenlenebilir, toplu kaydetme ve üç nokta menüsü ile varsayılan/şablon/silme seçenekleri kompaktlaştırıldı.
- Danışmanlık bitince müşteri arşivlenir, fiziksel dosyalar ve metadata korunur. Arşiv tarihi tutulur; liste filtresinden arşiv açılabilir ve müşteri yeniden etkinleştirilebilir. Arama arşivdekileri de kapsar (favori/arşiv filtresi hariç). Aktif genel bakış ve bildirimler arşivdeki müşterileri içermez. Önceki müşteri çöp kutusu kayıtları geri yüklenebilir.
- Arşivlenmiş müşteri tekrar etkinleştirildiğinde tamamlandı durumundaysa aktif olarak işaretlenir, diğer durumlar ve görevler korunur.

## v0.1.4 — Müşteri bilgi sayfası ve şablonlar
- Kundeninformationen sekmesinde temel bilgiler ve ek alanlar (metin, tarih, sayı, e-posta, telefon, URL, uzun metin). Alan tanımı varsayılan olarak gelecekteki müşteriler için kaydedilebilir; kişisel değerler kopyalanmaz.
- Vorlagen menüsünde Jobcenter, Arbeitssuche, Wohnungssuche, Aufenthaltstitel örnekleri. Kullanıcı yeni şablon oluşturabilir, alan, evrak listesi, görev, web sitesi, klasör ve genel boş belge ekleyebilir. Liste örnektir; resmi gereklilik değildir.
- Şablon mevcut müşteriye de uygulanır; mevcut alan değerleri ve görev durumları korunur, aynı kayıtlar yinelenmez. Birden fazla şablon uygulanabilir. Değişiklikler mevcut müşterilere otomatik dağıtılmaz; şablonu yeniden uygulayın.
- Alan, görev, web sitesi, evrak ve dosya menülerinden şablona ekleme. Chrome'da web sayfasına veya bağlantıya sağ tıklayıp Clientora: Sayfayı şablona ekle seçilebilir; URL sorgu parametreleri ve fragment varsayılan olarak kaldırılır, kullanıcı başlık ve adresi kontrol eder. Dosya için varsayılan yalnızca kontrol listesi girdisidir; kişisel veri içermeyen boş şablon dosyası açık onayla Sablonlar dizinine kopyalanabilir. Uygulamada 06_Diger/Sablonlar/<şablon-id> altında kopyalanır. İzin yoksa sonraki klasör erişiminde denenir; mevcut dosyanın üzerine yazılmaz. Şablon dosyalarını da ayrıca yedekleyin.
- Önceki şablonlar ve yedekler okunur. Tarayıcı ve gerçek dosya izinleriyle ayrıca test edilmelidir.

## v0.1.3 — Adres, klasör kurulumu, otomatik yedek
- Müşteri kaydı ve düzenleme ekranına sokak/bina, posta kodu, şehir, ülke alanları; arama ve müşteri genel görünümüne adres eklendi.
- İlk ana sayfada klasör seçimi yönlendirmesi. Klasör izni IndexedDB ile hatırlanır; izin düşerse yeniden bağlantı istenir. Seçilen yerel veya eşitlenen dizin altında Clientora oluşturulur. Klasör değişimi mevcut dosyaları taşımaz; indirme diziniyle eşleşme ayarı sıfırlanır.
- Ayarlar > Otomatik şifreli yedekleme: kullanıcı ayrı bir parola belirler. PBKDF2 (600.000 SHA-256 iterasyon), AES-GCM 256 bit, rastgele IV; dışarı aktarılamayan şifreleme anahtarı yalnız Chrome profilinin IndexedDB alanında tutulur, parola yazılmaz. Mevcut içe aktarma işlevi ve parola ile yedek açılır. Chrome çalışırken ve izin varken değişen metadata yaklaşık dakikada bir Yedekler dizinine yazılır; cihaz başına günlük anlık görüntü güncellenir, önceki günler silinmez. Son başarılı yedek ve hata durumu ayarlarda gösterilir.
- OneDrive, Google Drive veya Dropbox masaüstü eşitlemesi kullanıcının sorumluluğundadır. Clientora doğrudan bulut API kullanmaz. Belgeler normal dosyalardır ve ayrıca şifrelenmez. Aynı klasörde eşzamanlı birden çok Clientora kurulumu desteklenmez; yeni bilgisayarda yedek içe aktarılmalıdır. Bulut eşitleme tek başına kesin veri kurtarma garantisi değildir.
- Gerçek Chrome, işletim sistemi, klasör izni ve eşitleme testleri gereklidir.

## v0.1.2 — Demo verileri
- Boş kurulumda otomatik 5 kurgusal müşteri, her birinde 5 web sitesi, 5 görev, 3 not, 2 randevu ve 2 hatırlatma. Gerçek başvuru veya hesap yoktur.
- Ayarlar > Belgeler bölümünde bir üst klasör seçildiğinde 5 müşteri klasörü ve standart alt klasörler, örnek PDF/TXT/CSV belgeleriyle oluşturulur. macOS, Windows, Linux için aynı Chrome klasör seçicisi kullanılır; sabit OS yolu yoktur.
- Mevcut kayıtlar değiştirilmez. Ayarlar > Örnek veriler üzerinden kurgusal müşteri eklenebilir; aynı demo seti iki kez eklenmez. Örnek dosyaların üzerine yazılmaz. Belge erişimi kullanıcı izni gerektirir.
- Demo verileri gerçek web sitelerinin genel giriş sayfalarını kullanır; gerçek hesap, parola veya başvuru içermez. Randevular gerçek rezervasyon değildir. Demo içerikleri ağırlıklı İngilizce/Almancadır.

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
