const fs = require('fs');
const path = require('path');

const base = 'c:\\Users\\aminj\\Downloads\\SAAS 7\\components\\marketing';

// ─── 1. SynthesiaTrustPills.tsx ───
{
  let src = fs.readFileSync(path.join(base, 'SynthesiaTrustPills.tsx'), 'utf8');
  
  // Add motion import
  src = src.replace(
    'import React from "react";',
    'import React from "react";\nimport { motion } from "motion/react";'
  );
  
  // Wrap heading
  src = src.replace(
    '<div className="text-center max-w-3xl mx-auto space-y-3">',
    '<motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} viewport={{ once: true, margin: "-60px" }} className="text-center max-w-3xl mx-auto space-y-3">'
  );
  // Close it
  src = src.replace(
    /<\/div>\s*\r?\n\s*\r?\n\s*\{\/\* 4 Horizontal Pills/,
    '</motion.div>\n\n        {/* 4 Horizontal Pills'
  );
  
  // Wrap each pill card
  src = src.replace(
    /<div\s*\r?\n\s*key=\{idx\}\s*\r?\n\s*className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-surface border border-border\/80 shadow-xs hover:border-brand-300 hover:shadow-sm transition-all flex items-start gap-3\.5 group cursor-default"/,
    '<motion.div\n                key={idx}\n                initial={{ opacity: 0, y: 20 }}\n                whileInView={{ opacity: 1, y: 0 }}\n                transition={{ duration: 0.5, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] }}\n                viewport={{ once: true }}\n                className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-surface border border-border/80 shadow-xs hover:border-brand-300 hover:shadow-sm transition-all flex items-start gap-3.5 group cursor-default"'
  );
  
  // Close motion.div for pills (find the closing </div> for each pill)
  src = src.replace(
    /(<\/div>\s*\r?\n\s*<\/div>\s*\r?\n\s*\);\s*\r?\n\s*\}\)\}\s*\r?\n\s*<\/div>)/,
    (match) => match.replace(/<\/div>\s*\r?\n\s*\);/, '</motion.div>\n            );')
  );
  
  fs.writeFileSync(path.join(base, 'SynthesiaTrustPills.tsx'), src);
  console.log('✅ SynthesiaTrustPills.tsx updated');
}

// ─── 2. SynthesiaStatsCards.tsx ───
{
  let src = fs.readFileSync(path.join(base, 'SynthesiaStatsCards.tsx'), 'utf8');
  
  // Add motion import
  src = src.replace(
    'import React from "react";',
    'import React from "react";\nimport { motion } from "motion/react";'
  );
  
  // Wrap section header
  src = src.replace(
    '<div className="text-center max-w-3xl mx-auto space-y-3">',
    '<motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} viewport={{ once: true, margin: "-60px" }} className="text-center max-w-3xl mx-auto space-y-3">'
  );
  src = src.replace(
    /<\/div>\s*\r?\n\s*\r?\n\s*\{\/\* 3 Large Stat Cards/,
    '</motion.div>\n\n        {/* 3 Large Stat Cards'
  );
  
  // Wrap each stat card
  src = src.replace(
    /<div\s*\r?\n\s*key=\{idx\}\s*\r?\n\s*className="p-8 sm:p-10 rounded-2xl sm:rounded-3xl bg-surface-raised border border-border hover:border-brand-300 hover:shadow-md transition-all flex flex-col justify-between space-y-8 group"/,
    '<motion.div\n              key={idx}\n              initial={{ opacity: 0, y: 24 }}\n              whileInView={{ opacity: 1, y: 0 }}\n              transition={{ duration: 0.5, delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] }}\n              viewport={{ once: true }}\n              className="p-8 sm:p-10 rounded-2xl sm:rounded-3xl bg-surface-raised border border-border hover:border-brand-300 hover:shadow-md transition-all flex flex-col justify-between space-y-8 group"'
  );
  
  // Close motion.div for stat cards
  src = src.replace(
    /(<\/div>\s*\r?\n\s*<\/div>\s*\r?\n\s*\)\)}\s*\r?\n\s*<\/div>)/,
    (match) => match.replace(/<\/div>\s*\r?\n\s*\)\)/, '</motion.div>\n          ))')
  );
  
  fs.writeFileSync(path.join(base, 'SynthesiaStatsCards.tsx'), src);
  console.log('✅ SynthesiaStatsCards.tsx updated');
}

// ─── 3. AcceptanceNetworkBanner.tsx ───
{
  let src = fs.readFileSync(path.join(base, 'AcceptanceNetworkBanner.tsx'), 'utf8');
  
  // Add motion import
  src = src.replace(
    'import React from "react";',
    'import React from "react";\nimport { motion } from "motion/react";'
  );
  
  // Fix font-mono on eyebrow badge (monospace discipline)
  src = src.replace('text-xs font-mono font-bold uppercase', 'text-xs font-sans font-bold uppercase');
  
  // Fix font-mono on jurisdiction type
  src = src.replace('text-[10px] text-ink-softer font-mono pt-1', 'text-[10px] text-ink-softer font-sans pt-1');
  
  // Wrap main gradient panel in motion.div
  src = src.replace(
    '<div className="rounded-[var(--r-2xl)] bg-gradient-panel border border-brand-100/80 p-8 sm:p-12 md:p-16 relative overflow-hidden shadow-xl text-center space-y-8">',
    '<motion.div initial={{ opacity: 0, y: 40, scale: 0.98 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} viewport={{ once: true, margin: "-60px" }} className="rounded-[var(--r-2xl)] bg-gradient-panel border border-brand-100/80 p-8 sm:p-12 md:p-16 relative overflow-hidden shadow-xl text-center space-y-8">'
  );
  
  // Close the outer motion.div (replace the closing tag before </div></section>)
  src = src.replace(
    /        <\/div>\s*\r?\n\s*<\/div>\s*\r?\n\s*<\/section>/,
    '        </motion.div>\n      </div>\n    </section>'
  );
  
  fs.writeFileSync(path.join(base, 'AcceptanceNetworkBanner.tsx'), src);
  console.log('✅ AcceptanceNetworkBanner.tsx updated');
}

// ─── 4. FAQSection.tsx ───
{
  let src = fs.readFileSync(path.join(base, 'FAQSection.tsx'), 'utf8');
  
  // Add motion import
  src = src.replace(
    'import Image from "next/image";',
    'import Image from "next/image";\nimport { motion } from "motion/react";'
  );
  
  // Wrap left column sidebar
  src = src.replace(
    '<div className="lg:col-span-4 space-y-6 lg:sticky lg:top-28">',
    '<motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} viewport={{ once: true, margin: "-60px" }} className="lg:col-span-4 space-y-6 lg:sticky lg:top-28">'
  );
  
  // Close left column motion.div and wrap right column
  src = src.replace(
    /          <\/div>\s*\r?\n\s*\r?\n\s*\{\/\* Right Column \(Expandable Accordion 8-col\) \*\/\}\s*\r?\n\s*<div className="lg:col-span-8 space-y-4">/,
    '          </motion.div>\n\n          {/* Right Column (Expandable Accordion 8-col) */}\n          <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }} viewport={{ once: true, margin: "-60px" }} className="lg:col-span-8 space-y-4">'
  );
  
  // Close right column motion.div
  src = src.replace(
    /          <\/div>\s*\r?\n\s*<\/div>\s*\r?\n\s*<\/div>\s*\r?\n\s*<\/section>/,
    '          </motion.div>\n        </div>\n      </div>\n    </section>'
  );
  
  fs.writeFileSync(path.join(base, 'FAQSection.tsx'), src);
  console.log('✅ FAQSection.tsx updated');
}

console.log('\n🎉 Batch 1 complete (4 components)');
