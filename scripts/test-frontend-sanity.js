/**
 * ArenaMind-AI Frontend Sanity Check Script
 * Statically validates React components, checking properties, exports, and layout definitions.
 */

const fs = require('fs');
const path = require('path');

const COMPONENTS_DIR = path.join(__dirname, '..', 'frontend', 'src');

const filesToCheck = [
  {
    name: 'App.jsx',
    filePath: path.join(COMPONENTS_DIR, 'App.jsx'),
    patterns: [
      'export default function App',
      'const [started, setStarted]',
      'const [activeFeature, setActiveFeature]',
      'calculateAccessibilityScore',
      'toggleDemoMode'
    ]
  },
  {
    name: 'Header.jsx',
    filePath: path.join(COMPONENTS_DIR, 'components', 'Header.jsx'),
    patterns: [
      'export default function Header',
      'safetyLens',
      'isDemoMode',
      'activeFeature',
      'setActiveFeature'
    ]
  },
  {
    name: 'StadiumMap.jsx',
    filePath: path.join(COMPONENTS_DIR, 'components', 'StadiumMap.jsx'),
    patterns: [
      'export default function StadiumMap',
      'safetyLens',
      'pois',
      'alerts'
    ]
  },
  {
    name: 'ChatAssistant.jsx',
    filePath: path.join(COMPONENTS_DIR, 'components', 'ChatAssistant.jsx'),
    patterns: [
      'export default function ChatAssistant',
      'safetyLens',
      'role',
      'language'
    ]
  }
];

function runSanityCheck() {
  console.log('==================================================');
  console.log('Starting ArenaMind-AI Frontend Sanity Checks...');
  console.log('==================================================\n');

  let passed = true;

  for (const file of filesToCheck) {
    console.log(`[CHECK] Validating ${file.name}...`);
    
    if (!fs.existsSync(file.filePath)) {
      console.error(`✕ FAIL: File does not exist at ${file.filePath}\n`);
      passed = false;
      continue;
    }

    try {
      const content = fs.readFileSync(file.filePath, 'utf8');
      let filePassed = true;

      for (const pattern of file.patterns) {
        if (!content.includes(pattern)) {
          console.error(`  ✕ MISSING: Did not find required signature/hook: "${pattern}"`);
          filePassed = false;
          passed = false;
        }
      }

      if (filePassed) {
        console.log(`✓ PASS: ${file.name} structure is intact.\n`);
      } else {
        console.log(`✕ FAIL: ${file.name} has structural anomalies.\n`);
      }
    } catch (err) {
      console.error(`✕ FAIL: Failed to read ${file.name} with error:`, err.message, '\n');
      passed = false;
    }
  }

  console.log('==================================================');
  if (passed) {
    console.log('ALL FRONTEND SANITY CHECKS PASSED.');
    process.exit(0);
  } else {
    console.error('FRONTEND SANITY CHECKS DETECTED ANOMALIES.');
    process.exit(1);
  }
}

runSanityCheck();
