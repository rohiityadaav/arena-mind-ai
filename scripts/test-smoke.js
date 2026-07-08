/**
 * ArenaMind-AI Smoke Test Script
 * Verifies key backend endpoints: health, stadium data load, and assistant chat flows.
 * Covers:
 *  - Health check GET /api/health
 *  - Stadium metadata GET /api/stadium
 *  - Chat success flow POST /api/chat (200 status)
 *  - Chat payload validation errors (400 status)
 *  - Multilingual fallback logic
 */

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

async function runTests() {
  console.log('==================================================');
  console.log(`Starting ArenaMind-AI Smoke Tests on ${BACKEND_URL}...`);
  console.log('==================================================\n');

  let passed = true;

  // 1. Health check verification
  try {
    console.log('[TEST 1/6] GET /api/health...');
    const res = await fetch(`${BACKEND_URL}/api/health`);
    const status = res.status;
    const body = await res.json();
    
    if (status === 200 && body.status === 'ok') {
      console.log('✓ PASS: Health check is operational.\n');
    } else {
      console.error(`✕ FAIL: Health check returned status ${status} with body:`, body);
      passed = false;
    }
  } catch (err) {
    console.error('✕ FAIL: Health check request failed with error:', err.message, '\n');
    passed = false;
  }

  // 2. Stadium data retrieval verification
  try {
    console.log('[TEST 2/6] GET /api/stadium...');
    const res = await fetch(`${BACKEND_URL}/api/stadium`);
    const status = res.status;
    const body = await res.json();
    
    if (status === 200 && body.stadium && Array.isArray(body.zones)) {
      console.log(`✓ PASS: Loaded stadium context (${body.stadium.name}) with ${body.zones.length} active zones.\n`);
    } else {
      console.error(`✕ FAIL: Stadium load returned status ${status} with body:`, body);
      passed = false;
    }
  } catch (err) {
    console.error('✕ FAIL: Stadium data request failed with error:', err.message, '\n');
    passed = false;
  }

  // 3. Chat request execution (Success Flow)
  try {
    console.log('[TEST 3/6] POST /api/chat (Success Flow)...');
    const payload = {
      message: 'Hello, what is the current crowd status at MetLife Stadium?',
      role: 'fan',
      language: 'en',
      accessibilityNeeds: { wheelchair: false, stepFree: false, sensory: false }
    };
    
    const res = await fetch(`${BACKEND_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const status = res.status;
    const body = await res.json();
    
    if (status === 200 && body.message) {
      console.log('✓ PASS: Assistant responded successfully.');
      console.log(`  Response preview: "${body.message.substring(0, 80).replace(/\n/g, ' ')}..."\n`);
    } else {
      console.error(`✕ FAIL: Chat route returned status ${status} with body:`, body);
      passed = false;
    }
  } catch (err) {
    console.error('✕ FAIL: Chat request failed with error:', err.message, '\n');
    passed = false;
  }

  // 4. Chat request validation (Invalid Role - 400 Flow)
  try {
    console.log('[TEST 4/6] POST /api/chat (Invalid Role Validation)...');
    const payload = {
      message: 'Show me maps.',
      role: 'admin', // Invalid
      language: 'en'
    };
    
    const res = await fetch(`${BACKEND_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const status = res.status;
    const body = await res.json();
    
    if (status === 400 && body.error === 'Invalid user role specified') {
      console.log('✓ PASS: Endpoint rejected invalid role with HTTP 400.\n');
    } else {
      console.error(`✕ FAIL: Chat route returned status ${status} instead of 400. Body:`, body);
      passed = false;
    }
  } catch (err) {
    console.error('✕ FAIL: Invalid role test failed with error:', err.message, '\n');
    passed = false;
  }

  // 5. Chat request validation (Empty input - 400 Flow)
  try {
    console.log('[TEST 5/6] POST /api/chat (Empty Input Validation)...');
    const payload = {
      message: '', // Empty
      role: 'fan',
      language: 'en'
    };
    
    const res = await fetch(`${BACKEND_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const status = res.status;
    const body = await res.json();
    
    if (status === 400 && body.error.includes('Message is required')) {
      console.log('✓ PASS: Endpoint rejected empty inputs with HTTP 400.\n');
    } else {
      console.error(`✕ FAIL: Chat route returned status ${status} instead of 400. Body:`, body);
      passed = false;
    }
  } catch (err) {
    console.error('✕ FAIL: Empty input test failed with error:', err.message, '\n');
    passed = false;
  }

  // 6. Local structured fallback verification (LLM fallback)
  try {
    console.log('[TEST 6/6] POST /api/chat (Rule-Based Fallback Flow)...');
    const payload = {
      message: 'Where is the quiet sensory room?',
      role: 'volunteer',
      language: 'en'
    };
    
    const res = await fetch(`${BACKEND_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const status = res.status;
    const body = await res.json();
    
    if (status === 200 && body.intent === 'sensory' && body.message.includes('SENSORY')) {
      console.log('✓ PASS: Assistant fell back to local sensory protocols cleanly.\n');
    } else {
      console.error(`✕ FAIL: Rule-based fallback returned status ${status} with body:`, body);
      passed = false;
    }
  } catch (err) {
    console.error('✕ FAIL: Fallback flow test failed with error:', err.message, '\n');
    passed = false;
  }

  console.log('==================================================');
  if (passed) {
    console.log('ALL BACKEND SMOKE TESTS PASSED SUCCESSFULLY.');
    process.exit(0);
  } else {
    console.error('BACKEND SMOKE TESTS DETECTED FAILURES.');
    process.exit(1);
  }
}

runTests();
