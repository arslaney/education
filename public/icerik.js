// ============================================================
// icerik.js — AI Akademi (2 SAATLİK TAM SÜRÜM)
// ============================================================

window.MESLEKLER = [
  { id:"ik",     ikon:"👥", ad:"İnsan Kaynakları",     ozet:"İşe alım, çalışan deneyimi, politikalar" },
  { id:"akademi",ikon:"🎓", ad:"Akademi / Eğitim",      ozet:"İçerik geliştirme, öğrenme tasarımı" },
  { id:"uw",     ikon:"📋", ad:"Underwriting",          ozet:"Risk değerlendirme, poliçe analizi" },
  { id:"hasar",  ikon:"🛡️", ad:"Hasar / Tazminat",      ozet:"Dosya inceleme, müşteri iletişimi" },
  { id:"finans", ikon:"📊", ad:"Finans / Aktüerya",     ozet:"Raporlama, veri analizi, tahmin" },
  { id:"satis",  ikon:"🤝", ad:"Satış / Müşteri",        ozet:"Teklif, ikna, müşteri ilişkileri" },
];

const VAKA = {
  bilgi_krizi: {
    varsayilan:{ baglik:"Bir yığın belge, tek bir cevap", senaryo:"Masana 40 sayfalık bir doküman düştü. Yöneticin 10 dakika içinde 'özet ve riskler' istiyor.", gorev:"Bu dokümanı 5 maddede özetleyecek, 3 riski çıkaracak ve tek bir aksiyon önerecek bir prompt yaz. Rol + görev + format içersin." },
    ik:{ baglik:"40 sayfalık yeni İK yönetmeliği", senaryo:"Yeni uzaktan çalışma ve yan haklar yönetmeliği e-postayla geldi: 40 sayfa hukuk dili. Yarın tüm şirkete duyurman, İK ekibine de özet geçmen gerek.", gorev:"Bu yönetmeliği (1) çalışanların anlayacağı sade dille 5 maddede özetleyecek, (2) en çok soru gelecek 3 noktayı önceden çıkaracak bir prompt yaz. Rol + görev + format içersin." },
    akademi:{ baglik:"Dağınık eğitim materyali", senaryo:"Üç farklı uzmandan gelen ham eğitim notların var — slaytlar, e-postalar, toplantı kayıtları. Hepsinden tek tutarlı bir eğitim modülü kurman lazım.", gorev:"Bu dağınık notları (1) net öğrenme hedefleriyle, (2) 5 bölümlük bir modül iskeletine dönüştürecek bir prompt yaz. Rol + görev + format içersin." },
    uw:{ baglik:"Karmaşık ticari poliçe teklifi", senaryo:"Bir ticari yangın poliçesi teklifi geldi: 40 sayfa ek, şart ve istisna. Risk değerlendirmen bekleniyor.", gorev:"Bu teklifi (1) 5 maddede özetleyecek, (2) 3 riskli/eksik maddeyi işaretleyecek ve bir öneri verecek bir prompt yaz. Rol + görev + format içersin." },
    hasar:{ baglik:"Çok belgeli hasar dosyası", senaryo:"Bir kaza hasar dosyası önünde: ekspertiz raporu, faturalar, ifadeler — onlarca sayfa, bazıları çelişkili. Karar vermen gerek.", gorev:"Bu dosyayı (1) 5 maddede özetleyecek, (2) 3 tutarsızlık/risk noktasını çıkaracak bir prompt yaz. Rol + görev + format içersin." },
    finans:{ baglik:"Çeyreklik finansal rapor", senaryo:"40 sayfalık çeyrek raporu geldi. Yönetim kuruluna yarın sabah 1 sayfalık yönetici özeti sunman lazım.", gorev:"Bu raporu (1) 5 maddede özetleyecek, (2) 3 dikkat çekici trend/sapmayı çıkaracak bir prompt yaz. Rol + görev + format içersin." },
    satis:{ baglik:"Uzun bir RFP (teklif talebi)", senaryo:"Büyük bir kurumsal müşteriden 40 sayfalık teklif talebi geldi. Hangi şartlara odaklanırsan kazanırsın, çıkarman lazım.", gorev:"Bu talebi (1) 5 maddede özetleyecek, (2) 3 kritik müşteri beklentisini çıkaracak bir prompt yaz. Rol + görev + format içersin." },
  },
  saha_operasyonu:{
    varsayilan:{ baglik:"Zor müşteri, az zaman", senaryo:"Hizmeti 3 gün geciken kurumsal bir müşteri sinirli bir e-posta attı. Hızlı ve doğru cevap vermelisin.", gorev:"Özür dileyen ama profesyonel, güven veren bir e-posta yazdıracak prompt yaz. Ton, uzunluk ve net bir aksiyon belirt." },
    ik:{ baglik:"Hassas çalışan şikayeti", senaryo:"Bir çalışan, yöneticisiyle ilgili hassas bir mobbing iması içeren şikayet iletti. Yanıtın hem empatik hem de süreci doğru başlatan bir mesaj olmalı.", gorev:"Empatik ama kurumsal ve yasal sınırları koruyan, sonraki adımı net belirten bir yanıt yazdıracak prompt yaz. Ton, uzunluk ve gizlilik vurgusu belirt." },
    akademi:{ baglik:"Moralsiz eğitim katılımcısı", senaryo:"Yetenekli bir katılımcı sınavdan düşük aldı ve programı bırakmayı düşünüyor. Onu kaybetmeden, dürüst bir geri bildirim yazmalısın.", gorev:"Yapıcı, motive edici ama dürüst, somut gelişim önerisi içeren bir geri bildirim yazdıracak prompt yaz. Ton, uzunluk ve gelişim planı belirt." },
    uw:{ baglik:"Reddedilen teklife itiraz", senaryo:"Önemli bir acente, reddettiğin riskli teklife sert bir dille itiraz etti. İlişkiyi korumalı ama kararının arkasında durmalısın.", gorev:"Kararını net gerekçelerle açıklayan, ilişkiyi koruyan, alternatif sunan bir yanıt yazdıracak prompt yaz. Ton, uzunluk ve alternatif belirt." },
    hasar:{ baglik:"Tazminatı geciken mağdur", senaryo:"Hasar ödemesi 3 haftadır geciken bir müşteri sosyal medyada şikayet etmekle tehdit ediyor. Sakinleştirip süreci netleştirmelisin.", gorev:"Empati kuran, süreci şeffaf anlatan, güven veren, net tarih içeren bir e-posta yazdıracak prompt yaz. Ton, uzunluk ve net aksiyon belirt." },
    finans:{ baglik:"CFO'nun acil veri sorusu", senaryo:"CFO toplantı öncesi 'bu çeyrek hasar oranı neden %8 arttı?' diye sordu, 15 dakikan var. Net, savunulabilir bir açıklama gerek.", gorev:"Bir veri noktasındaki değişimi sade dille, olası nedenlerle açıklayacak bir özet yazdıracak prompt yaz. Ton, uzunluk ve öneri belirt." },
    satis:{ baglik:"Rakibe kayan büyük müşteri", senaryo:"Büyük bir müşteri teklifinde kararsız, rakip daha ucuz fiyat verdi. Fiyatı düşürmeden değerle ikna etmelisin.", gorev:"Değeri vurgulayan, güven veren, harekete geçiren ama baskıcı olmayan bir e-posta yazdıracak prompt yaz. Ton, uzunluk ve çağrı belirt." },
  },
  saha_kriz2:{
    varsayilan:{ baglik:"Kriz büyüdü: yönetici devrede", senaryo:"İlk yanıtın sonrası müşteri yöneticisini CC'ledi ve durum tırmandı. Şimdi hem müşteriyi hem yöneticiyi tatmin etmelisin.", gorev:"Hem müşteriye güven veren hem de iç tarafı (yöneticiyi) bilgilendiren, çözüm odaklı bir mesaj yazdıracak prompt yaz. Ton ve net aksiyon belirt." },
    ik:{ baglik:"Olay büyüdü: ekip morali", senaryo:"Çalışan şikayeti ekipte duyuldu ve genel bir huzursuzluk başladı. Tüm ekibe, paniği büyütmeden güven veren bir iç mesaj gerekli.", gorev:"Şeffaf ama detay vermeyen, güven veren, süreci sahiplenen bir ekip duyurusu yazdıracak prompt yaz. Ton ve sınırları belirt." },
    akademi:{ baglik:"Program geneli risk", senaryo:"Aynı moralsizlik birkaç katılımcıda daha görüldü. Eğitim sorumlusuna, programı iyileştirme önerisi içeren bir özet yazmalısın.", gorev:"Sorunu veriyle özetleyen, 3 somut iyileştirme öneren bir iç rapor yazdıracak prompt yaz. Ton ve format belirt." },
    uw:{ baglik:"Acente üst yönetime taşıdı", senaryo:"Acente itirazını senin yöneticine taşıdı. Yöneticine, kararının gerekçesini net özetleyen bir iç not yazmalısın.", gorev:"Kararını veriyle savunan, riski net ortaya koyan kısa bir iç not yazdıracak prompt yaz. Ton ve format belirt." },
    hasar:{ baglik:"Sosyal medyaya taşındı", senaryo:"Müşteri şikayetini gerçekten paylaştı, birkaç kişi etkileşti. İletişim ekibine durumu özetleyen bir iç bilgilendirme gerekli.", gorev:"Durumu objektif özetleyen, önerilen yanıt stratejisini içeren bir iç not yazdıracak prompt yaz. Ton ve format belirt." },
    finans:{ baglik:"Kurul ek soru sordu", senaryo:"Yönetim kurulu özetini beğendi ama 'gelecek çeyrek tahmini ne?' diye ek soru sordu. Temkinli ama net bir tahmin gerek.", gorev:"Varsayımları açıkça belirten, senaryolu (iyimser/kötümser) kısa bir tahmin yazdıracak prompt yaz. Ton ve format belirt." },
    satis:{ baglik:"Müşteri son bir indirim istedi", senaryo:"Müşteri ikna oldu ama 'son bir jest' olarak ek indirim istiyor. Değeri korumalı, ilişkiyi de kazanmalısın.", gorev:"İndirim yerine değer/ek hizmet öneren, ilişkiyi kapatan bir yanıt yazdıracak prompt yaz. Ton ve çağrı belirt." },
  },
};
function vaka(adi, meslekId){ const g=VAKA[adi]; if(!g) return null; return g[meslekId]||g.varsayilan; }
window.vaka = vaka;

window.BOLUMLER = [
  { tur:"giris" },
  { tur:"meslek_secimi" },

  { tur:"bolum_gecis", no:1, ad:"Temeller", alt:"Yapay zekâ aslında ne yapıyor?", sure:"~15 dk" },
  { tur:"ogren_tahmin" },
  { tur:"ogren_kart", veri:{ baslik:"Demek ki...", maddeler:[
    { ik:"🎯", b:"AI bir tahmin makinesidir", a:"Düşünmez, bir sonraki en olası kelimeyi seçer. Bu yüzden bazen emin görünüp yanılır (halüsinasyon)." },
    { ik:"🗣️", b:"Nasıl sorduğun = ne aldığın", a:"Aynı modele kötü sorarsan kötü, iyi sorarsan olağanüstü cevap alırsın." },
    { ik:"🧭", b:"Son karar her zaman sende", a:"AI taslak üretir; doğrulamak ve sahiplenmek senin işin." },
  ]} },
  { tur:"arac_test", faz:"saha" },

  { tur:"bolum_gecis", no:2, ad:"Araç Filosu", alt:"Her iş için doğru aleti seç", sure:"~18 dk" },
  { tur:"arac_ogren" },
  { tur:"arac_secimi", faz:"saha" },

  { tur:"bolum_gecis", no:3, ad:"Gizli Silah", alt:"Kendi belgelerinden konuşan AI: NotebookLM", sure:"~15 dk" },
  { tur:"notebook_ogren" },
  { tur:"notebook_demo" },
  { tur:"arac_secimi2", faz:"saha" },

  { tur:"bolum_gecis", no:4, ad:"Prompt Ustalığı", alt:"AI'a konuşmayı öğren", sure:"~25 dk" },
  { tur:"prompt_ogren" },
  { tur:"prompt_saha", vakaAdi:"bilgi_krizi", faz:"saha" },
  { tur:"onarim", faz:"saha" },

  { tur:"bolum_gecis", no:5, ad:"İş Akışı", alt:"Araçları birbirine bağla, gerçek güç burada", sure:"~15 dk" },
  { tur:"akis_ogren" },
  { tur:"akis_test", faz:"saha" },

  { tur:"bolum_gecis", no:6, ad:"Saha Operasyonu", alt:"Gerçek kriz, gerçek zaman baskısı", sure:"~22 dk" },
  { tur:"saha_vaka", vakaAdi:"saha_operasyonu", faz:"saha", asama:1 },
  { tur:"saha_vaka", vakaAdi:"saha_kriz2", faz:"saha", asama:2 },

  { tur:"bolum_gecis", no:7, ad:"Sorumlu Kullanım", alt:"Güç büyük, sorumluluk da öyle", sure:"~8 dk" },
  { tur:"etik_kart" },
  { tur:"etik_test", faz:"saha" },

  { tur:"final" },
];

window.ARACLAR = [
  { ad:"Claude",     ikon:"💬", renk:"#E11D34", guc:"Yazma · analiz · uzun belge · akıl yürütme", iyi:"Rapor, e-posta, sözleşme analizi, nüanslı metin" },
  { ad:"Gemini",     ikon:"🔷", renk:"#3B82F6", guc:"Google ekosistemi · dev bağlam · arama + görsel", iyi:"Çok dosya, web'le birleşik iş, Workspace entegrasyonu" },
  { ad:"NotebookLM", ikon:"🎧", renk:"#22C55E", guc:"Sadece senin kaynaklarından konuşur", iyi:"PDF'lerden özet, kaynaklı cevap, sesli brifing" },
  { ad:"Veo 3",      ikon:"🎬", renk:"#8B5CF6", guc:"Metinden video üretimi", iyi:"Tanıtım, sosyal medya klibi, kısa video" },
  { ad:"Higgsfield", ikon:"✨", renk:"#F5B544", guc:"Karakter & sinematik video, hareket", iyi:"Sahne, karakter tutarlılığı, efekt" },
];

window.ARAC_SENARYOLARI = {
  ik:[
    { s:"8 farklı İK politikası PDF'inden, kaynak göstererek tek bir 'izin kuralları' özeti istiyorsun.", sec:["Claude","NotebookLM","Veo 3","Higgsfield"], d:1, neden:"NotebookLM yalnızca yüklediğin kaynaklardan konuşur ve nereden bulduğunu gösterir — politika gibi 'doğruluk şart' işlerde ideal." },
    { s:"Yeni çalışanlara gönderilecek, sıcak ama profesyonel bir karşılama e-postası yazılacak.", sec:["Claude","Veo 3","Higgsfield","NotebookLM"], d:0, neden:"Claude nüanslı, doğru tonlu yazma işlerinde güçlü." },
    { s:"İşe alım ilanı için 15 saniyelik dikey bir tanıtım videosu üreteceksin.", sec:["Claude","NotebookLM","Veo 3","Gemini"], d:2, neden:"Veo 3 metinden kısa video üretir." },
    { s:"100 başvuru özgeçmişini, Google Drive'daki bir tabloyla birlikte tarayıp filtrelemen gerek.", sec:["NotebookLM","Gemini","Veo 3","Higgsfield"], d:1, neden:"Gemini, Google ekosistemi ve çok dosyalı işlerde güçlü." },
  ],
  akademi:[
    { s:"Hazırladığın 6 ders PDF'inden, öğrencilerin sorabileceği bir 'soru-cevap' asistanı kurmak istiyorsun.", sec:["Claude","NotebookLM","Veo 3","Higgsfield"], d:1, neden:"NotebookLM sadece senin yüklediğin ders materyalinden, kaynak göstererek cevap verir." },
    { s:"Bir eğitim konusunu anlatan, akıcı ve seviyeye uygun bir metin yazman gerek.", sec:["Claude","Veo 3","Higgsfield","Gemini"], d:0, neden:"Claude uzun, pedagojik metin yazımında güçlü." },
    { s:"Mikro-öğrenme için 20 saniyelik animasyonlu bir tanıtım videosu istiyorsun.", sec:["Claude","NotebookLM","Veo 3","Gemini"], d:2, neden:"Veo 3 kısa eğitim/tanıtım videoları için ideal." },
    { s:"Uzun bir ders kaydını, çalışabilecekleri sesli bir özete dönüştürmek istiyorsun.", sec:["Claude","NotebookLM","Higgsfield","Veo 3"], d:1, neden:"NotebookLM kaynaktan otomatik sesli brifing (Audio Overview) üretebilir." },
  ],
  varsayilan:[
    { s:"8 farklı PDF prosedürden, kaynak göstererek tek bir özet istiyorsun.", sec:["Claude","NotebookLM","Veo 3","Higgsfield"], d:1, neden:"NotebookLM yalnızca yüklediğin kaynaklardan konuşur ve kaynak gösterir." },
    { s:"Müşteriye gidecek, doğru tonda uzun ve dikkatli bir e-posta gerekiyor.", sec:["Claude","Veo 3","Higgsfield","NotebookLM"], d:0, neden:"Claude uzun ve nüanslı yazma işlerinde güçlü." },
    { s:"Sosyal medya için 15 saniyelik dikey tanıtım videosu üreteceksin.", sec:["Claude","NotebookLM","Veo 3","Gemini"], d:2, neden:"Veo 3 metinden kısa video üretir." },
    { s:"Google Drive'daki onlarca dosyayı, web'deki güncel veriyle birleştirip analiz etmen gerek.", sec:["NotebookLM","Gemini","Veo 3","Higgsfield"], d:1, neden:"Gemini, Google ekosistemi ve geniş bağlamlı işlerde güçlü." },
  ],
};
function aracSenaryolari(meslekId){ return window.ARAC_SENARYOLARI[meslekId]||window.ARAC_SENARYOLARI.varsayilan; }
window.aracSenaryolari = aracSenaryolari;

window.NOTEBOOK_SENARYOLARI = {
  ik:[
    { s:"Bir çalışan 'doğum izni kaç gün?' diye sordu. Yanıtın mutlaka resmi yönetmeliğe dayanmalı ve kaynağı gösterilmeli.", sec:["Claude (genel bilgi)","NotebookLM (yönetmelikten)","Veo 3","Gemini (web araması)"], d:1, neden:"İK'da yanıtın kaynağı kritiktir. NotebookLM yalnızca yüklediğin resmi yönetmelikten konuşur ve maddeyi gösterir — uydurma riski yok." },
    { s:"Yeni işe alınanlar için, 12 farklı onboarding dokümanından ortak bir 'ilk hafta rehberi' istiyorsun.", sec:["NotebookLM","Veo 3","Higgsfield","Claude (tek tek)"], d:0, neden:"NotebookLM tüm dokümanları birlikte okuyup kaynaklı tek bir rehber çıkarır." },
  ],
  akademi:[
    { s:"Öğrenciler ders materyalinden soru soracak. Cevaplar mutlaka senin verdiğin kaynaklardan olmalı, dışarıdan değil.", sec:["Claude","NotebookLM","Gemini","Veo 3"], d:1, neden:"NotebookLM sadece yüklediğin materyalden cevaplar — müfredat dışına çıkmaz, kaynağı gösterir." },
    { s:"5 farklı akademik kaynaktan, çelişkileriyle birlikte bir literatür özeti çıkarman gerek.", sec:["NotebookLM","Veo 3","Higgsfield","Gemini"], d:0, neden:"NotebookLM çoklu kaynağı birlikte analiz edip kaynaklı özet üretir." },
  ],
  varsayilan:[
    { s:"Bir prosedürle ilgili soruya, mutlaka şirket dokümanından, kaynak göstererek cevap vermen gerek.", sec:["Claude","NotebookLM","Gemini","Veo 3"], d:1, neden:"NotebookLM yalnızca yüklediğin dokümandan konuşur ve kaynağı gösterir." },
    { s:"Onlarca iç dokümandan ortak bir özet ve sesli brifing istiyorsun.", sec:["NotebookLM","Veo 3","Higgsfield","Claude"], d:0, neden:"NotebookLM çoklu kaynaktan özet + Audio Overview üretebilir." },
  ],
};
function notebookSenaryolari(meslekId){ return window.NOTEBOOK_SENARYOLARI[meslekId]||window.NOTEBOOK_SENARYOLARI.varsayilan; }
window.notebookSenaryolari = notebookSenaryolari;

window.AKIS_GOREVI = {
  ik:{ baglik:"Yeni politika duyurusu hazırla", adimlar:[
    { metin:"Resmi yönetmeliği NotebookLM'e yükleyip kaynaklı özet çıkar", dogruSira:1, arac:"NotebookLM" },
    { metin:"Claude ile özeti çalışanlara uygun, sıcak bir duyuru metnine dönüştür", dogruSira:2, arac:"Claude" },
    { metin:"Veo 3 ile 15 saniyelik kısa bir duyuru videosu üret", dogruSira:3, arac:"Veo 3" },
  ]},
  akademi:{ baglik:"Yeni eğitim modülü yayına hazırla", adimlar:[
    { metin:"Ham ders kaynaklarını NotebookLM'e yükleyip kaynaklı taslak çıkar", dogruSira:1, arac:"NotebookLM" },
    { metin:"Claude ile taslağı akıcı, seviyeye uygun ders metnine dönüştür", dogruSira:2, arac:"Claude" },
    { metin:"Veo 3 ile modül için kısa bir tanıtım videosu üret", dogruSira:3, arac:"Veo 3" },
  ]},
  varsayilan:{ baglik:"Bir raporu sunuma dönüştür", adimlar:[
    { metin:"Kaynak belgeleri NotebookLM'e yükleyip kaynaklı özet çıkar", dogruSira:1, arac:"NotebookLM" },
    { metin:"Claude ile özeti yöneticiye uygun bir metne dönüştür", dogruSira:2, arac:"Claude" },
    { metin:"Veo 3 ile sunum için kısa bir giriş videosu üret", dogruSira:3, arac:"Veo 3" },
  ]},
};
function akisGorevi(meslekId){ return window.AKIS_GOREVI[meslekId]||window.AKIS_GOREVI.varsayilan; }
window.akisGorevi = akisGorevi;

window.ETIK_SORU = {
  soru:"Bir müşterinin kimlik numarası ve poliçe detaylarını içeren belgeyi özetletmek istiyorsun. Hangisi doğru?",
  secenekler:[
    "Belgeyi olduğu gibi herkese açık bir AI aracına yapıştırırım",
    "Önce kişisel/gizli verileri çıkarır, sonra özetletirim",
    "Hiç AI kullanmam, AI her zaman risklidir",
    "Sadece müşteri adını silerim, gerisi sorun değil",
  ],
  dogru:1,
  aciklama:"Gizli ve kişisel veriyi (kimlik no, sağlık, müşteri bilgisi) halka açık araçlara vermeden önce çıkarmak esastır. AI'dan vazgeçmek değil, sorumlu kullanmak doğru cevaptır.",
};
