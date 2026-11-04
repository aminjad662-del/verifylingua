const fs = require('fs');
const path = require('path');

const base = 'c:\\Users\\aminj\\Downloads\\SAAS 7\\components\\marketing';

// ─── 5. SynthesiaCompetitorGrid.tsx ───
{
  let src = fs.readFileSync(path.join(base, 'SynthesiaCompetitorGrid.tsx'), 'utf8');
  
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
    /<\/div>\s*\r?\n\s*\r?\n\s*\{\/\* 3x3 Grid/,
    '</motion.div>\n\n        {/* 3x3 Grid'
  );
  
  // Wrap each competitor card
  src = src.replace(
    /<div\s*\r?\n\s*key=\{idx\}\s*\r?\n\s*className="p-6 sm:p-7 rounded-2xl bg-surface-raised border border-border hover:border-brand-300 hover:shadow-md transition-all flex flex-col justify-between space-y-6 group"/,
    '<motion.div\n              key={idx}\n              initial={{ opacity: 0, y: 20 }}\n              whileInView={{ opacity: 1, y: 0 }}\n              transition={{ duration: 0.45, delay: idx * 0.06, ease: [0.22, 1, 0.36, 1] }}\n              viewport={{ once: true }}\n              className="p-6 sm:p-7 rounded-2xl bg-surface-raised border border-border hover:border-brand-300 hover:shadow-md transition-all flex flex-col justify-between space-y-6 group"'
  );
  
  // Close the competitor card motion.div
  src = src.replace(
    /(<\/div>\s*\r?\n\s*<\/div>\s*\r?\n\s*\)\)}\s*\r?\n\s*<\/div>)/,
    (match) => match.replace(/<\/div>\s*\r?\n\s*\)\)/, '</motion.div>\n          ))')
  );
  
  fs.writeFileSync(path.join(base, 'SynthesiaCompetitorGrid.tsx'), src);
  console.log('✅ SynthesiaCompetitorGrid.tsx updated');
}

// ─── 6. SynthesiaCategoryLeader.tsx ───
{
  let src = fs.readFileSync(path.join(base, 'SynthesiaCategoryLeader.tsx'), 'utf8');
  
  // Add motion import
  src = src.replace(
    'import React from "react";',
    'import React from "react";\nimport { motion } from "motion/react";'
  );
  
  // Wrap the top 2-column grid
  src = src.replace(
    '<div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">',
    '<motion.div initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} viewport={{ once: true, margin: "-80px" }} className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">'
  );
  
  // Close the top grid motion.div
  src = src.replace(
    /        <\/div>\s*\r?\n\s*\r?\n\s*\{\/\* .*Bottom Ribbon/,
    '        </motion.div>\n\n        {/* ─── Bottom Ribbon'
  );
  
  fs.writeFileSync(path.join(base, 'SynthesiaCategoryLeader.tsx'), src);
  console.log('✅ SynthesiaCategoryLeader.tsx updated');
}

// ─── 7. SynthesiaDarkPreFooter.tsx ───
{
  let src = fs.readFileSync(path.join(base, 'SynthesiaDarkPreFooter.tsx'), 'utf8');
  
  // Add motion import
  src = src.replace(
    'import React, { useState } from "react";',
    'import React, { useState } from "react";\nimport { motion } from "motion/react";'
  );
  
  // Wrap the headline block (eyebrow badge through feature highlights)
  src = src.replace(
    '        {/* Top Eyebrow Badge */}',
    '        <motion.div initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} viewport={{ once: true, margin: "-80px" }}>\n        {/* Top Eyebrow Badge */'
  );
  src = src.replace(
    '        {/* Interactive Verified Sample Document Strip */}',
    '        </motion.div>\n\n        {/* Interactive Verified Sample Document Strip */'
  );
  
  // Add idx to doc map
  src = src.replace(
    '{sampleDocs.map((doc) => {',
    '{sampleDocs.map((doc, idx) => {'
  );
  
  fs.writeFileSync(path.join(base, 'SynthesiaDarkPreFooter.tsx'), src);
  console.log('✅ SynthesiaDarkPreFooter.tsx updated');
}

// ─── 8. SynthesiaWhyLoveBento.tsx ───
{
  let src = fs.readFileSync(path.join(base, 'SynthesiaWhyLoveBento.tsx'), 'utf8');
  
  // Already imports motion from "motion/react" - no change needed
  
  // Wrap section heading
  src = src.replace(
    '<div className="text-center max-w-3xl mx-auto space-y-4">',
    '<motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} viewport={{ once: true, margin: "-60px" }} className="text-center max-w-3xl mx-auto space-y-4">'
  );
  src = src.replace(
    /<\/div>\s*\r?\n\s*\r?\n\s*\{\/\* 3-Card Bento Stack/,
    '</motion.div>\n\n        {/* 3-Card Bento Stack'
  );
  
  fs.writeFileSync(path.join(base, 'SynthesiaWhyLoveBento.tsx'), src);
  console.log('✅ SynthesiaWhyLoveBento.tsx updated');
}

// ─── 9. SynthesiaDarkHowItWorks.tsx ───
{
  let src = fs.readFileSync(path.join(base, 'SynthesiaDarkHowItWorks.tsx'), 'utf8');
  
  // Already imports motion from "motion/react" - no change needed
  
  // Wrap the dark container in motion.div
  src = src.replace(
    '<div className="rounded-3xl bg-obsidian-950 border border-obsidian-border p-6 sm:p-12 shadow-2xl relative overflow-hidden">',
    '<motion.div initial={{ opacity: 0, y: 48, scale: 0.98 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} viewport={{ once: true, margin: "-100px" }} className="rounded-3xl bg-obsidian-950 border border-obsidian-border p-6 sm:p-12 shadow-2xl relative overflow-hidden">'
  );
  
  // Close the outer dark container motion.div
  src = src.replace(
    /        <\/div>\s*\r?\n\s*<\/div>\s*\r?\n\s*<\/div>\s*\r?\n\s*<\/section>/,
    '        </motion.div>\n      </div>\n    </section>'
  );
  
  fs.writeFileSync(path.join(base, 'SynthesiaDarkHowItWorks.tsx'), src);
  console.log('✅ SynthesiaDarkHowItWorks.tsx updated');
}

console.log('\n🎉 Batch 2 complete (5 components)');
