const { initDb, dbRun, generateUuid } = require('./database');

const seed = async () => {
  try {
    console.log('Starting database seeding...');
    await initDb();

    // Clear existing data (in reverse dependency order)
    await dbRun('DELETE FROM feedback;');
    await dbRun('DELETE FROM alerts;');
    await dbRun('DELETE FROM assistant_messages;');
    await dbRun('DELETE FROM assistant_sessions;');
    await dbRun('DELETE FROM routes;');
    await dbRun('DELETE FROM points_of_interest;');
    await dbRun('DELETE FROM zones;');
    await dbRun('DELETE FROM stadiums;');
    await dbRun('DELETE FROM users;');

    console.log('Cleared existing data.');

    // 1. Seed Stadium
    const stadiumId = generateUuid();
    await dbRun(`
      INSERT INTO stadiums (id, name, city, country, metadata)
      VALUES (?, ?, ?, ?, ?)
    `, [
      stadiumId,
      'MetLife Stadium',
      'East Rutherford, NJ',
      'United States',
      JSON.stringify({
        capacity: 82500,
        event: 'FIFA World Cup 2026 Demo',
        elevators: ['East Gate Lobby', 'West Gate Lobby', 'Section 109', 'Section 226'],
        ramps: ['North Gate Ramp', 'South Gate Ramp']
      })
    ]);
    console.log('Seeded MetLife Stadium.');

    // 2. Seed Zones
    const zones = [
      { name: 'Gate A (North Entrance)', type: 'gate', crowd: 40, acc_score: 80 },
      { name: 'Gate B (East Entrance)', type: 'gate', crowd: 90, acc_score: 75 }, // Highly congested
      { name: 'Gate C (South Entrance)', type: 'gate', crowd: 30, acc_score: 80 },
      { name: 'Gate D (West Entrance)', type: 'gate', crowd: 25, acc_score: 95 }, // Wheelchair friendly gate
      { name: 'Plaza Level', type: 'concourse', crowd: 50, acc_score: 90 },
      { name: 'Mid Concourse (100/200s)', type: 'concourse', crowd: 65, acc_score: 85 },
      { name: 'Upper Concourse (300s)', type: 'concourse', crowd: 45, acc_score: 70 },
      { name: 'Parking Lot E/F (General)', type: 'parking', crowd: 80, acc_score: 70 },
      { name: 'Parking Lot G (ADA)', type: 'parking', crowd: 30, acc_score: 100 }, // Premium ADA parking
      { name: 'Transit Station', type: 'transit', crowd: 60, acc_score: 90 }
    ];

    const seededZones = {};
    for (const z of zones) {
      const id = generateUuid();
      await dbRun(`
        INSERT INTO zones (id, stadium_id, name, zone_type, crowd_level, accessibility_score, metadata)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        id,
        stadiumId,
        z.name,
        z.type,
        z.crowd,
        z.acc_score,
        JSON.stringify({ description: `Main operational zone for ${z.name}` })
      ]);
      seededZones[z.name] = id;
    }
    console.log('Seeded zones:', Object.keys(seededZones).length);

    // 3. Seed Points of Interest (POIs)
    const pois = [
      { name: 'Gate A Entrance', type: 'gate', desc: 'General entry gate, moderate security lines.', is_acc: 1, zone: 'Gate A (North Entrance)' },
      { name: 'Gate B Entrance (East)', type: 'gate', desc: 'Main gate from parking lot E/F, long security queues.', is_acc: 1, zone: 'Gate B (East Entrance)' },
      { name: 'Gate D Entrance (ADA Priority)', type: 'gate', desc: 'Step-free priority entrance, direct ramp to lower level.', is_acc: 1, zone: 'Gate D (West Entrance)' },
      { name: 'Section 112 Wheelchair Deck', type: 'seating', desc: 'Elevated accessible seating area with clear views.', is_acc: 1, zone: 'Mid Concourse (100/200s)' },
      { name: 'Section 143 Restrooms', type: 'restroom', desc: 'All-gender wheelchair accessible restrooms with automatic doors.', is_acc: 1, zone: 'Mid Concourse (100/200s)' },
      { name: 'Section 224C Sensory Room', type: 'quiet_zone', desc: 'Sensory-friendly, noise-canceling room with staff assistance.', is_acc: 1, zone: 'Mid Concourse (100/200s)' },
      { name: 'General Restrooms Section 312', type: 'restroom', desc: 'Standard restrooms. Multi-stall, stairs only access.', is_acc: 0, zone: 'Upper Concourse (300s)' },
      { name: 'Transit Shuttle Pick-up', type: 'transit', desc: 'Shuttle buses run every 5 mins to local parking and rail stations.', is_acc: 1, zone: 'Transit Station' },
      { name: 'Fan Zone Plaza Activities', type: 'activities', desc: 'FIFA fan festival activation area, food trucks, and merchandise.', is_acc: 1, zone: 'Plaza Level' },
      { name: 'First Aid Station - Section 128', type: 'medical', desc: 'Full medical response team. Wheelchairs available for transport.', is_acc: 1, zone: 'Mid Concourse (100/200s)' }
    ];

    for (const p of pois) {
      const id = generateUuid();
      await dbRun(`
        INSERT INTO points_of_interest (id, stadium_id, zone_id, name, poi_type, description, is_accessible, metadata)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        id,
        stadiumId,
        seededZones[p.zone] || null,
        p.name,
        p.type,
        p.desc,
        p.is_acc,
        JSON.stringify({ tags: [p.type] })
      ]);
    }
    console.log('Seeded points of interest.');

    // 4. Seed Routes
    const routes = [
      {
        from: 'Parking Lot G (ADA)',
        to: 'Gate D Entrance (ADA Priority)',
        time: 4,
        acc_notes: 'Fully paved, step-free, wide path with flat ramp. Directly adjacent to accessible parking.',
        risk: 'low',
        data: { steps: ['Exit Lot G via the marked ADA pathway', 'Follow blue lines directly to Gate D VIP/ADA security entrance'] }
      },
      {
        from: 'Parking Lot E/F (General)',
        to: 'Gate B Entrance (East)',
        time: 8,
        acc_notes: 'Requires navigating a high-crowd gravel lane and concrete stairs (8 steps total). Alternative wheelchair path via Lot G ramp (15 mins).',
        risk: 'high',
        data: { steps: ['Exit Lot E/F heading East', 'Use main concrete stairway', 'Join security queues at Gate B'] }
      },
      {
        from: 'Gate D Entrance (ADA Priority)',
        to: 'Section 112 Wheelchair Deck',
        time: 3,
        acc_notes: 'Step-free. Enter Gate D, proceed 40 meters forward, take the elevator at elevator lobby West to Concourse Level 1.',
        risk: 'low',
        data: { steps: ['Enter Gate D security', 'Proceed to West Elevator Lobby', 'Take elevator to level 1', 'Section 112 is to the right'] }
      },
      {
        from: 'Gate A Entrance',
        to: 'Section 224C Sensory Room',
        time: 7,
        acc_notes: 'Step-free via elevators. Quiet path is suggested along the outer ring concourse to avoid main food plazas.',
        risk: 'medium',
        data: { steps: ['Enter Gate A', 'Walk past main merchandise stand', 'Use Section 109 elevator to level 2', 'Sensory room is marked 224C'] }
      },
      {
        from: 'Transit Shuttle Pick-up',
        to: 'Gate B Entrance (East)',
        time: 5,
        acc_notes: 'Main concrete path, but currently very crowded. Expect walking delays.',
        risk: 'medium',
        data: { steps: ['Follow signage for Gate B from shuttle loop', 'Cross the plaza walk', 'Arrive at East gate queue'] }
      }
    ];

    for (const r of routes) {
      const id = generateUuid();
      await dbRun(`
        INSERT INTO routes (id, stadium_id, from_point, to_point, route_data, estimated_time_minutes, accessibility_notes, crowd_risk_level)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        id,
        stadiumId,
        r.from,
        r.to,
        JSON.stringify(r.data),
        r.time,
        r.acc_notes,
        r.risk
      ]);
    }
    console.log('Seeded routes.');

    // 5. Seed Alerts
    const alerts = [
      {
        zone: 'Gate B (East Entrance)',
        type: 'congestion',
        severity: 'high',
        title: 'Gate B Bottleneck Warning',
        desc: 'Security queues at Gate B (East Entrance) are experiencing long delays (approx. 25-minute wait). Fans are advised to proceed to Gate A (North) or Gate C (South) for immediate entry.'
      },
      {
        zone: 'Transit Station',
        type: 'delay',
        severity: 'medium',
        title: 'Transit Shuttle Interruption',
        desc: 'The ADA shuttle loop from Lot G to Transit Station is experiencing minor delays of 10 minutes due to peak arrival flow. Extra accessible buses are en route.'
      },
      {
        zone: 'Mid Concourse (100/200s)',
        type: 'info',
        severity: 'low',
        title: 'Sensory Room is Available',
        desc: 'The sensory room at Section 224C is open. Noise-cancelling headphones and weighted vests are available upon request.'
      }
    ];

    for (const a of alerts) {
      const id = generateUuid();
      await dbRun(`
        INSERT INTO alerts (id, stadium_id, zone_id, alert_type, severity, title, description, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'open')
      `, [
        id,
        stadiumId,
        seededZones[a.zone] || null,
        a.type,
        a.severity,
        a.title,
        a.desc
      ]);
    }
    console.log('Seeded active alerts.');

    // 6. Create default staff user
    await dbRun(`
      INSERT INTO users (id, name, role, preferred_language, accessibility_needs)
      VALUES (?, ?, ?, ?, ?)
    `, [
      'staff-demo-id',
      'Operator Alex',
      'staff',
      'en',
      '{}'
    ]);
    console.log('Seeded default staff user.');

    console.log('Database seeding completed successfully.');
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    // We do not close db here, as database.js exports it, or we can close it if we spawn this script separately
    // But since this is a separate run, we can close it here
    // In database.js, db is open. So we can call db.close()
    // but db.close is async or takes callback, let's close it cleanly
    // Wait, let's just close it.
    // db.close();
  }
};

if (require.main === module) {
  seed().then(() => {
    process.exit(0);
  });
}
