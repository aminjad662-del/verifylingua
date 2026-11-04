const fs = require('fs');
const path = require('path');
const base = 'c:\\Users\\aminj\\Downloads\\SAAS 7\\components\\marketing';

// ─── SynthesiaDarkPreFooter.tsx ───
{
  let src = fs.readFileSync(path.join(base, 'SynthesiaDarkPreFooter.tsx'), 'utf8');
  
  // Add motion import (after useState import)
  src = src.replace(
    'import React, { useState } from "react";\r\n',
    'import React, { useState } from "react";\r\nimport { motion } from "motion/react";\r\n'
  );
  
  // Wrap headline block: insert <motion.div> INSIDE the relative container, before eyebrow
  // Target: right after the relative container opens
  src = src.replace(
    '        {/* Top Eyebrow Badge */}\r\n',
    '        <motion.div initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} viewport={{ once: true, margin: "-80px" }}>\r\n        {/* Top Eyebrow Badge */}\r\n'
  );
  
  // Close motion.div before the document strip
  src = src.replace(
    '        {/* Interactive Verified Sample Document Strip */}\r\n',
    '        </motion.div>\r\n\r\n        {/* Interactive Verified Sample Document Strip */}\r\n'
  );
  
  // Add idx to doc map
  src = src.replace(
    '{sampleDocs.map((doc) => {\r\n',
    '{sampleDocs.map((doc, idx) => {\r\n'
  );
  
  fs.writeFileSync(path.join(base, 'SynthesiaDarkPreFooter.tsx'), src);
  console.log('✅ SynthesiaDarkPreFooter.tsx updated');
}

// ─── SynthesiaDarkHowItWorks.tsx ───
{
  let src = fs.readFileSync(path.join(base, 'SynthesiaDarkHowItWorks.tsx'), 'utf8');
  
  // Already imports motion - no change needed
  
  // Wrap the dark container div
  src = src.replace(
    '        <div className="rounded-3xl bg-obsidian-950 border border-obsidian-border p-6 sm:p-12 shadow-2xl relative overflow-hidden">\r\n',
    '        <motion.div initial={{ opacity: 0, y: 48, scale: 0.98 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} viewport={{ once: true, margin: "-100px" }} className="rounded-3xl bg-obsidian-950 border border-obsidian-border p-6 sm:p-12 shadow-2xl relative overflow-hidden">\r\n'
  );
  
  // Close the motion.div - need to find the exact closing sequence
  // Original ending (last ~8 lines):
  // L241:             </div>    <- closes z-10 wrapper
  // L242:           </div>      <- closes dark container (now motion.div)  
  // L243:         </div>        <- closes max-w-7xl
  // L244:       </div>          <- wait no, let me count properly
  
  // Actually the original file ends with:
  //   </div>\r\n      </div>\r\n    </section>\r\n  );\r\n}\r\n
  // That's: </div> (z-10), </div> (dark container), </div> (max-w-7xl), NO wait...
  // section > div.max-w-7xl > div.dark-container > div.z-10 > ...content...
  // So we need: </div>(z-10) </div>(dark-container->motion.div) </div>(max-w-7xl) </section>
  
  // Find the exact end - replace the second-to-last </div> with </motion.div>
  // The file ends with: ...content...</div>\r\n          </div>\r\n        </div>\r\n      </div>\r\n    </section>
  
  // I need to replace exactly the closing tag of the dark container div
  // Let's be specific: find the sequence of closing tags at the end
  src = src.replace(
    '            </div>\r\n          </div>\r\n        </div>\r\n      </div>\r\n    </section>',
    '            </div>\r\n          </div>\r\n        </motion.div>\r\n      </div>\r\n    </section>'
  );
  
  fs.writeFileSync(path.join(base, 'SynthesiaDarkHowItWorks.tsx'), src);
  
  // Verify
  const motionOpens = (src.match(/<motion\.div/g) || []).length;
  const motionCloses = (src.match(/<\/motion\.div>/g) || []).length;
  console.log('✅ SynthesiaDarkHowItWorks.tsx updated (motion.div: ' + motionOpens + ' opens, ' + motionCloses + ' closes)');
}

console.log('\n🎉 Batch 3 fixes complete');
