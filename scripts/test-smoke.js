/**
 * ArenaMind-AI Smoke Test Script
 * Verifies key backend endpoints: health, stadium data load, and assistant chat.
 */

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

async function runTests() {
  console.log('==================================================');
  console.log(`Starting ArenaMind-AI Smoke Tests on ${BACKEND_URL}...`);
  console.log('==================================================\n');

  let passed = true;

  // 1. Health check verification
  try {
    console.log('[TEST 1/3] GET /api/health...');
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
    console.log('[TEST 2/3] GET /api/stadium...');
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

  // 3. Chat request execution
  try {
    console.log('[TEST 3/3] POST /api/chat...');
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
      console.log(`  Response preview: "${body.message.substring(0, 80)}..."\n`);
    } else {
      console.error(`✕ FAIL: Chat route returned status ${status} with body:`, body);
      passed = false;
    }
  } catch (err) {
    console.error('✕ FAIL: Chat request failed with error:', err.message, '\n');
    passed = false;
  }

  console.log('==================================================');
  if (passed) {
    console.log('ALL SMOKE TESTS PASSED SUCCESSFULLY.');
    process.exit(0);
  } else {
    console.error('SMOKE TESTS DETECTED FAILURES.');
    process.exit(1);
  }
}

runTests();
