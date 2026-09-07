import type { HierarchyNode, NodeType, DiscoveredPoint } from '../types';

export const CSV_HEADERS = [
  'ParentId',
  'NodeId',
  'NodeName',
  'NodeType',
  'DeviceName',
  'VoltagePoint',
  'CurrentPoint',
  'ActivePowerPoint',
  'ReactivePowerPoint',
  'PowerFactorPoint',
  'FrequencyPoint',
  'ActiveEnergyPoint',
  'THDVoltagePoint',
  'THDCurrentPoint'
];

/**
 * Serializes the hierarchy tree into a standard CSV string.
 */
export function exportHierarchyToCsv(root: HierarchyNode): string {
  const rows: string[][] = [CSV_HEADERS];

  function traverse(node: HierarchyNode, parentId = '') {
    const mappings = node.parameterMappings || {};
    rows.push([
      parentId,
      node.id,
      node.name,
      node.type,
      node.mappedPointId || '',
      mappings['voltage'] || '',
      mappings['current'] || '',
      mappings['activePower'] || '',
      mappings['reactivePower'] || '',
      mappings['powerFactor'] || '',
      mappings['frequency'] || '',
      mappings['activeEnergy'] || '',
      mappings['thdVoltage'] || '',
      mappings['thdCurrent'] || ''
    ]);

    if (node.children) {
      for (const child of node.children) {
        traverse(child, node.id);
      }
    }
  }

  traverse(root);
  return rows.map(r => r.map(escapeCsvCell).join(',')).join('\n');
}

function escapeCsvCell(cell: string): string {
  if (!cell) return '';
  if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
    return `"${cell.replace(/"/g, '""')}"`;
  }
  return cell;
}

/**
 * Downloads a sample CSV template with example rows for 1000+ meter configuration.
 */
export function downloadCsvTemplate(): void {
  const sampleRows = [
    CSV_HEADERS,
    ['', 'plant-1', 'Main Facility Plant', 'Plant', '', '', '', '', '', '', '', '', '', ''],
    ['plant-1', 'sub-1', 'Substation 101 (MDB-1)', 'MDB', 'MDB-01', '101', '102', '103', '104', '105', '106', '107', '108', '109'],
    ['sub-1', 'fdr-1', 'Chiller Feeder 1', 'Feeder', 'CH-FDR-1', '201', '202', '203', '204', '205', '206', '207', '208', '209'],
    ['fdr-1', 'mtr-1', 'Chiller Compressor Meter', 'Meter', 'PM-CH-1', '301', '302', '303', '304', '305', '306', '307', '308', '309'],
    ['sub-1', 'fdr-2', 'HVAC Air Handling Feeder', 'Feeder', 'AHU-FDR-1', '211', '212', '213', '214', '215', '216', '217', '218', '219'],
    ['plant-1', 'sub-2', 'Substation 102 (MDB-2)', 'MDB', 'MDB-02', '111', '112', '113', '114', '115', '116', '117', '118', '119']
  ];

  const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(sampleRows.map(r => r.map(escapeCsvCell).join(',')).join('\n'));
  const link = document.createElement('a');
  link.setAttribute('href', csvContent);
  link.setAttribute('download', 'PowerMonitoring_Meter_Hierarchy_Template.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Parses uploaded CSV text and constructs a validated HierarchyNode tree.
 */
export function importHierarchyFromCsv(csvText: string, discoveredPoints: DiscoveredPoint[] = []): HierarchyNode {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) {
    throw new Error('CSV file is empty or missing data rows.');
  }

  // Parse header
  const headerLine = lines[0];
  const parseRow = (line: string): string[] => {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    return values;
  };

  const headers = parseRow(headerLine).map(h => h.toLowerCase());
  const colIndex = {
    parentId: headers.indexOf('parentid'),
    nodeId: headers.indexOf('nodeid'),
    nodeName: headers.indexOf('nodename'),
    nodeType: headers.indexOf('nodetype'),
    deviceName: headers.indexOf('devicename'),
    voltage: headers.indexOf('voltagepoint'),
    current: headers.indexOf('currentpoint'),
    activePower: headers.indexOf('activepowerpoint'),
    reactivePower: headers.indexOf('reactivepowerpoint'),
    powerFactor: headers.indexOf('powerfactorpoint'),
    frequency: headers.indexOf('frequencypoint'),
    activeEnergy: headers.indexOf('activeenergypoint'),
    thdVoltage: headers.indexOf('thdvoltagepoint'),
    thdCurrent: headers.indexOf('thdcurrentpoint')
  };

  if (colIndex.nodeId === -1 || colIndex.nodeName === -1) {
    throw new Error('CSV missing required columns: NodeId, NodeName.');
  }

  // Point lookup map for name-to-id resolution
  const pointNameMap = new Map<string, string>();
  for (const dp of discoveredPoints) {
    pointNameMap.set(dp.id.toLowerCase(), dp.id);
    pointNameMap.set(dp.name.toLowerCase(), dp.id);
    if (dp.registerOrInstance) {
      pointNameMap.set(dp.registerOrInstance.toLowerCase(), dp.id);
    }
  }

  const resolvePoint = (raw: string): string => {
    if (!raw) return '';
    const clean = raw.trim().toLowerCase();
    return pointNameMap.get(clean) || raw.trim();
  };

  interface RawNode {
    parentId: string;
    node: HierarchyNode;
  }

  const rawNodes: RawNode[] = [];
  const nodeMap = new Map<string, HierarchyNode>();

  for (let i = 1; i < lines.length; i++) {
    const row = parseRow(lines[i]);
    const id = (colIndex.nodeId !== -1 ? row[colIndex.nodeId] : '') || `node-${i}`;
    const name = (colIndex.nodeName !== -1 ? row[colIndex.nodeName] : '') || `Node ${i}`;
    const rawType = (colIndex.nodeType !== -1 ? row[colIndex.nodeType] : '') || 'Feeder';
    const parentId = (colIndex.parentId !== -1 ? row[colIndex.parentId] : '') || '';
    const deviceName = (colIndex.deviceName !== -1 ? row[colIndex.deviceName] : '') || '';

    // Validate type
    const validTypes: NodeType[] = ['Plant', 'MDB', 'SMDB', 'MCC', 'Feeder', 'Meter'];
    const type: NodeType = validTypes.find(t => t.toLowerCase() === rawType.toLowerCase()) || 'Feeder';

    const paramMappings: Record<string, string> = {};
    if (colIndex.voltage !== -1 && row[colIndex.voltage]) paramMappings['voltage'] = resolvePoint(row[colIndex.voltage]);
    if (colIndex.current !== -1 && row[colIndex.current]) paramMappings['current'] = resolvePoint(row[colIndex.current]);
    if (colIndex.activePower !== -1 && row[colIndex.activePower]) paramMappings['activePower'] = resolvePoint(row[colIndex.activePower]);
    if (colIndex.reactivePower !== -1 && row[colIndex.reactivePower]) paramMappings['reactivePower'] = resolvePoint(row[colIndex.reactivePower]);
    if (colIndex.powerFactor !== -1 && row[colIndex.powerFactor]) paramMappings['powerFactor'] = resolvePoint(row[colIndex.powerFactor]);
    if (colIndex.frequency !== -1 && row[colIndex.frequency]) paramMappings['frequency'] = resolvePoint(row[colIndex.frequency]);
    if (colIndex.activeEnergy !== -1 && row[colIndex.activeEnergy]) paramMappings['activeEnergy'] = resolvePoint(row[colIndex.activeEnergy]);
    if (colIndex.thdVoltage !== -1 && row[colIndex.thdVoltage]) paramMappings['thdVoltage'] = resolvePoint(row[colIndex.thdVoltage]);
    if (colIndex.thdCurrent !== -1 && row[colIndex.thdCurrent]) paramMappings['thdCurrent'] = resolvePoint(row[colIndex.thdCurrent]);

    const node: HierarchyNode = {
      id,
      name,
      type,
      children: [],
      mappedPointId: resolvePoint(deviceName) || paramMappings['activePower'] || paramMappings['current'] || '',
      parameterMappings: paramMappings
    };

    nodeMap.set(id, node);
    rawNodes.push({ parentId, node });
  }

  // Build tree
  let rootNode: HierarchyNode | null = null;

  for (const { parentId, node } of rawNodes) {
    if (!parentId || parentId === node.id) {
      if (!rootNode) {
        rootNode = node;
      }
    } else {
      const parent = nodeMap.get(parentId);
      if (parent) {
        if (!parent.children) parent.children = [];
        parent.children.push(node);
      } else {
        if (!rootNode) rootNode = node;
        else {
          if (!rootNode.children) rootNode.children = [];
          rootNode.children.push(node);
        }
      }
    }
  }

  if (!rootNode) {
    throw new Error('Could not find or create a root Plant node in the uploaded CSV.');
  }

  return rootNode;
}
