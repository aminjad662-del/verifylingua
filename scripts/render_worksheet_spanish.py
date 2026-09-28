from PIL import Image, ImageFont, ImageDraw
import numpy as np
import os

def render_translated_worksheet():
    # Load original image
    src_path = r'C:\Users\aminj\.gemini\antigravity-cli\brain\3c3e34db-6035-4fcc-9a76-fa08c84d5241\.user_uploaded\uploaded_media_1790280403380.jpg'
    img_orig = Image.open(src_path).convert('RGB')
    orig_w, orig_h = img_orig.size # (772, 1000)

    # Scale factor for supersampled antialiased rendering
    SCALE = 4
    W, H = orig_w * SCALE, orig_h * SCALE

    # Create canvas at 4x
    canvas = Image.new('RGB', (W, H), (255, 255, 255))

    # Extract clean illustration from original image
    # In original coordinates: y=205..472, x=440..725
    orig_arr = np.array(img_orig)
    illus_crop = img_orig.crop((440, 205, 725, 472))
    # Resize illustration with high-quality Lanczos to match 4x canvas
    illus_crop_4x = illus_crop.resize(( (725 - 440) * SCALE, (472 - 205) * SCALE ), Image.Resampling.LANCZOS)
    canvas.paste(illus_crop_4x, (440 * SCALE, 205 * SCALE))

    draw = ImageDraw.Draw(canvas)

    # Fonts
    calibri_path = r'C:\Windows\Fonts\calibri.ttf'
    calibri_bold_path = r'C:\Windows\Fonts\calibrib.ttf'

    # Font sizes scaled by SCALE
    font_header = ImageFont.truetype(calibri_path, int(12.5 * SCALE))
    font_title = ImageFont.truetype(calibri_bold_path, int(22.5 * SCALE))
    font_byline = ImageFont.truetype(calibri_path, int(13 * SCALE))
    font_body = ImageFont.truetype(calibri_path, int(14.8 * SCALE))
    font_footer = ImageFont.truetype(calibri_path, int(11.5 * SCALE))

    # 1. Header
    # Left: "Habilidad - Comprensión de Lectura"
    draw.text((46 * SCALE, 47 * SCALE), "Habilidad - Comprensión de Lectura", font=font_header, fill=(20, 20, 20))

    # Right: "Nombre" + line
    name_str = "Nombre"
    draw.text((488 * SCALE, 47 * SCALE), name_str, font=font_header, fill=(20, 20, 20))
    name_bbox = draw.textbbox((488 * SCALE, 47 * SCALE), name_str, font=font_header)
    line_start_x = name_bbox[2] + 4 * SCALE
    line_end_x = 721 * SCALE
    line_y = 59.5 * SCALE
    draw.line([(line_start_x, line_y), (line_end_x, line_y)], fill=(30, 30, 30), width=int(1.2 * SCALE))

    # 2. Title: "Un Día en la Playa" (centered)
    title_str = "Un Día en la Playa"
    t_bbox = draw.textbbox((0, 0), title_str, font=font_title)
    t_w = t_bbox[2] - t_bbox[0]
    t_x = int((W - t_w) / 2)
    t_y = 96 * SCALE
    draw.text((t_x, t_y), title_str, font=font_title, fill=(0, 0, 0))
    # Underline beneath title
    underline_y = t_y + (t_bbox[3] - t_bbox[1]) + 4 * SCALE
    draw.line([(t_x, underline_y), (t_x + t_w, underline_y)], fill=(0, 0, 0), width=int(2.0 * SCALE))

    # 3. Byline: "Historia por: Judie Eberhardt" (centered)
    byline_str = "Historia por: Judie Eberhardt"
    b_bbox = draw.textbbox((0, 0), byline_str, font=font_byline)
    b_w = b_bbox[2] - b_bbox[0]
    b_x = int((W - b_w) / 2)
    b_y = 137 * SCALE
    draw.text((b_x, b_y), byline_str, font=font_byline, fill=(30, 30, 30))

    # 4. Narrative Body
    # Paragraph structure with strict wrapping & baselines
    LEFT_MARGIN = 46 * SCALE
    INDENT = 91 * SCALE
    RIGHT_MARGIN_FULL = 724 * SCALE
    RIGHT_MARGIN_WRAPPED = 430 * SCALE

    # Text lines definitions:
    # Each entry: (text, y_in_orig_px, x_start, is_indented)
    # Target baselines: y_start = 183, step = 24.8
    lines_spec = [
        # Line 0 (Full width across page above illustration)
        ("Era principios de verano y hacía mucho calor. La mamá de Tyler le había dicho que el", 183, INDENT),
        # Lines 1..5 (Paragraph 1 wrapped in left column next to illustration)
        ("sábado irían a la playa. Tyler estaba muy emocionado.", 208, LEFT_MARGIN),
        ("No veía la hora de practicar sus habilidades de natación", 233, LEFT_MARGIN),
        ("aprendidas en la piscina municipal durante la primavera.", 258, LEFT_MARGIN),
        ("Papá tenía que trabajar, por lo que no podría", 282, LEFT_MARGIN),
        ("acompañarlos.", 307, LEFT_MARGIN),
        # Lines 6..9 (Paragraph 2 wrapped in left column next to illustration)
        ("El viaje a la playa duró solo una hora, pero a", 332, INDENT),
        ("Tyler le pareció una eternidad. Mamá dijo que pasarían", 357, LEFT_MARGIN),
        ("el día nadando, y la gran sorpresa de cenar en un", 381, LEFT_MARGIN),
        ("restaurante daría un cierre especial a su ocupado día.", 406, LEFT_MARGIN),
        # Lines 10..11 (Paragraph 3 start wrapped in left column)
        ("Por fin llegaron a la playa. Tyler ayudó a su mamá a", 431, INDENT),
        ("descargar las toallas de playa, sus juguetes de arena y", 456, LEFT_MARGIN),
        # Lines 12..16 (Paragraph 3 continues FULL WIDTH below illustration)
        ("algunos bocadillos. “¡Las olas se ven altísimas!”, le dijo Tyler a su mamá. Mamá encontró un", 481, LEFT_MARGIN),
        ("buen sitio en la arena cerca del agua, extendió las toallas y colocó unas sillas. Sentado cerca", 505, LEFT_MARGIN),
        ("de ellos estaba un niño de la edad de Tyler. Se acercó y dijo que se llamaba Gary, y le preguntó", 530, LEFT_MARGIN),
        ("a Tyler si quería hacer un castillo de arena con él. “¡Claro!”, dijo Tyler. Su mamá empezó a", 555, LEFT_MARGIN),
        ("charlar con la mamá de Tyler sobre la escuela, el trabajo y cosas de las que suelen hablar las mamás.", 580, LEFT_MARGIN),
        # Lines 17..26 (Paragraph 4 FULL WIDTH)
        ("Los niños construyeron un gran castillo de arena. Decidieron meterse al agua. “¡Tengan", 605, INDENT),
        ("cuidado!”, gritó la mamá de Gary. “¡Lo tendremos!”, respondió Gary. Los niños corrían entrando y", 630, LEFT_MARGIN),
        ("saliendo del agua y saltaban entre las olas riendo con alegría. Se lo estaban pasando de maravilla.", 655, LEFT_MARGIN),
        ("De pronto, corrieron a saltar una gran ola, pero Tyler no encontraba a Gary. Tyler miró a su", 679, LEFT_MARGIN),
        ("alrededor y por fin lo vio agitando las manos y pidiendo ayuda. Tyler actuó de inmediato y recordó", 704, LEFT_MARGIN),
        ("las maniobras de salvamento aprendidas en su clase de natación de la piscina local. Tengo que", 729, LEFT_MARGIN),
        ("alcanzar a Gary, pensó Tyler. Tyler nadó hasta donde estaba Gary, le pasó el brazo por encima y le", 754, LEFT_MARGIN),
        ("dijo que se sujetara fuerte. Justo entonces el salvavidas los vio. Entró rápido al agua y se hizo", 778, LEFT_MARGIN),
        ("cargo. Logró tomar a Gary y llevarlo a salvo a la orilla. La mamá de Gary estaba asustada, pero", 803, LEFT_MARGIN),
        ("sabía que de no haber sido por la rápida reacción de Tyler, Gary se habría ahogado.", 828, LEFT_MARGIN),
        # Lines 27..30 (Paragraph 5 FULL WIDTH)
        ("Gary y su mamá le agradecieron a Tyler su rápida reacción y su destreza al nadar. Esa", 853, INDENT),
        ("noche, la mamá de Gary invitó a Tyler y a su mamá a cenar juntos. “Es mi muestra de", 878, LEFT_MARGIN),
        ("agradecimiento”, dijo ella. ¡Los niños no solo se hicieron grandes amigos, sino que sus", 903, LEFT_MARGIN),
        ("mamás también!", 927, LEFT_MARGIN),
    ]

    for text, orig_y, x_pos in lines_spec:
        y_pos = int(orig_y * SCALE)
        draw.text((x_pos, y_pos), text, font=font_body, fill=(0, 0, 0))

    # 5. Footer: "© HaveFunTeaching.com"
    footer_str = "© HaveFunTeaching.com"
    f_bbox = draw.textbbox((0, 0), footer_str, font=font_footer)
    f_w = f_bbox[2] - f_bbox[0]
    f_x = 720 * SCALE - f_w
    f_y = 948 * SCALE
    draw.text((f_x, f_y), footer_str, font=font_footer, fill=(30, 30, 30))

    # Downsample back to original dimensions with high-quality Lanczos resampling
    final_img = canvas.resize((orig_w, orig_h), Image.Resampling.LANCZOS)

    # Ensure output directory exists
    out_dir = r'C:\Users\aminj\Downloads\testtrans'
    os.makedirs(out_dir, exist_ok=True)
    out_file = os.path.join(out_dir, 'translated_worksheet_spanish.jpg')
    final_img.save(out_file, 'JPEG', quality=98)
    print('Successfully generated:', out_file)

if __name__ == '__main__':
    render_translated_worksheet()
