/**
 * ArenaMind-AI Frontend Sanity & Unit Check Script
 * Statically validates React components and runs unit tests for error classification.
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
        passed = false;
      }
    } catch (err) {
      console.error(`✕ FAIL: Failed to read ${file.name} with error:`, err.message, '\n');
      passed = false;
    }
  }

  // ================= SIMULATED UNIT TESTS FOR CHAT ERROR CLASSIFICATION =================
  console.log('==================================================');
  console.log('Running Error Classification Unit Tests...');
  console.log('==================================================\n');

  // Implementation of classifier matching ChatAssistant.jsx exactly
  function classifyError(err) {
    const errMsg = (err.message || '').toLowerCase();
    const errName = err.name || '';
    const status = err.status || null;

    const isNetworkError =
      errName === 'TypeError' ||
      errMsg.includes('failed to fetch') ||
      errMsg.includes('networkerror') ||
      errMsg.includes('network error') ||
      errMsg.includes('cors') ||
      errMsg.includes('load failed');

    const isBackendError =
      errName === 'BackendError' ||
      (typeof status === 'number' && status >= 400 && status < 600);

    if (isNetworkError) return 'NETWORK';
    if (isBackendError) return 'BACKEND';
    return 'CLIENT_BUG';
  }

  const testCases = [
    {
      name: 'Standard Fetch Failure',
      error: { name: 'TypeError', message: 'Failed to fetch' },
      expected: 'NETWORK'
    },
    {
      name: 'Firefox CORS Outage',
      error: { name: 'Error', message: 'NetworkError when attempting to fetch resource.' },
      expected: 'NETWORK'
    },
    {
      name: 'IOS Load Fail',
      error: { name: 'TypeError', message: 'Load failed' },
      expected: 'NETWORK'
    },
    {
      name: 'Backend Validation 400',
      error: { name: 'BackendError', status: 400, message: 'Invalid user role specified' },
      expected: 'BACKEND'
    },
    {
      name: 'Backend 500 Crash',
      error: { name: 'BackendError', status: 500, message: 'Failed to process chat message' },
      expected: 'BACKEND'
    },
    {
      name: 'Client ReferenceError Bug',
      error: { name: 'ReferenceError', message: 'activeFeature is not defined' },
      expected: 'CLIENT_BUG'
    }
  ];

  for (const tc of testCases) {
    const result = classifyError(tc.error);
    if (result === tc.expected) {
      console.log(`✓ PASS: ${tc.name} classified as ${result}`);
    } else {
      console.error(`✕ FAIL: ${tc.name} classified as ${result}, expected ${tc.expected}`);
      passed = false;
    }
  }

  // ================= SIMULATED UNIT TESTS FOR ACCESSIBILITY SCORE CALCULATION =================
  console.log('\n==================================================');
  console.log('Running Accessibility Score Unit Tests...');
  console.log('==================================================\n');

  function calculateAccessibilityScore(needs, activeAlerts) {
    let score = 92;
    if (needs.wheelchair) score += 4;
    if (needs.stepFree) score += 4;
    if (needs.sensory) score += 2;
    
    const activeElevatorOutages = activeAlerts.filter(
      a => a.alert_type === 'maintenance' && 
      (a.title.toLowerCase().includes('elevator') || a.description.toLowerCase().includes('elevator'))
    );
    score -= activeElevatorOutages.length * 15;
    
    const activeHazards = activeAlerts.filter(a => a.severity === 'critical' || a.severity === 'high');
    score -= activeHazards.length * 10;
    
    return Math.max(0, Math.min(100, score));
  }

  const scoreTestCases = [
    {
      name: 'Default State (No custom needs, no outages)',
      needs: { wheelchair: false, stepFree: false, sensory: false },
      alerts: [],
      expected: 92
    },
    {
      name: 'Full Accessibility Needs Enabled',
      needs: { wheelchair: true, stepFree: true, sensory: true },
      alerts: [],
      expected: 100 // 92 + 4 + 4 + 2 capped at 100
    },
    {
      name: 'Elevator Outage Deduct',
      needs: { wheelchair: true, stepFree: true, sensory: false },
      alerts: [
        { alert_type: 'maintenance', title: 'Elevator 4 Lobby offline', severity: 'medium' }
      ],
      expected: 85 // 92 + 4 + 4 - 15 = 85
    },
    {
      name: 'Critical Hazard Deduct',
      needs: { wheelchair: false, stepFree: false, sensory: false },
      alerts: [
        { alert_type: 'incident', title: 'Gate B congestion bottleneck', severity: 'critical' }
      ],
      expected: 82 // 92 - 10 = 82
    },
    {
      name: 'Outages exceeds limits',
      needs: { wheelchair: false, stepFree: false, sensory: false },
      alerts: [
        { alert_type: 'maintenance', title: 'Elevator lobby out of service', severity: 'medium' },
        { alert_type: 'maintenance', title: 'Elevator 2 down', severity: 'medium' },
        { alert_type: 'maintenance', title: 'Elevator 3 down', severity: 'medium' },
        { alert_type: 'maintenance', title: 'Elevator 4 down', severity: 'medium' },
        { alert_type: 'incident', title: 'Power outage Gate B', severity: 'critical' },
        { alert_type: 'incident', title: 'Emergency Gate C', severity: 'high' }
      ],
      expected: 12
    }
  ];

  for (const tc of scoreTestCases) {
    const result = calculateAccessibilityScore(tc.needs, tc.alerts);
    if (result === tc.expected) {
      console.log(`✓ PASS: ${tc.name} calculated score is ${result}%`);
    } else {
      console.error(`✕ FAIL: ${tc.name} calculated score is ${result}%, expected ${tc.expected}%`);
      passed = false;
    }
  }

  console.log('\n==================================================');
  if (passed) {
    console.log('ALL FRONTEND SANITY AND UNIT CHECKS PASSED.');
    process.exit(0);
  } else {
    console.error('FRONTEND SANITY/UNIT CHECKS DETECTED ANOMALIES.');
    process.exit(1);
  }
}

runSanityCheck();
