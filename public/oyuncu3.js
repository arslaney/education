// ============================================================
// oyuncu3.js — Saha sahneleri (UYGULA fazı) + kayıt + final
// ============================================================

async function kaydet(bolum, tur, icerik, dogru, puan, ek={}){
  durum.yapildi[bolum]=true;
  durum.toplam += (puan||0);
  durum.seviye = seviyeHesap(durum.toplam);
  await sb.from("kayitlar").insert({
    oturum_kodu:durum.oturum, oyuncu_id:durum.oyuncuId, isim:durum.isim, meslek:durum.meslek,
    bolum, tur, icerik:icerik||"", dogru, puan:puan||0,
    detay:ek.detay||{}, geri_bildirim:ek.gb||"", iyilestirilmis:ek.iyi||"", ai_cevap:ek.ai||"",
  });
  await sb.from("oyuncular").update({ toplam_puan:durum.toplam, seviye:durum.seviye }).eq("id",durum.oyuncuId);
}

function basariPerde(puan, mesaj, sonra){
  const perde=document.createElement("div");
  perde.style.cssText="position:fixed;inset:0;z-index:900;background:rgba(10,10,15,.92);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;animation:girAnim .4s;";
  perde.innerHTML=`<div class="merkez olcek">
    <div style="font-size:64px;margin-bottom:10px;">${puan>=75?"🏆":puan>=50?"⭐":"✓"}</div>
    <div class="dev" style="font-size:52px;color:var(--altin);">+${puan}</div>
    <div class="govde" style="margin-top:8px;">${mesaj}</div></div>`;
  document.body.appendChild(perde);
  setTimeout(()=>{ perde.style.transition="opacity .5s"; perde.style.opacity="0";
    setTimeout(()=>{perde.remove(); sonra&&sonra();},500); }, 1500);
}

// ---- SAHA: araç testi (ısınma, tek soru) ----
function aracTestEkran(idx){
  const sen=aracSenaryolari(durum.meslek)[0];
  const butonlar=sen.sec.map((o,j)=>`<button class="secim gir gir-${j+1}" data-j="${j}"><div class="yazi"><div class="baslik">${o}</div></div></button>`).join("");
  ekran(`<div style="flex:1;padding:24px 0;"><div class="kapsul">
    <div class="merkez"><div class="pill gir" style="margin-bottom:16px;">ISINMA TESTİ</div>
      <h2 class="h2 gir gir-1" style="margin-bottom:14px;">Doğru aracı seç</h2></div>
    <div class="kart gir gir-2" style="margin-bottom:18px;"><div class="kart-ic"><div class="etiket" style="margin-bottom:8px;">Senaryo</div>
      <p style="font-size:15.5px;line-height:1.55;">${sen.s}</p></div></div>
    <div class="secimler" id="secList">${butonlar}</div>
  </div></div>`);
  kok.querySelectorAll(".secim").forEach(b=>{
    b.onclick=async()=>{
      const j=Number(b.dataset.j), dg=j===sen.d;
      kok.querySelectorAll(".secim").forEach((x,k)=>{ x.classList.add("sonuc");
        if(k===sen.d)x.classList.add("dogru"); else if(k===j)x.classList.add("yanlis"); });
      const p=dg?40:10;
      await kaydet(idx,"arac_test",sen.sec[j],dg,p);
      $("#secList").insertAdjacentHTML("afterend",`<div class="gb ${dg?"yesil":""} olcek" style="margin-top:14px;"><b>${dg?"Doğru!":"Doğrusu: "+sen.sec[sen.d]}</b><br>${sen.neden}</div>`);
      basariPerde(p, dg?"Keskin seçim":"Not aldık, devam", ()=>bekleEkran("Cevabın alındı. Sınıf hazır olunca devam edeceğiz.","Tamamlandı ✓"));
    };
  });
}

// ---- SAHA: araç seçimi (çok senaryolu) ----
function aracSecimiEkran(idx){
  const senaryolar=aracSenaryolari(durum.meslek);
  let i=0, dogruSay=0;
  function ciz(){
    const sen=senaryolar[i];
    const butonlar=sen.sec.map((o,j)=>`<button class="secim gir gir-${j+1}" data-j="${j}"><div class="yazi"><div class="baslik">${o}</div></div></button>`).join("");
    ekran(`<div style="flex:1;padding:24px 0;"><div class="kapsul">
      <div class="merkez"><div class="pill gir" style="margin-bottom:14px;">SAHA · ${i+1}/${senaryolar.length}</div>
        <h2 class="h2 gir gir-1" style="margin-bottom:14px;">Hangi araç?</h2></div>
      <div class="kart gir gir-2" style="margin-bottom:18px;"><div class="kart-ic"><div class="etiket" style="margin-bottom:8px;">Senaryo</div>
        <p style="font-size:15.5px;line-height:1.55;">${sen.s}</p></div></div>
      <div class="secimler" id="secList">${butonlar}</div>
    </div></div>`);
    kok.querySelectorAll(".secim").forEach(b=>{
      b.onclick=()=>{
        const j=Number(b.dataset.j), dg=j===sen.d; if(dg)dogruSay++;
        kok.querySelectorAll(".secim").forEach((x,k)=>{ x.classList.add("sonuc");
          if(k===sen.d)x.classList.add("dogru"); else if(k===j)x.classList.add("yanlis"); });
        $("#secList").insertAdjacentHTML("afterend",`<div class="gb ${dg?"yesil":""} olcek" style="margin-top:14px;"><b>${dg?"Doğru!":"Doğrusu: "+sen.sec[sen.d]}</b><br>${sen.neden}</div>
          <button class="btn btn-ana btn-blok olcek" id="aracDevam" style="margin-top:14px;">${i<senaryolar.length-1?"Sıradaki →":"Bitir"}</button>`);
        document.getElementById("aracDevam").onclick=async()=>{
          i++;
          if(i<senaryolar.length) ciz();
          else{ const p=Math.round((dogruSay/senaryolar.length)*60);
            await kaydet(idx,"arac_secimi",dogruSay+"/"+senaryolar.length,dogruSay===senaryolar.length,p);
            basariPerde(p, dogruSay+"/"+senaryolar.length+" doğru", ()=>bekleEkran("Saha görevin tamamlandı. Sınıfı bekliyoruz.","Tamamlandı ✓"));
          }
        };
      };
    });
  }
  ciz();
}

// ---- SAHA: gömülü prompt (Claude çalıştırır + puanlar) ----
function promptSahaEkran(idx, b){
  const v=vaka(b.vakaAdi, durum.meslek);
  ekran(`<div style="flex:1;padding:24px 0;"><div class="kapsul">
    <div class="merkez"><div class="pill gir" style="margin-bottom:14px;">İLK VAKA</div>
      <h2 class="h2 gir gir-1" style="margin-bottom:6px;">${v.baglik}</h2></div>
    <div class="kart gir gir-2" style="margin-bottom:16px;border-left:3px solid var(--kirmizi);border-radius:var(--r-m);"><div class="kart-ic">
      <div class="etiket" style="margin-bottom:8px;">Durum</div><p style="font-size:15px;line-height:1.55;margin-bottom:14px;">${v.senaryo}</p>
      <div class="etiket" style="margin-bottom:8px;color:var(--altin);">Görevin</div><p class="govde" style="font-size:14px;">${v.gorev}</p>
    </div></div>
    <textarea class="alan gir gir-3" id="pIn" placeholder="Promptunu buraya yaz..."></textarea>
    <button class="btn btn-ana btn-blok btn-buyuk gir gir-4" id="pBtn" style="margin-top:14px;">Gönder ve çalıştır →</button>
  </div></div>`);
  $("#pBtn").onclick=async()=>{
    const prompt=$("#pIn").value.trim();
    if(prompt.length<5) return alert("Biraz daha detaylı yaz.");
    calisiyorEkran("Claude promptunu çalıştırıyor ve puanlıyor...");
    try{
      const r=await fetch("/api/degerlendir",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt,gorev:v.gorev})});
      const d=await r.json(); if(!r.ok)throw new Error(d.error||"hata");
      await kaydet(idx,"prompt_saha",prompt,null,d.puan,{detay:d.detay,gb:d.geri_bildirim,iyi:d.iyilestirilmis,ai:d.ai_cevap});
      basariPerde(d.puan,"Promptun değerlendirildi",()=>promptSonucEkran(d,false));
    }catch(e){ hataEkran(e.message); }
  };
}

function calisiyorEkran(mesaj){
  ekran(`<div class="merkez" style="flex:1;"><div class="kapsul merkez">
    <div class="donsun" style="margin-bottom:20px;"></div>
    <p class="govde nabiz">${mesaj}</p></div></div>`);
}
function hataEkran(m){
  ekran(`<div class="merkez" style="flex:1;"><div class="kapsul merkez">
    <p class="govde" style="margin-bottom:16px;">Bir sorun oluştu: ${m}</p>
    <button class="btn btn-hayalet" onclick="location.reload()">Tekrar dene</button></div></div>`);
}

function promptSonucEkran(d, final){
  const adlar={aciklik:"Açıklık",baglam:"Bağlam",spesifiklik:"Spesifiklik",format:"Format",rol:"Rol"};
  const barlar=Object.keys(adlar).map(k=>{const v=d.detay[k]||0;
    return `<div style="margin-bottom:10px;"><div style="display:flex;justify-content:space-between;font-size:12px;font-weight:600;margin-bottom:4px;"><span>${adlar[k]}</span><span>${v}</span></div>
      <div class="ilerleme-dis"><div class="ilerleme-ic" style="width:${v}%;background:${renk(v)}"></div></div></div>`;}).join("");
  ekran(`<div style="flex:1;padding:24px 0;"><div class="kapsul">
    <div class="merkez olcek"><div class="pill ${final?"altin":""}" style="margin-bottom:8px;">${final?"FİNAL SONUCU":"SONUCUN"}</div>
      <div class="dev" style="font-size:64px;color:${renk(d.puan)};">${d.puan}</div>
      <div class="kucuk" style="margin-bottom:20px;">/ 100 puan</div></div>
    <div class="kart gir gir-1" style="margin-bottom:14px;"><div class="kart-ic" style="padding:18px;">${barlar}</div></div>
    <div class="gb gir gir-2" style="margin-bottom:12px;">${d.geri_bildirim}</div>
    <div class="kart gir gir-3" style="margin-bottom:12px;background:#08080C;"><div class="kart-ic" style="padding:18px;">
      <div class="etiket" style="color:var(--turkuaz);margin-bottom:8px;">Promptunun çıktısı · Claude</div>
      <div style="font-size:13.5px;line-height:1.6;color:var(--gri-1);white-space:pre-wrap;max-height:220px;overflow:auto;">${d.ai_cevap}</div></div></div>
    <div class="kart gir gir-4" style="border-color:var(--altin)44;"><div class="kart-ic" style="padding:18px;">
      <div class="etiket" style="color:var(--altin);margin-bottom:8px;">Daha güçlü hali</div>
      <div style="font-size:13.5px;line-height:1.6;color:var(--beyaz);white-space:pre-wrap;">${d.iyilestirilmis}</div></div></div>
    <div class="gb yesil olcek" style="margin-top:14px;text-align:center;">Kaydedildi ✓ Sıradaki adım için bekle</div>
  </div></div>`);
}

// ---- SAHA: onarım atölyesi ----
function onarimEkran(idx){
  const kotu="Bana bir e-posta yaz.";
  ekran(`<div style="flex:1;padding:24px 0;"><div class="kapsul">
    <div class="merkez"><div class="pill gir" style="margin-bottom:14px;">ONARIM ATÖLYESİ</div>
      <h2 class="h2 gir gir-1" style="margin-bottom:6px;">Bu zayıf promptu kurtar</h2>
      <p class="kucuk gir gir-2" style="max-width:360px;margin-bottom:18px;">Öğrendiğin parçaları ekle. Önce/sonra puanını karşılaştıracağız.</p></div>
    <div class="kart gir gir-3" style="margin-bottom:14px;border-left:3px solid var(--kirmizi);border-radius:var(--r-m);"><div class="kart-ic" style="padding:16px;">
      <div class="etiket" style="margin-bottom:6px;">Zayıf prompt</div>
      <div style="font-family:var(--font-mono);font-size:15px;color:var(--gri-1);">"${kotu}"</div></div></div>
    <textarea class="alan gir gir-4" id="oIn" placeholder="Güçlü halini yaz...">${kotu}</textarea>
    <button class="btn btn-ana btn-blok btn-buyuk gir gir-5" id="oBtn" style="margin-top:14px;">Onar ve karşılaştır →</button>
  </div></div>`);
  $("#oBtn").onclick=async()=>{
    const yeni=$("#oIn").value.trim();
    if(yeni.length<8||yeni===kotu) return alert("Promptu gerçekten geliştir.");
    calisiyorEkran("Önce ve sonra karşılaştırılıyor...");
    try{
      const [r1,r2]=await Promise.all([
        fetch("/api/degerlendir",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt:kotu,gorev:"e-posta"})}).then(x=>x.json()),
        fetch("/api/degerlendir",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt:yeni,gorev:"e-posta"})}).then(x=>x.json()),
      ]);
      const o=r1.puan||0, s=r2.puan||0, kazanc=Math.max(0,s-o);
      await kaydet(idx,"onarim",yeni,s>o,kazanc,{detay:r2.detay,gb:r2.geri_bildirim});
      basariPerde(kazanc,"+"+kazanc+" puan güçlendirdin",()=>{
        ekran(`<div style="flex:1;padding:24px 0;"><div class="kapsul">
          <div class="merkez"><div class="pill" style="margin-bottom:18px;">ONARIM SONUCU</div></div>
          <div class="kart gir gir-1"><div class="kart-ic"><div style="display:flex;gap:12px;text-align:center;">
            <div style="flex:1;"><div class="kucuk">Önce</div><div class="dev" style="font-size:38px;color:${renk(o)}">${o}</div></div>
            <div style="display:flex;align-items:center;color:var(--gri-3);font-size:24px;">→</div>
            <div style="flex:1;"><div class="kucuk">Sonra</div><div class="dev" style="font-size:38px;color:${renk(s)}">${s}</div></div>
            <div style="flex:1;"><div class="kucuk">Kazanç</div><div class="dev" style="font-size:38px;color:var(--altin)">+${kazanc}</div></div>
          </div></div></div>
          <div class="gb gir gir-2" style="margin-top:14px;">${r2.geri_bildirim}</div>
          <div class="gb yesil olcek" style="margin-top:12px;text-align:center;">Kaydedildi ✓ Sıradaki bölüm için bekle</div>
        </div></div>`);
      });
    }catch(e){ hataEkran(e.message); }
  };
}

// ---- SAHA: zaman baskılı final vaka ----
function sahaVakaEkran(idx, b){
  const v=vaka(b.vakaAdi, durum.meslek);
  let kalan=90, sayac=null, gonderildi=false;
  ekran(`<div style="flex:1;padding:24px 0;"><div class="kapsul">
    <div class="merkez"><div class="pill altin gir" style="margin-bottom:12px;">⚡ ${b.asama===2?"FİNAL · 2. AŞAMA":"FİNAL OPERASYONU"} · YARIŞMA</div>
      <h2 class="h2 gir gir-1" style="margin-bottom:6px;">${v.baglik}</h2></div>
    <div class="kart gir gir-2" style="margin-bottom:14px;border-color:var(--altin)44;"><div class="kart-ic">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <div class="etiket" style="color:var(--altin);">Kalan süre</div>
        <div id="sayacGoster" style="font-family:var(--font-mono);font-size:24px;font-weight:800;color:var(--altin);">1:30</div></div>
      <p style="font-size:15px;line-height:1.55;margin-bottom:12px;">${v.senaryo}</p>
      <div class="etiket" style="margin-bottom:6px;">Görevin</div><p class="govde" style="font-size:14px;">${v.gorev}</p>
    </div></div>
    <textarea class="alan gir gir-3" id="vIn" placeholder="En iyi promptunu yaz — puan ve süre birlikte değerlendirilecek..."></textarea>
    <button class="btn btn-ana btn-blok btn-buyuk gir gir-4" id="vBtn" style="margin-top:14px;">Operasyonu tamamla →</button>
  </div></div>`);

  sayac=setInterval(()=>{
    kalan--;
    const mm=Math.floor(kalan/60), ss=String(kalan%60).padStart(2,"0");
    const g=document.getElementById("sayacGoster"); if(g){ g.textContent=mm+":"+ss; if(kalan<=20)g.style.color="var(--kirmizi-parlak)"; }
    if(kalan<=0){ clearInterval(sayac); if(!gonderildi) gonder(true); }
  },1000);

  async function gonder(sureBitti){
    if(gonderildi) return; gonderildi=true; clearInterval(sayac);
    const prompt=$("#vIn").value.trim();
    if(prompt.length<5 && !sureBitti){ gonderildi=false; return alert("Biraz daha detaylı yaz."); }
    if(prompt.length<5){ await kaydet(idx,"saha_vaka","(boş)",false,0); return bekleEkran("Süre doldu. Sıralama birazdan açıklanacak.","Süre bitti"); }
    calisiyorEkran("Final değerlendiriliyor...");
    try{
      const r=await fetch("/api/degerlendir",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt,gorev:v.gorev})});
      const d=await r.json(); if(!r.ok)throw new Error(d.error||"hata");
      const hizBonus=Math.max(0,Math.round(kalan/6)); // hızlı bitirene bonus
      const final=d.puan+hizBonus;
      await kaydet(idx,"saha_vaka",prompt,null,final,{detay:d.detay,gb:d.geri_bildirim+(hizBonus?` (+${hizBonus} hız bonusu)`:""),iyi:d.iyilestirilmis,ai:d.ai_cevap});
      basariPerde(final,(hizBonus?"+"+hizBonus+" hız bonusu! ":"")+"Final tamamlandı",()=>promptSonucEkran({...d,puan:final},true));
    }catch(e){ hataEkran(e.message); }
  }
  $("#vBtn").onclick=()=>gonder(false);
}

// ---- FİNAL: karne + sertifika + ödev ----
function finalEkran(){
  const r = durum.toplam;
  const seviye = seviyeHesap(r);
  ekran(`<div style="flex:1;padding:24px 0;"><div class="kapsul">
    <div class="merkez">
      <div class="olcek" style="font-size:60px;margin-bottom:6px;">🏁</div>
      <h1 class="dev gir gir-1" style="font-size:clamp(30px,8vw,46px);margin-bottom:8px;">Operasyon tamamlandı</h1>
      <p class="govde gir gir-2" style="max-width:360px;margin-bottom:26px;">Bir günü baştan sona yapay zekâ ile yönettin. İşte karnen.</p>
    </div>
    <div class="kart parlak-gec gir gir-3" style="margin-bottom:16px;border-color:var(--altin)55;"><div class="kart-ic" style="text-align:center;padding:30px;">
      <div class="etiket" style="color:var(--altin);margin-bottom:10px;">AI USTALIK SERTİFİKASI</div>
      <div class="h2" style="margin-bottom:4px;">${durum.isim}</div>
      <div class="kucuk" style="margin-bottom:18px;">${durum.meslekAd}</div>
      <div class="dev" style="font-size:56px;color:var(--altin);">${r}</div>
      <div class="kucuk" style="margin-bottom:14px;">toplam puan</div>
      <div class="pill altin" style="font-size:14px;">Seviye: ${seviye}</div>
    </div></div>
    <div class="kart gir gir-4" style="margin-bottom:16px;"><div class="kart-ic">
      <div class="etiket" style="margin-bottom:12px;">Yarın deneyeceğin tek şey</div>
      <p class="govde" style="font-size:15px;">Bu hafta yaptığın sıkıcı, tekrarlayan bir işi seç — bir e-posta, bir özet, bir tablo — ve onu bugün öğrendiğin bir araçla, iyi bir promptla yeniden yap. Mükemmel olması gerekmiyor; sadece dene.</p>
    </div></div>
    <div class="merkez gir gir-5">
      <p class="kucuk" style="text-align:center;max-width:320px;">AI seni değil, AI kullanan birini ikame eder. Bugün o kişi olmaya başladın.</p>
    </div>
  </div></div>`);
}

// ============================================================
// EK SAHA SAHNELERİ (2 saatlik sürüm)
// ============================================================

// ---- SAHA: NotebookLM vurgulu araç seçimi (2. tur) ----
function aracSecimi2Ekran(idx){
  const senaryolar=notebookSenaryolari(durum.meslek);
  let i=0, dogruSay=0;
  function ciz(){
    const sen=senaryolar[i];
    const butonlar=sen.sec.map((o,j)=>`<button class="secim gir gir-${j+1}" data-j="${j}"><div class="yazi"><div class="baslik">${o}</div></div></button>`).join("");
    ekran(`<div style="flex:1;padding:24px 0;"><div class="kapsul">
      <div class="merkez"><div class="pill gir" style="margin-bottom:14px;background:rgba(34,197,94,.12);border-color:rgba(34,197,94,.3);color:#22C55E;">KAYNAK TESTİ · ${i+1}/${senaryolar.length}</div>
        <h2 class="h2 gir gir-1" style="margin-bottom:14px;">Doğruluk şart — hangisi?</h2></div>
      <div class="kart gir gir-2" style="margin-bottom:18px;"><div class="kart-ic"><div class="etiket" style="margin-bottom:8px;color:#22C55E;">Senaryo</div>
        <p style="font-size:15.5px;line-height:1.55;">${sen.s}</p></div></div>
      <div class="secimler" id="secList">${butonlar}</div>
    </div></div>`);
    kok.querySelectorAll(".secim").forEach(b=>{
      b.onclick=()=>{
        const j=Number(b.dataset.j), dg=j===sen.d; if(dg)dogruSay++;
        kok.querySelectorAll(".secim").forEach((x,k)=>{ x.classList.add("sonuc");
          if(k===sen.d)x.classList.add("dogru"); else if(k===j)x.classList.add("yanlis"); });
        $("#secList").insertAdjacentHTML("afterend",`<div class="gb ${dg?"yesil":""} olcek" style="margin-top:14px;"><b>${dg?"Doğru!":"Doğrusu: "+sen.sec[sen.d]}</b><br>${sen.neden}</div>
          <button class="btn btn-ana btn-blok olcek" id="acDevam" style="margin-top:14px;">${i<senaryolar.length-1?"Sıradaki →":"Bitir"}</button>`);
        document.getElementById("acDevam").onclick=async()=>{
          i++;
          if(i<senaryolar.length) ciz();
          else{ const p=Math.round((dogruSay/senaryolar.length)*50);
            await kaydet(idx,"arac_secimi2",dogruSay+"/"+senaryolar.length,dogruSay===senaryolar.length,p);
            basariPerde(p, dogruSay+"/"+senaryolar.length+" doğru", ()=>bekleEkran("Kaynak testi tamamlandı. Sınıfı bekliyoruz.","Tamamlandı ✓"));
          }
        };
      };
    });
  }
  ciz();
}

// ---- SAHA: iş akışı sıralama testi ----
function akisTestEkran(idx){
  const gorev=akisGorevi(durum.meslek);
  // adımları karıştır
  let karisik=gorev.adimlar.map((a,i)=>({...a,_i:i})).sort(()=>Math.random()-0.5);
  let secim=[]; // kullanıcının dizdiği sıra (dogruSira değerleri)
  function ciz(){
    const havuz=karisik.filter(a=>!secim.includes(a.dogruSira)).map(a=>`
      <button class="secim akisBtn" data-sira="${a.dogruSira}" style="margin-bottom:9px;">
        <div class="ikon" style="font-size:16px;">${a.arac==="NotebookLM"?"🎧":a.arac==="Claude"?"💬":"🎬"}</div>
        <div class="yazi"><div class="baslik" style="font-size:14px;">${a.metin}</div><div class="aciklama">${a.arac}</div></div>
        <span style="color:var(--gri-3);">+</span></button>`).join("");
    const dizilim=secim.map((sira,n)=>{ const a=gorev.adimlar.find(x=>x.dogruSira===sira);
      return `<div class="kart" style="margin-bottom:9px;border-color:var(--kirmizi)55;"><div class="kart-ic" style="padding:13px 15px;display:flex;gap:12px;align-items:center;">
        <div style="width:26px;height:26px;border-radius:7px;background:var(--kirmizi);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;">${n+1}</div>
        <div style="flex:1;font-size:14px;">${a.metin}</div></div></div>`;}).join("");
    ekran(`<div style="flex:1;padding:24px 0;"><div class="kapsul">
      <div class="merkez"><div class="pill gir" style="margin-bottom:14px;">İŞ AKIŞI · SAHA</div>
        <h2 class="h2 gir gir-1" style="margin-bottom:6px;">${gorev.baglik}</h2>
        <p class="kucuk gir gir-2" style="max-width:360px;margin-bottom:18px;">Adımları doğru sıraya diz. Hangi araçla başlamak, neyle bitirmek mantıklı?</p></div>
      ${secim.length?`<div class="gir" style="margin-bottom:14px;"><div class="etiket" style="margin-bottom:8px;">Senin sıralaman</div>${dizilim}</div>`:""}
      ${havuz?`<div class="gir gir-3"><div class="etiket" style="margin-bottom:8px;color:var(--gri-2);">Kalan adımlar</div>${havuz}</div>`:""}
      ${secim.length===gorev.adimlar.length?`<button class="btn btn-ana btn-blok btn-buyuk olcek" id="akisOnay" style="margin-top:14px;">Akışı onayla →</button>`:""}
    </div></div>`);
    kok.querySelectorAll(".akisBtn").forEach(b=>{ b.onclick=()=>{ secim.push(Number(b.dataset.sira)); ciz(); }; });
    const onay=document.getElementById("akisOnay");
    if(onay) onay.onclick=async()=>{
      const dogru=secim.every((s,n)=>s===n+1);
      const p=dogru?60:Math.round((secim.filter((s,n)=>s===n+1).length/secim.length)*30);
      await kaydet(idx,"akis_test",secim.join("→"),dogru,p);
      basariPerde(p, dogru?"Kusursuz akış!":"Sıra tam değil ama olsun", ()=>{
        ekran(`<div style="flex:1;padding:24px 0;"><div class="kapsul">
          <div class="merkez"><div class="pill ${dogru?"":"notr"}" style="margin-bottom:16px;">${dogru?"DOĞRU SIRA":"İPUCU"}</div></div>
          ${gorev.adimlar.map((a,n)=>`<div class="kart" style="margin-bottom:9px;border-left:3px solid ${a.arac==="NotebookLM"?"#22C55E":a.arac==="Claude"?"#E11D34":"#8B5CF6"};border-radius:var(--r-m);"><div class="kart-ic" style="padding:14px;display:flex;gap:12px;align-items:center;">
            <div style="width:26px;height:26px;border-radius:7px;background:var(--zemin-3);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;">${n+1}</div>
            <div style="flex:1;font-size:14px;">${a.metin}<div class="kucuk" style="margin-top:2px;">${a.arac}</div></div></div></div>`).join("")}
          <div class="gb yesil olcek" style="margin-top:14px;text-align:center;">Önce kaynak (NotebookLM) → sonra metin (Claude) → en son görsel (Veo 3). Kaydedildi ✓</div>
        </div></div>`);
      });
    };
  }
  ciz();
}

// ---- SAHA: etik testi ----
function etikTestEkran(idx){
  const e=window.ETIK_SORU;
  const butonlar=e.secenekler.map((o,j)=>`<button class="secim gir gir-${j+1}" data-j="${j}"><div class="yazi"><div class="baslik" style="font-size:14px;">${o}</div></div></button>`).join("");
  ekran(`<div style="flex:1;padding:24px 0;"><div class="kapsul">
    <div class="merkez"><div class="pill gir" style="margin-bottom:14px;">SON TEST</div>
      <h2 class="h2 gir gir-1" style="margin-bottom:14px;">Doğru kararı ver</h2></div>
    <div class="kart gir gir-2" style="margin-bottom:18px;"><div class="kart-ic"><p style="font-size:15.5px;line-height:1.55;">${e.soru}</p></div></div>
    <div class="secimler" id="secList">${butonlar}</div>
  </div></div>`);
  kok.querySelectorAll(".secim").forEach(b=>{
    b.onclick=async()=>{
      const j=Number(b.dataset.j), dg=j===e.dogru;
      kok.querySelectorAll(".secim").forEach((x,k)=>{ x.classList.add("sonuc");
        if(k===e.dogru)x.classList.add("dogru"); else if(k===j)x.classList.add("yanlis"); });
      const p=dg?40:10;
      await kaydet(idx,"etik_test",e.secenekler[j],dg,p);
      $("#secList").insertAdjacentHTML("afterend",`<div class="gb ${dg?"yesil":""} olcek" style="margin-top:14px;"><b>${dg?"Doğru karar!":"Dikkat"}</b><br>${e.aciklama}</div>`);
      basariPerde(p, dg?"Sorumlu kullanım":"Aklında olsun", ()=>bekleEkran("Son test tamamlandı. Kapanışa geçiyoruz.","Tamamlandı ✓"));
    };
  });
}

// ---- SAHA: REHBERLİ GÖREV (örnek dosya → gerçek araçta yap → çıktıyı değerlendir) ----
function rehberliGorevEkran(idx, b){
  const g = window.rehberliGorev(b.gorev);
  if(!g) return bekleEkran("Görev yükleniyor.","Görev");
  const aracRenk = g.arac==="NotebookLM"?"#22C55E":g.arac==="Claude"?"#E11D34":"#8B5CF6";
  const aracIkon = g.arac==="NotebookLM"?"🎧":g.arac==="Claude"?"💬":"🎬";
  const adimlar = g.adimlar.map((a,i)=>`
    <div style="display:flex;gap:12px;align-items:flex-start;margin-bottom:11px;">
      <div style="width:26px;height:26px;border-radius:8px;background:${aracRenk};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;flex-shrink:0;">${i+1}</div>
      <div style="flex:1;font-size:14px;line-height:1.5;padding-top:2px;">${a}</div>
    </div>`).join("");
  ekran(`<div style="flex:1;padding:24px 0;"><div class="kapsul">
    <div class="merkez"><div class="pill gir" style="margin-bottom:14px;border-color:${aracRenk}55;color:${aracRenk};background:${aracRenk}1A;">${g.rozet}</div>
      <h2 class="h2 gir gir-1" style="margin-bottom:8px;">${g.baslik}</h2></div>
    <div class="kart gir gir-2" style="margin-bottom:14px;border-left:3px solid ${aracRenk};border-radius:var(--r-m);"><div class="kart-ic">
      <div class="etiket" style="margin-bottom:8px;">Senaryo</div>
      <p style="font-size:15px;line-height:1.55;">${g.senaryo}</p></div></div>

    <a href="${g.dosya}" download="${g.dosyaAd}" class="btn btn-hayalet btn-blok gir gir-3" style="margin-bottom:16px;text-decoration:none;border-color:${aracRenk}66;">⬇ Örnek dosyayı indir — ${g.dosyaAd}</a>

    <div class="kart gir gir-3" style="margin-bottom:16px;"><div class="kart-ic">
      <div class="etiket" style="margin-bottom:14px;">${aracIkon} ${g.arac}'ta yap</div>
      ${adimlar}
    </div></div>

    <div class="kart gir gir-4" style="border-color:var(--altin)44;"><div class="kart-ic">
      <div class="etiket" style="color:var(--altin);margin-bottom:8px;">Çıktını değerlendir</div>
      <p class="kucuk" style="margin-bottom:12px;">${g.ciktiIstegi}</p>
      <textarea class="alan" id="rgIn" placeholder="Aracın sana verdiği çıktıyı buraya yapıştır..."></textarea>
      <button class="btn btn-ana btn-blok btn-buyuk" id="rgBtn" style="margin-top:12px;">Değerlendir →</button>
    </div></div>
  </div></div>`);

  $("#rgBtn").onclick = async ()=>{
    const cikti = $("#rgIn").value.trim();
    if(cikti.length<15) return alert("Çıktını yapıştır (en az birkaç cümle).");
    calisiyorEkran("Claude çıktını değerlendiriyor...");
    try{
      const r = await fetch("/api/degerlendir",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({prompt:cikti, gorev:g.gorevDeger})});
      const d = await r.json(); if(!r.ok) throw new Error(d.error||"hata");
      await kaydet(idx,"rehberli_gorev",cikti.slice(0,200),null,d.puan,{detay:d.detay,gb:d.geri_bildirim,iyi:d.iyilestirilmis});
      basariPerde(d.puan,"Çıktın değerlendirildi",()=>{
        ekran(`<div style="flex:1;padding:24px 0;"><div class="kapsul">
          <div class="merkez olcek"><div class="pill" style="margin-bottom:8px;">${g.baslik}</div>
            <div class="dev" style="font-size:60px;color:${renk(d.puan)};">${d.puan}</div>
            <div class="kucuk" style="margin-bottom:20px;">/ 100 puan</div></div>
          <div class="gb gir gir-1" style="margin-bottom:12px;">${d.geri_bildirim}</div>
          ${d.iyilestirilmis?`<div class="kart gir gir-2" style="border-color:var(--altin)44;"><div class="kart-ic" style="padding:18px;">
            <div class="etiket" style="color:var(--altin);margin-bottom:8px;">Daha da iyisi için ipucu</div>
            <div style="font-size:13.5px;line-height:1.6;color:var(--beyaz);white-space:pre-wrap;">${d.iyilestirilmis}</div></div></div>`:""}
          <div class="gb yesil olcek" style="margin-top:14px;text-align:center;">Kaydedildi ✓ Sıradaki görev için bekle</div>
        </div></div>`);
      });
    }catch(e){ hataEkran(e.message); }
  };
}
