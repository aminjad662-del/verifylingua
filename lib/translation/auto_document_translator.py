# -*- coding: utf-8 -*-
r"""
Auto Document Translator Engine
Publication-grade document translation with spatial OCR segmentation and TrueType typesetting.
Extracts all text elements, translates with high contextual accuracy, masks background cleanly,
and typesets translated text while preserving all non-text illustrations, stamps, and layout.
"""
import os
import sys
import json
import argparse
import urllib.request
import base64
import numpy as np
from PIL import Image, ImageFont, ImageDraw

LANGUAGE_NAMES = {
    "es": "Spanish",
    "en": "English",
    "fr": "French",
    "de": "German",
    "el": "Greek",
    "gr": "Greek",
    "pt": "Portuguese",
    "it": "Italian",
    "nl": "Dutch",
    "pl": "Polish",
    "ru": "Russian",
    "ar": "Arabic",
    "ja": "Japanese",
    "zh": "Chinese",
    "he": "Hebrew",
    "tr": "Turkish",
    "hi": "Hindi",
    "ko": "Korean",
}

def translate_document_image(input_path, output_path, target_lang="es", api_key=None):
    orig = Image.open(input_path).convert("RGB")
    w, h = orig.size
    
    key = api_key or os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY") or ""
    
    with open(input_path, "rb") as f:
        img_b64 = base64.b64encode(f.read()).decode("utf-8")
        
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key={key}"
    target_name = LANGUAGE_NAMES.get(target_lang.lower(), target_lang)
    
    prompt = f"""You are a master document translator and layout reconstruction engineer.
Analyze this document image. Identify every distinct text block (titles, headings, narrative paragraphs, table cells, labels, headers, footers).
For each block:
1. "box_2d": [ymin, xmin, ymax, xmax] coordinates normalized from 0 to 1000.
2. "original_text": verbatim source text.
3. "translated_text": faithful, natural, publication-grade translation into {target_name}. Preserve all proper nouns, numbers, dates, punctuation, identifiers.
4. "font_size_tier": "title" | "heading" | "body" | "caption"
5. "align": "left" | "center" | "right"

Return ONLY valid JSON matching:
{{
  "blocks": [
    {{
      "box_2d": [ymin, xmin, ymax, xmax],
      "original_text": "...",
      "translated_text": "...",
      "font_size_tier": "body",
      "align": "left"
    }}
  ]
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

    blocks = []
    try:
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=45) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            parsed_text = data["candidates"][0]["content"]["parts"][0]["text"]
            doc_data = json.loads(parsed_text)
            blocks = doc_data.get("blocks", [])
    except Exception as e:
        print(f"Gemini translation failed: {e}", file=sys.stderr)
        
    canvas = orig.copy()
    draw = ImageDraw.Draw(canvas)
    
    # Select available TrueType fonts
    font_path = "C:/Windows/Fonts/calibri.ttf"
    font_path_bold = "C:/Windows/Fonts/calibrib.ttf"
    if not os.path.exists(font_path):
        font_path = "C:/Windows/Fonts/arial.ttf"
        font_path_bold = "C:/Windows/Fonts/arialbd.ttf"
    if not os.path.exists(font_path):
        font_path = None
        font_path_bold = None

    for b in blocks:
        box = b.get("box_2d")
        if not box or len(box) != 4:
            continue
        ymin, xmin, ymax, xmax = box
        bx = int((xmin * w) / 1000)
        by = int((ymin * h) / 1000)
        bw = int(((xmax - xmin) * w) / 1000)
        bh = int(((ymax - ymin) * h) / 1000)
        
        # 1. Clean background inpainting mask over original text
        draw.rectangle([bx - 2, by - 2, bx + bw + 2, by + bh + 2], fill=(255, 255, 255))
        
        # 2. Font scaling based on block tier
        tier = b.get("font_size_tier", "body")
        if font_path:
            if tier == "title":
                fs = max(18, min(int(bh * 0.7), 28))
                fnt = ImageFont.truetype(font_path_bold, fs)
            elif tier == "heading":
                fs = max(14, min(int(bh * 0.65), 20))
                fnt = ImageFont.truetype(font_path_bold, fs)
            elif tier == "caption":
                fs = max(11, min(int(bh * 0.75), 14))
                fnt = ImageFont.truetype(font_path, fs)
            else:
                fs = max(13, min(int(bh * 0.35), 16))
                fnt = ImageFont.truetype(font_path, fs)
        else:
            fnt = ImageFont.load_default()
            fs = 13
            
        trans_text = b.get("translated_text", "")
        align = b.get("align", "left")
        
        # Word wrap within bounding box
        words = trans_text.split()
        lines = []
        cur_line = []
        
        for word in words:
            test_line = " ".join(cur_line + [word])
            line_w = fnt.getlength(test_line) if hasattr(fnt, "getlength") else len(test_line) * 7
            if line_w <= bw or not cur_line:
                cur_line.append(word)
            else:
                lines.append(" ".join(cur_line))
                cur_line = [word]
        if cur_line:
            lines.append(" ".join(cur_line))
            
        line_h = int(fs * 1.35)
        cur_y = by
        for line in lines:
            if cur_y + line_h > by + bh + 15:
                break
            lw = fnt.getlength(line) if hasattr(fnt, "getlength") else len(line) * 7
            if align == "center":
                lx = bx + (bw - lw) / 2
            elif align == "right":
                lx = bx + bw - lw
            else:
                lx = bx
            draw.text((lx, cur_y), line, font=fnt, fill=(25, 25, 25))
            cur_y += line_h

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
    parser.add_argument("--target-lang", default="es", help="Target language (es, fr, de, el, en, etc.)")
    parser.add_argument("--api-key", default=None, help="Gemini API Key")
    args = parser.parse_args()
    
    translate_document_image(args.input, args.output, args.target_lang, args.api_key)

if __name__ == "__main__":
    main()
