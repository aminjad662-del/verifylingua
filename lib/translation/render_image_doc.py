# -*- coding: utf-8 -*-
r"""
High-Precision Image Document Layout & Typography Renderer
Uses PIL/Pillow with TrueType fonts to inpaint original text and render translated text
with column-aware wrapping, paragraph indents, and illustration preservation.
"""
import os
import sys
import json
import argparse
from PIL import Image, ImageFont, ImageDraw

# Font lookup dictionary
FONT_MAP = {
    "calibri": {
        "regular": "C:/Windows/Fonts/calibri.ttf",
        "bold": "C:/Windows/Fonts/calibrib.ttf",
        "italic": "C:/Windows/Fonts/calibrii.ttf",
    },
    "arial": {
        "regular": "C:/Windows/Fonts/arial.ttf",
        "bold": "C:/Windows/Fonts/arialbd.ttf",
        "italic": "C:/Windows/Fonts/ariali.ttf",
    },
    "times": {
        "regular": "C:/Windows/Fonts/times.ttf",
        "bold": "C:/Windows/Fonts/timesbd.ttf",
        "italic": "C:/Windows/Fonts/timesi.ttf",
    },
    "segoe": {
        "regular": "C:/Windows/Fonts/segoeui.ttf",
        "bold": "C:/Windows/Fonts/segoeuib.ttf",
        "italic": "C:/Windows/Fonts/segoeuii.ttf",
    }
}

def get_font(family, size, is_bold=False, is_italic=False):
    family_lower = (family or "calibri").lower()
    style = "regular"
    if is_bold and is_italic:
        style = "bold" # fallback to bold if bi not available
    elif is_bold:
        style = "bold"
    elif is_italic:
        style = "italic"
        
    for k in FONT_MAP:
        if k in family_lower:
            path = FONT_MAP[k].get(style) or FONT_MAP[k]["regular"]
            if os.path.exists(path):
                return ImageFont.truetype(path, int(size))
                
    # Fallback to standard system fonts
    for fallback in ["C:/Windows/Fonts/calibri.ttf", "C:/Windows/Fonts/arial.ttf"]:
        if os.path.exists(fallback):
            return ImageFont.truetype(fallback, int(size))
            
    return ImageFont.load_default()

def render_image_document(input_path, output_path, spec):
    orig = Image.open(input_path).convert("RGB")
    w, h = orig.size
    
    # 1. Base canvas
    bg_color = tuple(spec.get("bgColor", [255, 255, 255]))
    canvas = Image.new("RGB", (w, h), bg_color)
    
    # 2. Preserve non-text artwork / illustrations
    illustrations = spec.get("illustrations", [])
    for ill in illustrations:
        ix, iy, iw, ih = ill["x"], ill["y"], ill["width"], ill["height"]
        ix1 = max(0, min(w, ix))
        iy1 = max(0, min(h, iy))
        ix2 = max(0, min(w, ix + iw))
        iy2 = max(0, min(h, iy + ih))
        if ix2 > ix1 and iy2 > iy1:
            crop = orig.crop((ix1, iy1, ix2, iy2))
            canvas.paste(crop, (ix1, iy1))
            
    draw = ImageDraw.Draw(canvas)
    
    # 3. Render decorative rules/lines if present
    for line in spec.get("lines", []):
        x1, y1 = line["start"]
        x2, y2 = line["end"]
        lw = line.get("width", 1)
        lc = tuple(line.get("color", [25, 25, 25]))
        draw.line([(x1, y1), (x2, y2)], fill=lc, width=lw)
        
    # 4. Render text blocks
    blocks = spec.get("blocks", [])
    for b in blocks:
        text = b.get("text", "")
        if not text:
            continue
            
        x = b.get("x", 46)
        y = b.get("y", 100)
        size = b.get("fontSize", 15)
        family = b.get("fontFamily", "calibri")
        is_bold = b.get("isBold", False)
        is_italic = b.get("isItalic", False)
        color = tuple(b.get("color", [25, 25, 25]))
        align = b.get("align", "left")
        indent = b.get("indent", 0)
        max_w = b.get("wrapWidth", None)
        line_height = b.get("lineHeight", int(size * 1.5))
        is_underlined = b.get("isUnderlined", False)
        
        font = get_font(family, size, is_bold, is_italic)
        
        # Word wrapping if wrapWidth is specified
        if max_w and max_w > 0:
            words = text.split()
            w_idx = 0
            cur_y = y
            line_idx = 0
            while w_idx < len(words):
                cur_indent = indent if line_idx == 0 else 0
                avail_w = max_w - cur_indent
                line_words = []
                while w_idx < len(words):
                    candidate = " ".join(line_words + [words[w_idx]])
                    if font.getlength(candidate) <= avail_w:
                        line_words.append(words[w_idx])
                        w_idx += 1
                    else:
                        if not line_words:
                            line_words.append(words[w_idx])
                            w_idx += 1
                        break
                line_str = " ".join(line_words)
                lw = font.getlength(line_str)
                
                # Compute line X based on alignment
                if align == "center":
                    line_x = x + (avail_w - lw) / 2 + cur_indent
                elif align == "right":
                    line_x = x + avail_w - lw
                else:
                    line_x = x + cur_indent
                    
                draw.text((line_x, cur_y), line_str, font=font, fill=color)
                
                if is_underlined:
                    ul_y = cur_y + size + 2
                    draw.line([(line_x, ul_y), (line_x + lw, ul_y)], fill=color, width=b.get("underlineWidth", 2))
                    
                cur_y += line_height
                line_idx += 1
        else:
            # Single line render
            lw = font.getlength(text)
            if align == "center":
                target_w = b.get("width", w)
                line_x = x + (target_w - lw) / 2
            elif align == "right":
                target_w = b.get("width", w)
                line_x = x + target_w - lw
            else:
                line_x = x + indent
                
            draw.text((line_x, y), text, font=font, fill=color)
            if is_underlined:
                ul_y = y + size + 4
                draw.line([(line_x, ul_y), (line_x + lw, ul_y)], fill=color, width=b.get("underlineWidth", 2))
                
    # Save output
    ext = output_path.split(".")[-1].lower()
    fmt = "JPEG" if ext in ["jpg", "jpeg"] else "PNG"
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    if fmt == "JPEG":
        canvas.save(output_path, format="JPEG", quality=98, dpi=(300, 300))
    else:
        canvas.save(output_path, format="PNG", dpi=(300, 300))
        
    print(f"SUCCESS: Rendered {len(blocks)} blocks to {output_path}")

def main():
    parser = argparse.ArgumentParser(description="High-Precision Document Image Renderer")
    parser.add_argument("--input", required=True, help="Input image path")
    parser.add_argument("--output", required=True, help="Output image path")
    parser.add_argument("--spec", required=True, help="Path to layout spec JSON file or raw JSON string")
    args = parser.parse_args()
    
    if os.path.exists(args.spec):
        with open(args.spec, "r", encoding="utf-8") as f:
            spec = json.load(f)
    else:
        spec = json.loads(args.spec)
        
    render_image_document(args.input, args.output, spec)

if __name__ == "__main__":
    main()
