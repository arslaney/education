// ============================================================
// oyuncu2.js — Öğrenme sahneleri (ÖĞRET fazı)
// ============================================================

// ---- ÖĞREN: oynanabilir tahmin makinesi ----
// Katılımcı yarım cümle görür, sonraki kelimeyi modelin nasıl "tahmin" ettiğini deneyimler.
function tahminEkran(){
  const ornekler = [
    { cumle:"Sabah uyandım ve ilk işim bir bardak", secenekler:[["kahve",62],["su",24],["çay",11],["taş",3]] },
    { cumle:"Toplantı çok verimliydi, herkes fikrini açıkça", secenekler:[["paylaştı",58],["söyledi",30],["sakladı",9],["uçtu",3]] },
    { cumle:"Müşteriye dönüş yapmadan önce dosyayı dikkatlice", secenekler:[["inceledim",55],["okudum",33],["yırttım",8],["uyudum",4]] },
  ];
  let i=0;
  function ciz(){
    const o=ornekler[i];
    const butonlar=o.secenekler.map((s,j)=>`
      <button class="tkn" data-j="${j}" data-olasi="${s[1]}" style="display:flex;align-items:center;justify-content:space-between;width:100%;padding:14px 16px;margin-bottom:9px;background:var(--zemin-2);border:1.5px solid var(--cizgi);border-radius:var(--r-m);cursor:pointer;color:var(--beyaz);font-family:var(--font);font-size:15px;transition:all .2s;">
        <span style="font-weight:600;">${s[0]}</span>
        <span class="cubuk" style="width:0;height:8px;background:linear-gradient(90deg,var(--kirmizi),var(--kirmizi-parlak));border-radius:4px;transition:width .9s var(--gecis);"></span>
      </button>`).join("");
    ekran(`<div style="flex:1;padding:24px 0;"><div class="kapsul">
      <div class="merkez"><div class="pill gir" style="margin-bottom:18px;">DENEY · ${i+1}/${ornekler.length}</div>
        <h2 class="h2 gir gir-1" style="margin-bottom:8px;">Sıradaki kelimeyi sen tahmin et</h2>
        <p class="kucuk gir gir-2" style="max-width:360px;margin-bottom:24px;">AI tam olarak bunu yapar: olasılıkları tartar, en olasıyı seçer.</p>
      </div>
      <div class="kart gir gir-3" style="margin-bottom:22px;"><div class="kart-ic">
        <div style="font-size:19px;line-height:1.5;">"${o.cumle} <span style="color:var(--kirmizi-parlak);font-weight:700;">___</span>"</div>
      </div></div>
      <div class="gir gir-4">${butonlar}</div>
      <div id="tahminSonuc"></div>
    </div></div>`);
    kok.querySelectorAll(".tkn").forEach(btn=>{
      btn.onclick=()=>{
        kok.querySelectorAll(".tkn").forEach(b=>{
          const ol=Number(b.dataset.olasi);
          b.querySelector(".cubuk").style.width=Math.max(8,ol*1.6)+"px";
          b.style.pointerEvents="none";
          if(ol>=50){ b.style.borderColor="var(--yesil)"; b.style.background="rgba(34,197,94,.1)"; }
        });
        const enOlasi=ornekler[i].secenekler.reduce((a,b)=>b[1]>a[1]?b:a);
        const son=document.getElementById("tahminSonuc");
        son.innerHTML=`<div class="gb yesil olcek" style="margin-top:14px;">
          <b>En olası kelime: "${enOlasi[0]}" (%${enOlasi[1]})</b><br>
          AI binlerce olasılık arasından en yükseğini seçer. "Düşünmez" — tahmin eder. İşte tüm sihir bu.</div>
          <button class="btn btn-ana btn-blok olcek" id="tahminDevam" style="margin-top:14px;">${i<ornekler.length-1?"Bir deney daha →":"Anladım, devam →"}</button>`;
        document.getElementById("tahminDevam").onclick=()=>{
          i++; if(i<ornekler.length) ciz();
          else bekleEkran("Harika. Şimdi bunun ne anlama geldiğine bakalım.","Deney bitti");
        };
      };
    });
  }
  ciz();
}

// ---- ÖĞREN: bilgi kartı (maddeler) ----
function kartEkran(veri){
  const md=veri.maddeler.map((m,i)=>`
    <div class="kart gir gir-${i+1}" style="margin-bottom:12px;"><div class="kart-ic" style="display:flex;gap:16px;align-items:flex-start;padding:20px;">
      <div style="font-size:30px;line-height:1;">${m.ik}</div>
      <div><div class="h3" style="margin-bottom:5px;">${m.b}</div><p class="govde" style="font-size:14.5px;">${m.a}</p></div>
    </div></div>`).join("");
  ekran(`<div style="flex:1;padding:24px 0;"><div class="kapsul">
    <div class="merkez"><div class="pill gir" style="margin-bottom:18px;">DERS NOTU</div>
      <h2 class="h2 gir gir-1" style="margin-bottom:24px;">${veri.baslik}</h2></div>
    ${md}
    <div class="gir gir-4" style="text-align:center;margin-top:8px;color:var(--gri-3);font-size:13px;">Eğitmen devam edecek</div>
  </div></div>`);
}

// ---- ÖĞREN: araç filosu (interaktif tanıma) ----
function aracOgrenEkran(){
  const kartlar=window.ARACLAR.map((a,i)=>`
    <button class="aracKart gir gir-${(i%5)+1}" data-i="${i}" style="text-align:left;width:100%;padding:0;border:none;background:none;cursor:pointer;margin-bottom:12px;">
      <div class="kart" style="border-left:3px solid ${a.renk};border-radius:var(--r-m);"><div class="kart-ic" style="padding:18px;display:flex;gap:14px;align-items:center;">
        <div style="width:46px;height:46px;border-radius:12px;background:${a.renk}22;display:flex;align-items:center;justify-content:center;font-size:24px;">${a.ikon}</div>
        <div style="flex:1;"><div class="h3" style="font-size:17px;">${a.ad}</div>
          <div class="kucuk" style="margin-top:2px;">${a.guc}</div></div>
        <span style="color:var(--gri-3);">›</span>
      </div></div>
    </button>`).join("");
  ekran(`<div style="flex:1;padding:24px 0;"><div class="kapsul">
    <div class="merkez"><div class="pill gir" style="margin-bottom:18px;">EKİPMAN</div>
      <h2 class="h2 gir gir-1" style="margin-bottom:8px;">Araç filonu tanı</h2>
      <p class="kucuk gir gir-2" style="max-width:360px;margin-bottom:24px;">Her birine dokun, ne işe yaradığını gör. Birazdan doğru aracı seçeceksin.</p></div>
    ${kartlar}
    <div id="aracDetay"></div>
  </div></div>`);
  kok.querySelectorAll(".aracKart").forEach(b=>{
    b.onclick=()=>{
      const a=window.ARACLAR[Number(b.dataset.i)];
      const d=document.getElementById("aracDetay");
      d.innerHTML=`<div class="gb olcek" style="margin-top:6px;border-color:${a.renk}66;">
        <b style="color:${a.renk}">${a.ikon} ${a.ad} — ne zaman?</b><br>${a.iyi}</div>`;
      d.scrollIntoView({behavior:"smooth",block:"nearest"});
    };
  });
}

// ---- ÖĞREN: prompt kurucu (5 parça interaktif) ----
function promptOgrenEkran(){
  const parcalar=[
    { k:"ROL", a:"Modele kimlik ver", o:"Deneyimli bir asistansın", renk:"var(--kirmizi-parlak)" },
    { k:"BAĞLAM", a:"Arka planı anlat", o:"Bu bir kurumsal toplantı notu", renk:"var(--mavi)" },
    { k:"GÖREV", a:"Ne istediğini söyle", o:"5 maddede özetle", renk:"var(--mor)" },
    { k:"FORMAT", a:"Çıktının şeklini ver", o:"Kısa cümleler, madde madde", renk:"var(--turkuaz)" },
    { k:"ÖRNEK", a:"İstersen örnek ver", o:"Şu tonda: ...", renk:"var(--altin)" },
  ];
  let acik=[];
  function ciz(){
    const satirlar=parcalar.map((p,i)=>{
      const secili=acik.includes(i);
      return `<button class="parca" data-i="${i}" style="text-align:left;width:100%;padding:15px 16px;margin-bottom:9px;background:${secili?p.renk+"1A":"var(--zemin-2)"};border:1.5px solid ${secili?p.renk:"var(--cizgi)"};border-radius:var(--r-m);cursor:pointer;color:var(--beyaz);font-family:var(--font);transition:all .2s;display:flex;align-items:center;gap:13px;">
        <div style="width:28px;height:28px;border-radius:8px;background:${p.renk};color:#0A0A0F;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:13px;flex-shrink:0;">${i+1}</div>
        <div style="flex:1;"><div style="font-weight:700;font-size:14px;color:${p.renk};letter-spacing:.05em;">${p.k}</div>
          <div style="font-size:13px;color:var(--gri-1);">${p.a}</div></div>
        <span style="color:${secili?p.renk:"var(--gri-3)"};font-size:18px;">${secili?"✓":"+"}</span>
      </button>`;
    }).join("");
    const onizleme=acik.length? parcalar.filter((_,i)=>acik.includes(i)).map(p=>p.o).join(". ")+"." : "Parçaları ekledikçe promptun burada oluşacak...";
    ekran(`<div style="flex:1;padding:24px 0;"><div class="kapsul">
      <div class="merkez"><div class="pill gir" style="margin-bottom:18px;">USTALIK</div>
        <h2 class="h2 gir gir-1" style="margin-bottom:8px;">İyi promptun 5 parçası</h2>
        <p class="kucuk gir gir-2" style="max-width:360px;margin-bottom:22px;">Her parçaya dokun, promptun nasıl güçlendiğini canlı gör.</p></div>
      <div class="gir gir-3">${satirlar}</div>
      <div class="kart gir gir-4" style="margin-top:14px;border-color:var(--cizgi-parlak);"><div class="kart-ic" style="padding:18px;">
        <div class="etiket" style="margin-bottom:8px;">Oluşan promptun</div>
        <div style="font-family:var(--font-mono);font-size:14px;line-height:1.6;color:${acik.length?"var(--beyaz)":"var(--gri-3)"};">${onizleme}</div>
      </div></div>
      ${acik.length>=3?`<button class="btn btn-ana btn-blok olcek" id="promptOgrenDevam" style="margin-top:14px;">Çekirdeği yakaladım →</button>`:""}
    </div></div>`);
    kok.querySelectorAll(".parca").forEach(b=>{
      b.onclick=()=>{ const i=Number(b.dataset.i);
        if(acik.includes(i)) acik=acik.filter(x=>x!==i); else acik.push(i);
        ciz();
      };
    });
    const dv=document.getElementById("promptOgrenDevam");
    if(dv) dv.onclick=()=>bekleEkran("Mükemmel. Şimdi bunu gerçek bir vakada kullanma zamanı.","Hazırsın");
  }
  ciz();
}

// ============================================================
// EK ÖĞRENME SAHNELERİ (2 saatlik sürüm)
// ============================================================

// ---- ÖĞREN: NotebookLM nedir ----
function notebookOgrenEkran(){
  ekran(`<div style="flex:1;padding:24px 0;"><div class="kapsul">
    <div class="merkez"><div class="pill gir" style="margin-bottom:18px;background:rgba(34,197,94,.12);border-color:rgba(34,197,94,.3);color:#22C55E;">🎧 GİZLİ SİLAH</div>
      <h2 class="h2 gir gir-1" style="margin-bottom:10px;">NotebookLM</h2>
      <p class="govde gir gir-2" style="max-width:380px;margin-bottom:24px;">Diğer araçlardan tek farkı, ama en kritik farkı: <b style="color:var(--beyaz)">sadece senin yüklediğin kaynaklardan</b> konuşur. Uydurmaz, internetten çekmez.</p></div>
    <div class="kart gir gir-3" style="margin-bottom:12px;border-left:3px solid #22C55E;border-radius:var(--r-m);"><div class="kart-ic" style="padding:18px;">
      <div class="h3" style="font-size:16px;margin-bottom:6px;">📌 Kaynağı gösterir</div>
      <p class="govde" style="font-size:14px;">Her cevabın yanında "bunu şu belgenin şu sayfasında buldum" der. Güven gerektiren işlerde altın değerinde.</p></div></div>
    <div class="kart gir gir-4" style="margin-bottom:12px;border-left:3px solid #22C55E;border-radius:var(--r-m);"><div class="kart-ic" style="padding:18px;">
      <div class="h3" style="font-size:16px;margin-bottom:6px;">📚 Onlarca belgeyi birden okur</div>
      <p class="govde" style="font-size:14px;">10 PDF yükle, hepsinden tek bir tutarlı özet çıkarsın. Politikalar, prosedürler, ders notları için ideal.</p></div></div>
    <div class="kart gir gir-5" style="border-left:3px solid #22C55E;border-radius:var(--r-m);"><div class="kart-ic" style="padding:18px;">
      <div class="h3" style="font-size:16px;margin-bottom:6px;">🎙️ Ve sıradaki sürpriz...</div>
      <p class="govde" style="font-size:14px;">Belgelerinden, iki kişinin sohbet ettiği bir <b style="color:var(--beyaz)">sesli özet</b> üretebilir. Birazdan göreceksin.</p></div></div>
  </div></div>`);
}

// ---- ÖĞREN: sesli özet demo ("vay be" anı) ----
function notebookDemoEkran(){
  ekran(`<div style="flex:1;padding:24px 0;"><div class="kapsul">
    <div class="merkez"><div class="pill gir" style="margin-bottom:18px;background:rgba(34,197,94,.12);border-color:rgba(34,197,94,.3);color:#22C55E;">CANLI DEMO</div>
      <h2 class="h2 gir gir-1" style="margin-bottom:8px;">Belgelerin konuşuyor</h2>
      <p class="kucuk gir gir-2" style="max-width:360px;margin-bottom:24px;">Eğitmen şimdi NotebookLM'in sesli özetini (Audio Overview) çalacak. Sıkıcı bir PDF yığınının nasıl bir podcast'e dönüştüğünü dinle.</p></div>
    <div class="kart gir gir-3" style="margin-bottom:18px;"><div class="kart-ic" style="padding:22px;">
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px;">
        <div style="width:52px;height:52px;border-radius:50%;background:rgba(34,197,94,.15);display:flex;align-items:center;justify-content:center;font-size:26px;">🎙️</div>
        <div><div class="h3" style="font-size:16px;">Sesli Özet</div><div class="kucuk">2 sunucu · senin belgelerinden</div></div>
      </div>
      <div style="display:flex;align-items:center;gap:3px;height:40px;justify-content:center;">
        ${Array.from({length:32}).map((_,i)=>`<span class="nabiz" style="width:4px;height:${10+Math.abs(Math.sin(i*0.6))*28}px;background:#22C55E;border-radius:2px;animation-delay:${i*0.05}s;opacity:.7;"></span>`).join("")}
      </div>
      <div class="kucuk" style="text-align:center;margin-top:14px;">▶ Eğitmen projeksiyondan çalıyor</div>
    </div></div>
    <div class="gb gir gir-4"><b>Neden bu kadar etkili?</b> Çünkü en sıkıcı dokümanı bile, dinlenebilir bir sohbete çeviriyor. Yolda, işe giderken eğitim materyalini "dinleyebilirsin".</div>
  </div></div>`);
}

// ---- ÖĞREN: iş akışı zincirleme mantığı ----
function akisOgrenEkran(){
  ekran(`<div style="flex:1;padding:24px 0;"><div class="kapsul">
    <div class="merkez"><div class="pill gir" style="margin-bottom:18px;">ZİNCİRLEME</div>
      <h2 class="h2 gir gir-1" style="margin-bottom:10px;">Asıl güç: araçları bağlamak</h2>
      <p class="govde gir gir-2" style="max-width:380px;margin-bottom:26px;">Tek bir araç güçlüdür. Ama gerçek verimlilik, bir işin <b style="color:var(--beyaz)">araçtan araca aktığı</b> bir hat kurduğunda doğar.</p></div>
    <div class="gir gir-3" style="display:flex;flex-direction:column;gap:0;">
      ${[["📚","Kaynak topla","NotebookLM ile belgelerden kaynaklı özet"],["✍️","Metne dök","Claude ile özeti istenen tona/biçime çevir"],["🎬","Görselleştir","Veo 3 ile kısa bir tanıtım videosu"]].map((a,i,arr)=>`
        <div class="kart" style="margin-bottom:0;"><div class="kart-ic" style="padding:16px;display:flex;gap:14px;align-items:center;">
          <div style="width:40px;height:40px;border-radius:11px;background:var(--zemin-3);display:flex;align-items:center;justify-content:center;font-size:20px;">${a[0]}</div>
          <div style="flex:1;"><div class="h3" style="font-size:15px;">${a[1]}</div><div class="kucuk">${a[2]}</div></div>
        </div></div>
        ${i<arr.length-1?`<div style="text-align:center;color:var(--kirmizi-parlak);font-size:20px;padding:4px 0;">↓</div>`:""}
      `).join("")}
    </div>
    <div class="gb gir gir-4" style="margin-top:18px;">Birazdan, kendi işine ait bir akışın adımlarını <b>doğru sıraya</b> dizeceksin.</div>
  </div></div>`);
}

// ---- ÖĞREN: etik kart ----
function etikKartEkran(){
  const kurallar=[
    ["🔍","Doğrula","AI emin görünse de yanılabilir. Önemli her şeyi kontrol et."],
    ["🔒","Gizliliğe dikkat","Müşteri verisi, kimlik no, gizli belge — düşünmeden yapıştırma."],
    ["✍️","Son söz sende","AI taslak verir; kararı ve sorumluluğu sen taşırsın."],
    ["💬","Şeffaf ol","Gerektiğinde 'bunda AI'dan yararlandım' demekten çekinme."],
  ];
  ekran(`<div style="flex:1;padding:24px 0;"><div class="kapsul">
    <div class="merkez"><div class="pill gir" style="margin-bottom:18px;">4 ALTIN KURAL</div>
      <h2 class="h2 gir gir-1" style="margin-bottom:24px;">Sorumlu kullanım</h2></div>
    ${kurallar.map((k,i)=>`<div class="kart gir gir-${i+1}" style="margin-bottom:12px;"><div class="kart-ic" style="padding:18px;display:flex;gap:14px;align-items:flex-start;">
      <div style="font-size:26px;">${k[0]}</div>
      <div><div class="h3" style="font-size:16px;margin-bottom:4px;">${k[1]}</div><p class="govde" style="font-size:14px;">${k[2]}</p></div>
    </div></div>`).join("")}
  </div></div>`);
}

// ---- ANLATIM SLAYDI (eğitmen bundan anlatır, ekran dolu durur) ----
function anlatimSlaytEkran(b){
  const s = window.anlatimSlayt(b.slayt);
  if(!s) return bekleEkran("Eğitmen anlatıyor.","Anlatım");
  const maddeler = s.maddeler.map((m,i)=>`
    <div class="kart gir gir-${i+2}" style="margin-bottom:11px;"><div class="kart-ic" style="padding:18px;display:flex;gap:15px;align-items:flex-start;">
      <div style="font-size:30px;line-height:1;">${m[0]}</div>
      <div><div class="h3" style="font-size:16px;margin-bottom:3px;">${m[1]}</div><p class="govde" style="font-size:14px;">${m[2]}</p></div>
    </div></div>`).join("");
  ekran(`<div style="flex:1;padding:24px 0;"><div class="kapsul">
    <div class="merkez"><div class="pill gir" style="margin-bottom:18px;">${s.rozet}</div>
      <h1 class="h1 gir gir-1" style="margin-bottom:14px;max-width:520px;">${s.baslik}</h1>
      <p class="govde gir gir-1" style="max-width:480px;margin-bottom:26px;font-size:16.5px;">${s.govde}</p></div>
    ${maddeler}
    <div class="gir" style="text-align:center;margin-top:14px;color:var(--gri-3);font-size:13px;">Eğitmen anlatıyor — hazır olunca devam edeceğiz</div>
  </div></div>`);
}
