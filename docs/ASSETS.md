# Medalhas e emblemas

As medalhas foram restauradas com a ferramenta integrada ImageGen, usando os prints do proprietário como referência. Não são recortes retangulares dos prints. Arquivos WebP com transparência em `public/img/medals`, com conversão e redução para 256 pixels após restauração. O emblema Desafiante em `public/img/challenger-rank.webp` foi restaurado separadamente. As asas, anéis, luzes e partículas são SVG/CSS, com redução de movimento respeitada.

As artes das skins são as imagens originais já presentes no projeto. Os nomes seguem a [página oficial da Samira no Wild Rift](https://wildrift.leagueoflegends.com/pt-br/champions/samira/), consultada em 30/10/2026. O enquadramento é feito por CSS por skin, preservando o arquivo original.

Os temas de elo alteram cores e efeitos. Mestre, Grão-Mestre e Desafiante têm emblemas próprios. Os demais elos usam um escudo estilizado temático; Soberano usa uma variação temática do emblema Desafiante. Não são apresentações oficiais idênticas do cliente do jogo.

## Prompts de restauração

### mvp

Reconstruct ONLY the left MVP medal from this reference as a polished high-resolution standalone game UI asset. Exact text MVP, crisp readable serif capitals on a navy blue diamond, dimensional brushed gold beveled frame with pointed lower crest. Faithfully retain the reference silhouette, colors and proportions. Restore details and clean jagged/blurry edges with premium craftsmanship. Centered, front-on, consistent balanced padding, tightly framed. No S or A medals. No screenshot background, no unrelated marks. Transparent background with real alpha, no checkerboard. This is a clean restoration, not a rectangular screenshot crop.

### rank-s

Restore ONLY the middle gold S performance medal as a standalone high-resolution game UI asset. Exact single serif capital S in luminous ivory gold, round dark bronze/navy center, finely beveled double gold circular border, small diamond ornament at the top and bottom, subtle angular side wings matching the supplied reference. Faithful shape and colors, polished detailed metal, crisp edges, front-facing centered with tight consistent padding. No MVP or A, no other text. Genuine transparent alpha background, no checkerboard or screenshot backdrop. Carefully reconstruct details rather than a screenshot crop.

### rank-a

Restore ONLY the right gold A performance medal as a standalone high-resolution game UI asset. Exact single serif capital A in luminous ivory gold, round dark bronze/navy center, finely beveled double gold circular border, small diamond ornament at the top and bottom, subtle angular side wings matching the supplied reference. Faithful shape and colors, polished detailed metal, crisp edges, front-facing centered with tight consistent padding. No MVP or S, no other text. Genuine transparent alpha background, no checkerboard or screenshot backdrop. Carefully reconstruct details rather than a screenshot crop.

### svp

Restore this SVP medal into a clean standalone high-resolution game UI asset. Exact text SVP in elegant pale gold serif capitals. Faithfully retain the navy diamond center, double dimensional metallic gold diamond outline and pointed lower blue-gold crest. Refine symmetrical geometry and recreate crisp gold bevel highlights, do not simply crop/upscale the blurry screenshot. Front-facing centered tightly framed with balanced padding. No extra icons/text. Genuine transparent alpha background, no checkerboard or screenshot background.

### triple

Restore the supplied Wild Rift multikill numeral UI icon as one high-resolution standalone transparent asset. Exact numeral 3, angular calligraphic fantasy game typography, italic right-leaning, broad sculpted gold-to-ivory beveled strokes and the distinctive diagonal slash cutting across the middle as in reference. Faithful numeral silhouette; crisp edges and rich metallic detail, not blurry screenshot crop. Single centered numeral only, no words or frame, tight consistent balanced padding. Real transparent alpha background, no checkerboard, no photograph backdrop.

### quadra

Restore the supplied Wild Rift multikill numeral UI icon as one high-resolution standalone transparent asset. Exact numeral 4, angular calligraphic fantasy game typography, italic right-leaning, broad sculpted icy blue-to-ivory beveled strokes and the distinctive diagonal slash cutting across the middle as in reference. Faithful numeral silhouette; crisp edges and rich metallic detail, not blurry screenshot crop. Single centered numeral only, no words or frame, tight consistent balanced padding. Real transparent alpha background, no checkerboard, no photograph backdrop.

### penta

Restore the supplied Wild Rift multikill numeral UI icon as one high-resolution standalone transparent asset. Exact numeral 5, angular calligraphic fantasy game typography, italic right-leaning, broad sculpted icy blue-to-violet-to-ivory beveled strokes and the distinctive diagonal slash cutting across the middle as in reference. Faithful numeral silhouette; crisp edges and rich metallic detail, not blurry screenshot crop. Single centered numeral only, no words or frame, tight consistent balanced padding. Real transparent alpha background, no checkerboard, no photograph backdrop.
# Refinamento dos emblemas — 31/10/2026

Substituídas as asas SVG de Mestre/Grão-Mestre por artes completas restauradas com a ferramenta integrada image_gen, a partir das duas referências enviadas pelo proprietário. Não são arquivos oficiais originais da Riot: são restaurações assistidas das referências. Fundo transparente preservado, conversão WebP 640×640, renderização responsiva e animação discreta separada. Sem recorte retangular do screenshot. Arquivos: public/img/ranks/master-complete-v2.webp e grandmaster-complete-v2.webp. Os outros elos conservam seus emblemas/cores, sem reaproveitar essas asas como se fossem de outro elo.

Prompt Mestre: “Use case: background-extraction / precise-object-edit. Restore the MASTER rank medallion in the reference screenshot as a pristine high-resolution UI game asset on a genuinely TRANSPARENT background. Extract and carefully reconstruct the COMPLETE central purple metallic helmet, icy blue luminous circular frame with its angular notches at the top and bottom, and both magenta/violet crystalline layered wings, sharp upward tips and fine gold edges. Match the original screenshot proportions and silhouette faithfully: wide circular ring nearly touches the wings, narrow angular feather blades fan outward and sweep upward, fine overlapping bright diagonal veins. Keep the original intricate realistic fantasy game rendering, violet highlights and dark metal in helmet. Reconstruct clean edges and missing fine detail, not a rough screenshot crop. Remove ALL background, title, subtitles, numbers, gems under circle, text and UI. Isolated symmetrical emblem only, centered, ample transparent padding to contain subtle glow, square canvas. No text, no extra feathers or new ornament, no stylization into flat SVG or cartoon. This will display at 220px width so crisp distinct ring and wing silhouette matters.”

Prompt Grão-Mestre: “Use case: background-extraction / precise-object-edit. Restore the GRANDMASTER rank medallion in the reference screenshot as a pristine high-resolution UI game asset on a genuinely TRANSPARENT background. Reconstruct COMPLETE central dark silver/black and ruby metallic helmet, fine brushed-gold circular frame with angular top notches and both ruby/red crystalline layered wings with sharp gold edges. Faithfully match this screenshot: upward pointed wing tips, swept outward angular feather panels with bright diagonal veins, ring occupies most height between the wings, balanced wide silhouette. Keep realistic original detailed fantasy game metal and luminous ruby rendering. Restore clean high-resolution edges not a rough crop. Remove ALL background, title, numbers, text, gem under ring, UI. Isolated symmetrical full emblem, centered with ample transparent padding containing faint red glow on square canvas. No text, no invented new ornament, no flat SVG or cartoon simplification. To display at 220px width so fine sharp feathers and gold rim must be clear.”
