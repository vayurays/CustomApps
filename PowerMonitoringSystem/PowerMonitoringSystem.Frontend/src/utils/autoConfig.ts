import type { HierarchyNode, DiscoveredPoint, NodeType } from '../types';

export interface NamePatternConfig {
  delimiter: string;
  scope: 'rebuild' | 'updateExisting';
  parameterTokens: Record<string, string[]>;
}

export interface AutoConfigResult {
  hierarchy: HierarchyNode;
  configuredMetersCount: number;
  mappedPointsCount: number;
}

export interface PatternMatchSample {
  meterName: string;
  parameter: string;
  pointName: string;
  pointId: string;
}

export interface PatternPreviewResult {
  detectedMeterCount: number;
  totalMappedPointsCount: number;
  sampleMatches: PatternMatchSample[];
}

export const DEFAULT_PARAMETER_TOKENS: Record<string, string[]> = {
  voltage: ['v_ll', 'v_ln', 'vry', 'vyb', 'vbr', 'v_r', 'v_y', 'v_b', 'voltage', 'volt', 'v', 'u'],
  current: ['curr', 'current', 'amp', 'amps', 'i_r', 'i_y', 'i_b', 'ir', 'iy', 'ib', 'i'],
  activePower: ['act_pwr', 'active_power', 'p_tot', 'p_kw', 'real_power', 'kw', 'w', 'mw'],
  reactivePower: ['react_pwr', 'reactive_power', 'q_tot', 'p_kvar', 'kvar', 'var'],
  apparentPower: ['app_pwr', 'apparent_power', 's_tot', 'kva', 'va', 'mva'],
  powerFactor: ['power_factor', 'p_factor', 'cosphi', 'cos_phi', 'pf'],
  frequency: ['frequency', 'freq', 'hz'],
  activeEnergy: ['active_energy', 'total_energy', 'tot_kwh', 'kwh_tot', 'energy', 'kwh', 'mwh'],
  thdVoltage: ['thd_v', 'thd_vr', 'thd_voltage', 'thd_u', 'thdv'],
  thdCurrent: ['thd_i', 'thd_ir', 'thd_current', 'thdi']
};

export const DEFAULT_PATTERN_CONFIG: NamePatternConfig = {
  delimiter: '_',
  scope: 'rebuild',
  parameterTokens: DEFAULT_PARAMETER_TOKENS
};

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Builds a regex to test if a point name matches a specific electrical parameter,
 * matching full words or segmented tokens using the delimiter.
 */
function buildParameterRegex(tokens: string[], delimiter: string): RegExp {
  const delim = delimiter ? escapeRegex(delimiter) : '_';
  const pattern = tokens.map(t => escapeRegex(t)).join('|');
  return new RegExp(`(?:^|[${delim}\\s.:/-])(?:${pattern})(?:$|[${delim}\\s.:/-])`, 'i');
}

/**
 * Extracts meter prefix from point name based on the specified delimiter.
 * E.g., for delimiter "_", "MDB01_Current_R" -> "MDB01".
 * E.g., for delimiter ".", "PM101.ActivePower" -> "PM101".
 */
export function extractMeterName(pointName: string, delimiter: string): string {
  if (delimiter && pointName.includes(delimiter)) {
    const parts = pointName.split(delimiter);
    if (parts[0].trim()) {
      return parts[0].trim();
    }
  }

  // Fallback regex matching common industrial prefixes: EM01_, Feeder-1:, Panel-A.
  const match = pointName.match(/^([a-zA-Z0-9_-]+)[_:.\s/]/);
  if (match && match[1]) {
    return match[1].trim();
  }

  return 'Meter';
}

/**
 * Auto-maps all 10 electrical parameters for a single selected node
 * by searching discovered points that match this node's name, ID, or device link.
 */
export function autoMapNodeByName(
  node: HierarchyNode,
  discoveredItems: DiscoveredPoint[],
  config: Partial<NamePatternConfig> = {}
): { mappedCount: number; updatedMappings: Record<string, string> } {
  const points = discoveredItems.filter(p => p.itemType === 'Point');
  const tokens = config.parameterTokens || DEFAULT_PARAMETER_TOKENS;
  const delimiter = config.delimiter ?? '_';

  // Normalize node identifiers for matching
  const cleanNodeName = node.name.toLowerCase().trim();
  const cleanNodeId = node.id.toLowerCase().trim();
  const deviceId = node.mappedPointId || '';

  // 1. Gather candidate points for this meter
  let candidatePoints: DiscoveredPoint[] = [];

  // If node is already linked to a primary device, prioritize points from that device
  if (deviceId) {
    const dev = discoveredItems.find(d => d.id === deviceId);
    if (dev && dev.deviceIp) {
      candidatePoints = points.filter(p => p.deviceIp === dev.deviceIp);
    }
  }

  // If no candidate points from device, find by name matching
  if (candidatePoints.length === 0) {
    candidatePoints = points.filter(p => {
      const pName = p.name.toLowerCase();
      const pMeter = extractMeterName(p.name, delimiter).toLowerCase();
      return (
        pMeter === cleanNodeName ||
        pMeter === cleanNodeId ||
        pName.startsWith(cleanNodeName) ||
        pName.includes(cleanNodeName)
      );
    });
  }

  // If still no candidate points, test against device name if available
  if (candidatePoints.length === 0 && deviceId) {
    candidatePoints = points.filter(p => p.id === deviceId || p.deviceIp === deviceId);
  }

  // 2. Map the 10 parameters from candidate points
  const updatedMappings: Record<string, string> = { ...(node.parameterMappings || {}) };
  let mappedCount = 0;

  for (const [paramKey, paramTokens] of Object.entries(tokens)) {
    const regex = buildParameterRegex(paramTokens, delimiter);
    for (const pt of candidatePoints) {
      const searchTarget = `${pt.name} ${pt.registerOrInstance || ''}`.toLowerCase();
      if (regex.test(searchTarget)) {
        updatedMappings[paramKey] = pt.id;
        mappedCount++;
        break; // Match first best candidate for this parameter
      }
    }
  }

  return { mappedCount, updatedMappings };
}

/**
 * Previews what meters and points will be matched given a specific NamePatternConfig
 * without committing changes to the tree.
 */
export function previewPatternMatches(
  discoveredItems: DiscoveredPoint[],
  config: NamePatternConfig = DEFAULT_PATTERN_CONFIG
): PatternPreviewResult {
  const points = discoveredItems.filter(item => item.itemType === 'Point');
  const tokens = config.parameterTokens || DEFAULT_PARAMETER_TOKENS;
  const delimiter = config.delimiter ?? '_';

  const groups = new Map<string, DiscoveredPoint[]>();

  for (const p of points) {
    let groupKey = p.deviceIp || '';
    if (!groupKey || groupKey === 'Local') {
      groupKey = extractMeterName(p.name, delimiter);
    }
    if (!groups.has(groupKey)) {
      groups.set(groupKey, []);
    }
    groups.get(groupKey)!.push(p);
  }

  const sampleMatches: PatternMatchSample[] = [];
  let totalMappedPointsCount = 0;

  for (const [meterName, grpPoints] of groups.entries()) {
    for (const [paramKey, paramTokens] of Object.entries(tokens)) {
      const regex = buildParameterRegex(paramTokens, delimiter);
      for (const pt of grpPoints) {
        const searchTarget = `${pt.name} ${pt.registerOrInstance || ''}`.toLowerCase();
        if (regex.test(searchTarget)) {
          totalMappedPointsCount++;
          if (sampleMatches.length < 15) {
            sampleMatches.push({
              meterName,
              parameter: paramKey,
              pointName: pt.name,
              pointId: pt.id
            });
          }
          break;
        }
      }
    }
  }

  return {
    detectedMeterCount: groups.size,
    totalMappedPointsCount,
    sampleMatches
  };
}

/**
 * Auto-configures meters across the entire distribution tree or updates existing tree nodes
 * based on customizable NamePatternConfig.
 */
export function autoConfigureWithPatterns(
  discoveredItems: DiscoveredPoint[],
  config: NamePatternConfig = DEFAULT_PATTERN_CONFIG,
  existingHierarchy?: HierarchyNode
): AutoConfigResult {
  const points = discoveredItems.filter(item => item.itemType === 'Point');
  const devices = discoveredItems.filter(item => item.itemType === 'Device');
  const tokens = config.parameterTokens || DEFAULT_PARAMETER_TOKENS;
  const delimiter = config.delimiter ?? '_';

  // Scope: Update Existing Nodes Only
  if (config.scope === 'updateExisting' && existingHierarchy) {
    let totalMappedPoints = 0;
    let totalMeters = 0;

    const clonedTree: HierarchyNode = JSON.parse(JSON.stringify(existingHierarchy));

    function traverseUpdate(node: HierarchyNode) {
      if (node.type === 'Meter' || node.type === 'Feeder' || node.type === 'MDB') {
        const result = autoMapNodeByName(node, discoveredItems, config);
        node.parameterMappings = result.updatedMappings;
        totalMappedPoints += Object.keys(result.updatedMappings).length;
        totalMeters++;
      }
      if (node.children) {
        for (const child of node.children) {
          traverseUpdate(child);
        }
      }
    }

    traverseUpdate(clonedTree);

    return {
      hierarchy: clonedTree,
      configuredMetersCount: totalMeters,
      mappedPointsCount: totalMappedPoints
    };
  }

  // Scope: Rebuild Entire Tree
  const groups = new Map<string, DiscoveredPoint[]>();

  for (const p of points) {
    let groupKey = p.deviceIp || '';
    if (!groupKey || groupKey === 'Local') {
      groupKey = extractMeterName(p.name, delimiter);
    }
    if (!groups.has(groupKey)) {
      groups.set(groupKey, []);
    }
    groups.get(groupKey)!.push(p);
  }

  if (groups.size === 0 && devices.length > 0) {
    for (const d of devices) {
      groups.set(d.name, []);
    }
  }

  let totalMappedPoints = 0;
  let totalMeters = 0;

  const rootNode: HierarchyNode = {
    id: 'plant-root',
    name: 'Main Plant Facility',
    type: 'Plant',
    children: [],
    parameterMappings: {}
  };

  const incomerNode: HierarchyNode = {
    id: 'mdb-incomers',
    name: 'Main Distribution (MDB-01)',
    type: 'MDB',
    children: [],
    parameterMappings: {}
  };
  rootNode.children!.push(incomerNode);

  const feedersNode: HierarchyNode = {
    id: 'smdb-feeders',
    name: 'Sub-Distribution Feeders (SMDB-01)',
    type: 'SMDB',
    children: [],
    parameterMappings: {}
  };
  incomerNode.children!.push(feedersNode);

  let index = 1;
  for (const [groupName, grpPoints] of groups.entries()) {
    const paramMappings: Record<string, string> = {};

    for (const [paramKey, paramTokens] of Object.entries(tokens)) {
      const regex = buildParameterRegex(paramTokens, delimiter);
      for (const pt of grpPoints) {
        const searchTarget = `${pt.name} ${pt.registerOrInstance || ''}`.toLowerCase();
        if (!paramMappings[paramKey] && regex.test(searchTarget)) {
          paramMappings[paramKey] = pt.id;
          totalMappedPoints++;
          break;
        }
      }
    }

    let nodeType: NodeType = 'Meter';
    const lowerName = groupName.toLowerCase();
    if (lowerName.includes('incomer') || lowerName.includes('transformer') || lowerName.includes('grid')) {
      nodeType = 'MDB';
    } else if (lowerName.includes('feeder') || lowerName.includes('substation') || lowerName.includes('mcc')) {
      nodeType = 'Feeder';
    }

    const meterNode: HierarchyNode = {
      id: `auto-meter-${index}`,
      name: groupName.startsWith('dev-') ? `Meter ${index}` : groupName,
      type: nodeType,
      children: [],
      mappedPointId: paramMappings['activePower'] || paramMappings['current'] || (grpPoints[0]?.id || ''),
      parameterMappings: paramMappings
    };

    if (nodeType === 'MDB') {
      incomerNode.children!.push(meterNode);
    } else {
      feedersNode.children!.push(meterNode);
    }

    totalMeters++;
    index++;
  }

  return {
    hierarchy: rootNode,
    configuredMetersCount: totalMeters,
    mappedPointsCount: totalMappedPoints
  };
}

/**
 * Default backward-compatible auto-configuration using standard parameters.
 */
export function autoConfigureMeters(discoveredItems: DiscoveredPoint[]): AutoConfigResult {
  return autoConfigureWithPatterns(discoveredItems, DEFAULT_PATTERN_CONFIG);
}
