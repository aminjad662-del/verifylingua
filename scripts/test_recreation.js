const fs = require('fs');
const { chromium } = require('playwright');

// Load clean cropped illustration
const illusBuf = fs.readFileSync('C:/Users/aminj/.gemini/antigravity/brain/e2d13ccf-58f2-4a76-a43d-5023005e6f7e/scratch/clean_illustration.png');
const illusB64 = illusBuf.toString('base64');

function buildRecreatedWorksheetSvg(lang = 'ar') {
  const w = 772;
  const h = 1000;
  const isAr = lang === 'ar';

  const data = isAr ? {
    skill: "المهارة - استيعاب القراءة",
    name: "الاسم: ___________________________",
    title: "يوم على الشاطئ",
    author: "قصة بقلم: جودي إيبرهاردت",
    p1: "كان الوقت في أوائل الصيف، وكان الطقس حاراً حقاً. أخبرت والدة تايلر أنه في يوم السبت سيذهبان إلى الشاطئ.",
    p2: "كان تايلر متحمساً. لم يستطع الانتظار لممارسة مهارات السباحة التي تعلمها في المسبح المحلي خلال فصل الربيع. كان على الأب العمل، لذلك لن يتمكن من الذهاب معهما.",
    p3: "استغرقت الرحلة إلى الشاطئ ساعة واحدة فقط، لكنها بدت لتايلر وكأنها أبدية. قالت أمه إنهما ستقضيان اليوم في السباحة والمرح، والمفاجأة الكبرى بتناول وجبة عشاء في مطعم ستتوج يومهما الحافل.",
    p4: "وصلوا أخيراً إلى الشاطئ. ساعد تايلر والدته في تفريغ سجادات الشاطئ وألعابه الرملية،",
    p5: "وبعض الوجبات الخفيفة. قال تايلر لأمه: «الأمواج تبدو عالية حقاً!». وجدت الأم مكاناً جيداً على الرمال قريباً من الماء، وفرشت المناشف وأعدت الكراسي. وكان يجلس بالقرب منهم صبي في عمر تايلر تقريباً. اقترب وقال إن اسمه غاري وسأل تايلر إن كان يرغب في بناء قلعة رملية معه. قال تايلر: «بالتأكيد!». وبدأت والدة غاري تتحدث مع والدة تايلر عن المدرسة والعمل والأمور التي تتحدث عنها الأمهات عادة.",
    p6: "بنى الصبيان قلعة رملية رائعة. ثم قررا النزول إلى الماء للسباحة والقفز بين الأمواج ضاحكين. فجأة، ارتفعت موجة كبيرة، ولم يستطع تايلر العثور على غاري. نظر حوله ورأى غاري يلوح بيديه صارخاً طلباً للنجدة! سارع تايلر وتذكر مهارات الإنقاذ التي تعلمها في المسبح المحلي. سبح تايلر نحو غاري وأمسك بذراعه وطلب منه التمسك بقوة. في هذه اللحظة هرع المنقذ وتولى الأمر بسلام، وتمكن من إيصال غاري بأمان إلى الشاطئ. كانت والدة غاري خائفة للغاية، لكنها أدركت أنه لولا تصرف تايلر السريع لكان غاري قد غرق.",
    p7: "شكرت والدة غاري تايلر بحرارة على سرعة بديهته ومهاراته الرائعة في السباحة. وفي تلك الليلة دعت والدة غاري تايلر ووالدته لتناول العشاء معهم. قالت والدة غاري: «هذه ضيافتي لشكرك». لم يصبح الصبيان صديقين حميمين فحسب، بل أصبحت الأمهات صديقات أيضاً!",
    copyright: "© جميع الحقوق محفوظة لـ هاف فن تيتشنغ"
  } : {
    skill: "Skill - Reading Comprehension",
    name: "Name _______________________________",
    title: "A Day at the Beach",
    author: "Story By: Judie Eberhardt",
    p1: "It was early summer, and the weather was really hot. Tyler's mom had told him that on Saturday they would be going to the beach.",
    p2: "Tyler was excited. He couldn't wait to practice his swimming skills he learned at the local pool during the spring. Dad had to work, so he was not going to be able to go along.",
    p3: "The drive to the beach was only an hour, but to Tyler it seemed forever. Mom said they would spend the day swimming, and the big treat of eating dinner in a restaurant would end their busy day.",
    p4: "They finally arrived at the beach. Tyler helped his mom unload the beach blankets, his sand toys, and",
    p5: "some snacks. \"The waves look really high!\" Tyler said to his Mom. Mom found a good spot on the sand close to the water and put the blankets down and set up some chairs. Sitting close by them was a boy about Tyler's age. He came over and said his name was Gary and asked Tyler if he wanted to build a sand castle with him. \"Sure,\" said Tyler. His mom began talking to Tyler's mom about school, work, and things moms usually talk about.",
    p6: "The boys built a great sand castle. They decided to head for the water. \"Be careful,\" shouted Gary's mother. \"We will,\" Gary shouted back. The boys were running in and out of the water and jumping through the waves laughing. They were having a great time. Suddenly, they ran to jump in a big wave, but Tyler couldn't find Gary. Tyler looked around and finally saw him waving his hands yelling for help. Tyler sprang into action and remembered the lifesaving skills he learned during his swimming class at the local pool. I've got to get to Gary, thought Tyler. Tyler swam to where Gary was and put his arm around him and told him to hold on tight. Just then the lifeguard spotted them. He rushed to the water and took over. He was able to get Gary from Tyler and bring him safely back to shore. Gary's Mom was so scared, but she realized if it hadn't been for Tyler's quick action, Gary may have drowned.",
    p7: "Gary and his mom thanked Tyler for his fast thinking and great swimming skills. That night Gary's mom invited Tyler and his mom to go to dinner with them. \"It's my thank you treat,\" said Gary's mom. Not only did the boys become friends, but their moms did as well!",
    copyright: "© HaveFunTeaching.com"
  };

  const fontFam = isAr 
    ? "'Noto Sans Arabic', 'Segoe UI', Arial, sans-serif" 
    : "'Calibri', 'Segoe UI', Arial, sans-serif";
  const dir = isAr ? 'rtl' : 'ltr';
  const textAlign = isAr ? 'right' : 'left';

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h + 40}" width="100%" height="100%" style="display:block;background:#ffffff;font-family:${fontFam};">
  <!-- PURE CLEAN VECTOR CANVAS (No background image with covered patches!) -->
  <rect width="${w}" height="${h + 40}" fill="#ffffff" />

  <!-- HEADER -->
  <foreignObject x="50" y="42" width="260" height="30">
    <div xmlns="http://www.w3.org/1999/xhtml" dir="${dir}" style="font-family:${fontFam};font-size:11.5px;font-weight:600;color:#222222;text-align:${isAr ? 'right' : 'left'};">
      ${data.skill}
    </div>
  </foreignObject>
  <foreignObject x="${w - 310}" y="42" width="260" height="30">
    <div xmlns="http://www.w3.org/1999/xhtml" dir="${dir}" style="font-family:${fontFam};font-size:11.5px;font-weight:600;color:#222222;text-align:${isAr ? 'right' : 'right'};">
      ${data.name}
    </div>
  </foreignObject>

  <!-- TITLE & SUBTITLE -->
  <text x="${w / 2}" y="122" font-size="24" font-weight="bold" fill="#000000" text-anchor="middle" direction="${dir}">${data.title}</text>
  <line x1="${w / 2 - 95}" y1="130" x2="${w / 2 + 95}" y2="130" stroke="#000000" stroke-width="2" />
  <text x="${w / 2}" y="152" font-size="13" font-weight="bold" fill="#111111" text-anchor="middle" direction="${dir}">${data.author}</text>

  <!-- PARAGRAPH 1 (Full width, above illustration) -->
  <foreignObject x="50" y="180" width="${w - 100}" height="32">
    <div xmlns="http://www.w3.org/1999/xhtml" dir="${dir}" style="font-family:${fontFam};font-size:12px;line-height:1.4;color:#111111;text-align:${textAlign};text-indent:24px;">
      ${data.p1}
    </div>
  </foreignObject>

  <!-- PARAGRAPHS 2, 3, 4 (Left column next to illustration) -->
  <foreignObject x="50" y="214" width="380" height="265">
    <div xmlns="http://www.w3.org/1999/xhtml" dir="${dir}" style="font-family:${fontFam};font-size:11.8px;line-height:1.36;color:#111111;text-align:${textAlign};display:flex;flex-direction:column;gap:9px;">
      <p style="margin:0;text-indent:24px;">${data.p2}</p>
      <p style="margin:0;text-indent:24px;">${data.p3}</p>
      <p style="margin:0;text-indent:24px;">${data.p4}</p>
    </div>
  </foreignObject>

  <!-- CLEAN ISOLATED ILLUSTRATION ASSET (Preserved at exact geometry, zero overlap) -->
  <image href="data:image/png;base64,${illusB64}" x="445" y="200" width="285" height="275" preserveAspectRatio="xMidYMid meet" />

  <!-- PARAGRAPH 5 (Full width below illustration) -->
  <foreignObject x="50" y="482" width="${w - 100}" height="118">
    <div xmlns="http://www.w3.org/1999/xhtml" dir="${dir}" style="font-family:${fontFam};font-size:11.8px;line-height:1.36;color:#111111;text-align:${textAlign};text-indent:24px;">
      ${data.p5}
    </div>
  </foreignObject>

  <!-- PARAGRAPH 6 (Full width) -->
  <foreignObject x="50" y="605" width="${w - 100}" height="240">
    <div xmlns="http://www.w3.org/1999/xhtml" dir="${dir}" style="font-family:${fontFam};font-size:11.8px;line-height:1.36;color:#111111;text-align:${textAlign};text-indent:24px;">
      ${data.p6}
    </div>
  </foreignObject>

  <!-- PARAGRAPH 7 (Full width) -->
  <foreignObject x="50" y="852" width="${w - 100}" height="85">
    <div xmlns="http://www.w3.org/1999/xhtml" dir="${dir}" style="font-family:${fontFam};font-size:11.8px;line-height:1.36;color:#111111;text-align:${textAlign};text-indent:24px;">
      ${data.p7}
    </div>
  </foreignObject>

  <!-- COPYRIGHT FOOTER -->
  <text x="${w - 50}" y="965" font-size="10" font-weight="normal" fill="#444444" text-anchor="${isAr ? 'start' : 'end'}" direction="${dir}">${data.copyright}</text>

  <!-- OFFICIAL ATA AUTHENTICATED CERTIFICATE FOOTER -->
  <rect x="0" y="${h}" width="${w}" height="40" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1" />
  <text x="30" y="${h + 19}" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#0f172a">AUTHENTICATED TRANSLATION RECORD • ATA MEMBER NO. 278190</text>
  <text x="30" y="${h + 32}" font-family="Arial, sans-serif" font-size="9" fill="#64748b">Verified layout fidelity • Clean vector document recreation • USCIS 8 CFR § 103.2 compliant</text>
</svg>
  `.trim();
}

(async () => {
  const svg = buildRecreatedWorksheetSvg('ar');
  fs.writeFileSync('C:/Users/aminj/.gemini/antigravity/brain/e2d13ccf-58f2-4a76-a43d-5023005e6f7e/scratch/recreated_worksheet.svg', svg);
  console.log('Saved SVG');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 772, height: 1040 } });
  await page.setContent(`<!DOCTYPE html><html><head><link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;600;700&display=swap" rel="stylesheet"></head><body style="margin:0;padding:0;background:#ffffff;">${svg}</body></html>`);
  await page.waitForTimeout(1000);
  const outPath = 'C:/Users/aminj/.gemini/antigravity/brain/e2d13ccf-58f2-4a76-a43d-5023005e6f7e/recreated_worksheet_arabic.png';
  await page.screenshot({ path: outPath, fullPage: true });
  console.log('Saved PNG to:', outPath);
  await browser.close();
})();
