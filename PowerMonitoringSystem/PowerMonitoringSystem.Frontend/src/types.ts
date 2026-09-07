export type NodeType = 'Plant' | 'MDB' | 'SMDB' | 'MCC' | 'Feeder' | 'Meter';

export interface HierarchyNode {
  id: string;
  name: string;
  type: NodeType;
  children?: HierarchyNode[];
  mappedPointId?: string;
  mappedDeviceId?: number;
  parameterMappings?: Record<string, string>;
}

export interface DiscoveredPoint {
  id: string;
  name: string;
  protocol: string;
  deviceIp: string;
  registerOrInstance: string;
  itemType?: string;
  unit?: string;
  presentValue?: number | null;
}

export interface MeterData {
  nodeId: string;
  nodeName: string;
  nodeType: string;
  voltageAvg: number;
  currentAvg: number;
  powerFactor: number;
  frequency: number;
  activePower: number;
  apparentPower: number;
  reactivePower: number;
  energyToday: number;
  energyYesterday: number;
  energyMonth: number;
  demandKw: number;
  loadPercentage: number;
  status: 'Healthy' | 'Warning' | 'Critical';
  healthScore: number;
  isOnline: boolean;
  lastUpdated: string;

  // Phase-wise voltages
  vR_LN: number;
  vY_LN: number;
  vB_LN: number;
  vrY_LL: number;
  vyB_LL: number;
  vbR_LL: number;

  // Phase-wise currents
  iR: number;
  iY: number;
  iB: number;
  iNeutral: number;

  // Phase-wise powers
  powerR: number;
  powerY: number;
  powerB: number;
  reactivePowerR: number;
  reactivePowerY: number;
  reactivePowerB: number;
  pfR: number;
  pfY: number;
  pfB: number;

  // Harmonics & distortion
  thD_VR: number;
  thD_VY: number;
  thD_VB: number;
  thD_IR: number;
  thD_IY: number;
  thD_IB: number;

  voltageImbalancePercent: number;
  currentImbalancePercent: number;
  phaseSequence: string;
}

export interface TrendPoint {
  time: string;
  v: number;
  c: number;
  kw: number;
  pf: number;
  hz: number;
}

export interface EnergyData {
  totalEnergyKwh: number;
  totalReactiveKvarh: number;
  totalApparentKvah: number;
  averagePowerFactor: number;
  peakDemandKw: number;
  peakDemandTime: string;
  carbonFootprintKg: number;
  estimatedCost: number;
  variancePercent: number;
  trendBars: Array<{
    label: string;
    value: number;
    previousValue: number;
  }>;
  touBreakdown: {
    peakKwh: number;
    normalKwh: number;
    offPeakKwh: number;
    peakPercent: number;
    normalPercent: number;
    offPeakPercent: number;
  };
  subFeeders: Array<{
    nodeId: string;
    name: string;
    type: string;
    energyKwh: number;
    percentage: number;
  }>;
}

export interface HarmonicOrder {
  order: string;
  value: number;
  limit: number;
  status: 'Normal' | 'Warning' | 'Exceeded';
}

export interface PhasorVector {
  angle: number;
  magnitude: number;
  color: string;
}

export interface PowerQualityDisturbance {
  id: string;
  eventType: 'Sag' | 'Swell' | 'Interruption' | 'Transient';
  phase: string;
  magnitudePercent: number;
  voltage: number;
  durationMs: number;
  timestamp: string;
  severity: 'Critical' | 'Warning' | 'Info';
  status: 'Active' | 'Resolved';
  iticLimitExceeded: boolean;
  description: string;
}

export interface PowerQualityData {
  thdVoltageAvg: number;
  thdCurrentAvg: number;
  voltageUnbalancePercent: number;
  currentUnbalancePercent: number;
  frequencyDeviationHz: number;
  transformerKFactor: number;
  ieee519Compliance: 'Pass' | 'Marginal' | 'Fail';
  harmonics: HarmonicOrder[];
  phasorDiagram: {
    vr: PhasorVector;
    vy: PhasorVector;
    vb: PhasorVector;
    ir: PhasorVector;
    iy: PhasorVector;
    ib: PhasorVector;
  };
  disturbances: PowerQualityDisturbance[];
}

export interface PowerAlarm {
  id: number;
  vPointId: number;
  parameterName: string;
  nodeName: string;
  severity: 'Critical' | 'Warning' | 'Info';
  triggerValue: number;
  thresholdValue?: number;
  unit: string;
  message: string;
  timestamp: string;
  resolvedAt?: string;
  isActive: boolean;
  isAcknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  supportedFormats: string[];
}

export interface ReportResult {
  title: string;
  generatedAt: string;
  dateRange: string;
  nodeScope: string;
  rows: Array<Record<string, any>>;
  summary: Record<string, any>;
}

export interface PowerMonitoringSettings {
  enableDemoMode: boolean;
}
