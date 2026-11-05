(() => {
  const brands = [
    {name:"Yonex",slug:"yonex",palette:["#e3edd8","#79a13e","#17211e","#c5df62"],products:[
      ["Yonex ASTROX 77 PRO","Rackets",8990,"PLAYER PICK","racket",["#17211e","#c5df62"]],
      ["Yonex NANOFLARE 700 TOUR","Rackets",8290,"FAST HANDLING","racket",["#17211e","#a9c7e5"]],
      ["Yonex Aerosensa 10 Feather Shuttles · 12","Shuttlecocks",1190,"TOURNAMENT FEEL","shuttle",["#faf9ef","#c5df62"]],
      ["Yonex POWER CUSHION 88 DIAL UNISEX","Shoes",5890,"COURT READY","shoe",["#17211e","#c5df62"]],
      ["Yonex BG65 Titanium String · 10 m","Strings",350,"ALL-ROUND","spool",["#faf9ef","#8aa743"]],
      ["Yonex AEROBITE BOOST String Set · 10.5 m","Strings",3290,"PLAYER PICK","spool",["#17211e","#e9584b"]],
      ["Yonex CREW NECK SHIRT · 10716","Apparel",1490,"QUICK DRY","jersey",["#17211e","#c5df62"]],
      ["Yonex KNIT SHORTS · 15242","Apparel",1190,"COURT ESSENTIAL","shorts",["#17211e","#a9c7e5"]],
      ["Yonex Pro Racquet Bag 6 · BAG92426","Accessories",4290,"EXTRA CAPACITY","bag",["#17211e","#c5df62"]],
      ["Yonex EXCEL CORE GRIP · AC126","Accessories",390,"PLAYER PICK","grip",["#faf9ef","#79a13e"]],
      ["Yonex Mavis 350 Nylon Shuttles · 6","Shuttlecocks",690,"PRACTICE READY","shuttle",["#faf9ef","#b4c85a"]],
      ["Yonex POWER CUSHION ECLIPSION 3 MEN","Shoes",7190,"STABILITY SERIES","shoe",["#17211e","#8cad42"]],
      ["Yonex CREW NECK SHIRT · 20948","Apparel",1890,"PLAYER EDITION","jersey",["#17211e","#f4f3e7"]],
      ["Yonex AC541 Soft Racket Cover","Accessories",890,"COURT ESSENTIAL","bag",["#17211e","#c5df62"]],
      ["Yonex SYNTHETIC LEATHER EXCEL PRO GRIP · AC128","Accessories",450,"DRY FEEL","grip",["#faf9ef","#88a546"]]
    ]},
    {name:"Victor",slug:"victor",palette:["#f5e1dd","#dc3d42","#21282d","#f0b5ac"],products:[
      ["Victor THRUSTER RYUGA III CQ","Rackets",7790,"POWER SERIES","racket",["#21282d","#e84948"]],
      ["Victor ARS-100X ULTRA Q","Rackets",8190,"SPEED SERIES","racket",["#21282d","#9cc9d9"]],
      ["Victor Master Ace Feather Shuttles · 12","Shuttlecocks",1290,"TOURNAMENT FEEL","shuttle",["#faf9ef","#e84948"]],
      ["Victor P9200cXLTD X Shoes","Shoes",5490,"COURT READY","shoe",["#21282d","#e84948"]],
      ["Victor VBS-66N Control String · 10 m","Strings",390,"PRECISE FEEL","spool",["#faf9ef","#e84948"]],
      ["Victor VBS-70 RL String Reel · 200 m","Strings",2990,"POWER SERIES","spool",["#21282d","#f0b5ac"]],
      ["Victor x Street Fighter Knitted T-shirt T-2601STF","Apparel",1290,"QUICK DRY","jersey",["#21282d","#e84948"]],
      ["Victor Zswing Collection 2.0 Knitted Shorts R-602ZSW","Apparel",990,"COURT ESSENTIAL","shorts",["#21282d","#9cc9d9"]],
      ["Victor x Street Fighter Rectangular Racket Bag BR5659STFB","Accessories",3190,"EXTRA CAPACITY","bag",["#21282d","#e84948"]],
      ["Victor GR262 Grip Wrap · 3 Pack","Accessories",290,"PLAYER PICK","grip",["#faf9ef","#dc3d42"]],
      ["Victor x Street Fighter NCS Max Synthetic Shuttlecock","Shuttlecocks",590,"PRACTICE READY","shuttle",["#faf9ef","#e84948"]],
      ["Victor P9200cX A/DX Shoes","Shoes",6290,"STABILITY SERIES","shoe",["#21282d","#e84948"]],
      ["Victor BWF World Junior Championships Knitted T-shirt","Apparel",1790,"PLAYER EDITION","jersey",["#21282d","#f0b5ac"]],
      ["Victor x Street Fighter Rectangular Racket Bag BR5637STFJ","Accessories",790,"COURT ESSENTIAL","bag",["#21282d","#e84948"]],
      ["Victor x Butterbear Overgrip GR221BTB","Accessories",350,"CUSHION FEEL","grip",["#faf9ef","#dc3d42"]]
    ]},
    {name:"Li-Ning",slug:"li-ning",palette:["#f4e3db","#e45b36","#202b42","#f1b33c"],products:[
      ["Li-Ning Axforce 80 Power 4U","Rackets",9590,"ATTACK SERIES","racket",["#202b42","#ef603b"]],
      ["Li-Ning Windstorm 72 Speed · 72 g","Rackets",7290,"ULTRA LIGHT","racket",["#202b42","#f1b33c"]],
      ["Li-Ning A+300 Feather Shuttles · 12","Shuttlecocks",1290,"TOURNAMENT FEEL","shuttle",["#faf9ef","#ef603b"]],
      ["Li-Ning Hypersonic III Shoes","Shoes",4290,"COURT READY","shoe",["#202b42","#ef603b"]],
      ["Li-Ning No.1 Boost String · 10 m","Strings",650,"REPULSION","spool",["#faf9ef","#ef603b"]],
      ["Li-Ning No. 5 String · 10 m","Strings",2790,"PRECISE FEEL","spool",["#202b42","#f1b33c"]],
      ["Li-Ning Slash Round Neck T-shirt","Apparel",1590,"QUICK DRY","jersey",["#202b42","#ef603b"]],
      ["Li-Ning Men's Shorts","Apparel",1190,"COURT ESSENTIAL","shorts",["#202b42","#f1b33c"]],
      ["Li-Ning Badminton Racket Bag Limited · 9 in 1","Accessories",3690,"EXTRA CAPACITY","bag",["#202b42","#ef603b"]],
      ["Li-Ning Overgrip Glue · Box of 10","Accessories",320,"PLAYER PICK","grip",["#faf9ef","#e45b36"]],
      ["Li-Ning A+300 Feather Shuttles · 12","Shuttlecocks",550,"PRACTICE READY","shuttle",["#faf9ef","#ef603b"]],
      ["Li-Ning Aero Lite II Shoes","Shoes",4990,"STABILITY SERIES","shoe",["#202b42","#f1b33c"]],
      ["Li-Ning AAYP071 Sudirman Cup Edition T-shirt","Apparel",1890,"PLAYER EDITION","jersey",["#202b42","#ef603b"]],
      ["Li-Ning Beijing-Tokyo Limited Racket Bag · 9 in 1","Accessories",850,"COURT ESSENTIAL","bag",["#202b42","#f1b33c"]],
      ["Li-Ning AXJQ008 Perforated Overgrip · Box of 10","Accessories",390,"CUSHION FEEL","grip",["#faf9ef","#e45b36"]]
    ]},
    {name:"Babolat",slug:"babolat",palette:["#f2efd0","#d3b92b","#202321","#e4d96e"],products:[
      ["Babolat X-Feel Origin Strung","Rackets",5890,"POWER SERIES","racket",["#202321","#e0c530"]],
      ["Babolat Satelite Rise Strung","Rackets",6290,"FAST HANDLING","racket",["#202321","#e6e2c7"]],
      ["Babolat Hybrid Challenge Feather Shuttles · 12","Shuttlecocks",1090,"TOURNAMENT FEEL","shuttle",["#faf9ef","#d3b92b"]],
      ["Babolat Shadow Tour 5 Men Shoes","Shoes",4990,"COURT READY","shoe",["#202321","#d3b92b"]],
      ["Babolat I Feel 68 String · 10.2 m","Strings",390,"REPULSION","spool",["#faf9ef","#d3b92b"]],
      ["Babolat iFeel 70 Durability Reel · 200 m","Strings",2690,"DURABILITY","spool",["#202321","#e6e2c7"]],
      ["Babolat Exercise Graphic Tee Men","Apparel",1390,"QUICK DRY","jersey",["#202321","#d3b92b"]],
      ["Babolat Play Short Men","Apparel",990,"COURT ESSENTIAL","shorts",["#202321","#e6e2c7"]],
      ["Babolat Backrack 3 Bag","Accessories",3490,"EXTRA CAPACITY","bag",["#202321","#d3b92b"]],
      ["Babolat Grip Sensation X2","Accessories",350,"PLAYER PICK","grip",["#faf9ef","#d3b92b"]],
      ["Babolat Nylon Tournament Shuttlecock","Shuttlecocks",620,"PRACTICE READY","shuttle",["#faf9ef","#d3b92b"]],
      ["Babolat Shadow Spirit 2 Men Shoes","Shoes",4290,"STABILITY SERIES","shoe",["#202321","#d3b92b"]],
      ["Babolat Play Crew Neck Tee Men","Apparel",1690,"PLAYER EDITION","jersey",["#202321","#e4d96e"]],
      ["Babolat Cross Pro Badminton Bag","Accessories",790,"COURT ESSENTIAL","bag",["#202321","#d3b92b"]],
      ["Babolat Syntec Pro Grip","Accessories",420,"CUSHION FEEL","grip",["#faf9ef","#d3b92b"]]
    ]},
    {name:"Kawasaki",slug:"kawasaki",palette:["#dcebe2","#328b59","#1d2933","#a9d8b8"],products:[
      ["Kawasaki SPIDER KING 306 Racket","Rackets",5290,"ATTACK SERIES","racket",["#1d2933","#42a86c"]],
      ["Kawasaki MASTER MAO 20 Purple Racket","Rackets",4790,"FAST HANDLING","racket",["#1d2933","#a9d8b8"]],
      ["Kawasaki King 8E Feather Shuttles · 12","Shuttlecocks",990,"TOURNAMENT FEEL","shuttle",["#faf9ef","#42a86c"]],
      ["Kawasaki K-565 JuFeng Shoes","Shoes",3590,"COURT READY","shoe",["#1d2933","#42a86c"]],
      ["Kawasaki KSB-65 Ti String · 10 m","Strings",320,"PRECISE FEEL","spool",["#faf9ef","#328b59"]],
      ["Kawasaki KSB-68 String Reel · 200 m","Strings",2390,"POWER SERIES","spool",["#1d2933","#a9d8b8"]],
      ["Kawasaki K1C02-C1010 T-shirt","Apparel",1190,"QUICK DRY","jersey",["#1d2933","#42a86c"]],
      ["Kawasaki K1C10-A3693-1 Shorts","Apparel",890,"COURT ESSENTIAL","shorts",["#1d2933","#a9d8b8"]],
      ["Kawasaki K1G00-C8903 Racket Bag","Accessories",2890,"EXTRA CAPACITY","bag",["#1d2933","#42a86c"]],
      ["Kawasaki K-001 Racket Grips · 5 Pack","Accessories",250,"PLAYER PICK","grip",["#faf9ef","#328b59"]],
      ["Kawasaki N350 Nylon Shuttles · 6","Shuttlecocks",490,"PRACTICE READY","shuttle",["#faf9ef","#42a86c"]],
      ["Kawasaki K1B30-C32020 Badminton Shoes","Shoes",4290,"STABILITY SERIES","shoe",["#1d2933","#a9d8b8"]],
      ["Kawasaki K1C02-C1031 T-shirt","Apparel",1590,"PLAYER EDITION","jersey",["#1d2933","#42a86c"]],
      ["Kawasaki K1G00-C8905 Racket Bag","Accessories",690,"COURT ESSENTIAL","bag",["#1d2933","#a9d8b8"]],
      ["Kawasaki X5II Racket Grips · 5 Pack","Accessories",290,"CUSHION FEEL","grip",["#faf9ef","#328b59"]]
    ]}
  ];

  const xml = (value) => String(value).replace(/[&<>"']/g,(character) => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&apos;"
  })[character]);

  function illustration(type,primary,accent,dark,variant) {
    const tilt = [-12,-6,4,10][variant % 4];
    if (type === "racket") return `<g transform="rotate(${tilt} 350 330)"><ellipse cx="350" cy="228" rx="100" ry="152" fill="#fff" fill-opacity=".72" stroke="${primary}" stroke-width="15"/><ellipse cx="350" cy="228" rx="86" ry="137" fill="none" stroke="${accent}" stroke-width="2"/>${[-56,-28,0,28,56].map((x) => `<path d="M${350+x} 95v268" stroke="${primary}" stroke-opacity=".42" stroke-width="2"/>`).join("")}${[-85,-50,-15,20,55,90].map((y) => `<path d="M265 ${228+y}h170" stroke="${primary}" stroke-opacity=".42" stroke-width="2"/>`).join("")}<path d="M350 379v158" stroke="${dark}" stroke-width="18" stroke-linecap="round"/><path d="M350 468v67" stroke="${accent}" stroke-width="22" stroke-linecap="round"/></g>`;
    if (type === "shuttle") return `<g transform="rotate(${tilt} 350 320)"><path d="M280 344 235 151Q350 73 465 151l-45 193Z" fill="#fff" stroke="${primary}" stroke-width="8"/>${[-2,-1,0,1,2].map((offset) => `<path d="M350 335 235 ${151+offset*9}M350 335 465 ${151+offset*9}" stroke="${accent}" stroke-width="5" opacity=".8"/>`).join("")}<path d="M285 337q65-20 130 0l-19 92q-46 39-92 0Z" fill="${accent}" stroke="${primary}" stroke-width="8"/><path d="M303 351q47-14 94 0" fill="none" stroke="#fff" stroke-width="6" opacity=".8"/></g>`;
    if (type === "shoe") return `<g transform="rotate(${tilt} 350 330)"><path d="M102 357q75 2 122-44l80-123q20-28 48-5l58 76q37 44 112 57 57 10 75 54l-14 49H138q-45-10-36-64Z" fill="#fff" stroke="${primary}" stroke-width="12" stroke-linejoin="round"/><path d="m304 217 73 78q34 31 120 51" fill="none" stroke="${accent}" stroke-width="19" stroke-linecap="round"/><path d="M125 415h470" stroke="${primary}" stroke-width="16" stroke-linecap="round"/>${[0,1,2].map((i) => `<path d="m${310+i*30} ${250+i*17} 48 10" stroke="${primary}" stroke-width="7" stroke-linecap="round"/>`).join("")}</g>`;
    if (type === "spool") return `<g transform="rotate(${tilt} 350 320)"><ellipse cx="350" cy="331" rx="173" ry="130" fill="${primary}"/><ellipse cx="350" cy="316" rx="158" ry="118" fill="${accent}"/><ellipse cx="350" cy="301" rx="142" ry="106" fill="#fff" stroke="${primary}" stroke-width="9"/><ellipse cx="350" cy="301" rx="67" ry="50" fill="${dark}"/><ellipse cx="350" cy="301" rx="45" ry="33" fill="#f3f4ed"/><path d="M212 279q138-95 276 0M207 306q143-94 286 0M218 336q132-88 264 0" fill="none" stroke="${accent}" stroke-width="6" opacity=".8"/></g>`;
    if (type === "jersey") return `<g transform="rotate(${tilt} 350 330)"><path d="m260 145 90 44 90-44 111 70-56 91-50-26v178H255V280l-50 26-56-91Z" fill="#fff" stroke="${primary}" stroke-width="12" stroke-linejoin="round"/><path d="m260 145 90 44 90-44-31 87H291Z" fill="${accent}"/><path d="M350 193v260" stroke="${primary}" stroke-opacity=".18" stroke-width="8"/><path d="M251 334h198" stroke="${accent}" stroke-width="17" opacity=".8"/></g>`;
    if (type === "shorts") return `<g transform="rotate(${tilt} 350 330)"><path d="M205 160h290l-14 102 49 223H375l-25-158-25 158H165l49-223Z" fill="${dark}" stroke="${primary}" stroke-width="12" stroke-linejoin="round"/><path d="M205 160h290l-7 54H212Z" fill="${accent}"/><path d="M350 218v110" stroke="${primary}" stroke-width="9"/><path d="M183 431h170M374 431h135" stroke="#fff" stroke-opacity=".75" stroke-width="9"/></g>`;
    if (type === "bag") return `<g transform="rotate(${tilt} 350 330)"><path d="M158 229q0-34 34-34h316q34 0 34 34v230q0 34-34 34H192q-34 0-34-34Z" fill="${dark}" stroke="${primary}" stroke-width="12"/><path d="M246 202q0-94 104-94t104 94" fill="none" stroke="${accent}" stroke-width="19"/><path d="M162 315h376" stroke="${accent}" stroke-width="16"/><path d="M293 318v171" stroke="#fff" stroke-opacity=".45" stroke-width="7"/><rect x="337" y="346" width="93" height="66" rx="9" fill="${primary}"/><path d="M196 455q38-55 82 0M423 455q39-55 82 0" fill="none" stroke="#fff" stroke-width="8" opacity=".7"/></g>`;
    return `<g transform="rotate(${tilt} 350 330)"><rect x="188" y="236" width="324" height="186" rx="84" fill="${primary}"/><rect x="211" y="250" width="278" height="158" rx="72" fill="${accent}"/><ellipse cx="350" cy="329" rx="62" ry="56" fill="#fff"/><ellipse cx="350" cy="329" rx="36" ry="32" fill="${dark}"/><path d="M204 292h62M434 373h62" stroke="#fff" stroke-width="12" stroke-linecap="round" opacity=".85"/></g>`;
  }

  const productPhotoReferences = {
    "yonex-racket-01":{image:"https://www.yonex.com/media/catalog/product/a/x/ax77-p_.png?quality=80&bg-color=248,248,248,0.75&fit=bounds&height=300&width=240&canvas=240:300",label:"Yonex ASTROX 77 PRO",credit:"Yonex · ASTROX 77 PRO",page:"https://www.yonex.com/badminton/racquets/astrox-77-pro",exactMatch:true},
    "yonex-racket-02":{image:"https://www.yonex.com/media/catalog/product/a/l/all_2nf-700t_343-1.jpg?quality=80&bg-color=248,248,248,0.75&fit=bounds&height=300&width=240&canvas=240:300",label:"Yonex NANOFLARE 700 TOUR",credit:"Yonex · NANOFLARE 700 TOUR",page:"https://www.yonex.com/badminton/racquets/2nf-700t",exactMatch:true},
    "yonex-shuttle-03":{image:"https://www.yonex.com/media/catalog/product/a/e/aerosensa_10.png?quality=80&bg-color=248,248,248,0.75&fit=bounds&height=300&width=240&canvas=240:300",label:"Yonex AEROSENSA 10 shuttlecocks",credit:"Yonex · AEROSENSA 10",page:"https://www.yonex.com/badminton/shuttlecocks/aerosensa-10",exactMatch:true},
    "yonex-shoe-04":{image:"https://www.yonex.com/media/catalog/product/a/l/all_shb88d3_615-1.jpg?quality=80&bg-color=248,248,248,0.75&fit=bounds&height=265&width=265&canvas=265:265",label:"Yonex POWER CUSHION 88 DIAL UNISEX",credit:"Yonex · POWER CUSHION 88 DIAL",page:"https://www.yonex.com/power-cushion-88-dial-unisex",exactMatch:true},
    "yonex-bag-09":{image:"https://cdn.shopify.com/s/files/1/1238/5608/files/Yonex_92426_Badminton_Bag.webp?v=1716582606",label:"Yonex Pro Racquet Bag 6 · BAG92426",credit:"Yonex Pro Bag BAG92426 · Badminton Warehouse",page:"https://www.badmintonwarehouse.com/products/yonex-92426-pro-badminton-tennis-bag-6-racket",exactMatch:true},
    "yonex-spool-05":{image:"https://www.yonex.com/media/catalog/product/b/g/bg65ti_ex_pac_221006.png?quality=80&bg-color=248,248,248,0.75&fit=bounds&height=300&width=240&canvas=240:300",label:"Yonex BG65 TITANIUM string",credit:"Yonex · BG65 TITANIUM",page:"https://www.yonex.com/badminton/strings/bg65ti",exactMatch:true},
    "yonex-spool-06":{image:"https://www.yonex.com/media/catalog/product/b/g/bgabbt_661_ex_pac_1.png?quality=80&bg-color=248,248,248,0.75&fit=bounds&height=300&width=240&canvas=240:300",label:"Yonex AEROBITE BOOST string set · 10.5 m",credit:"Yonex · AEROBITE BOOST",page:"https://www.yonex.com/badminton/strings/bgabbt",exactMatch:true},
    "yonex-jersey-07":{image:"https://www.yonex.com/media/catalog/product/a/l/all_10716_224-1.jpg?quality=80&bg-color=248,248,248,0.75&fit=bounds&height=300&width=240&canvas=240:300",label:"Yonex CREW NECK SHIRT · 10716",credit:"Yonex · CREW NECK SHIRT 10716",page:"https://www.yonex.com/badminton/apparel/men-s/tournament/10716",exactMatch:true},
    "yonex-shorts-08":{image:"https://www.yonex.com/media/catalog/product/a/l/all_15242_322-1.jpg?quality=80&bg-color=248,248,248,0.75&fit=bounds&height=300&width=240&canvas=240:300",label:"Yonex KNIT SHORTS · 15242",credit:"Yonex · KNIT SHORTS 15242",page:"https://www.yonex.com/badminton/apparel/men-s/tournament/15242",exactMatch:true},
    "yonex-grip-10":{image:"https://www.yonex.com/media/catalog/product/a/c/ac126.png?quality=80&bg-color=248,248,248,0.75&fit=bounds&height=300&width=240&canvas=240:300",label:"Yonex EXCEL CORE GRIP · AC126",credit:"Yonex · EXCEL CORE GRIP AC126",page:"https://www.yonex.com/badminton/accessories/replacement-grips/ac126",exactMatch:true},
    "yonex-shuttle-11":{image:"https://www.yonex.com/media/catalog/product/m/a/mavis350_1.png?quality=80&bg-color=248,248,248,0.75&fit=bounds&height=300&width=240&canvas=240:300",label:"Yonex MAVIS 350 nylon shuttlecocks",credit:"Yonex · MAVIS 350",page:"https://www.yonex.com/badminton/shuttlecocks/m-350",exactMatch:true},
    "yonex-shoe-12":{image:"https://www.yonex.com/media/catalog/product/s/h/shte3mac_188_1.png?quality=80&bg-color=248,248,248,0.75&fit=bounds&height=300&width=240&canvas=240:300",label:"Yonex POWER CUSHION ECLIPSION 3 MEN",credit:"Yonex · POWER CUSHION ECLIPSION 3",page:"https://www.yonex.com/power-cushion-eclipsion-3",exactMatch:true},
    "yonex-jersey-13":{image:"https://www.yonex.com/media/catalog/product/a/l/all_20948_224-1.jpg?quality=80&bg-color=248,248,248,0.75&fit=bounds&height=300&width=240&canvas=240:300",label:"Yonex CREW NECK SHIRT · 20948",credit:"Yonex · CREW NECK SHIRT 20948",page:"https://www.yonex.com/badminton/apparel/women-s/women-s-tournament/20948",exactMatch:true},
    "yonex-grip-15":{image:"https://www.yonex.com/media/catalog/product/a/c/ac128_w_1.png?quality=80&bg-color=248,248,248,0.75&fit=bounds&height=300&width=240&canvas=240:300",label:"Yonex SYNTHETIC LEATHER EXCEL PRO GRIP · AC128",credit:"Yonex · EXCEL PRO GRIP AC128",page:"https://www.yonex.com/badminton/accessories/replacement-grips/ac128",exactMatch:true},
    "yonex-bag-14":{image:"https://www.badmintonwarehouse.com/cdn/shop/files/yonex-ac-541-blue-soft-racket-cover_406x406.webp?v=1736442895",label:"Yonex AC541 Soft Racket Cover",credit:"Yonex AC541 · Badminton Warehouse",page:"https://www.badmintonwarehouse.com/products/yonex-ac541-red-soft-racket-cover-stylish-protection-for-your-racket",exactMatch:true},
    "victor-racket-01":{image:"https://dkjulgymkya8y.cloudfront.net/images/5a0e2fbc-34d9-416f-a758-eb5f416738de.webp",label:"Victor THRUSTER RYUGA III CQ",credit:"Victor · THRUSTER RYUGA III CQ",page:"https://www.victorsport.com/product/tk-ryugaiiicq",exactMatch:true},
    "victor-racket-02":{image:"https://dkjulgymkya8y.cloudfront.net/victor/en_us/product-127207_0_20241209105848.webp",label:"Victor ARS-100X ULTRA Q",credit:"Victor · ARS-100X ULTRA Q",page:"https://www.victorsport.com/product/hsbc-bwf-world-tour-finals-2024-racket-ars-100x-ultra-q",exactMatch:true},
    "victor-shuttle-03":{image:"https://dkjulgymkya8y.cloudfront.net/victor/en_us/product-1451_0_20230419163841.webp",label:"Victor MASTER ACE goose-feather shuttlecocks",credit:"Victor · MASTER ACE",page:"https://www.victorsport.com/product/master-ace",exactMatch:true},
    "victor-shoe-04":{image:"https://dkjulgymkya8y.cloudfront.net/images/68fb6519-ff61-4280-802a-8abc99c6578e.webp",label:"Victor P9200cXLTD X shoes",credit:"Victor · P9200cXLTD X",page:"https://www.victorsport.com/product/p9200cxltdx",exactMatch:true},
    "victor-spool-05":{image:"https://dkjulgymkya8y.cloudfront.net/images/bac3d5c3-864b-471a-a3e3-edf42d95cd34.webp",label:"Victor VBS-66N badminton string",credit:"Victor · VBS-66N",page:"https://www.victorsport.com/product/vbs-66n",exactMatch:true},
    "victor-spool-06":{image:"https://dkjulgymkya8y.cloudfront.net/images/496b14ce-d6c6-4dfe-aa14-ae688adbfb89.webp",label:"Victor VBS-70 RL string",credit:"Victor · VBS-70 RL",page:"https://www.victorsport.com/product/vbs-70rl",exactMatch:true},
    "victor-jersey-07":{image:"https://dkjulgymkya8y.cloudfront.net/images/f873d862-2892-4d56-b7df-b3044c06d6e0.webp",label:"Victor x Street Fighter knitted T-shirt",credit:"Victor · Street Fighter Knitted T-shirt",page:"https://www.victorsport.com/product/victorxstreetfightercollectionknittedt-shirtt-2601stfac",exactMatch:true},
    "victor-shorts-08":{image:"https://dkjulgymkya8y.cloudfront.net/images/75c66cbf-e61b-4020-af46-15f51b0000c5.webp",label:"Victor Zswing Collection 2.0 knitted shorts",credit:"Victor · Zswing knitted shorts",page:"https://www.victorsport.com/product/zswingcollection20knittedshortsr-602zswja",exactMatch:true},
    "victor-bag-09":{image:"https://dkjulgymkya8y.cloudfront.net/images/a9619c4b-5c2a-4a52-a9a7-f541751e49ff.webp",label:"Victor x Street Fighter rectangular racket bag",credit:"Victor · Street Fighter racket bag",page:"https://www.victorsport.com/product/victorxstreetfightercollectionrectangularracketbagbr5659stfb",exactMatch:true},
    "victor-grip-10":{image:"https://dkjulgymkya8y.cloudfront.net/victor/en_us/product-2014121216590334758.webp",label:"Victor GR262-3 overgrip",credit:"Victor · GR262-3",page:"https://www.victorsport.com/product/gr262-3-acdejrpyz",exactMatch:true},
    "victor-shuttle-11":{image:"https://dkjulgymkya8y.cloudfront.net/images/b3f04cb4-5a70-47d2-a417-fb6dad8811e2.webp",label:"Victor x Street Fighter NCS Max synthetic shuttlecock",credit:"Victor · NCS Max synthetic shuttlecock",page:"https://www.victorsport.com/product/victorxstreetfightercollectionsyntheticshuttlecockncsmax_stfbd2",exactMatch:true},
    "victor-shoe-12":{image:"https://dkjulgymkya8y.cloudfront.net/images/7378479a-21a9-4302-a1b8-33c4a35b598e.webp",label:"Victor P9200cX A/DX shoes",credit:"Victor · P9200cX A/DX",page:"https://www.victorsport.com/product/p9200cxadx",exactMatch:true},
    "victor-jersey-13":{image:"https://dkjulgymkya8y.cloudfront.net/images/4093aba8-39fd-42c5-b083-ec5c339b6d64.webp",label:"Victor BWF World Junior Championships knitted T-shirt",credit:"Victor · BWF World Junior Championships T-shirt",page:"https://www.victorsport.com/product/victorbwfworldjuniorchampionships2026knittedt-shirtt-2601wjcg",exactMatch:true},
    "victor-bag-14":{image:"https://dkjulgymkya8y.cloudfront.net/images/6ed75fb7-57d2-4f3b-b782-16137e2101fc.webp",label:"Victor x Street Fighter rectangular racket bag",credit:"Victor · Street Fighter racket bag",page:"https://www.victorsport.com/product/victorxstreetfightercollectionrectangularracketbagbr5637stfj",exactMatch:true},
    "victor-grip-15":{image:"https://dkjulgymkya8y.cloudfront.net/images/7790cfaf-6561-4fd5-9bf6-eed0f77f33cc.webp",label:"Victor x Butterbear overgrip",credit:"Victor · Butterbear overgrip",page:"https://www.victorsport.com/product/victorxbutterbearovergripgr221btbwe",exactMatch:true},
    "li-ning-racket-01":{image:"https://li-ning.co.uk/wp-content/uploads/2022/04/axforce-80-4u-84-grams.jpg.jpg",label:"Li-Ning AxForce 80 badminton racket · 4U",credit:"Li-Ning UK · AxForce 80 (4U)",page:"https://li-ning.co.uk/product/li-ning-axforce-80/",exactMatch:true},
    "li-ning-racket-02":{image:"https://li-ning.co.uk/wp-content/uploads/2025/12/template_02_2cac2c6bae.jpg.webp",label:"Li-Ning Windstorm 72 Speed badminton racket · 72 g",credit:"Li-Ning UK · Windstorm 72 Speed",page:"https://li-ning.co.uk/product/li-ning-windstorm-72-speed/",exactMatch:true},
    "li-ning-shuttle-03":{image:"https://li-ning.co.uk/wp-content/uploads/2022/04/a-300-1-670x670.jpeg",label:"Li-Ning A+300 feather shuttlecocks · 12 in 1",credit:"Li-Ning UK · A+ 300 feather shuttlecock",page:"https://li-ning.co.uk/product/li-ning-a-300-shuttlecock/",exactMatch:true},
    "li-ning-spool-06":{image:"https://li-ning.co.uk/wp-content/uploads/2022/04/no-5-string-white-1-670x656.jpeg",label:"Li-Ning No. 5 badminton string · 10 m",credit:"Li-Ning UK · No. 5 String (10 m)",page:"https://li-ning.co.uk/product/li-ning-no-5-string/",exactMatch:true},
    "li-ning-shorts-08":{image:"https://li-ning.co.uk/wp-content/uploads/2022/04/1075154019.jpeg",label:"Li-Ning men's shorts",credit:"Li-Ning UK · Men's Shorts",page:"https://li-ning.co.uk/product/mens-shorts-black/",exactMatch:true},
    "li-ning-bag-09":{image:"https://li-ning.co.uk/wp-content/uploads/2022/04/ABJQ056-2-2-670x670.jpg",label:"Li-Ning Badminton Racket Bag Limited · 9 in 1",credit:"Li-Ning UK · Badminton Racket Bag Limited 9 in 1",page:"https://li-ning.co.uk/product/badminton-racket-bag-limited-9-in-1/",exactMatch:true},
    "li-ning-grip-10":{image:"https://li-ning.co.uk/wp-content/uploads/2022/04/axsf002-overgrip-glue-box-10er-axsf002-670x670.jpeg",label:"Li-Ning overgrip glue · box of 10",credit:"Li-Ning UK · Overgrip Glue Box of 10",page:"https://li-ning.co.uk/product/overgrip-glue-box-of-10/",exactMatch:true},
    "li-ning-shoe-04":{image:"https://sg.lining.studio/cdn/shop/files/Main_L_ef42f2f0-43ad-4db3-aca3-3d25facad4df.jpg?v=1761124615&width=3840",label:"Li-Ning Hypersonic III shoes",credit:"Li-Ning · Hypersonic III",page:"https://sg.lining.studio/products/hypersonic-iii",exactMatch:true},
    "li-ning-spool-05":{image:"https://li-ning.co.uk/wp-content/uploads/2022/04/no-1-boost-badminton-string-alpine-white-3-1-e1745576377419.jpeg",label:"Li-Ning No.1 Boost badminton string · 10 m",credit:"Li-Ning · No.1 Boost 10 m",page:"https://li-ning.co.uk/product/li-ning-no-1-repulsion-boost-badminton-string/",exactMatch:true},
    "li-ning-shuttle-11":{image:"https://li-ning.co.uk/wp-content/uploads/2022/04/a-300-670x670.jpeg",label:"Li-Ning A+ 300 feather shuttlecocks · 12 in 1",credit:"Li-Ning UK · A+ 300 feather shuttlecock",page:"https://li-ning.co.uk/product/li-ning-a-300-shuttlecock/",exactMatch:true},
    "li-ning-jersey-07":{image:"https://sg.lining.studio/cdn/shop/files/ATSSA_03_1_BLACK_01_9b3c0ab644.jpg?v=1752148558",label:"Li-Ning Slash round neck T-shirt",credit:"Li-Ning · Slash round neck T-shirt",page:"https://sg.lining.studio",exactMatch:true},
    "li-ning-shoe-12":{image:"https://sg.lining.studio/cdn/shop/files/Template_01_d3f9946e64.jpg?v=1752149489",label:"Li-Ning Aero Lite II shoes",credit:"Li-Ning · Aero Lite II",page:"https://sg.lining.studio/products/aero-lite-ii",exactMatch:true},
    "li-ning-jersey-13":{image:"https://li-ning.co.uk/wp-content/uploads/2022/04/ts_lining_aayp071_men_blanc_grand-removebg-preview-670x670.jpg",label:"Li-Ning AAYP071 Sudirman Cup Edition men's T-shirt",credit:"Li-Ning UK · AAYP071 Sudirman Cup Edition",page:"https://li-ning.co.uk/product/sudirman-cup-edn-white-t-shirt/",exactMatch:true},
    "li-ning-bag-14":{image:"https://li-ning.co.uk/wp-content/uploads/2022/04/ABJQ064-1-1-670x670.jpg",label:"Li-Ning Beijing-Tokyo Limited racket bag · 9 in 1",credit:"Li-Ning UK · Beijing-Tokyo Limited 9-in-1 racket bag",page:"https://li-ning.co.uk/product/badminton-racket-bag-beijing-tokyo-limited-9-in-1/",exactMatch:true},
    "li-ning-grip-15":{image:"https://li-ning.co.uk/wp-content/uploads/2022/04/AXJQ008-detail-670x411.jpeg",label:"Li-Ning AXJQ008 perforated overgrips · box of 10",credit:"Li-Ning UK · AXJQ008 perforated overgrip",page:"https://li-ning.co.uk/product/overgrip-perforated-box-of-10-different-colors/",exactMatch:true},
    "babolat-racket-01":{image:"https://media.babolat.com/image/upload/f_auto,q_auto,c_pad,w_252,h_252/v1738160617/Product_Media/2026/Badminton/RACQUETS/601484-X_FEEL_ORIGIN_S_NCV-100-1-Face.png",label:"Babolat X-Feel Origin Strung racket",credit:"Babolat · X-Feel Origin Strung",page:"https://www.babolat.com/gb/x-feel-origin-strung/601484.html",exactMatch:true},
    "babolat-racket-02":{image:"https://media.babolat.com/image/upload/f_auto,q_auto,c_pad,w_252,h_252/v1749114499/Product_Media/2026/Badminton/RACQUETS/601495-SATELITE_RISE_S_NC-100-1-Face.png",label:"Babolat Satelite Rise Strung racket",credit:"Babolat · Satelite Rise Strung",page:"https://www.babolat.com/gb/satelite-rise-strung/601495.html",exactMatch:true},
    "babolat-shuttle-03":{image:"https://media.babolat.com/image/upload/f_auto,q_auto,c_pad,w_252,h_252/v1781517171/Product_Media/2026/Badminton/ACCESSORIES/ARTWORK/551028-HYBRID_SHUTTLECOCK-100-1-Pack_Recto.png",label:"Babolat Hybrid Challenge shuttlecock",credit:"Babolat · Hybrid Challenge",page:"https://www.babolat.com/gb/hybrid-challenge/551028.html",exactMatch:true},
    "babolat-shoe-04":{image:"https://media.babolat.com/image/upload/f_auto,q_auto,c_pad,w_252,h_252/v1750777366/Product_Media/2026/Badminton/SHOES/30F26356B-SHADOW_TOUR_5_MEN-2053-1-Exterieur.png",label:"Babolat Shadow Tour 5 Men shoes",credit:"Babolat · Shadow Tour 5 Men",page:"https://www.babolat.com/gb/shadow-tour-5-men/2053-30F26356B.html",exactMatch:true},
    "babolat-spool-05":{image:"https://media.babolat.com/image/upload/f_auto,q_auto,c_pad,w_252,h_252/v1781513139/Product_Media/2026/Badminton/STRINGS/241128-IFEEL_68_10-2M-101-1-Pack_Recto.png",label:"Babolat I Feel 68 10.2M string",credit:"Babolat · I Feel 68",page:"https://www.babolat.com/gb/i-feel-68-10.2m/241128.html",exactMatch:true},
    "babolat-spool-06":{image:"https://media.babolat.com/image/upload/f_auto,q_auto,c_pad,w_252,h_252/v1781513134/Product_Media/2026/Badminton/STRINGS/243129-IFEEL_70-101-1-Pack_Recto_DURABILITY.png",label:"Babolat I Feel 70 200M string",credit:"Babolat · I Feel 70 200M",page:"https://www.babolat.com/gb/i-feel-70-200m/243129.html",exactMatch:true},
    "babolat-jersey-07":{image:"https://media.babolat.com/image/upload/f_auto,q_auto,c_pad,w_252,h_252/v1708077344/Product_Media/2025/Apparel/EXERCISE/4MTF017-Exercise_Graphic_Tee-6020-1-Face.png",label:"Babolat Exercise Graphic Tee Men",credit:"Babolat · Exercise Graphic Tee",page:"https://www.babolat.com/gb/exercise-graphic-tee-men/4MTF017.html",exactMatch:true},
    "babolat-shorts-08":{image:"https://media.babolat.com/image/upload/f_auto,q_auto,c_pad,w_252,h_252/v1708077934/Product_Media/2025/Apparel/PLAY/3MTF061-Play_Short-1000-1-Face.png",label:"Babolat Play Short Men",credit:"Babolat · Play Short Men",page:"https://www.babolat.com/gb/play-short-men/3MTF061.html",exactMatch:true},
    "babolat-bag-09":{image:"https://media.babolat.com/image/upload/f_auto,q_auto,c_pad,w_252,h_252/v1752063303/Product_Media/2026/Tennis/BAGS/757024-BACKRACK_3-207-1-3_4_Face.png",label:"Babolat Backrack 3 bag",credit:"Babolat · Backrack 3",page:"https://www.babolat.com/gb/backrack-3/757024.html",exactMatch:true},
    "babolat-grip-10":{image:"https://media.babolat.com/image/upload/f_auto,q_auto,c_pad,w_252,h_252/v1750777254/Product_Media/2026/Badminton/ACCESSORIES/670072-GRIP_SENSATION_X2-101-1-Pack_Recto.png",label:"Babolat Grip Sensation X2",credit:"Babolat · Grip Sensation X2",page:"https://www.babolat.com/gb/grip-sensation-x2/670072.html",exactMatch:true},
    "babolat-shuttle-11":{image:"https://media.babolat.com/image/upload/f_auto,q_auto,c_pad,w_252,h_252/v1781515796/Product_Media/2026/Badminton/ACCESSORIES/562004-TOURNAMENT-101-1-Pack_Recto.png",label:"Babolat Nylon Tournament shuttlecock",credit:"Babolat · Nylon Tournament",page:"https://www.babolat.com/gb/nylon-tournament/562004.html",exactMatch:true},
    "babolat-shoe-12":{image:"https://media.babolat.com/image/upload/f_auto,q_auto,c_pad,w_252,h_252/v1738161847/Product_Media/2026/Badminton/SHOES/3A0S26A641-SHADOW_SPIRIT_2_MEN-2052-1-Exterieur.png",label:"Babolat Shadow Spirit 2 Men shoes",credit:"Babolat · Shadow Spirit 2 Men",page:"https://www.babolat.com/gb/shadow-spirit-2-men/2052-3A0S26A641.html",exactMatch:true},
    "babolat-jersey-13":{image:"https://media.babolat.com/image/upload/f_auto,q_auto,c_pad,w_252,h_252/v1708077936/Product_Media/2025/Apparel/PLAY/3MTF011-Play_Crew_Neck_Tee-1095-1-Face.png",label:"Babolat Play Crew Neck Tee Men",credit:"Babolat · Play Crew Neck Tee",page:"https://www.babolat.com/gb/play-crew-neck-tee-men/3MTF011.html",exactMatch:true},
    "babolat-bag-14":{image:"https://media.babolat.com/image/upload/f_auto,q_auto,c_pad,w_252,h_252/v1741254504/Product_Media/2026/Badminton/BAGS/757023-CROSS_PRO-2031-1-3_4_Face.png",label:"Babolat Cross Pro badminton bag",credit:"Babolat · Cross Pro",page:"https://www.babolat.com/gb/cross-pro/757023.html",exactMatch:true},
    "babolat-grip-15":{image:"https://media.babolat.com/image/upload/f_auto,q_auto,c_pad,w_252,h_252/v1728897362/Product_Media/2024/Tennis/Grips%20Surgrips/670051-SYNTEC_PRO_X1-101-1-Pack_Recto.png",label:"Babolat Syntec Pro grip",credit:"Babolat · Syntec Pro",page:"https://www.babolat.com/gb/syntec-pro/670051.html",exactMatch:true},
    "kawasaki-racket-01":{image:"https://kawasaki-sport.eu/hpeciai/edf1190849e1ecd7eab3f26513522fec/eng_il_Badminton-racket-Kawasaki-SPIDER-KING-306.jpg",label:"Kawasaki SPIDER KING 306 racket",credit:"Kawasaki Sport Europe · SPIDER KING 306",page:"https://kawasaki-sport.eu/en/products/badminton-racket-kawasaki-spider-king-306.html",exactMatch:true},
    "kawasaki-racket-02":{image:"https://kawasaki-sport.eu/hpeciai/b9dab929f80edbbf33a660d2df49252f/eng_il_Badminton-racket-Kawasaki-MASTER-MAO-20-Purple-765.png",label:"Kawasaki MASTER MAO 20 Purple racket",credit:"Kawasaki Sport Europe · MASTER MAO 20",page:"https://kawasaki-sport.eu/kawasaki-master-mao-20-racket",exactMatch:true},
    "kawasaki-shuttle-03":{image:"https://kawasaki-sport.eu/hpeciai/79e34100df8c038e61c3f03a2e80117b/eng_pl_Shuttlecocks-Kawasaki-CLUB-8E-25_1.jpg",label:"Kawasaki King 8E goose-feather shuttlecocks · 12 pieces",credit:"Kawasaki Sport Europe · King 8E feather shuttlecocks",page:"https://kawasaki-sport.eu/en/products/shuttlecocks-kawasaki-club-8e-25.html",exactMatch:true},
    "kawasaki-shuttle-11":{image:"https://kawasaki-sport.eu/hpeciai/27f08c748883ae0369add67a01896290/eng_pl_Shuttlecocks-Kawasaki-N350-31_1.jpg",label:"Kawasaki N350 nylon shuttlecocks · 6 pieces",credit:"Kawasaki Sport Europe · N350 (6 shuttlecocks)",page:"https://kawasaki-sport.eu/en/products/shuttlecocks-kawasaki-n350-31.html",exactMatch:true},
    "kawasaki-shoe-04":{image:"https://kawasaki-sport.eu/hpeciai/685a818aad86d898a624a3c8b44cce4f/eng_il_Shoes-Kawasaki-K-565-JuFeng-series-52.jpg",label:"Kawasaki K-565 JuFeng shoes",credit:"Kawasaki Sport Europe · K-565 JuFeng",page:"https://kawasaki-sport.eu/en/products/shoes-kawasaki-k-565-jufeng-series-52.html",exactMatch:true},
    "kawasaki-spool-05":{image:"https://kawasaki-sport.eu/hpeciai/e9f636435b61b640e9a24ae917bdb2c0/eng_pm_Badminton-string-KAWASAKI-KSB-65-Ti-10m-222_1.jpg",label:"Kawasaki KSB-65 Ti string",credit:"Kawasaki Sport Europe · KSB-65 Ti",page:"https://kawasaki-sport.eu/en/products/badminton-string-kawasaki-ksb-65-ti-10m-222.html",exactMatch:true},
    "kawasaki-spool-06":{image:"https://kawasaki-sport.eu/hpeciai/6a668ac8a0c4d1ccdd07d8e6d1d5d21a/eng_il_Badminton-string-kawasaki-ksb-68-200m-92.png",label:"Kawasaki KSB-68 200m string",credit:"Kawasaki Sport Europe · KSB-68",page:"https://kawasaki-sport.eu/en/products/badminton-string-kawasaki-ksb-68-200m-92.html",exactMatch:true},
    "kawasaki-jersey-07":{image:"https://kawasaki-sport.eu/hpeciai/ce6c2aad283d6445390668701fd1961a/eng_il_T-Shirt-Kawasaki-K1C02-C1010-578.png",label:"Kawasaki K1C02-C1010 T-shirt",credit:"Kawasaki Sport Europe · K1C02-C1010",page:"https://kawasaki-sport.eu/en/products/t-shirt-kawasaki-k1c02-c1010-578.html",exactMatch:true},
    "kawasaki-shorts-08":{image:"https://kawasaki-sport.eu/hpeciai/62740b910ce7b85a7812fa375b3689b7/eng_il_Shorts-Kawasaki-K1C10-A3693-1-157.jpg",label:"Kawasaki K1C10-A3693-1 shorts",credit:"Kawasaki Sport Europe · K1C10-A3693-1",page:"https://kawasaki-sport.eu/en/products/shorts-kawasaki-k1c10-a3693-1-157.html",exactMatch:true},
    "kawasaki-bag-09":{image:"https://kawasaki-sport.eu/hpeciai/a878a45c4536c091d3015a6342e160f6/eng_il_Racquets-bag-Kawasaki-K1G00-C8903-Black-623.png",label:"Kawasaki K1G00-C8903 racket bag",credit:"Kawasaki Sport Europe · K1G00-C8903",page:"https://kawasaki-sport.eu/en/products/racquets-bag-kawasaki-k1g00-c8903-black-623.html",exactMatch:true},
    "kawasaki-grip-10":{image:"https://kawasaki-sport.eu/hpeciai/1e889bad1325132defe4e7cbd8d05617/eng_il_-5pc-Racket-grip-Kawasaki-K-001-347.jpg",label:"Kawasaki K-001 racket grips",credit:"Kawasaki Sport Europe · K-001 grips",page:"https://kawasaki-sport.eu/en/products/-5pc-racket-grip-kawasaki-k-001-347.html",exactMatch:true},
    "kawasaki-shoe-12":{image:"https://kawasaki-sport.eu/hpeciai/652a28dd20e62483329cc61d35902182/eng_il_Badminton-Shoes-Kawasaki-K1B30-C32020-631.jpg",label:"Kawasaki K1B30-C32020 badminton shoes",credit:"Kawasaki Sport Europe · K1B30-C32020",page:"https://kawasaki-sport.eu/en/products/badminton-shoes-kawasaki-k1b30-c32020-631.html",exactMatch:true},
    "kawasaki-jersey-13":{image:"https://kawasaki-sport.eu/hpeciai/aec5ae4e89b87ce92905355ad62c2193/eng_il_T-Shirt-Kawasaki-K1C02-C1031-white-679.jpg",label:"Kawasaki K1C02-C1031 T-shirt",credit:"Kawasaki Sport Europe · K1C02-C1031",page:"https://kawasaki-sport.eu/en/products/t-shirt-kawasaki-k1c02-c1031-white-679.html",exactMatch:true},
    "kawasaki-bag-14":{image:"https://kawasaki-sport.eu/hpeciai/61187250b57feec9ac933c7a6997bc6d/eng_il_Racquets-bag-Kawasaki-K1G00-C8905-Black-777.jpg",label:"Kawasaki K1G00-C8905 racket bag",credit:"Kawasaki Sport Europe · K1G00-C8905",page:"https://kawasaki-sport.eu/kawasaki-k1g00-c8905-racket-bag-black",exactMatch:true},
    "kawasaki-grip-15":{image:"https://kawasaki-sport.eu/hpeciai/5101bf24ade44ba9821a385291f72da5/eng_il_Racket-grips-Kawasaki-X5II-mix-5-pc-622.jpg",label:"Kawasaki X5II racket grips",credit:"Kawasaki Sport Europe · X5II grips",page:"https://kawasaki-sport.eu/en/products/racket-grips-kawasaki-x5ii-mix-5-pc-622.html",exactMatch:true}
  };

  window.CADAY_BRANDS = brands.map(({name,slug}) => ({name,slug}));
  window.CADAY_CATALOG = brands.flatMap((brand,brandIndex) => brand.products.map((item,index) => {
    const [name,category,price,badge,visual,colors] = item;
    const id = `${brand.slug}-${visual}-${String(index+1).padStart(2,"0")}`;
    const stock = 50 + ((brandIndex * 13 + index * 7) % 51);
    const [primary,accent] = colors;
    const [light,brandColor,dark,detail] = brand.palette;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 700"><defs><linearGradient id="bg" x1="0" x2="1" y1="0" y2="1"><stop stop-color="${light}"/><stop offset="1" stop-color="#f8f8f3"/></linearGradient><linearGradient id="item" x1="0" x2="1"><stop stop-color="${primary}"/><stop offset="1" stop-color="${accent}"/></linearGradient></defs><rect width="700" height="700" fill="url(#bg)"/><path d="M-40 146 356 -20h116L-40 247zm0 73L525 0h83L-40 254zm450 481 330-330v110L520 700z" fill="${brandColor}" opacity=".07"/><circle cx="${560-(index%3)*32}" cy="${150+(index%4)*19}" r="${125+(index%3)*15}" fill="${detail}" opacity=".22"/><path d="M0 530Q190 ${480+(index%4)*12} 370 540T700 516V700H0Z" fill="${brandColor}" opacity=".1"/><path d="M0 570h700M52 535v165M648 535v165" stroke="${brandColor}" stroke-opacity=".16" stroke-width="2"/>${illustration(visual,primary,accent,dark,index)}<rect x="38" y="38" width="624" height="624" rx="22" fill="none" stroke="${brandColor}" stroke-opacity=".1" stroke-width="2"/><text x="54" y="598" fill="${dark}" font-family="Arial,sans-serif" font-size="16" font-weight="700" letter-spacing="3">${xml(brand.name.toUpperCase())}</text><text x="54" y="628" fill="${brandColor}" font-family="Arial,sans-serif" font-size="11" font-weight="700" letter-spacing="2">${xml(category.toUpperCase())} · ${String(index+1).padStart(2,"0")}</text><circle cx="616" cy="610" r="13" fill="${detail}"/></svg>`;
    const photo = productPhotoReferences[id]?.exactMatch ? productPhotoReferences[id] : null;
    return {
      id,name,brand:brand.name,category,price,stock,badge,
      image:photo?.image ?? `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
      imageAlt:photo?.label ?? name,
      fallbackImage:`data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
      imageAlt:photo?.label ?? `${brand.name} ${category.toLowerCase()} illustration`,
      photoCredit:photo?.credit ?? "",
      photoPage:photo?.page ?? "",
      colors:[primary,accent,detail]
    };
  }));
})();
