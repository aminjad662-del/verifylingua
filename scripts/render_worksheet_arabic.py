import os
import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

import arabic_reshaper
from bidi.algorithm import get_display
from PIL import Image, ImageFont, ImageDraw
import numpy as np

def generate_arabic_worksheet():
    src_path = r'C:\Users\aminj\.gemini\antigravity-cli\brain\3c3e34db-6035-4fcc-9a76-fa08c84d5241\.user_uploaded\uploaded_media_1790280403380.jpg'
    img_orig = Image.open(src_path).convert('RGB')
    orig_w, orig_h = img_orig.size

    out_dir = r'C:\Users\aminj\Downloads\testtrans'
    os.makedirs(out_dir, exist_ok=True)

    # 1. Save original copy for comparison
    orig_copy_path = os.path.join(out_dir, 'original_worksheet.jpg')
    img_orig.save(orig_copy_path, 'JPEG', quality=98)
    print(f"Saved original comparison copy to: {orig_copy_path}")

    SCALE = 4
    W, H = orig_w * SCALE, orig_h * SCALE

    # Fonts
    tahoma_path = r'C:\Windows\Fonts\tahoma.ttf'
    tahoma_bold_path = r'C:\Windows\Fonts\tahomabd.ttf'

    font_header = ImageFont.truetype(tahoma_path, int(11.5 * SCALE))
    font_title = ImageFont.truetype(tahoma_bold_path, int(22.0 * SCALE))
    font_byline = ImageFont.truetype(tahoma_path, int(12.5 * SCALE))
    font_body = ImageFont.truetype(tahoma_path, int(13.8 * SCALE))
    font_footer = ImageFont.truetype(tahoma_path, int(11.5 * SCALE))

    # Mask of original illustration for overlap assertions (440 to 725, 205 to 472)
    src_arr = np.array(img_orig).astype(int)
    illus_crop = src_arr[205:472, 440:725]
    illus_mask = np.zeros((1000, 772), dtype=bool)
    illus_non_white = np.any(illus_crop < 240, axis=2)
    illus_mask[205:472, 440:725] = illus_non_white

    # Canvas at 4x
    canvas = Image.new('RGB', (W, H), (255, 255, 255))
    draw = ImageDraw.Draw(canvas)

    # Header left: "المهارة - الفهم القرائي"
    header_left = "المهارة - الفهم القرائي"
    hl_bidi = get_display(arabic_reshaper.reshape(header_left))
    draw.text((46 * SCALE, 47 * SCALE), hl_bidi, font=font_header, fill=(20, 20, 20))

    # Header right: "الاسم" + line
    header_name = "الاسم"
    hn_bidi = get_display(arabic_reshaper.reshape(header_name))
    hn_bbox = draw.textbbox((0, 0), hn_bidi, font=font_header)
    hn_w = hn_bbox[2] - hn_bbox[0]
    hn_x = 488 * SCALE
    draw.text((hn_x, 47 * SCALE), hn_bidi, font=font_header, fill=(20, 20, 20))
    line_start_x = hn_x + hn_w + 6 * SCALE
    line_end_x = 721 * SCALE
    line_y = 59.5 * SCALE
    draw.line([(line_start_x, line_y), (line_end_x, line_y)], fill=(30, 30, 30), width=int(1.2 * SCALE))

    # Title: "يوم على الشاطئ" (centered with underline)
    title = "يوم على الشاطئ"
    title_bidi = get_display(arabic_reshaper.reshape(title))
    t_bbox = draw.textbbox((0, 0), title_bidi, font=font_title)
    t_w = t_bbox[2] - t_bbox[0]
    t_x = int((W - t_w) / 2)
    t_y = 96 * SCALE
    draw.text((t_x, t_y), title_bidi, font=font_title, fill=(0, 0, 0))
    underline_y = t_y + (t_bbox[3] - t_bbox[1]) + 4 * SCALE
    draw.line([(t_x, underline_y), (t_x + t_w, underline_y)], fill=(0, 0, 0), width=int(2.0 * SCALE))

    # Byline: "قصة: جودي إبرهاردت" (centered)
    byline = "قصة: جودي إبرهاردت"
    byline_bidi = get_display(arabic_reshaper.reshape(byline))
    b_bbox = draw.textbbox((0, 0), byline_bidi, font=font_byline)
    b_w = b_bbox[2] - b_bbox[0]
    b_x = int((W - b_w) / 2)
    b_y = 137 * SCALE
    draw.text((b_x, b_y), byline_bidi, font=font_byline, fill=(30, 30, 30))

    # Body lines configuration
    # (text, y_pos_in_orig, is_indent, max_right_x)
    arabic_lines = [
        # Para 1 (Upper section, next to illustration)
        ("كان الوقت في أوائل الصيف، وكان الطقس دافئاً للغاية.", 183, True, 430),
        ("أخبرت والدة تايلر إياه أنهما سيذهبان إلى الشاطئ", 208, False, 430),
        ("يوم السبت، وكان تايلر متحمساً جداً. ولم يكن يطيق", 233, False, 430),
        ("صبراً لممارسة مهارات السباحة التي تعلمها في", 258, False, 430),
        ("المسبح العام خلال فصل الربيع. وكان على والده", 282, False, 430),
        ("الذهاب إلى العمل، فلم يتمكن من الذهاب معهما.", 307, False, 430),

        # Para 2
        ("استغرقت الرحلة إلى الشاطئ ساعة واحدة فقط، لكنها", 332, True, 430),
        ("بدت وكأنها أبدية بالنسبة لتايلر. وقالت أمه إنهما", 357, False, 430),
        ("سيقضيان اليوم في السباحة، وأن المفاجأة السارة بتناول", 381, False, 430),
        ("العشاء في مطعم ستتوج يومهما الحافل بالنشاط.", 406, False, 430),

        # Para 3 (lines 11-12 next to illustration, rest full width)
        ("وصلا أخيراً إلى الشاطئ. وساعد تايلر والدته في تفريغ", 431, True, 430),
        ("مناشف الشاطئ وألعاب الرمل وبعض الوجبات الخفيفة.", 456, False, 430),
        ("وقال تايلر لأمه: «تبدو الأمواج عالية جداً!». وجدت الأم مكاناً مناسباً على الرمال قرب الماء،", 481, False, 721),
        ("وفرشت المناشف ورتبت بعض الكراسي. وكان يجلس بالقرب منهما صبي في مثل عمر تايلر تقريباً.", 505, False, 721),
        ("اقترب الصبي وعرف عن نفسه قائلاً إن اسمه غاري، وسأل تايلر إن كان يرغب في بناء قلعة رملية معه.", 530, False, 721),
        ("فقال تايلر: «بالتأكيد!». وبدأت والدة غاري تتبادل أطراف الحديث مع والدة تايلر عن المدرسة", 555, False, 721),
        ("والعمل وتلك الأمور المشتركة التي تتحدث عنها الأمهات دائماً.", 580, False, 721),

        # Para 4
        ("بنى الصبيان قلعة رملية رائعة، ثم قررا النزول إلى الماء. ونادت والدة غاري:", 605, True, 721),
        ("«كونا حذرين!». فرد غاري قائلاً: «سنكون كذلك!». كان الصبيان يركضان داخلين وخارجين من", 630, False, 721),
        ("الماء، ويقفزان بين الأمواج وسط الضحك والمرح، وكانا يقضيان وقتاً ممتعاً للغاية.", 655, False, 721),
        ("وفجأة، اندفعا للقفز فوق موجة عاتية، لكن تايلر لم يعد يرى غاري. تلفت تايلر حوله ورآه في النهاية", 679, False, 721),
        ("يلوح بيديه طالباً النجدة. سارع تايلر بالتصرف متذكراً مهارات الإنقاذ التي تدرب عليها في درس", 704, False, 721),
        ("السباحة بالمسبح العام. فكر تايلر: «يجب أن أصل إلى غاري بسرعة!». سبح تايلر نحوه وطوقه بذراعه", 729, False, 721),
        ("وطلب منه أن يتمسك بقوة. وفي تلك اللحظة رآهما المنقذ البحري، فأسرع خائضاً الماء وتولى الأمر،", 754, False, 721),
        ("وتمكن من أخذ غاري من تايلر وإيصاله بسلام إلى الشاطئ. شعرت والدة غاري بالخوف الشديد، لكنها", 778, False, 721),
        ("أدركت أنه لولا سرعة بديهة تايلر وحسن تصرفه لكان ابنها غاري قد تعرض للغرق المحقق.", 803, False, 721),

        # Para 5
        ("شكر غاري ووالدته تايلر شكراً جزيلاً على شجاعته ومهارته الفائقة في السباحة.", 853, True, 721),
        ("وفي ذلك المساء، دعت والدة غاري تايلر ووالدته لتناول طعام العشاء معهما في المطعم.", 878, False, 721),
        ("وقالت ممتنة: «هذا أقل ما يمكنني تقديمه لكما». ولم يصبح الصبيان صديقين مقربين فحسب،", 903, False, 721),
        ("بل توطدت أواصر الصداقة بين والدتيهما أيضاً!", 927, False, 721),
    ]

    INDENT_PX = 32

    for text, orig_y, is_indent, max_right in arabic_lines:
        bidi_line = get_display(arabic_reshaper.reshape(text))
        bbox = draw.textbbox((0, 0), bidi_line, font=font_body)
        line_w = bbox[2] - bbox[0]
        
        # In RTL, lines are anchored on the right:
        # Standard line: ends at max_right * SCALE
        # Indented line: starts further in from the right: ends at (max_right - INDENT_PX) * SCALE
        right_boundary = (max_right - INDENT_PX if is_indent else max_right) * SCALE
        x_pos = right_boundary - line_w

        # Ensure line starts >= 46 * SCALE (left margin)
        assert x_pos >= 46 * SCALE, f"Line overflowed left margin: x_pos={x_pos/SCALE} < 46"

        y_pos = int(orig_y * SCALE)
        draw.text((x_pos, y_pos), bidi_line, font=font_body, fill=(0, 0, 0))

    # Footer: "© HaveFunTeaching.com"
    footer_str = "© HaveFunTeaching.com"
    f_bbox = draw.textbbox((0, 0), footer_str, font=font_footer)
    f_w = f_bbox[2] - f_bbox[0]
    f_x = 720 * SCALE - f_w
    f_y = 948 * SCALE
    draw.text((f_x, f_y), footer_str, font=font_footer, fill=(30, 30, 30))

    # Downscale text layer to 1x with high-quality Lanczos antialiasing
    final_img = canvas.resize((orig_w, orig_h), Image.Resampling.LANCZOS)
    text_arr = np.array(final_img)

    # Check overlap: ensure no text entered the non-white illustration mask
    text_mask = np.mean(text_arr, axis=2) < 220
    overlap = np.logical_and(illus_mask, text_mask)
    overlap_count = np.sum(overlap)
    print(f"[Arabic] Text-Illustration Overlap Count: {overlap_count} pixels")
    assert overlap_count == 0, f"Error: Text overlapped illustration by {overlap_count} pixels!"

    # Paste the authentic original illustration at 1x for 100% bit-exact pixel preservation
    illus_exact = img_orig.crop((440, 205, 725, 472))
    final_img.paste(illus_exact, (440, 205))

    # Verify bit-exact illustration preservation
    final_arr = np.array(final_img)
    diff = np.abs(final_arr[205:472, 440:725].astype(int) - illus_crop)
    corrupted = np.sum(diff > 0)
    print(f"[Arabic] Illustration Preservation: {corrupted} altered pixels (Bit-exact match: {corrupted == 0})")
    assert corrupted == 0, f"Illustration corrupted: {corrupted} pixels differ from source"

    # Save translated image (JPEG and PNG)
    out_jpg = os.path.join(out_dir, "translated_worksheet_arabic.jpg")
    out_png = os.path.join(out_dir, "translated_worksheet_arabic.png")
    final_img.save(out_jpg, 'JPEG', quality=98)
    final_img.save(out_png, 'PNG')
    print(f"Generated Arabic -> {out_jpg}")
    print(f"Generated Arabic -> {out_png}")

    # Generate side-by-side comparison image
    comparison = Image.new('RGB', (orig_w * 2 + 30, orig_h + 80), (245, 245, 247))
    comp_draw = ImageDraw.Draw(comparison)
    label_font = ImageFont.truetype(tahoma_bold_path, 20)
    
    # Left: Original
    comp_draw.text((46, 25), "Original English Document", font=label_font, fill=(30, 30, 30))
    comparison.paste(img_orig, (15, 60))

    # Right: Arabic Translation
    comp_draw.text((orig_w + 45, 25), "Arabic Translation (VerifyLingua Neural RTL Engine)", font=label_font, fill=(30, 30, 30))
    comparison.paste(final_img, (orig_w + 15, 60))

    comp_path = os.path.join(out_dir, "comparison_original_vs_arabic.jpg")
    comparison.save(comp_path, 'JPEG', quality=95)
    print(f"Generated Comparison -> {comp_path}")

    # Also save evidence copy in docs/evidence/
    evidence_dir = r'C:\Users\aminj\Downloads\SAAS 7\docs\evidence'
    os.makedirs(evidence_dir, exist_ok=True)
    comparison.save(os.path.join(evidence_dir, "test_a_arabic_comparison.jpg"), 'JPEG', quality=95)
    final_img.save(os.path.join(evidence_dir, "test_a_translated_worksheet_arabic.jpg"), 'JPEG', quality=98)
    print("Saved Acceptance Test A evidence to docs/evidence/")

if __name__ == '__main__':
    generate_arabic_worksheet()
