(function (root) {
  'use strict';
  const data = {
    version: 'Riverton classroom models v1.0',
    projects: [
      {id:'library', name:'Library & learning', detail:'Refit learning rooms and add shared equipment.', color:'#184eca', rate:0.08, max:4000},
      {id:'roads', name:'Roads & crossings', detail:'Repair surfaces and improve crossings.', color:'#566b86', rate:0.06, max:5000},
      {id:'parks', name:'Parks & public spaces', detail:'Renew play areas, paths, and gathering places.', color:'#337258', rate:0.10, max:3000},
      {id:'flood', name:'Flood protection', detail:'Upgrade drainage and flood-control equipment.', color:'#157e9c', rate:0.08, max:5000},
      {id:'readiness', name:'Emergency readiness', detail:'Equip response teams and practice the plan.', color:'#a96513', rate:0.10, max:3000}
    ],
    presets: {
      balanced:{name:'A bit of everything', plan:[1500,2500,1000,2500,1000], upkeep:100},
      community:{name:'Everyday places first', plan:[3000,2000,2000,1000,500], upkeep:100},
      resilient:{name:'Prepare for disruption', plan:[1000,2000,500,4000,2000], upkeep:100}
    },
    exhibits: [
      {id:'E01', kind:'visual', date:'2027-04-04', dateLabel:'April 4, 2027', title:'The Eastbank project', source:'Riverton planning office · project brief', format:'Site plan', summary:'A gate at the river outfall, a public walkway, and two different kinds of acceptance.', paragraphs:[
        'The Eastbank project combines an outfall flap gate with repairs to the riverside walkway. The gate is intended to limit river water flowing backward into the town’s drainage channel. It cannot prevent every source of surface flooding.',
        'Council authorized $600,000 for the project. The paved walkway can be inspected separately from the gate. A safe walkway does not establish that the gate has passed its functional acceptance test.',
        'The schematic shows relative positions only. It is not a survey, evacuation map, or real location.'
      ], limit:'A proposed design establishes intent, not whether the equipment was installed, tested, or effective.'},
      {id:'E02', kind:'document', date:'2027-04-08', dateLabel:'April 8, 2027', title:'What “accepted” was supposed to mean', source:'Executed project contract · section 4.2', format:'Contract excerpt', summary:'Mechanical completion is due June 10. A witnessed wet-flow test is required before operational acceptance.', paragraphs:[
        'Mechanical installation milestone: June 10, 2027. Target date for witnessed functional testing: June 12, subject to safe river conditions.',
        'Operational acceptance of the flap gate requires a witnessed wet-flow test and a signed test record. A dry-cycle check alone does not satisfy this requirement.',
        'Walkway safety acceptance may proceed independently. Any public description of project completion must distinguish walkway access from operational acceptance of the gate.'
      ], limit:'A contract tells us what was required. It does not prove whether the requirement was met.'},
      {id:'E03', kind:'document', date:'2027-05-28', dateLabel:'May 28, 2027', title:'The $60,000 transfer', source:'Council finance minutes · amendment 7', format:'Budget record', summary:'The project stays within $600,000, but its first-year maintenance allocation becomes zero.', paragraphs:[
        'Original authorization: gate and drainage works $450,000; walkway and plaza $90,000; first-year gate maintenance and drills $60,000. Total: $600,000.',
        'Amendment adopted: transfer $60,000 from the maintenance-and-drills line to walkway and plaza completion. Revised allocations: $450,000, $150,000, and $0. Total remains $600,000.',
        'The minutes record no replacement maintenance appropriation. They do not record whether staff performed any maintenance using other resources.'
      ], limit:'A zero allocation in this record does not prove that no maintenance occurred, or that this decision caused the flood.'},
      {id:'E04', kind:'document', date:'2027-06-01', dateLabel:'June 1, 2027', title:'An inspection—with a narrow scope', source:'Walkway inspection certificate · W-17', format:'Inspection certificate', summary:'The paving is accepted. The gate and hydraulic works are expressly excluded.', paragraphs:[
        'Inspection scope: public walkway paving, handrails, and pedestrian trip hazards. Result: accepted for public pedestrian access.',
        'Excluded from this certificate: outfall gate installation, electrical actuation, hydraulic performance, and the witnessed wet-flow acceptance test.',
        'Signed June 1, 2027. No gate test record is attached to this certificate.'
      ], limit:'This is affirmative evidence of a walkway inspection, not a certificate for the entire flood-protection project.'},
      {id:'E05', kind:'visual', date:'2027-06-18', dateLabel:'June 18, 2027', title:'The gate is still beside the trench', source:'Fictional construction archive · image record P-18', format:'Construction image', summary:'The case record places an uninstalled gate panel beside an open excavation on June 18.', paragraphs:[
        'Case-file caption: Eastbank outfall, June 18. The steel gate panel is resting on timber beside the excavation. Installation is still in progress.',
        'The image was generated for this fictional exercise. Its June 18 date and location are authored case facts, not camera metadata or an independently verified photograph.',
        'Within the scenario, compare this dated record with the director’s claim that all inspections were complete on June 1.'
      ], limit:'The image does not show the equipment’s condition on the storm date or establish the physical cause of flooding.'},
      {id:'E06', kind:'document', date:'2027-06-19', dateLabel:'June 19, 2027', title:'Dry cycle passed. Wet-flow test pending.', source:'Site engineer’s field memorandum · F-22', format:'Field memo', summary:'A working actuator is recorded, but operational acceptance is still incomplete.', paragraphs:[
        'The actuator was connected this morning. A dry-cycle movement check passed. The witnessed wet-flow test has not been completed because river conditions are unsuitable.',
        'Recommendation: allow use of the separately accepted walkway. Do not describe the gate as operationally accepted until the wet-flow test and signed record are complete.',
        'There is no later signed wet-flow test record in the supplied case file. Absence from this file is not proof that a later test never occurred.'
      ], limit:'This establishes the test status on June 19. It does not establish the gate’s later condition.'},
      {id:'E07', kind:'document', date:'2027-07-09', dateLabel:'July 9, 2027', title:'A resident reports debris', source:'Resident email to public works · receipt R-09', format:'Reported observation', summary:'Leah Ortiz reports litter and branches at the outfall. The file contains a receipt but no work-completion record.', paragraphs:[
        'From Leah Ortiz: “There are branches and litter gathered at the Eastbank outfall. I cannot tell whether the gate can close. Could someone check it before the next heavy rain?”',
        'The public-works inbox acknowledged receipt on July 9. No inspection response or cleanup completion record is included in this case file.',
        'Ortiz observed the outfall from the walkway. She did not inspect the actuator or measure water flow.'
      ], limit:'A resident’s report establishes a reported concern. It does not independently verify a mechanical failure or prove that staff took no action.'},
      {id:'E08', kind:'document', date:'2027-07-13', dateLabel:'July 13, 2027', title:'The flood report leaves the cause open', source:'Post-event incident report · I-13', format:'Incident report', summary:'Flooding occurred July 12. Missing measurements prevent a firm causal conclusion.', paragraphs:[
        'During the July 12 storm, surface water entered several Eastbank streets. Crews found debris at the outfall during the following morning’s inspection.',
        'No gate-position log is available for the storm. River-level readings are missing between 17:00 and 20:00. The report does not separate river backflow from local stormwater runoff.',
        'Finding: the supplied evidence is insufficient to determine whether gate position, debris, local runoff, or a combination caused the street flooding. Obtain operational logs, later acceptance records, work orders, and hydrologic analysis.'
      ], limit:'Timing and suspicious circumstances are not a complete causal explanation.'},
      {id:'E09', kind:'statement', date:'2027-06-20', dateLabel:'June 20, 2027', title:'“All inspections were complete by June 1.”', source:'Public works director Mara Ellis · opening remarks', format:'Public statement', summary:'The director describes the project as tested and ready. This is the claim to investigate.', paragraphs:[
        'Mara Ellis, public works director: “All inspections were complete by June 1. Eastbank’s flood-protection project is tested and ready.”',
        'These remarks were delivered on June 20, ahead of the walkway reopening. The statement does not identify an inspection certificate or wet-flow test record.',
        'Your task is to compare this claim with the dated records. Establish what the evidence supports before deciding what to ask at the hearing.'
      ], limit:'A public assurance is a claim to check against records. It is not itself proof of acceptance or deliberate deception.'}
    ],
    witnesses: [
      {id:'director', name:'Mara Ellis', role:'Public works director', opening:'I believed the opening announcement reflected the project’s inspection status.', knows:['E01','E03','E04','E09'], boundary:'Can explain the public statement and administrative records; cannot supply an unrecorded wet-flow test or identify the physical cause of the flood.', followup:'Which inspection certificate supported your June 20 statement, and what exactly did it cover?'},
      {id:'engineer', name:'Jonah Reed', role:'Site engineer', opening:'On June 19, the dry cycle passed, but the wet-flow acceptance test was still pending.', knows:['E02','E05','E06','E08'], boundary:'Can explain installation, test requirements, and the field memo; cannot establish gate position during the storm or the director’s intent.', followup:'What additional record would establish operational acceptance, and is it in the supplied file?'},
      {id:'resident', name:'Leah Ortiz', role:'Eastbank resident', opening:'I reported debris on July 9. From the walkway, I could not tell whether the gate would close.', knows:['E07'], boundary:'Can describe the reported observation and acknowledgement; cannot diagnose the gate or establish what crews did afterward.', followup:'What did you directly observe, and what were you unable to determine?'}
    ],
    findings: [
      {id:'accepted', claim:'All project inspections were complete by June 1.', answer:'contradicted', evidence:['E02','E04','E05','E06'], explanation:'E04 covers only the walkway; E05 places installation later, and E06 records the wet-flow test as pending on June 19. The June 1 blanket claim is contradicted.'},
      {id:'maintenance', claim:'The May 28 amendment left $0 in the project’s maintenance-and-drills line.', answer:'supported', evidence:['E03'], explanation:'E03 shows the $60,000 transfer and a revised $0 allocation. It does not establish whether other resources later paid for work.'},
      {id:'cause', claim:'The maintenance transfer caused the July 12 flooding.', answer:'unresolved', evidence:['E03','E07','E08'], explanation:'The transfer and reported debris justify investigation. E08 explicitly leaves the cause unresolved. Missing logs and flow data prevent a firm causal conclusion.'}
    ]
  };
  root.FIELDWORK_CIVIC_DATA = data;
  if (typeof module !== 'undefined') module.exports = data;
})(typeof window !== 'undefined' ? window : globalThis);
