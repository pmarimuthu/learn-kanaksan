#!/usr/bin/env python3
"""
Parse VitePress markdown lesson files → physics-app JSON lesson files.
Usage: python scripts/parse_md_to_json.py
"""
import re, json, os, sys
from pathlib import Path

# ── Paths ────────────────────────────────────────────────────────────────────
VITEPRESS_SRC = Path(__file__).parent.parent.parent / "docs" / "chapters"
# JSON files go to public/ so Nuxt serves them as static assets at /data/...
DATA_OUT      = Path(__file__).parent.parent / "public" / "data" / "chapters"

# ── VitePress folder → physics-app chapter slug + NCERT chapter number ───────
CHAPTER_MAP = {
    "01-units-and-measurement":                    ("ch02-units-measurement",         2),
    "02-motion-in-a-straight-line":                ("ch03-motion-straight-line",       3),
    "03-motion-in-a-plane":                        ("ch04-motion-plane",               4),
    "04-laws-of-motion":                           ("ch05-laws-of-motion",             5),
    "05-work-energy-power":                        ("ch06-work-energy-power",          6),
    "06-system-of-particles-rotational-motion":    ("ch07-systems-particles",          7),
    "07-gravitation":                              ("ch08-gravitation",                8),
    "08-mechanical-properties-of-solids":          ("ch09-mechanical-properties-solids", 9),
    "09-mechanical-properties-of-fluids":          ("ch10-mechanical-properties-fluids", 10),
    "10-thermal-properties-of-matter":             ("ch11-thermal-properties",         11),
    "11-thermodynamics":                           ("ch12-thermodynamics",             12),
    "12-kinetic-theory":                           ("ch13-kinetic-theory",             13),
    "13-oscillations":                             ("ch14-oscillations",               14),
    "14-waves":                                    ("ch15-waves",                      15),
}

# Standard exam tags for all lessons
EXAM_TAGS = ["JEE Main", "KCET", "Karnataka PU Board"]

# ── Parsers ──────────────────────────────────────────────────────────────────

def parse_frontmatter(text):
    """Return description from YAML front matter."""
    m = re.match(r'^---\n(.*?)\n---', text, re.DOTALL)
    if not m:
        return ""
    desc_m = re.search(r'description:\s*"([^"]+)"', m.group(1))
    return desc_m.group(1) if desc_m else ""


def parse_title(text):
    """First H1."""
    m = re.search(r'^# (.+)$', text, re.MULTILINE)
    return m.group(1).strip() if m else ""


def parse_concept_meta(text):
    """Extract chapter, section, page from <ConceptMeta .../>."""
    m = re.search(r'<ConceptMeta\s+chapter="([^"]+)"\s+section="([^"]+)"(?:\s+page="([^"]+)")?', text)
    if not m:
        return None, None, None
    return m.group(1), m.group(2), m.group(3)


def parse_concept_hero(text):
    """Extract type from <ConceptHero type="..."/>."""
    m = re.search(r'<ConceptHero\s+type="([^"]+)"', text)
    return m.group(1) if m else None


def clean_text(s: str) -> str:
    """Strip LaTeX, markdown bold/italic, list prefixes from a single string."""
    # Remove LaTeX display math $$...$$
    s = re.sub(r'\$\$.*?\$\$', '', s, flags=re.DOTALL).strip()
    # Remove inline math $...$ — strip delimiters, keep text
    s = re.sub(r'\$([^$\n]+)\$', r'\1', s)
    # Remove markdown bold/italic
    s = re.sub(r'\*\*([^*]+)\*\*', r'\1', s)
    s = re.sub(r'\*([^*]+)\*', r'\1', s)
    # Remove markdown bullet prefix
    s = re.sub(r'^[-*]\s+', '', s)
    # Remove numbered list prefix
    s = re.sub(r'^\d+\.\s+', '', s)
    return s.strip()


def parse_blocks(text):
    """
    Extract ::: TYPE [optional heading on same line]\\ncontent\\n::: blocks.
    Returns list of {type, heading, body} dicts.

    Blocks may have their content starting on the same line as ::: TYPE,
    or on subsequent lines, or both.
    """
    BLOCK_TYPES = {"idea", "formula", "real", "try", "whatif"}
    DEFAULT_HEADINGS = {
        "idea": "The Idea",
        "formula": "The Formula",
        "real": "Real-World Example",
        "try": "Try It At Home",
        "whatif": "What If…",
    }
    blocks = []
    # Use [^\n]+ for the inline part so DOTALL doesn't eat past the first line
    pattern = re.compile(
        r'^:::\s+(\w+)(?:\s+([^\n]+))?\n(.*?)^:::',
        re.MULTILINE | re.DOTALL
    )
    for m in pattern.finditer(text):
        btype = m.group(1).lower()
        if btype not in BLOCK_TYPES:
            continue

        # Content can appear on the same line as ::: TYPE (inline) and/or on following lines
        inline = (m.group(2) or "").strip()
        raw_body = (m.group(3) or "").strip()

        # Build the full list of content lines (inline first, then body)
        all_lines = []
        if inline:
            all_lines.append(inline)
        all_lines.extend(raw_body.splitlines())

        # Check if the very first non-empty line is a **bold heading** (title-only, ≤8 words)
        heading = ""
        body_parts = []
        for line in all_lines:
            stripped = line.strip()
            if not stripped:
                continue
            bold_m = re.match(r'^\*\*([^*]+)\*\*$', stripped)
            if not heading and bold_m and len(bold_m.group(1).split()) <= 8:
                heading = bold_m.group(1)
                continue
            cleaned = clean_text(stripped)
            if cleaned:
                body_parts.append(cleaned)

        body = "\n".join(body_parts).strip()
        if not heading:
            heading = DEFAULT_HEADINGS.get(btype, btype.title())

        if body:
            blocks.append({"type": btype, "heading": heading, "body": body})

    return blocks


def parse_quiz(text):
    """
    Extract <Quiz question="..." :options="[...]" explanation="..."/> blocks.
    Returns list of {id, question, options, answer, explanation} dicts.
    """
    questions = []
    # Match the whole Quiz component (may span multiple lines)
    quiz_pat = re.compile(
        r'<Quiz\s+question="([^"]+)"\s+:options="\[(.*?)\]"\s+explanation="([^"]+)"',
        re.DOTALL
    )
    # Also handle single-quoted
    quiz_pat2 = re.compile(
        r"<Quiz\s+question='([^']+)'\s+:options='\[(.*?)\]'\s+explanation='([^']+)'",
        re.DOTALL
    )

    for i, m in enumerate(list(quiz_pat.finditer(text)) + list(quiz_pat2.finditer(text))):
        question = m.group(1).strip()
        opts_raw = m.group(3) if quiz_pat2.pattern in m.re.pattern else m.group(2)
        explanation = m.group(3).strip()

        # Parse options: { text: '...', correct: true } or { text: "...", correct: true }
        opts_raw = m.group(2)
        opt_texts = re.findall(r'text:\s*[\'"]([^\'"]+)[\'"]', opts_raw)
        correct_idx = 0
        # Find which option has correct:true
        # Split by { ... } entries
        entries = re.findall(r'\{[^}]+\}', opts_raw)
        for j, entry in enumerate(entries):
            if 'correct: true' in entry or "correct:true" in entry:
                correct_idx = j
                break

        if not opt_texts:
            continue

        questions.append({
            "id": f"q{i+1}",
            "question": question,
            "options": opt_texts,
            "answer": correct_idx,
            "explanation": explanation,
        })

    return questions


def md_file_to_lesson(md_path: Path, chapter_slug: str, ncert_chapter: int, order: int) -> dict:
    """Convert a single markdown file to a lesson dict."""
    text = md_path.read_text(encoding="utf-8")
    slug = md_path.stem  # filename without .md

    title = parse_title(text)
    subtitle = parse_frontmatter(text)
    # Shorten subtitle if it's the SEO description (too long)
    if len(subtitle) > 120:
        subtitle = subtitle.split(".")[0].strip().rstrip(",")

    meta_ch, meta_sec, meta_page = parse_concept_meta(text)
    visual_type = parse_concept_hero(text)
    blocks = parse_blocks(text)
    quiz = parse_quiz(text)

    lesson = {
        "slug": slug,
        "title": title,
        "subtitle": subtitle,
        "chapter": chapter_slug,
        "order": order,
        "examTags": EXAM_TAGS,
        "blocks": blocks,
        "quiz": quiz,
    }
    if visual_type:
        lesson["visualType"] = visual_type
    if meta_ch:
        lesson["ncertChapter"] = ncert_chapter
    if meta_sec:
        lesson["ncertSection"] = meta_sec
    if meta_page:
        lesson["ncertPage"] = meta_page

    return lesson


# ── Chapter index titles & descriptions ──────────────────────────────────────

CHAPTER_META = {
    "ch02-units-measurement": {
        "title": "Units & Measurement",
        "icon": "📐",
        "description": "Before you can do any physics, you need to measure things — and to measure, you need agreed standards. This chapter covers the SI system, significant figures, dimensions, and dimensional analysis.",
    },
    "ch03-motion-straight-line": {
        "title": "Motion in a Straight Line",
        "icon": "➡️",
        "description": "The language of motion: position, displacement, velocity, acceleration, and the three kinematic equations that describe uniform acceleration.",
    },
    "ch04-motion-plane": {
        "title": "Motion in a Plane",
        "icon": "✈️",
        "description": "Extend kinematics to 2D: scalars vs vectors, vector addition, projectile motion, circular motion, and relative velocity.",
    },
    "ch05-laws-of-motion": {
        "title": "Laws of Motion",
        "icon": "⚡",
        "description": "Newton's three laws, inertia, momentum, impulse, friction, and equilibrium — the rules that govern every push and pull.",
    },
    "ch06-work-energy-power": {
        "title": "Work, Energy & Power",
        "icon": "🔋",
        "description": "Work done by a force, kinetic and potential energy, the work-energy theorem, conservation of energy, power, and collisions.",
    },
    "ch07-systems-particles": {
        "title": "Systems of Particles & Rotational Motion",
        "icon": "🌀",
        "description": "Centre of mass, torque, moment of inertia, angular momentum, and rolling motion — the rotational analogue of Newton's laws.",
    },
    "ch08-gravitation": {
        "title": "Gravitation",
        "icon": "🌍",
        "description": "Universal law of gravitation, gravitational field, Kepler's laws, satellites, and escape velocity.",
    },
    "ch09-mechanical-properties-solids": {
        "title": "Mechanical Properties of Solids",
        "icon": "🧱",
        "description": "Elasticity, stress, strain, Hooke's law, Young's modulus, and the stress-strain curve — how solids resist and deform under force.",
    },
    "ch10-mechanical-properties-fluids": {
        "title": "Mechanical Properties of Fluids",
        "icon": "💧",
        "description": "Pressure, Pascal's law, Archimedes' principle, Bernoulli's theorem, surface tension, and viscosity.",
    },
    "ch11-thermal-properties": {
        "title": "Thermal Properties of Matter",
        "icon": "🌡️",
        "description": "Temperature, heat, thermal expansion, calorimetry, heat transfer (conduction, convection, radiation), and Newton's law of cooling.",
    },
    "ch12-thermodynamics": {
        "title": "Thermodynamics",
        "icon": "🔥",
        "description": "Thermodynamic processes, first and second laws, heat engines, refrigerators, and the Carnot theorem.",
    },
    "ch13-kinetic-theory": {
        "title": "Kinetic Theory",
        "icon": "💨",
        "description": "Kinetic theory of gases, speed of molecules, equipartition of energy, and mean free path.",
    },
    "ch14-oscillations": {
        "title": "Oscillations",
        "icon": "🎵",
        "description": "Simple harmonic motion, energy in SHM, the simple pendulum, damped oscillations, and resonance.",
    },
    "ch15-waves": {
        "title": "Waves",
        "icon": "〰️",
        "description": "Wave motion, speed of waves, standing waves, beats, and the Doppler effect.",
    },
}

# ── Main ─────────────────────────────────────────────────────────────────────

def main():
    chapters_summary = []  # for chapters.json

    # ch01 stays draft (no source)
    chapters_summary.append({
        "num": 1, "slug": "ch01-physical-world", "title": "Physical World",
        "icon": "🌌", "status": "draft", "lessonCount": 1,
        "description": "What physics is, its scope, and the four fundamental forces of nature.",
    })

    for vp_folder, (app_slug, ncert_ch) in sorted(CHAPTER_MAP.items()):
        vp_dir = VITEPRESS_SRC / vp_folder
        if not vp_dir.exists():
            print(f"SKIP (not found): {vp_folder}")
            continue

        meta = CHAPTER_META[app_slug]
        out_dir = DATA_OUT / app_slug / "lessons"
        out_dir.mkdir(parents=True, exist_ok=True)

        # Collect lesson files (exclude index.md), sorted
        md_files = sorted([f for f in vp_dir.glob("*.md") if f.stem != "index"])

        lesson_refs = []
        for order, md_file in enumerate(md_files, start=1):
            lesson = md_file_to_lesson(md_file, app_slug, ncert_ch, order)
            out_path = out_dir / f"{md_file.stem}.json"
            out_path.write_text(json.dumps(lesson, ensure_ascii=False, indent=2))
            lesson_refs.append({"slug": md_file.stem, "title": lesson["title"], "order": order})
            print(f"  ✓ {app_slug}/{md_file.stem}.json")

        # Write chapter index
        ch_index = {
            "slug": app_slug,
            "title": meta["title"],
            "icon": meta["icon"],
            "description": meta["description"],
            "lessons": lesson_refs,
        }
        (DATA_OUT / app_slug / "index.json").write_text(
            json.dumps(ch_index, ensure_ascii=False, indent=2)
        )
        print(f"✓ {app_slug}/index.json ({len(lesson_refs)} lessons)")

        chapters_summary.append({
            "num": ncert_ch - 1,  # app num = NCERT ch num - 1 (Physical World is ch01 in app)
            "slug": app_slug,
            "title": meta["title"],
            "icon": meta["icon"],
            "status": "published",
            "lessonCount": len(lesson_refs),
            "description": meta["description"],
        })

    # Sort by num
    chapters_summary.sort(key=lambda c: c["num"])
    # Fix ch01 num
    for c in chapters_summary:
        if c["slug"] == "ch01-physical-world":
            c["num"] = 1
        else:
            c["num"] = c["num"] + 1  # offset by 1 since ch01 is Physical World

    out_ch_json = DATA_OUT.parent / "chapters.json"
    out_ch_json.write_text(json.dumps(chapters_summary, ensure_ascii=False, indent=2))
    print(f"\n✓ chapters.json ({len(chapters_summary)} chapters)")


if __name__ == "__main__":
    main()
