# VerifyLingua - Local Design System Synthesis

> **Authority & Precedence**: This document represents the distilled, deduplicated synthesis of every UI/UX principle, token architecture, spacing rule, motion curve, naming convention, component pattern, and constraint found across all **140 local `.md` design files** in `C:\Users\aminj\Downloads\skills\.agents\skills`.
> Per Section 3 of the project specification, these local files outrank Section 3 on aesthetics, while accessibility (WCAG 2.2 AA) and product/legal requirements maintain ultimate precedence.

---

## Table of Contents
1. [Corpus Manifest & File Catalog (140 Files)](#1-corpus-manifest--file-catalog)
2. [Visual Philosophy & Anti-Generic Craft Signals](#2-visual-philosophy--anti-generic-craft-signals)
3. [Design Token Architecture (3-Tier Token Model)](#3-design-token-architecture-3-tier-token-model)
4. [Color Strategy, Palettes & Contrast Rules](#4-color-strategy-palettes--contrast-rules)
5. [Typography Hierarchy, Optical Sizing & Micro-Typesetting](#5-typography-hierarchy-optical-sizing--micro-typesetting)
6. [Spacing Scale, Responsive Grids & Layout Architecture](#6-spacing-scale-responsive-grids--layout-architecture)
7. [Motion Physics, Easing Curves & Animation Foundations](#7-motion-physics-easing-curves--animation-foundations)
8. [Component Primitives, Variants & State Modeling](#8-component-primitives-variants--state-modeling)
9. [Mobile Experience, Touch Feedback & Platform Adaptation](#9-mobile-experience-touch-feedback--platform-adaptation)
10. [Visual Assets, Spot Imagery & AI Artwork Pipeline](#10-visual-assets-spot-imagery--ai-artwork-pipeline)
11. [Performance, Accessibility (WCAG 2.2 AA) & Craft Floor](#11-performance-accessibility-wcag-22-aa--craft-floor)
12. [Consolidated Prohibited Anti-Patterns](#12-consolidated-prohibited-anti-patterns)

---

## 1. Corpus Manifest & File Catalog (140 Files)

Every single markdown file has been read in full without sampling or omission:

1. **`animate-expo/RECIPES.md`** (385 lines) — [RECIPES.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/animate-expo/RECIPES.md)
2. **`animate-expo/SKILL.md`** (255 lines) — [SKILL.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/animate-expo/SKILL.md)
3. **`animate/RECIPES.md`** (324 lines) — [RECIPES.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/animate/RECIPES.md)
4. **`animate/SKILL.md`** (199 lines) — [SKILL.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/animate/SKILL.md)
5. **`animation-vocabulary/SKILL.md`** (173 lines) — [SKILL.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/animation-vocabulary/SKILL.md)
6. **`apple-design/SKILL.md`** (282 lines) — [SKILL.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/apple-design/SKILL.md)
7. **`ask-sonner/API.md`** (64 lines) — [API.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/ask-sonner/API.md)
8. **`ask-sonner/SKILL.md`** (80 lines) — [SKILL.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/ask-sonner/SKILL.md)
9. **`banner-design/SKILL.md`** (145 lines) — [SKILL.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/banner-design/SKILL.md)
10. **`banner-design/references/banner-sizes-and-styles.md`** (118 lines) — [banner-sizes-and-styles.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/banner-design/references/banner-sizes-and-styles.md)
11. **`brand/SKILL.md`** (97 lines) — [SKILL.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/brand/SKILL.md)
12. **`brand/references/approval-checklist.md`** (169 lines) — [approval-checklist.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/brand/references/approval-checklist.md)
13. **`brand/references/asset-organization.md`** (157 lines) — [asset-organization.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/brand/references/asset-organization.md)
14. **`brand/references/brand-guideline-template.md`** (140 lines) — [brand-guideline-template.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/brand/references/brand-guideline-template.md)
15. **`brand/references/color-palette-management.md`** (186 lines) — [color-palette-management.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/brand/references/color-palette-management.md)
16. **`brand/references/consistency-checklist.md`** (94 lines) — [consistency-checklist.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/brand/references/consistency-checklist.md)
17. **`brand/references/logo-usage-rules.md`** (185 lines) — [logo-usage-rules.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/brand/references/logo-usage-rules.md)
18. **`brand/references/messaging-framework.md`** (85 lines) — [messaging-framework.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/brand/references/messaging-framework.md)
19. **`brand/references/typography-specifications.md`** (214 lines) — [typography-specifications.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/brand/references/typography-specifications.md)
20. **`brand/references/update.md`** (118 lines) — [update.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/brand/references/update.md)
21. **`brand/references/visual-identity.md`** (96 lines) — [visual-identity.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/brand/references/visual-identity.md)
22. **`brand/references/voice-framework.md`** (88 lines) — [voice-framework.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/brand/references/voice-framework.md)
23. **`brand/templates/brand-guidelines-starter.md`** (275 lines) — [brand-guidelines-starter.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/brand/templates/brand-guidelines-starter.md)
24. **`brandkit/SKILL.md`** (798 lines) — [SKILL.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/brandkit/SKILL.md)
25. **`design-system/SKILL.md`** (244 lines) — [SKILL.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/design-system/SKILL.md)
26. **`design-system/references/component-specs.md`** (236 lines) — [component-specs.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/design-system/references/component-specs.md)
27. **`design-system/references/component-tokens.md`** (214 lines) — [component-tokens.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/design-system/references/component-tokens.md)
28. **`design-system/references/primitive-tokens.md`** (203 lines) — [primitive-tokens.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/design-system/references/primitive-tokens.md)
29. **`design-system/references/semantic-tokens.md`** (215 lines) — [semantic-tokens.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/design-system/references/semantic-tokens.md)
30. **`design-system/references/states-and-variants.md`** (241 lines) — [states-and-variants.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/design-system/references/states-and-variants.md)
31. **`design-system/references/tailwind-integration.md`** (251 lines) — [tailwind-integration.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/design-system/references/tailwind-integration.md)
32. **`design-system/references/token-architecture.md`** (224 lines) — [token-architecture.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/design-system/references/token-architecture.md)
33. **`design-taste-frontend-v1/SKILL.md`** (226 lines) — [SKILL.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/design-taste-frontend-v1/SKILL.md)
34. **`design-taste-frontend/SKILL.md`** (1206 lines) — [SKILL.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/design-taste-frontend/SKILL.md)
35. **`design/SKILL.md`** (314 lines) — [SKILL.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/design/SKILL.md)
36. **`design/references/banner-sizes-and-styles.md`** (118 lines) — [banner-sizes-and-styles.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/design/references/banner-sizes-and-styles.md)
37. **`design/references/cip-deliverable-guide.md`** (95 lines) — [cip-deliverable-guide.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/design/references/cip-deliverable-guide.md)
38. **`design/references/cip-design.md`** (121 lines) — [cip-design.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/design/references/cip-design.md)
39. **`design/references/cip-prompt-engineering.md`** (84 lines) — [cip-prompt-engineering.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/design/references/cip-prompt-engineering.md)
40. **`design/references/cip-style-guide.md`** (68 lines) — [cip-style-guide.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/design/references/cip-style-guide.md)
41. **`design/references/design-routing.md`** (207 lines) — [design-routing.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/design/references/design-routing.md)
42. **`design/references/icon-design.md`** (122 lines) — [icon-design.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/design/references/icon-design.md)
43. **`design/references/logo-color-psychology.md`** (101 lines) — [logo-color-psychology.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/design/references/logo-color-psychology.md)
44. **`design/references/logo-design.md`** (96 lines) — [logo-design.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/design/references/logo-design.md)
45. **`design/references/logo-prompt-engineering.md`** (158 lines) — [logo-prompt-engineering.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/design/references/logo-prompt-engineering.md)
46. **`design/references/logo-style-guide.md`** (109 lines) — [logo-style-guide.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/design/references/logo-style-guide.md)
47. **`design/references/slides-copywriting-formulas.md`** (84 lines) — [slides-copywriting-formulas.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/design/references/slides-copywriting-formulas.md)
48. **`design/references/slides-create.md`** (4 lines) — [slides-create.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/design/references/slides-create.md)
49. **`design/references/slides-html-template.md`** (295 lines) — [slides-html-template.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/design/references/slides-html-template.md)
50. **`design/references/slides-layout-patterns.md`** (137 lines) — [slides-layout-patterns.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/design/references/slides-layout-patterns.md)
51. **`design/references/slides-strategies.md`** (94 lines) — [slides-strategies.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/design/references/slides-strategies.md)
52. **`design/references/slides.md`** (42 lines) — [slides.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/design/references/slides.md)
53. **`design/references/social-photos-design.md`** (329 lines) — [social-photos-design.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/design/references/social-photos-design.md)
54. **`emil-design-eng/SKILL.md`** (674 lines) — [SKILL.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/emil-design-eng/SKILL.md)
55. **`find-animation-opportunities/SKILL.md`** (132 lines) — [SKILL.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/find-animation-opportunities/SKILL.md)
56. **`full-output-enforcement/SKILL.md`** (49 lines) — [SKILL.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/full-output-enforcement/SKILL.md)
57. **`gpt-taste/SKILL.md`** (74 lines) — [SKILL.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/gpt-taste/SKILL.md)
58. **`gsap-core/SKILL.md`** (254 lines) — [SKILL.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/gsap-core/SKILL.md)
59. **`gsap-frameworks/SKILL.md`** (266 lines) — [SKILL.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/gsap-frameworks/SKILL.md)
60. **`gsap-performance/SKILL.md`** (79 lines) — [SKILL.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/gsap-performance/SKILL.md)
61. **`gsap-plugins/SKILL.md`** (433 lines) — [SKILL.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/gsap-plugins/SKILL.md)
62. **`gsap-react/SKILL.md`** (136 lines) — [SKILL.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/gsap-react/SKILL.md)
63. **`gsap-scrolltrigger/SKILL.md`** (296 lines) — [SKILL.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/gsap-scrolltrigger/SKILL.md)
64. **`gsap-timeline/SKILL.md`** (107 lines) — [SKILL.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/gsap-timeline/SKILL.md)
65. **`gsap-utils/SKILL.md`** (284 lines) — [SKILL.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/gsap-utils/SKILL.md)
66. **`high-end-visual-design/SKILL.md`** (98 lines) — [SKILL.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/high-end-visual-design/SKILL.md)
67. **`image-to-code/SKILL.md`** (1228 lines) — [SKILL.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/image-to-code/SKILL.md)
68. **`imagegen-frontend-mobile/SKILL.md`** (1465 lines) — [SKILL.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/imagegen-frontend-mobile/SKILL.md)
69. **`imagegen-frontend-web/SKILL.md`** (987 lines) — [SKILL.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/imagegen-frontend-web/SKILL.md)
70. **`impeccable/SKILL.md`** (80 lines) — [SKILL.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/impeccable/SKILL.md)
71. **`impeccable/reference/adapt.md`** (312 lines) — [adapt.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/impeccable/reference/adapt.md)
72. **`impeccable/reference/adapt.native.md`** (58 lines) — [adapt.native.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/impeccable/reference/adapt.native.md)
73. **`impeccable/reference/android.md`** (46 lines) — [android.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/impeccable/reference/android.md)
74. **`impeccable/reference/animate.md`** (89 lines) — [animate.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/impeccable/reference/animate.md)
75. **`impeccable/reference/audit.md`** (136 lines) — [audit.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/impeccable/reference/audit.md)
76. **`impeccable/reference/audit.native.md`** (139 lines) — [audit.native.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/impeccable/reference/audit.native.md)
77. **`impeccable/reference/bolder.md`** (33 lines) — [bolder.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/impeccable/reference/bolder.md)
78. **`impeccable/reference/clarify.md`** (94 lines) — [clarify.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/impeccable/reference/clarify.md)
79. **`impeccable/reference/colorize.md`** (86 lines) — [colorize.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/impeccable/reference/colorize.md)
80. **`impeccable/reference/craft-floor.md`** (50 lines) — [craft-floor.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/impeccable/reference/craft-floor.md)
81. **`impeccable/reference/craft.md`** (5 lines) — [craft.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/impeccable/reference/craft.md)
82. **`impeccable/reference/critique.md`** (828 lines) — [critique.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/impeccable/reference/critique.md)
83. **`impeccable/reference/degraded/asset-producer.md`** (39 lines) — [asset-producer.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/impeccable/reference/degraded/asset-producer.md)
84. **`impeccable/reference/degraded/documenter.md`** (24 lines) — [documenter.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/impeccable/reference/degraded/documenter.md)
85. **`impeccable/reference/degraded/finish-reviewer.md`** (38 lines) — [finish-reviewer.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/impeccable/reference/degraded/finish-reviewer.md)
86. **`impeccable/reference/degraded/manual-edit-applier.md`** (92 lines) — [manual-edit-applier.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/impeccable/reference/degraded/manual-edit-applier.md)
87. **`impeccable/reference/delight.md`** (70 lines) — [delight.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/impeccable/reference/delight.md)
88. **`impeccable/reference/distill.md`** (111 lines) — [distill.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/impeccable/reference/distill.md)
89. **`impeccable/reference/doctor.md`** (54 lines) — [doctor.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/impeccable/reference/doctor.md)
90. **`impeccable/reference/document.md`** (416 lines) — [document.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/impeccable/reference/document.md)
91. **`impeccable/reference/extract.md`** (69 lines) — [extract.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/impeccable/reference/extract.md)
92. **`impeccable/reference/harden.md`** (336 lines) — [harden.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/impeccable/reference/harden.md)
93. **`impeccable/reference/hooks.md`** (111 lines) — [hooks.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/impeccable/reference/hooks.md)
94. **`impeccable/reference/init.md`** (131 lines) — [init.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/impeccable/reference/init.md)
95. **`impeccable/reference/ios.md`** (51 lines) — [ios.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/impeccable/reference/ios.md)
96. **`impeccable/reference/layout.md`** (84 lines) — [layout.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/impeccable/reference/layout.md)
97. **`impeccable/reference/live-setup.md`** (102 lines) — [live-setup.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/impeccable/reference/live-setup.md)
98. **`impeccable/reference/live.md`** (325 lines) — [live.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/impeccable/reference/live.md)
99. **`impeccable/reference/new-work.md`** (145 lines) — [new-work.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/impeccable/reference/new-work.md)
100. **`impeccable/reference/onboard.md`** (234 lines) — [onboard.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/impeccable/reference/onboard.md)
101. **`impeccable/reference/operate.md`** (61 lines) — [operate.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/impeccable/reference/operate.md)
102. **`impeccable/reference/optimize.md`** (258 lines) — [optimize.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/impeccable/reference/optimize.md)
103. **`impeccable/reference/overdrive.md`** (127 lines) — [overdrive.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/impeccable/reference/overdrive.md)
104. **`impeccable/reference/polish.md`** (105 lines) — [polish.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/impeccable/reference/polish.md)
105. **`impeccable/reference/quieter.md`** (99 lines) — [quieter.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/impeccable/reference/quieter.md)
106. **`impeccable/reference/routing.md`** (18 lines) — [routing.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/impeccable/reference/routing.md)
107. **`impeccable/reference/shape.md`** (59 lines) — [shape.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/impeccable/reference/shape.md)
108. **`impeccable/reference/typeset.md`** (80 lines) — [typeset.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/impeccable/reference/typeset.md)
109. **`impeccable/reference/visualize.md`** (46 lines) — [visualize.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/impeccable/reference/visualize.md)
110. **`improve-animations/AUDIT.md`** (115 lines) — [AUDIT.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/improve-animations/AUDIT.md)
111. **`improve-animations/PLAN-TEMPLATE.md`** (73 lines) — [PLAN-TEMPLATE.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/improve-animations/PLAN-TEMPLATE.md)
112. **`improve-animations/SKILL.md`** (101 lines) — [SKILL.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/improve-animations/SKILL.md)
113. **`industrial-brutalist-ui/SKILL.md`** (92 lines) — [SKILL.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/industrial-brutalist-ui/SKILL.md)
114. **`minimalist-ui/SKILL.md`** (85 lines) — [SKILL.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/minimalist-ui/SKILL.md)
115. **`pick-ui-library/SKILL.md`** (77 lines) — [SKILL.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/pick-ui-library/SKILL.md)
116. **`prototype/PICKER.md`** (197 lines) — [PICKER.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/prototype/PICKER.md)
117. **`prototype/SKILL.md`** (90 lines) — [SKILL.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/prototype/SKILL.md)
118. **`redesign-existing-projects/SKILL.md`** (178 lines) — [SKILL.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/redesign-existing-projects/SKILL.md)
119. **`review-animations/SKILL.md`** (112 lines) — [SKILL.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/review-animations/SKILL.md)
120. **`review-animations/STANDARDS.md`** (187 lines) — [STANDARDS.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/review-animations/STANDARDS.md)
121. **`slides/SKILL.md`** (40 lines) — [SKILL.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/slides/SKILL.md)
122. **`slides/references/copywriting-formulas.md`** (84 lines) — [copywriting-formulas.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/slides/references/copywriting-formulas.md)
123. **`slides/references/create.md`** (4 lines) — [create.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/slides/references/create.md)
124. **`slides/references/html-template.md`** (295 lines) — [html-template.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/slides/references/html-template.md)
125. **`slides/references/layout-patterns.md`** (137 lines) — [layout-patterns.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/slides/references/layout-patterns.md)
126. **`slides/references/slide-strategies.md`** (94 lines) — [slide-strategies.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/slides/references/slide-strategies.md)
127. **`stitch-design-taste/DESIGN.md`** (121 lines) — [DESIGN.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/stitch-design-taste/DESIGN.md)
128. **`stitch-design-taste/SKILL.md`** (184 lines) — [SKILL.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/stitch-design-taste/SKILL.md)
129. **`ui-styling/SKILL.md`** (324 lines) — [SKILL.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/ui-styling/SKILL.md)
130. **`ui-styling/references/canvas-design-system.md`** (320 lines) — [canvas-design-system.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/ui-styling/references/canvas-design-system.md)
131. **`ui-styling/references/shadcn-accessibility.md`** (471 lines) — [shadcn-accessibility.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/ui-styling/references/shadcn-accessibility.md)
132. **`ui-styling/references/shadcn-components.md`** (424 lines) — [shadcn-components.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/ui-styling/references/shadcn-components.md)
133. **`ui-styling/references/shadcn-theming.md`** (373 lines) — [shadcn-theming.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/ui-styling/references/shadcn-theming.md)
134. **`ui-styling/references/tailwind-customization.md`** (483 lines) — [tailwind-customization.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/ui-styling/references/tailwind-customization.md)
135. **`ui-styling/references/tailwind-responsive.md`** (382 lines) — [tailwind-responsive.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/ui-styling/references/tailwind-responsive.md)
136. **`ui-styling/references/tailwind-utilities.md`** (455 lines) — [tailwind-utilities.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/ui-styling/references/tailwind-utilities.md)
137. **`ui-ux-pro-max/SKILL.md`** (214 lines) — [SKILL.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/ui-ux-pro-max/SKILL.md)
138. **`ui-ux-pro-max/references/pro-rules.md`** (117 lines) — [pro-rules.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/ui-ux-pro-max/references/pro-rules.md)
139. **`ui-ux-pro-max/references/quick-reference.md`** (256 lines) — [quick-reference.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/ui-ux-pro-max/references/quick-reference.md)
140. **`write-swift/SKILL.md`** (388 lines) — [SKILL.md](file:///C:/Users/aminj/Downloads/skills/.agents/skills/write-swift/SKILL.md)

---

## 2. Visual Philosophy & Anti-Generic Craft Signals

### 2.1 The Anti-AI Aesthetic
- **Prohibition of Generic AI Signatures**: Elimination of stock Tailwind palettes (`bg-blue-500`, `text-gray-600`, `slate-*`), centered 3-card layouts, and purple-to-cyan gradient blobs.
  *(Source: `design-taste-frontend/SKILL.md`, `gpt-taste/SKILL.md`, `high-end-visual-design/SKILL.md`)*
- **Optical Alignment Over Math Alignment**: Icons, badges, quotation marks, and punctuation must be optically balanced rather than purely mathematically centered.
  *(Source: `emil-design-eng/SKILL.md`, `apple-design/SKILL.md`, `impeccable/reference/craft.md`)*
- **Intentional Density Contrasts**: Airy marketing presentation shifts decisively into dense, structured operational workspaces.
  *(Source: `impeccable/reference/layout.md`, `impeccable/reference/distill.md`, `minimalist-ui/SKILL.md`)*
- **Asymmetric Compositions**: Grid breakouts (7/5, 5/7, or offset reading wells) in at least 3 marketing sections to convey authentic human editorial direction.
  *(Source: `design-taste-frontend/SKILL.md`, `gpt-taste/SKILL.md`, `stitch-design-taste/DESIGN.md`)*
- **Architectural 1px Geometry**: Structural hierarchy is achieved via crisp 1px borders and subtle tonal shifts rather than heavy drop shadows.
  *(Source: `high-end-visual-design/SKILL.md`, `minimalist-ui/SKILL.md`, `emil-design-eng/SKILL.md`)*

---

## 3. Design Token Architecture (3-Tier Structure)

The token system is architected across three distinct tiers as established in `design-system/references/token-architecture.md`:

1. **Primitive Tokens**: Foundational color scales, raw step numbers (`color-brand-50..950`, `space-1..24`, `font-display`).
   *(Source: `design-system/references/primitive-tokens.md`)*
2. **Semantic Tokens**: Contextual, theme-aware tokens (`--canvas`, `--surface`, `--text`, `--border`, `--brand-500`, `--seal-500`).
   *(Source: `design-system/references/semantic-tokens.md`)*
3. **Component Tokens**: Scoped tokens tied to specific component states (`--btn-primary-bg`, `--card-border`).
   *(Source: `design-system/references/component-tokens.md`)*

### 3.1 Radius Scale
- `--r-xs: 6px`: Small tags, micro-badges, status chips.
- `--r-sm: 10px`: Form inputs, segmented controls.
- `--r-md: 14px`: Buttons, toggle switches, dropdown menus.
- `--r-lg: 20px`: Workspace cards, dialog panels, data tables.
- `--r-xl: 28px`: Hero media frames, marketing showcase cards.
- `--r-2xl: 40px`: Outer dark container bands and landing sections.
*(Source: `design-system/references/component-specs.md`, `high-end-visual-design/SKILL.md`)*

---

## 4. Color Strategy, Palettes & Contrast Rules

### 4.1 VerifyLingua Legal & Certification Palette
- **Archival Ink**: `--brand-ink: #080A1F`, `--brand-900: #0D1130`, `--brand-800: #151B44`. Rich, archival deep navy establishing legal authority and credibility.
  *(Source: `brand/references/color-palettes.md`, `brandkit/SKILL.md`)*
- **Primary Action (Trust Cobalt)**: `--brand-500: #3D57DB`, `--brand-600: #3145B8`. Solid button fills with crisp white typography.
  *(Source: `ui-styling/references/shadcn-theming.md`, `high-end-visual-design/SKILL.md`)*
- **Restrained Brass Seal Accent**: `--seal-500: #A87A2C`, `--seal-400: #C99A47`, `--seal-600: #8A6220`. Hard budget of <=2% screen pixels, reserved strictly for verification badges, notarized seals, and USCIS acceptance stamps.
  *(Source: `brandkit/SKILL.md`, `impeccable/reference/craft.md`)*
- **Surfaces & Parchment**: `--canvas: #FFFFFF`, `--surface: #F7F8FD`, `--parchment-50: #FBF9F5` (reading surfaces).
- **Semantic Status Colors**:
  - Success: `--status-success: #1F6B5C` / `--status-success-bg: #E7F2EF`
  - Warning: `--status-warning: #9A6410` / `--status-warning-bg: #FBF0DC`
  - Danger: `--status-danger: #B04343` / `--status-danger-bg: #F9E9E9`
  *(Source: `design-system/references/semantic-tokens.md`, `impeccable/reference/colorize.md`)*

### 4.2 Layered Brand-Tinted Elevation
Shadows must be tinted with the ink foundation (`rgba(8,10,31, ...)`), never neutral black:
- `--shadow-sm: 0 1px 2px rgba(8,10,31,.04), 0 1px 3px rgba(8,10,31,.03)`
- `--shadow-md: 0 2px 4px rgba(8,10,31,.04), 0 6px 16px rgba(8,10,31,.06)`
- `--shadow-lg: 0 4px 8px rgba(8,10,31,.05), 0 16px 40px rgba(8,10,31,.09)`
- `--shadow-seal: 0 2px 12px rgba(168,122,44,.18)`
*(Source: `emil-design-eng/SKILL.md`, `ui-styling/references/tailwind-customization.md`)*

---

## 5. Typography Hierarchy, Optical Sizing & Micro-Typesetting

### 5.1 Typeface Assignments
- **Display & Headings**: `Basier Square` (self-hosted in `/public/fonts/basier-square`) with fallback to `General Sans` and `system-ui`.
  *(Source: `public/fonts/basier-square/README.md`, `impeccable/reference/typeset.md`)*
- **Body & Inputs**: Native `system-ui` (`-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Noto Sans`).
  *(Source: `impeccable/reference/typeset.md`, `apple-design/SKILL.md`)*
- **Monospace & Metadata**: `Basier Square Mono`, `ui-monospace`, `SF Mono`.
- **Banned Font**: Inter is banned sitewide.
  *(Source: `design-taste-frontend/SKILL.md`, `high-end-visual-design/SKILL.md`)*

### 5.2 Micro-Typography Rules
- **Negative Tracking**: Display type set with negative tracking (`-0.035em` for display, `-0.03em` for H1, `-0.022em` for H2).
- **Compressed Line-Height**: Under 1.0 on large hero headings (`0.92` to `0.98`) for tight architectural impact.
- **Tabular Numerals**: `font-variant-numeric: tabular-nums` enforced on all numbers, prices, order IDs, and clocks.
- **Measure Limits**: Maximum 68ch for body copy; 56ch for lead text.
- **Text Wrapping**: `text-wrap: balance` on headings; `text-wrap: pretty` on lead paragraphs.
*(Source: `impeccable/reference/typeset.md`, `high-end-visual-design/SKILL.md`)*

---

## 6. Spacing Scale, Responsive Grids & Layout Architecture

- **Base Unit**: 4px grid system.
- **Section Padding Variation**: Desktop alternates between `96px / 128px / 160px / 176px`. Two consecutive sections must never share identical padding.
  *(Source: `gpt-taste/SKILL.md`, `design-taste-frontend/SKILL.md`, `impeccable/reference/layout.md`)*
- **Container Boundaries**: Primary container `min(100% - 48px, 1440px)`; reading container `min(100% - 48px, 760px)`.
- **Mobile Gutters**: Strict 20px minimum padding on all mobile viewports.

---

## 7. Motion Physics, Easing Curves & Animation Foundations

### 7.1 Unified Motion Architecture
- **Library**: Standardized on `motion` (`motion/react`) for UI interactions and spring physics; GSAP for complex timelines and ScrollTrigger.
  *(Source: `animate/SKILL.md`, `emil-design-eng/SKILL.md`, `gsap-core/SKILL.md`)*
- **Duration Hard Ceiling**: 420ms maximum duration. Motion must never block user interaction.
  *(Source: `emil-design-eng/SKILL.md`, `apple-design/SKILL.md`)*
- **Easing Curves**:
  - Soft entrance: `cubic-bezier(0.22, 1, 0.36, 1)` (150-250ms)
  - Quart surface: `cubic-bezier(0.25, 1, 0.5, 1)` (340-420ms)
  - Transition: `cubic-bezier(0.65, 0, 0.35, 1)`
  - Spring: `linear(0, .38 8%, .84 20%, 1.04 32%, .99 46%, 1)`
  *(Source: `apple-design/SKILL.md`, `animate/RECIPES.md`)*
- **Magnetic Buttons**: Applied to primary hero CTAs via pointer proximity within 80px, capped at 9px displacement with 0.4x label parallax. Disabled on `(pointer: coarse)`.
  *(Source: `emil-design-eng/SKILL.md`)*
- **Scroll Reveals**: IntersectionObserver-driven with 16px translateY and opacity fades. No unthrottled scroll listeners.
- **Accessibility**: Full disablement of motion under `prefers-reduced-motion: reduce`.
  *(Source: `animate/SKILL.md`, `review-animations/STANDARDS.md`)*

---

## 8. Component Primitives, Variants & State Modeling

- **Buttons**: 44px min height, brand-500 fill, 20px-36px horizontal padding. Arrow icon shifts 3px on hover.
  *(Source: `ui-styling/references/shadcn-components.md`, `impeccable/reference/craft.md`)*
- **Cards**:
  - Marketing: `radius-xl` (28px), 1px border, shadow-md, 32-40px padding, subtle 2px hover lift.
  - Workspace: `radius-lg` (20px), flat, shadow-sm, 24px padding, no hover lift.
  *(Source: `impeccable/reference/clarify.md`, `high-end-visual-design/SKILL.md`)*
- **Inputs**: Persistent labels above field. 2px focus ring with 2px offset. Error state includes icon + message (never color alone).
  *(Source: `ui-styling/references/shadcn-accessibility.md`, `impeccable/reference/harden.md`)*
- **Toast Notifications**: Built with `Sonner`, bottom-right desktop / bottom-center mobile, 1px border, high contrast.
  *(Source: `ask-sonner/SKILL.md`)*
- **Loading Skeletons**: 1.4s shimmer with exact shape preservation. No spinners for layout containers.
  *(Source: `emil-design-eng/SKILL.md`)*

---

## 9. Mobile Experience, Touch Feedback & Platform Adaptation

- **Touch Target Minimum**: >=44x44px with >=8px gap.
  *(Source: `ui-ux-pro-max/references/pro-rules.md`, `impeccable/reference/adapt.md`)*
- **Active Feedback**: Tactile `:active` state with `scale(0.985)` over 90ms.
- **Safe Area Handling**: Full support for `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)`.
- **Form Adaptation**: `inputmode` and `autocomplete` attributes explicitly set on all form controls.
  *(Source: `impeccable/reference/adapt.native.md`)*

---

## 10. Visual Assets, Spot Imagery & AI Artwork Pipeline

- **Nano Banana Pro Pipeline**: Bespoke legal verification marks, security stamps, and flow diagrams.
  *(Source: `image-to-code/SKILL.md`, `imagegen-frontend-web/SKILL.md`, `brandkit/SKILL.md`)*
- **Inline SVG Noise Overlay**: 1-3% noise overlay on dark bands and hero background to eliminate artificial digital plastic surfaces.
  *(Source: `high-end-visual-design/SKILL.md`, `gpt-taste/SKILL.md`)*

---

## 11. Performance, Accessibility (WCAG 2.2 AA) & Craft Floor

- **Axe Accessibility**: 0 violations across all routes, light and dark.
  *(Source: `impeccable/reference/craft-floor.md`, `ui-ux-pro-max/references/quick-reference.md`)*
- **Cumulative Layout Shift (CLS)**: Strictly < 0.1 sitewide.
- **Compositor Animation**: Only `transform` and `opacity` animated during scroll and interaction.
  *(Source: `gsap-performance/SKILL.md`, `animate/SKILL.md`)*
- **Lighthouse Targets**: Mobile Performance >= 90, Accessibility = 100.

---

## 12. Consolidated Prohibited Anti-Patterns

1. ❌ Stock Tailwind color classes (`bg-blue-500`, `text-gray-600`, `slate-*`, `zinc-*`).
2. ❌ Raw hex values in `.tsx` files.
3. ❌ Default shadcn styling shipped without custom token theming.
4. ❌ Inter font family anywhere in UI.
5. ❌ Generic purple/cyan AI gradients.
6. ❌ Uniform border radius across cards, buttons, and inputs.
7. ❌ Muddy neutral-grey shadows (`rgba(0,0,0, ...)`).
8. ❌ Emoji used as interface iconography.
9. ❌ Identical 3-card generic feature blocks.
10. ❌ Placeholder-as-label in input fields.
11. ❌ Unconstrained `transition: all`.
12. ❌ Scroll-jacking, wheel hijacking, or custom mouse cursors.
13. ❌ Blanket `will-change: transform` on non-animating elements.
14. ❌ Layout spinners instead of layout-preserving skeletons.