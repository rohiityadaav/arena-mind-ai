const express = require('express');
const router = express.Router();
const { dbAll } = require('../database');

router.get('/', async (req, res) => {
  try {
    const stadiums = await dbAll('SELECT * FROM stadiums');
    
    if (stadiums.length === 0) {
      return res.json({ stadium: null, zones: [], pois: [], routes: [] });
    }

    const stadium = stadiums[0];
    const zones = await dbAll('SELECT * FROM zones WHERE stadium_id = ?', [stadium.id]);
    const pois = await dbAll('SELECT * FROM points_of_interest WHERE stadium_id = ?', [stadium.id]);
    const routes = await dbAll('SELECT * FROM routes WHERE stadium_id = ?', [stadium.id]);

    // Parse JSON text fields
    const parsedZones = zones.map(z => ({
      ...z,
      metadata: JSON.parse(z.metadata || '{}')
    }));

    const parsedPois = pois.map(p => ({
      ...p,
      is_accessible: Boolean(p.is_accessible),
      metadata: JSON.parse(p.metadata || '{}')
    }));

    const parsedRoutes = routes.map(r => ({
      ...r,
      route_data: JSON.parse(r.route_data || '{}')
    }));

    const parsedStadium = {
      ...stadium,
      metadata: JSON.parse(stadium.metadata || '{}')
    };

    res.json({
      stadium: parsedStadium,
      zones: parsedZones,
      pois: parsedPois,
      routes: parsedRoutes
    });
  } catch (error) {
    console.error('Failed to retrieve stadium data:', error);
    res.status(500).json({ error: 'Failed to retrieve stadium data' });
  }
});

module.exports = router;
