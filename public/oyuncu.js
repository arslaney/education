// ============================================================
// oyuncu.js — Katılımcı deneyim motoru
// ============================================================
const sb = supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
const kok = document.getElementById("kok");
const B = window.BOLUMLER;

const durum = {
  oturum:null, oyuncuId:null, isim:null,
  meslek:null, meslekAd:null,
  bolum:-1, kilit:true,
  toplam:0, seviye:"Çırak",
  yapildi:{}, rozetler:[],
};

// ---- atmosfer zerreleri ----
(function zerreler(){
  const at = document.querySelector(".atmosfer");
  for(let i=0;i<14;i++){
    const z=document.createElement("div"); z.className="zerre";
    z.style.left=Math.random()*100+"%";
    z.style.animationDuration=(8+Math.random()*10)+"s";
    z.style.animationDelay=(Math.random()*8)+"s";
    at.appendChild(z);
  }
})();

const seviyeTablosu = [
  { esik:0, ad:"Çırak" }, { esik:120, ad:"Operatör" },
  { esik:280, ad:"Uzman" }, { esik:450, ad:"AI Ustası" },
];
function seviyeHesap(p){ let s="Çırak"; seviyeTablosu.forEach(x=>{ if(p>=x.esik) s=x.ad; }); return s; }

// ---- HUD (üst durum çubuğu) ----
function hud(){
  const yuzde = B.length>2 ? Math.round((durum.bolum/(B.length-1))*100) : 0;
  return `<div class="hud">
    <div class="hud-sol">
      <div class="hud-logo">AI</div>
      <div class="hud-bilgi"><div class="b1">${durum.isim||"AI Akademi"}</div>
        <div class="b2">${durum.meslekAd||"—"}</div></div>
    </div>
    <div class="hud-sag">
      <div class="hud-istat"><span class="v">${durum.seviye}</span><span class="e">Seviye</span></div>
      <div class="hud-istat"><span class="v altin">${durum.toplam}</span><span class="e">Puan</span></div>
    </div>
  </div>`;
}

function ekran(html, hudVar=true){
  kok.innerHTML = (hudVar?hud():"") + html;
}
const $ = (s)=>kok.querySelector(s);
const renk = (p)=> p>=75?"#22C55E":p>=50?"#F5B544":"#FF3B52";

// ============================================================
// SİNEMATİK AÇILIŞ + KATILIM
// ============================================================
function girisEkran(){
  ekran(`
    <div class="merkez" style="flex:1; padding:30px 0;">
      <div class="kapsul merkez">
        <div class="pill gir gir-1" style="margin-bottom:28px;">● CANLI EĞİTİM SİMÜLASYONU</div>
        <div class="dev gir gir-2" style="font-size:clamp(40px,11vw,68px); margin-bottom:10px;">AI<br>AKADEMİ</div>
        <p class="govde gir gir-3" style="max-width:380px; margin-bottom:36px;">
          Önümüzdeki iki saatte sıradan bir eğitim izlemeyeceksin.
          Bir göreve başlayacak, gerçek vakalar çözecek ve yapay zekâyı
          <b style="color:var(--beyaz)">yaparak</b> öğreneceksin.</p>
        <div class="kart gir gir-4" style="width:100%; max-width:380px;">
          <div class="kart-ic">
            <div class="etiket" style="margin-bottom:14px;">Göreve katıl</div>
            <input class="alan alan-kod" id="kodIn" maxlength="4" inputmode="numeric" placeholder="0000" style="margin-bottom:12px;">
            <input class="alan" id="isimIn" placeholder="Adın soyadın" style="margin-bottom:16px;">
            <button class="btn btn-ana btn-blok btn-buyuk" id="katilBtn">Giriş yap →</button>
            <div class="kucuk" id="hata" style="color:var(--kirmizi-parlak); margin-top:12px; text-align:center; min-height:18px;"></div>
          </div>
        </div>
      </div>
    </div>`, false);
  $("#katilBtn").onclick = katil;
  $("#kodIn").addEventListener("keydown",e=>{if(e.key==="Enter")$("#isimIn").focus();});
  $("#isimIn").addEventListener("keydown",e=>{if(e.key==="Enter")katil();});
}

async function katil(){
  const kod=$("#kodIn").value.trim(), ad=$("#isimIn").value.trim();
  $("#hata").textContent="";
  if(kod.length!==4) return $("#hata").textContent="4 haneli görev kodunu gir.";
  if(!ad) return $("#hata").textContent="Adını gir.";
  $("#katilBtn").disabled=true; $("#katilBtn").textContent="Bağlanıyor...";
  const { data:ot } = await sb.from("oturumlar").select("*").eq("kod",kod).maybeSingle();
  if(!ot){ $("#hata").textContent="Bu kodda bir görev bulunamadı."; $("#katilBtn").disabled=false; $("#katilBtn").textContent="Giriş yap →"; return; }
  const { data:o } = await sb.from("oyuncular").insert({ oturum_kodu:kod, isim:ad }).select().single();
  durum.oturum=kod; durum.oyuncuId=o.id; durum.isim=ad;

  sb.channel("akad-"+kod)
    .on("postgres_changes",{event:"UPDATE",schema:"public",table:"oturumlar",filter:"kod=eq."+kod},
      (p)=>bolumCiz(p.new.aktif_bolum, p.new.faz_kilit))
    .subscribe();

  // sinematik geçiş
  gecisAnimasyon(()=> bolumCiz(ot.aktif_bolum, ot.faz_kilit));
}

// ---- sinematik perde geçişi ----
function gecisAnimasyon(sonra){
  const perde=document.createElement("div");
  perde.style.cssText="position:fixed;inset:0;z-index:999;background:var(--zemin-0);display:flex;align-items:center;justify-content:center;animation:girAnim .3s;";
  perde.innerHTML=`<div class="donsun"></div>`;
  document.body.appendChild(perde);
  setTimeout(()=>{ sonra&&sonra();
    perde.style.transition="opacity .5s"; perde.style.opacity="0";
    setTimeout(()=>perde.remove(),500);
  }, 700);
}

// ============================================================
// BÖLÜM YÖNLENDİRİCİSİ
// ============================================================
function bolumCiz(idx, kilit){
  durum.bolum=idx; durum.kilit=kilit;
  const b=B[idx]; if(!b) return;
  const t=b.tur;

  if(t==="giris")          return; // zaten giriş ekranındayız
  if(t==="meslek_secimi")  return meslekSecimEkran();
  if(t==="bolum_gecis")    return bolumGecisEkran(b);
  if(t==="ogren_tahmin")   return tahminEkran();
  if(t==="ogren_kart")     return kartEkran(b.veri);
  if(t==="arac_ogren")     return aracOgrenEkran();
  if(t==="prompt_ogren")   return promptOgrenEkran();
  if(t==="notebook_ogren") return notebookOgrenEkran();
  if(t==="notebook_demo")  return notebookDemoEkran();
  if(t==="akis_ogren")     return akisOgrenEkran();
  if(t==="etik_kart")      return etikKartEkran();
  if(t==="arac_test")      return sahaSarmal(idx,kilit,()=>aracTestEkran(idx));
  if(t==="arac_secimi")    return sahaSarmal(idx,kilit,()=>aracSecimiEkran(idx));
  if(t==="arac_secimi2")   return sahaSarmal(idx,kilit,()=>aracSecimi2Ekran(idx));
  if(t==="prompt_saha")    return sahaSarmal(idx,kilit,()=>promptSahaEkran(idx,b));
  if(t==="onarim")         return sahaSarmal(idx,kilit,()=>onarimEkran(idx));
  if(t==="akis_test")      return sahaSarmal(idx,kilit,()=>akisTestEkran(idx));
  if(t==="saha_vaka")      return sahaSarmal(idx,kilit,()=>sahaVakaEkran(idx,b));
  if(t==="etik_test")      return sahaSarmal(idx,kilit,()=>etikTestEkran(idx));
  if(t==="final")          return finalEkran();
}

// saha görevleri: meslek seçilmemişse uyar; kilitliyse bekle; yapıldıysa bekle
function sahaSarmal(idx, kilit, ciz){
  if(!durum.meslek && idx>2){ /* meslek zorunlu sahalar için */ }
  if(kilit) return bekleEkran("Eğitmen birazdan bu görevi açacak.","Hazırlan");
  if(durum.yapildi[idx]) return bekleEkran("Görevin tamamlandı. Sınıfın geri kalanı bitince devam edeceğiz.","Tamamlandı ✓");
  ciz();
}

function bekleEkran(mesaj, baslik){
  ekran(`<div class="merkez" style="flex:1;">
    <div class="kapsul merkez">
      <div class="pill notr olcek" style="margin-bottom:24px;">${baslik}</div>
      <div class="olcek" style="display:flex; gap:8px; margin-bottom:24px;">
        <span class="nabiz" style="width:12px;height:12px;border-radius:50%;background:var(--kirmizi);"></span>
        <span class="nabiz" style="width:12px;height:12px;border-radius:50%;background:var(--kirmizi);animation-delay:.3s;"></span>
        <span class="nabiz" style="width:12px;height:12px;border-radius:50%;background:var(--kirmizi);animation-delay:.6s;"></span>
      </div>
      <p class="govde olcek" style="max-width:340px;">${mesaj}</p>
    </div>
  </div>`);
}

// ============================================================
// MESLEK SEÇİMİ
// ============================================================
function meslekSecimEkran(){
  if(durum.meslek) return bekleEkran("Departmanın kaydedildi. Eğitmenin başlatmasını bekle.", durum.meslekAd);
  const kartlar = window.MESLEKLER.map((m,i)=>`
    <button class="secim gir gir-${(i%5)+1}" data-id="${m.id}" data-ad="${m.ad}">
      <div class="ikon">${m.ikon}</div>
      <div class="yazi"><div class="baslik">${m.ad}</div><div class="aciklama">${m.ozet}</div></div>
      <span style="color:var(--gri-3);font-size:20px;">›</span>
    </button>`).join("");
  ekran(`<div style="flex:1; padding:24px 0;">
    <div class="kapsul">
      <div class="merkez">
        <div class="pill gir" style="margin-bottom:18px;">İLK GÖREV</div>
        <h1 class="h1 gir gir-1" style="margin-bottom:10px;">Hangi departmandasın?</h1>
        <p class="govde gir gir-2" style="max-width:400px; margin-bottom:28px;">
          Bugünkü vakaların ve örneklerin senin işine göre şekillenecek. Departmanını seç.</p>
      </div>
      <div class="secimler">${kartlar}</div>
    </div>
  </div>`);
  kok.querySelectorAll(".secim").forEach(b=>{
    b.onclick=async()=>{
      durum.meslek=b.dataset.id; durum.meslekAd=b.dataset.ad;
      await sb.from("oyuncular").update({ meslek:durum.meslek, meslek_ad:durum.meslekAd }).eq("id",durum.oyuncuId);
      gecisAnimasyon(()=> bekleEkran("Departmanın: "+durum.meslekAd+". Eğitmenin başlatmasını bekle.", durum.meslekAd));
    };
  });
}

// ============================================================
// BÖLÜM GEÇİŞ (sinematik ara perde)
// ============================================================
function bolumGecisEkran(b){
  ekran(`<div class="merkez" style="flex:1;">
    <div class="kapsul merkez">
      <div class="olcek" style="font-family:var(--font-mono); font-size:15px; color:var(--gri-2); letter-spacing:.3em; margin-bottom:18px;">BÖLÜM ${String(b.no).padStart(2,"0")}</div>
      <h1 class="dev gir gir-1" style="font-size:clamp(34px,9vw,56px); margin-bottom:14px;">${b.ad}</h1>
      <p class="govde gir gir-2" style="max-width:380px; margin-bottom:10px;">${b.alt}</p>
      <div class="pill notr gir gir-3">${b.sure}</div>
      <div class="gir gir-4" style="margin-top:40px; color:var(--gri-3); font-size:13px;">Eğitmen anlatıyor — birazdan başlıyoruz</div>
    </div>
  </div>`);
}

// devamı oyuncu2.js'te (öğrenme + saha sahneleri)
girisEkran();
