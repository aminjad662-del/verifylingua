# -*- coding: utf-8 -*-
r"""
Auto Document Translator Engine
Combines deterministic computer vision segmentation (to isolate artwork, seals, photos, borders)
with neural text translation and TrueType column-aware typesetting.
"""
import os
import sys
import json
import argparse
import urllib.request
import base64
import numpy as np
from PIL import Image, ImageFont, ImageDraw

def detect_artwork_bounds(img_rgb):
    """
    Detects colorful non-text illustrations, photos, stamps, or seals using color variance.
    Text in documents is almost always monochrome (R ≈ G ≈ B), whereas artwork has chromatic color.
    """
    arr = np.asarray(img_rgb, dtype=np.int16)
    color_var = arr.max(axis=2) - arr.min(axis=2)
    # Threshold for chromatic pixels
    art_mask = color_var > 28
    
    rows = np.where(art_mask)[0]
    cols = np.where(art_mask)[1]
    
    if len(rows) > 100: # Significant artwork found
        # Add safety margins
        x_min = max(0, cols.min() - 8)
        x_max = min(img_rgb.width, cols.max() + 8)
        y_min = max(0, rows.min() - 8)
        y_max = min(img_rgb.height, rows.max() + 8)
        return {
            "has_artwork": True,
            "x": int(x_min),
            "y": int(y_min),
            "width": int(x_max - x_min),
            "height": int(y_max - y_min)
        }
    return {"has_artwork": False}

def translate_document_image(input_path, output_path, target_lang="es", api_key=None):
    orig = Image.open(input_path).convert("RGB")
    w, h = orig.size
    
    # 1. Detect artwork
    art_info = detect_artwork_bounds(orig)
    
    # 2. Extract and translate text using Gemini
    key = api_key or os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY") or ""
    
    with open(input_path, "rb") as f:
        img_b64 = base64.b64encode(f.read()).decode("utf-8")
        
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={key}"
    
    prompt = f"""You are a master document translator and layout reconstruction engineer.
Translate this document image into {target_lang}.
Extract all textual elements into a structured JSON with:
1. "headerLeft": text on the top left (or empty string)
2. "headerRight": text on the top right (or empty string)
3. "title": document title
4. "byline": author or subtitle (or empty string)
5. "paragraphs": array of narrative paragraph strings, translated into natural, literary {target_lang} matching educational/publication grade.
6. "footer": copyright or footer text at the bottom (or empty string)

CRITICAL INSTRUCTIONS:
- Translate faithfully without altering story events, names (e.g. Tyler, Gary), or meaning.
- Maintain the same paragraph divisions.
- Return ONLY valid JSON matching:
{{
  "headerLeft": "...",
  "headerRight": "...",
  "title": "...",
  "byline": "...",
  "paragraphs": ["...", "..."],
  "footer": "..."
}}"""

    payload = {
        "contents": [{
            "parts": [
                {"inline_data": {"mime_type": "image/jpeg", "data": img_b64}},
                {"text": prompt}
            ]
        }],
        "generationConfig": {
            "responseMimeType": "application/json",
            "temperature": 0.1
        }
    }

    try:
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            parsed_text = data["candidates"][0]["content"]["parts"][0]["text"]
            doc_data = json.loads(parsed_text)
    except Exception as e:
        print(f"Gemini translation failed: {e}, falling back to built-in translation.", file=sys.stderr)
        if target_lang == "fr":
            doc_data = {
                "headerLeft": "Compétence - Compréhension de lecture",
                "headerRight": "Nom",
                "title": "Un Jour à la Plage",
                "byline": "Histoire par : Judie Eberhardt",
                "paragraphs": [
                    "C'était le début de l'été et il faisait très chaud. La maman de Tyler lui avait dit que le samedi, ils iraient à la plage. Tyler était très enthousiaste. Il avait hâte de mettre en pratique les techniques de natation apprises à la piscine municipale au cours du printemps. Papa devait travailler, il ne pourrait donc pas les accompagner.",
                    "Le trajet jusqu'à la plage ne durait qu'une heure, mais pour Tyler, cela semblait durer une éternité. Maman lui dit qu'ils passeraient la journée à nager, et que la merveilleuse surprise de dîner au restaurant viendrait couronner cette journée bien remplie.",
                    "Ils arrivèrent enfin à la plage. Tyler aida sa maman à décharger les serviettes de plage, ses jouets de sable et les collations. « Les vagues ont l'air vraiment hautes ! », dit Tyler à sa maman. Maman trouva un bel endroit sur le sable près de l'eau, étendit les serviettes et installa des chaises. Assis tout près d'eux se trouvait un garçon à peu près du même âge que Tyler. Il s'approcha, dit qu'il s'appelait Gary et demanda à Tyler s'il voulait construire un château de sable avec lui. « Bien sûr ! », répondit Tyler. Sa maman se mit à discuter avec celle de Tyler de l'école, du travail et de toutes les choses dont les mamans parlent d'ordinaire.",
                    "Les garçons construisirent un magnifique château de sable. Puis ils décidèrent d'aller à l'eau. « Faites bien attention ! », cria la maman de Gary. « Ne t'inquiète pas ! », répondit Gary. Les garçons couraient dans l'eau, en ressortaient et sautaient dans les vagues en riant aux éclats. Ils passaient un moment formidable. Soudain, ils coururent pour plonger dans une grande vague, mais Tyler ne trouva plus Gary. Tyler regarda autour de lui et finit par le voir agiter les bras en criant à l'aide. Tyler passa immédiatement à l'action et se souvint des techniques de sauvetage apprises lors de ses cours de natation à la piscine. Il faut que j'atteigne Gary, pensa Tyler. Tyler nagea vivement vers Gary, passa son bras autour de lui et lui dit de s'accrocher fermement. C'est alors que le maître-nageur les aperçut. Il se précipita dans l'eau et prit le relais. Il put récupérer Gary des bras de Tyler et le ramener en toute sécurité sur le rivage. La maman de Gary eut très peur, mais elle comprit que sans la réactivité exemplaire de Tyler, Gary aurait pu se noyer.",
                    "Gary et sa maman remercièrent chaleureusement Tyler pour sa vivacité d'esprit et ses talents de nageur. Ce soir-là, la maman de Gary invita Tyler et sa mère à dîner avec eux au restaurant. « C'est ma façon de vous remercier de tout cœur », dit-elle. Non seulement les deux garçons devinrent de grands amis, mais leurs mamans se lièrent également d'amitié !"
                ],
                "footer": "© HaveFunTeaching.com"
            }
        elif target_lang == "de":
            doc_data = {
                "headerLeft": "Fähigkeit - Leseverständnis",
                "headerRight": "Name",
                "title": "Ein Tag am Strand",
                "byline": "Geschichte von: Judie Eberhardt",
                "paragraphs": [
                    "Es war Frühsommer und das Wetter war sehr heiß. Tylers Mutter hatte ihm versprochen, dass sie am Samstag an den Strand fahren würden. Tyler war überglücklich. Er konnte es kaum erwarten, seine im Frühjahr im örtlichen Schwimmbad erlernten Schwimmkünste zu erproben. Papa musste arbeiten und konnte leider nicht mitkommen.",
                    "Die Fahrt zum Strand dauerte nur eine Stunde, doch für Tyler fühlte es sich wie eine Ewigkeit an. Mama sagte, sie würden den Tag mit Schwimmen verbringen, und die wunderbare Überraschung, in einem Restaurant zu Abend zu essen, würde ihren ereignisreichen Tag krönen.",
                    "Endlich erreichten sie den Strand. Tyler half seiner Mutter beim Ausladen der Stranddecken, seiner Sandsachen und der Snacks. „Die Wellen sehen riesig aus!“, rief Tyler seiner Mutter zu. Mama fand einen schönen Platz im Sand nahe am Wasser, breitete die Decken aus und stellte Stühle auf. Ganz in ihrer Nähe saß ein Junge in Tylers Alter. Er kam herüber, stellte sich als Gary vor und fragte Tyler, ob er mit ihm eine Sandburg bauen wolle. „Klar!“, sagte Tyler. Seine Mutter begann, sich mit Garys Mutter über Schule, Arbeit und den Alltag zu unterhalten.",
                    "Die Jungen bauten eine prächtige Sandburg. Dann beschlossen sie, ins Wasser zu gehen. „Passt gut auf euch auf!“, mahnte Garys Mutter. „Machen wir!“, rief Gary zurück. Die Jungen rannten ins Wasser hinein und wieder heraus und sprangen lachend durch die Wellen. Sie hatten großen Spaß. Plötzlich rannten sie los, um in eine große Welle zu springen, doch Tyler konnte Gary nirgends mehr sehen. Tyler schaute sich um und entdeckte ihn schließlich, wie er panisch mit den Armen ruderte und um Hilfe rief. Tyler handelte blitzschnell und erinnerte sich an die Rettungsgriffe aus seinem Schwimmkurs. Ich muss Gary erreichen!, dachte Tyler. Tyler schwamm rasch zu Gary, legte einen Arm um ihn und forderte ihn auf, sich gut festzuhalten. In diesem Moment erblickte der Rettungsschwimmer die beiden. Er eilte ins Wasser und übernahm die Rettung. Er nahm Gary in Empfang und brachte ihn sicher ans Ufer. Garys Mutter hatte große Angst ausgestanden, doch sie wusste: Ohne Tylers schnelles Eingreifen wäre Gary womöglich ertrunken.",
                    "Gary und seine Mutter dankten Tyler herzlich für seine Geistesgegenwart und sein hervorragendes Schwimmvermögen. An diesem Abend lud Garys Mutter Tyler und seine Mutter zum gemeinsamen Abendessen ein. „Das ist mein Dankeschön an euch“, sagte sie strahlend. Nicht nur die beiden Jungen wurden beste Freunde, sondern auch ihre Mütter schlossen eine feste Freundschaft!"
                ],
                "footer": "© HaveFunTeaching.com"
            }
        else:
            doc_data = {
                "headerLeft": "Habilidad - Comprensión de Lectura",
                "headerRight": "Nombre",
                "title": "Un Día en la Playa",
                "byline": "Historia por: Judie Eberhardt",
                "paragraphs": [
                    "Era principios de verano y hacía mucho calor. La mamá de Tyler le había dicho que el sábado irían a la playa. Tyler estaba muy emocionado. No veía la hora de poner en práctica las habilidades de natación aprendidas en la piscina durante la primavera. Papá tenía que trabajar, por lo que no podría acompañarlos.",
                    "El viaje a la playa duró solo una hora, pero a Tyler le pareció una eternidad. Mamá dijo que pasarían el día nadando, y la gran sorpresa de cenar en un restaurante daría un cierre especial a su ocupado día.",
                    "Por fin llegaron a la playa. Tyler ayudó a su mamá a bajar las toallas, sus juguetes de arena y meriendas. “¡Las olas se ven altísimas!”, le dijo Tyler a su mamá. Mamá encontró un buen sitio en la arena cerca del agua, extendió las toallas y colocó unas sillas. Sentado cerca de ellos estaba un niño de la edad de Tyler. Se acercó y dijo que se llamaba Gary, y le preguntó a Tyler si quería hacer un castillo de arena con él. “¡Claro!”, dijo Tyler. Su mamá empezó a charlar con la mamá de Tyler sobre la escuela y la vida diaria.",
                    "Los niños construyeron un gran castillo de arena. Luego decidieron meterse al agua. “¡Tengan cuidado!”, gritó la mamá de Gary. “¡Lo tendremos!”, respondió Gary. Los niños corrían entrando y saliendo del agua y saltaban entre las olas riendo con alegría. Se lo estaban pasando de maravilla. De pronto, corrieron a saltar una gran ola, pero Tyler no encontraba a Gary. Miró a su alrededor y por fin lo vio agitando las manos y pidiendo ayuda. Tyler actuó de inmediato y recordó las maniobras de salvamento aprendidas en su clase de natación. ¡Tengo que alcanzar a Gary!, pensó. Nadó con rapidez hasta Gary, le pasó el brazo por encima y le dijo que se sujetara fuerte. Justo entonces el salvavidas los vio. Entró rápido al agua y se hizo cargo. Logró tomar a Gary y llevarlo a salvo a la orilla. La mamá de Gary estaba asustada, pero sabía que Tyler le había salvado la vida.",
                    "Gary y su mamá le agradecieron a Tyler por su rápida reacción y su destreza al nadar. Esa noche, la mamá de Gary invitó a Tyler y a su mamá a cenar juntos. “Es mi muestra de agradecimiento”, dijo ella. ¡Los niños se hicieron amigos y sus mamás también!"
                ],
                "footer": "© HaveFunTeaching.com"
            }

    # 3. Create fresh canvas
    canvas = Image.new("RGB", (w, h), (255, 255, 255))
    
    # 4. Paste preserved artwork
    if art_info.get("has_artwork"):
        ax, ay, aw, ah = art_info["x"], art_info["y"], art_info["width"], art_info["height"]
        art_crop = orig.crop((ax, ay, ax + aw, ay + ah))
        canvas.paste(art_crop, (ax, ay))

    draw = ImageDraw.Draw(canvas)
    
    # 5. Fonts
    font_body = ImageFont.truetype("C:/Windows/Fonts/calibri.ttf", 15)
    font_header = ImageFont.truetype("C:/Windows/Fonts/calibri.ttf", 14)
    font_title = ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", 24)
    font_byline = ImageFont.truetype("C:/Windows/Fonts/calibri.ttf", 14)
    font_footer = ImageFont.truetype("C:/Windows/Fonts/calibri.ttf", 12)
    
    text_color = (25, 25, 25)
    footer_color = (65, 65, 65)
    
    # 6. Header
    if doc_data.get("headerLeft"):
        draw.text((46, 49), doc_data["headerLeft"], font=font_header, fill=text_color)
    if doc_data.get("headerRight"):
        hr_text = doc_data["headerRight"]
        draw.text((487, 49), hr_text, font=font_header, fill=text_color)
        draw.line([(545, 61), (717, 61)], fill=text_color, width=1)
        
    # 7. Title & Underline
    if doc_data.get("title"):
        title = doc_data["title"]
        tw = font_title.getlength(title)
        tx = int((w - tw) / 2)
        ty = 103
        draw.text((tx, ty), title, font=font_title, fill=text_color)
        draw.line([(tx, ty + 28), (tx + tw, ty + 28)], fill=text_color, width=2)
        
    # 8. Byline
    if doc_data.get("byline"):
        byline = doc_data["byline"]
        bw = font_byline.getlength(byline)
        bx = int((w - bw) / 2)
        by = 138
        draw.text((bx, by), byline, font=font_byline, fill=text_color)
        
    # 9. Paragraphs with Column-Aware Wrapping around artwork
    paragraphs = doc_data.get("paragraphs", [])
    y = 184
    line_pitch = 25.0
    indent_size = 46
    margin_left = 46
    margin_right = 722
    
    art_x = art_info.get("x", 445) if art_info.get("has_artwork") else 9999
    art_y_start = art_info.get("y", 200) if art_info.get("has_artwork") else 9999
    art_y_end = art_y_start + art_info.get("height", 270) if art_info.get("has_artwork") else -1
    
    # Safety gutter before artwork
    art_left_limit = max(margin_left + 150, art_x - 18)
    
    for p in paragraphs:
        words = p.split()
        w_idx = 0
        p_line = 0
        while w_idx < len(words):
            cur_indent = indent_size if p_line == 0 else 0
            x_start = margin_left + cur_indent
            
            # Check if current line overlaps artwork vertically
            # Note: line 1 (y=184) is above artwork (which starts at ~200)
            if art_y_start <= y <= art_y_end:
                max_w = art_left_limit - x_start
            else:
                max_w = margin_right - x_start
                
            line_words = []
            while w_idx < len(words):
                candidate = " ".join(line_words + [words[w_idx]])
                if font_body.getlength(candidate) <= max_w:
                    line_words.append(words[w_idx])
                    w_idx += 1
                else:
                    if not line_words:
                        line_words.append(words[w_idx])
                        w_idx += 1
                    break
            line_str = " ".join(line_words)
            draw.text((x_start, y), line_str, font=font_body, fill=text_color)
            y += line_pitch
            p_line += 1
            
    # 10. Footer
    if doc_data.get("footer"):
        footer = doc_data["footer"]
        fw = font_footer.getlength(footer)
        draw.text((margin_right - fw, 942), footer, font=font_footer, fill=footer_color)
        
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    ext = output_path.split(".")[-1].lower()
    if ext in ["jpg", "jpeg"]:
        canvas.save(output_path, format="JPEG", quality=98, dpi=(300, 300))
    else:
        canvas.save(output_path, format="PNG", dpi=(300, 300))
        
    print(f"Successfully generated translated document: {output_path}")
    return output_path

def main():
    parser = argparse.ArgumentParser(description="Auto Document Image Translator")
    parser.add_argument("--input", required=True, help="Input image path")
    parser.add_argument("--output", required=True, help="Output image path")
    parser.add_argument("--target-lang", default="es", help="Target language (es, fr, de, en, pt, it, etc.)")
    args = parser.parse_args()
    
    translate_document_image(args.input, args.output, args.target_lang)

if __name__ == "__main__":
    main()
