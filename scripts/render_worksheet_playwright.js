const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

async function renderArabicWorksheet() {
  const srcPath = 'C:\\Users\\aminj\\.gemini\\antigravity-cli\\brain\\3c3e34db-6035-4fcc-9a76-fa08c84d5241\\.user_uploaded\\uploaded_media_1790280403380.jpg';
  const outDir = 'C:\\Users\\aminj\\Downloads\\testtrans';
  const evidenceDir = 'C:\\Users\\aminj\\Downloads\\SAAS 7\\docs\\evidence';

  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  if (!fs.existsSync(evidenceDir)) fs.mkdirSync(evidenceDir, { recursive: true });

  // Load the cropped illustration image as base64
  // We can use sharp or python or jimp to crop the exact illustration, or use python script
  // Let's create an html file that references the fonts and layout
  const htmlContent = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;600;700&display=swap');

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    width: 772px;
    height: 1000px;
    background-color: #ffffff;
    font-family: 'Noto Sans Arabic', 'Segoe UI', Tahoma, sans-serif;
    color: #111111;
    position: relative;
    overflow: hidden;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }

  .header-left {
    position: absolute;
    left: 48px;
    top: 46px;
    font-size: 12.5px;
    font-weight: 600;
    color: #222222;
    direction: rtl;
  }

  .header-name {
    position: absolute;
    right: 48px;
    top: 46px;
    font-size: 12.5px;
    font-weight: 600;
    color: #222222;
    direction: rtl;
    display: flex;
    align-items: flex-end;
    gap: 6px;
  }

  .header-name .underline {
    display: inline-block;
    width: 175px;
    height: 16px;
    border-bottom: 1.2px solid #222222;
  }

  .title-container {
    position: absolute;
    top: 85px;
    left: 0;
    width: 100%;
    text-align: center;
  }

  .title {
    display: inline-block;
    font-size: 25px;
    font-weight: 700;
    color: #000000;
    border-bottom: 2px solid #000000;
    padding-bottom: 2px;
    letter-spacing: -0.2px;
  }

  .byline {
    position: absolute;
    top: 136px;
    left: 0;
    width: 100%;
    text-align: center;
    font-size: 13px;
    color: #2b2b2b;
    font-weight: 600;
  }

  .illustration {
    position: absolute;
    left: 440px;
    top: 205px;
    width: 285px;
    height: 267px;
    object-fit: fill;
    z-index: 10;
  }

  .upper-text {
    position: absolute;
    left: 46px;
    top: 182px;
    width: 384px;
    text-align: justify;
    text-justify: inter-word;
    font-size: 12.8px;
    line-height: 24.5px;
    color: #000000;
  }

  .upper-text p {
    text-indent: 28px;
    margin-bottom: 0px;
  }

  .lower-text {
    position: absolute;
    left: 46px;
    top: 481px;
    width: 675px;
    text-align: justify;
    text-justify: inter-word;
    font-size: 12.8px;
    line-height: 24.5px;
    color: #000000;
  }

  .lower-text p {
    text-indent: 28px;
    margin-bottom: 0px;
  }

  .footer {
    position: absolute;
    right: 51px;
    bottom: 38px;
    font-size: 12px;
    color: #333333;
    font-family: Arial, sans-serif;
    direction: ltr;
  }
</style>
</head>
<body>

  <div class="header-left">المهارة - الفهم القرائي</div>

  <div class="header-name">
    <span>الاسم:</span>
    <span class="underline"></span>
  </div>

  <div class="title-container">
    <div class="title">يوم على الشاطئ</div>
  </div>

  <div class="byline">قصة: جودي إبرهاردت</div>

  <img class="illustration" src="illustration_crop.png" alt="Illustration" />

  <div class="upper-text">
    <p>كان الوقت في أوائل الصيف، وكان الطقس دافئاً للغاية. أخبرت والدة تايلر إياه أنهما سيذهبان إلى الشاطئ يوم السبت، فكان تايلر متحمساً جداً. ولم يكن يطيق صبراً لممارسة مهارات السباحة التي تعلمها في المسبح العام خلال فصل الربيع. وكان على والده الذهاب إلى العمل، فلم يتمكن من الذهاب معهما.</p>
    <p>استغرقت الرحلة إلى الشاطئ ساعة واحدة فقط، لكنها بدت وكأنها أبدية بالنسبة لتايلر. وقالت أمه إنهما سيقضيان اليوم في السباحة، وأن المفاجأة السارة بتناول طعام العشاء في مطعم ستتوج يومهما الحافل بالنشاط.</p>
    <p>وصلا أخيراً إلى الشاطئ، وساعد تايلر والدته في تفريغ مناشف الشاطئ وألعاب الرمل وبعض الوجبات الخفيفة.</p>
  </div>

  <div class="lower-text">
    <p style="text-indent: 0;">وقال تايلر لأمه: «تبدو الأمواج عالية جداً!». وجدت الأم مكاناً مناسباً على الرمال قرب الماء، وفرشت المناشف ورتبت بعض الكراسي. وكان يجلس بالقرب منهما صبي في مثل عمر تايلر تقريباً. اقترب الصبي وعرف عن نفسه قائلاً إن اسمه غاري، وسأل تايلر إن كان يرغب في بناء قلعة رملية معه. فقال تايلر: «بالتأكيد!». وبدأت والدة غاري تتبادل أطراف الحديث مع والدة تايلر عن المدرسة والعمل وتلك الأمور المشتركة التي تتحدث عنها الأمهات دائماً.</p>
    <p>بنى الصبيان قلعة رملية رائعة، ثم قررا النزول إلى الماء. ونادت والدة غاري: «كونا حذرين!». فرد غاري قائلاً: «سنكون كذلك!». كان الصبيان يركضان داخلين وخارجين من الماء، ويقفزان بين الأمواج وسط الضحك والمرح، وكانا يقضيان وقتاً ممتعاً للغاية. وفجأة، اندفعا للقفز فوق موجة عاتية، لكن تايلر لم يعد يرى غاري. تلفت تايلر حوله ورآه في النهاية يلوح بيديه طالباً النجدة. سارع تايلر بالتصرف متذكراً مهارات الإنقاذ التي تدرب عليها في درس السباحة بالمسبح العام. فكر تايلر: «يجب أن أصل إلى غاري بسرعة!». سبح تايلر نحوه وطوقه بذراعه وطلب منه أن يتمسك بقوة. وفي تلك اللحظة رآهما المنقذ البحري، فأسرع خائضاً الماء وتولى الأمر، وتمكن من أخذ غاري من تايلر وإيصاله بسلام إلى الشاطئ. شعرت والدة غاري بالخوف الشديد، لكنها أدركت أنه لولا سرعة بديهة تايلر وحسن تصرفه لكان ابنها غاري قد تعرض للغرق المحقق.</p>
    <p>شكر غاري ووالدته تايلر شكراً جزيلاً على شجاعته ومهارته الفائقة في السباحة. وفي ذلك المساء، دعت والدة غاري تايلر ووالدته لتناول طعام العشاء معهما في المطعم، وقالت ممتنة: «هذا أقل ما يمكنني تقديمه لكما». ولم يصبح الصبيان صديقين مقربين فحسب، بل توطدت أواصر الصداقة بين والدتيهما أيضاً!</p>
  </div>

  <div class="footer">© HaveFunTeaching.com</div>

</body>
</html>`;

  // First, extract the bit-exact crop of the illustration using Python or Jimp
  // We'll write the HTML to a temporary file
  const htmlPath = path.join(outDir, 'arabic_worksheet.html');
  fs.writeFileSync(htmlPath, htmlContent, 'utf-8');
  console.log('Written HTML to:', htmlPath);

  // Launch Chromium
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 772, height: 1000 },
    deviceScaleFactor: 1, // 1x exact pixel matching with original 772x1000
  });

  const page = await context.newPage();
  await page.goto('file:///' + htmlPath.replace(/\\/g, '/'), { waitUntil: 'networkidle' });

  // Wait for Google Fonts Noto Sans Arabic to load
  await page.evaluate(async () => {
    await document.fonts.ready;
  });

  const screenshotBuffer = await page.screenshot({
    type: 'png',
    clip: { x: 0, y: 0, width: 772, height: 1000 }
  });

  await browser.close();

  const outPng = path.join(outDir, 'translated_worksheet_arabic.png');
  fs.writeFileSync(outPng, screenshotBuffer);
  console.log('Saved Playwright Arabic screenshot to:', outPng);
}

renderArabicWorksheet().catch(console.error);
