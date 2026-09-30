import os
import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
import arabic_reshaper
from bidi.algorithm import get_display
from PIL import Image, ImageFont, ImageDraw
import numpy as np

def test_lines():
    SCALE = 4
    calibri_path = r'C:\Windows\Fonts\tahoma.ttf'
    font_body = ImageFont.truetype(calibri_path, int(13.8 * SCALE))
    font_title = ImageFont.truetype(r'C:\Windows\Fonts\tahomabd.ttf', int(22.0 * SCALE))
    font_header = ImageFont.truetype(calibri_path, int(12.0 * SCALE))
    font_byline = ImageFont.truetype(calibri_path, int(12.5 * SCALE))

    # Upper lines (next to illustration): max width = 380 * SCALE
    # Indented lines: max width = (380 - 35) * SCALE = 345 * SCALE
    # Lower lines (full width): max width = 670 * SCALE
    # Indented lines: max width = (670 - 35) * SCALE = 635 * SCALE

    arabic_lines = [
        # Para 1
        ("كان الوقت في أوائل الصيف، وكان الطقس دافئاً للغاية.", 183, True, 380, 345),
        ("أخبرت والدة تايلر إياه أنهما سيذهبان إلى الشاطئ", 208, False, 380, 380),
        ("يوم السبت، وكان تايلر متحمساً جداً. ولم يكن يطيق", 233, False, 380, 380),
        ("صبراً لممارسة مهارات السباحة التي تعلمها في", 258, False, 380, 380),
        ("المسبح العام خلال فصل الربيع. وكان على والده", 282, False, 380, 380),
        ("الذهاب إلى العمل، فلم يتمكن من الذهاب معهما.", 307, False, 380, 380),

        # Para 2
        ("استغرقت الرحلة إلى الشاطئ ساعة واحدة فقط، لكنها", 332, True, 380, 345),
        ("بدت وكأنها أبدية بالنسبة لتايلر. وقالت أمه إنهما", 357, False, 380, 380),
        ("سيقضيان اليوم في السباحة، وأن المفاجأة السارة بتناول", 381, False, 380, 380),
        ("العشاء في مطعم ستتوج يومهما الحافل بالنشاط.", 406, False, 380, 380),

        # Para 3 (lines 11-12 next to illustration, rest full width)
        ("وصلا أخيراً إلى الشاطئ. وساعد تايلر والدته في تفريغ", 431, True, 380, 345),
        ("مناشف الشاطئ وألعاب الرمل وبعض الوجبات الخفيفة.", 456, False, 380, 380),
        ("وقال تايلر لأمه: «تبدو الأمواج عالية جداً!». وجدت الأم مكاناً مناسباً على الرمال قرب الماء،", 481, False, 670, 670),
        ("وفرشت المناشف ورتبت بعض الكراسي. وكان يجلس بالقرب منهما صبي في مثل عمر تايلر تقريباً.", 505, False, 670, 670),
        ("اقترب الصبي وعرف عن نفسه قائلاً إن اسمه غاري، وسأل تايلر إن كان يرغب في بناء قلعة رملية معه.", 530, False, 670, 670),
        ("فقال تايلر: «بالتأكيد!». وبدأت والدة غاري تتبادل أطراف الحديث مع والدة تايلر عن المدرسة", 555, False, 670, 670),
        ("والعمل وتلك الأمور المشتركة التي تتحدث عنها الأمهات دائماً.", 580, False, 670, 670),

        # Para 4
        ("بنى الصبيان قلعة رملية رائعة، ثم قررا النزول إلى الماء. ونادت والدة غاري:", 605, True, 670, 635),
        ("«كونا حذرين!». فرد غاري قائلاً: «سنكون كذلك!». كان الصبيان يركضان داخلين وخارجين من", 630, False, 670, 670),
        ("الماء، ويقفزان بين الأمواج وسط الضحك والمرح، وكانا يقضيان وقتاً ممتعاً للغاية.", 655, False, 670, 670),
        ("وفجأة، اندفعا للقفز فوق موجة عاتية، لكن تايلر لم يعد يرى غاري. تلفت تايلر حوله ورآه في النهاية", 679, False, 670, 670),
        ("يلوح بيديه طالباً النجدة. سارع تايلر بالتصرف متذكراً مهارات الإنقاذ التي تدرب عليها في درس", 704, False, 670, 670),
        ("السباحة بالمسبح العام. فكر تايلر: «يجب أن أصل إلى غاري بسرعة!». سبح تايلر نحوه وطوقه بذراعه", 729, False, 670, 670),
        ("وطلب منه أن يتمسك بقوة. وفي تلك اللحظة رآهما المنقذ البحري، فأسرع خائضاً الماء وتولى الأمر،", 754, False, 670, 670),
        ("وتمكن من أخذ غاري من تايلر وإيصاله بسلام إلى الشاطئ. شعرت والدة غاري بالخوف الشديد، لكنها", 778, False, 670, 670),
        ("أدركت أنه لولا سرعة بديهة تايلر وحسن تصرفه لكان ابنها غاري قد تعرض للغرق المحقق.", 803, False, 670, 670),

        # Para 5
        ("شكر غاري ووالدته تايلر شكراً جزيلاً على شجاعته ومهارته الفائقة في السباحة.", 853, True, 670, 635),
        ("وفي ذلك المساء، دعت والدة غاري تايلر ووالدته لتناول طعام العشاء معهما في المطعم.", 878, False, 670, 670),
        ("وقالت ممتنة: «هذا أقل ما يمكنني تقديمه لكما». ولم يصبح الصبيان صديقين مقربين فحسب،", 903, False, 670, 670),
        ("بل توطدت أواصر الصداقة بين والدتيهما أيضاً!", 927, False, 670, 670),
    ]

    dummy = Image.new('RGB', (100, 100))
    draw = ImageDraw.Draw(dummy)

    print(f"Total lines: {len(arabic_lines)}")
    all_fit = True
    for idx, (text, y, is_indent, max_w, allowed_w) in enumerate(arabic_lines):
        reshaped = arabic_reshaper.reshape(text)
        bidi_text = get_display(reshaped)
        bbox = draw.textbbox((0, 0), bidi_text, font=font_body)
        w_px = (bbox[2] - bbox[0]) / SCALE
        allowed = allowed_w
        fits = w_px <= allowed
        if not fits:
            all_fit = False
            print(f"Line {idx+1} EXCEEDS allowed width: {w_px:.1f}px > {allowed}px: {text}")
        else:
            print(f"Line {idx+1:02d} OK ({w_px:.1f}px / {allowed}px): {text[:35]}...")

    print("ALL LINES FIT STATUS:", all_fit)

if __name__ == '__main__':
    test_lines()
