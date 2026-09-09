// Curated educational references. These records are not live alerts.
window.FIELDWORK_TSUNAMI = {
  reviewed: 'September 4, 2026',
  cases: [
    {
      key: 'alaska1964', year: '1964', place: 'Alaska → the U.S. West Coast', date: 'March 27, 1964 (Alaska local date)', magnitude: '9.2',
      toll: '124', tollLabel: 'tsunami deaths, according to NOAA',
      story: 'The tsunami killed people in Alaska, California, and Oregon. A disaster beginning in one state reached communities far down the coast.',
      lesson: 'The disaster helped lead to a second U.S. tsunami warning facility in Alaska in 1967.',
      source: 'https://sos.noaa.gov/catalog/datasets/tsunami-historical-series-alaska-1964/', sourceLabel: 'NOAA: 1964 event and animation',
      caution: 'This is NOAA’s tsunami death estimate, not a combined earthquake-and-tsunami total.'
    },
    {
      key: 'indian2004', year: '2004', place: 'Sumatra → the Indian Ocean', date: 'December 26, 2004', magnitude: '9.1',
      toll: '≈228,000', tollLabel: 'dead or missing in the earthquake and tsunami',
      story: 'An undersea earthquake sent destructive waves across the Indian Ocean. NOAA’s 2024 compilation records 227,899 people dead or missing and presumed dead.',
      lesson: 'The Indian Ocean lacked a regional tsunami warning system. Detection, communications, and public understanding all needed to work together.',
      source: 'https://www.ncei.noaa.gov/sites/default/files/2024-11/IO_Poster_20241030_final_lowres.pdf', sourceLabel: 'NOAA: 2004 historical compilation (PDF)',
      contextSource: 'https://www.pmel.noaa.gov/public/pmel/publications-search/search_abstract.php?fmContributionNum=4987', contextLabel: 'NOAA-hosted research: the warning gap',
      caution: 'The earthquake and tsunami tolls cannot be separated reliably; this figure includes people missing and presumed dead.'
    },
    {
      key: 'japan2011', year: '2011', place: 'Japan → the Pacific', date: 'March 11, 2011', magnitude: '9.1',
      toll: '18,000+', tollLabel: 'dead or missing and presumed dead in Japan',
      story: 'The earthquake and tsunami devastated Japan. Waves also reached Hawaii and the U.S. West Coast.',
      lesson: 'NOAA credits connected warning and evacuation systems with limiting deaths outside Japan. Preparedness saved lives, even though it could not prevent every loss.',
      source: 'https://www.ncei.noaa.gov/news/day-2011-japan-earthquake-and-tsunami', sourceLabel: 'NOAA: 2011 event and lessons',
      contextSource: 'https://sos.noaa.gov/catalog/datasets/tsunami-historical-series-japan-2011/', contextLabel: 'NOAA: Pacific-wide wave animation',
      caution: 'NOAA’s March 2026 update: 15,901 deaths and 2,519 missing and presumed dead. These are combined disaster counts.'
    }
  ],
  steps: [
    {key:'detect',name:'Detect the earthquake',agency:'USGS + seismic partners',question:'Where did the Earth move?',body:'Seismic networks provide rapid estimates of earthquake location, depth, and magnitude. USGS earthquake information supports NOAA’s tsunami warning centers.',gap:'Without rapid seismic information, assessing a possible tsunami starts later.',source:'https://www.usgs.gov/faqs/there-a-system-warn-populations-imminent-occurrence-a-tsunami',sourceLabel:'USGS: working with NOAA'},
    {key:'measure',name:'Measure the ocean',agency:'NOAA + observing partners',question:'Did the water move?',body:'Deep-ocean DART instruments and coastal water-level gauges measure the waves. Earthquake size alone cannot reveal the full tsunami.',gap:'Without ocean measurements, forecasters have less evidence to confirm and refine the threat.',source:'https://www.tsunami.noaa.gov/pmel-theme/tsunami-detection',sourceLabel:'NOAA: tsunami detection'},
    {key:'warn',name:'Evaluate and warn',agency:'NOAA / National Weather Service',question:'Which coasts could be affected?',body:'Warning centers combine seismic information, ocean observations, and forecast models to issue and update alerts. An initial alert can precede confirmation by an ocean sensor.',gap:'Waiting for perfect information can use up valuable response time. Alerts are updated as evidence improves.',source:'https://www.tsunami.noaa.gov/pmel-theme/forecast-warning',sourceLabel:'NOAA: forecasts and warnings'},
    {key:'act',name:'Reach people who can act',agency:'Emergency managers + communities',question:'Can people get to safety?',body:'Emergency alerts, radio, sirens, and local officials carry the message. Evacuation plans, accessible routes, and public understanding turn information into action.',gap:'A forecast alone cannot move anyone. People need to receive it, understand it, and be able to respond.',source:'https://www.weather.gov/safety/tsunami-before',sourceLabel:'NOAA/NWS: prepare and receive alerts'}
  ],
  checks: [
    {id:'roles',question:'A large offshore earthquake is detected. Who evaluates the tsunami threat and issues U.S. tsunami alerts?',choices:['NOAA’s tsunami warning centers, using seismic and ocean information.','This learning page, using earthquake magnitude alone.','Every earthquake dot on the USGS map is already a tsunami warning.'],correct:0,explanation:'USGS supplies earthquake information; NOAA’s warning centers evaluate the tsunami threat and issue alerts. This page does not issue warnings.',source:'https://www.usgs.gov/faqs/there-a-system-warn-populations-imminent-occurrence-a-tsunami'},
    {id:'snapshot',question:'Today’s earthquake feed looks quiet. What does that tell us about keeping the warning system ready?',choices:['The system is unnecessary until a very large earthquake appears.','A short snapshot cannot tell us when a rare disaster will happen; readiness must already be in place.','A quiet feed means every U.S. coastline is safe.'],correct:1,explanation:'A day or week of earthquake reports is a short observation window. It cannot establish future tsunami risk or replace official alerts.',source:'https://www.weather.gov/safety/tsunami-about'},
    {id:'sensors',question:'Why are ocean instruments needed when we already have earthquake instruments?',choices:['Every offshore earthquake produces identical waves.','Ocean instruments prevent the seafloor from moving.','They measure the water response and help forecasters refine the tsunami threat.'],correct:2,explanation:'Earthquake measurements describe the source. Ocean measurements add evidence about the resulting waves.',source:'https://www.tsunami.noaa.gov/pmel-theme/tsunami-detection'}
  ]
};
