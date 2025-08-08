/*
  Industrial Equipment Domain Types
  Scope:
  - Equipment types (pumps, compressors, motors)
  - Maintenance schedules and intervals
  - Maintenance task definitions
  - Equipment health metrics and status indicators
  - Self-performed maintenance workflows
*/

// -------- Shared primitives --------

export type UUID = string;

export type ISODateTime = string; // ISO-8601

export type Nullable<T> = T | null;

export type KeyValue = Record<string, string | number | boolean | null>;

export interface Attachment {
  id: UUID;
  fileName: string;
  contentType: string;
  url: string;
  uploadedAt: ISODateTime;
  metadata?: KeyValue;
}

export interface GeoLocation {
  site?: string;
  area?: string;
  building?: string;
  floor?: string;
  line?: string;
  coordinates?: {
    lat: number;
    lon: number;
    elevationM?: number;
  };
}

export enum Criticality {
  Low = "low",
  Medium = "medium",
  High = "high",
  Critical = "critical",
}

export enum EquipmentType {
  Pump = "pump",
  Compressor = "compressor",
  Motor = "motor",
}

export enum EquipmentStatus {
  Commissioning = "commissioning",
  Running = "running",
  Standby = "standby",
  Shutdown = "shutdown",
  Maintenance = "maintenance",
  Faulted = "faulted",
  Decommissioned = "decommissioned",
}

export enum HealthStatus {
  Excellent = "excellent",
  Good = "good",
  Fair = "fair",
  Poor = "poor",
  Critical = "critical",
}

export enum UnitOfMeasure {
  // electrical
  Volt = "V",
  Amp = "A",
  Hertz = "Hz",
  Watt = "W",
  KiloWatt = "kW",
  // mechanical
  RPM = "rpm",
  NewtonMeter = "Nm",
  Bar = "bar",
  Pascal = "Pa",
  Celsius = "C",
  Fahrenheit = "F",
  LiterPerMinute = "L/min",
  CubicMeterPerHour = "m3/h",
  // vibration
  MmPerSec = "mm/s",
  G = "g",
  // generic
  Percent = "%",
  Hours = "h",
  Days = "d",
}

export enum SensorType {
  Temperature = "temperature",
  Vibration = "vibration",
  Pressure = "pressure",
  Flow = "flow",
  Current = "current",
  Voltage = "voltage",
  Speed = "speed",
  Humidity = "humidity",
}

export interface SensorReading {
  id: UUID;
  equipmentId: UUID;
  type: SensorType;
  value: number;
  unit: UnitOfMeasure | string; // allow custom units
  observedAt: ISODateTime;
  metadata?: KeyValue;
}

// -------- Equipment Models --------

export interface EquipmentBase {
  id: UUID;
  name: string;
  type: EquipmentType;
  status: EquipmentStatus;
  model?: string;
  manufacturer?: string;
  serialNumber?: string;
  assetTag?: string;
  location?: GeoLocation;
  installedAt?: ISODateTime;
  commissionedAt?: ISODateTime;
  decommissionedAt?: ISODateTime;
  criticality?: Criticality;
  tags?: string[];
  metadata?: KeyValue;
}

// Specific equipment attributes
export interface Pump extends EquipmentBase {
  type: EquipmentType.Pump;
  pump: {
    ratedFlow?: { value: number; unit: UnitOfMeasure | string };
    ratedHead?: { value: number; unit: UnitOfMeasure | string }; // pressure/height
    ratedPower?: { value: number; unit: UnitOfMeasure | string };
    speed?: { value: number; unit: UnitOfMeasure | string }; // rpm
    driveType?: "direct" | "belt" | "gear" | "magnetic";
    sealType?: "mechanical" | "packing" | "seal-less";
  };
}

export interface Compressor extends EquipmentBase {
  type: EquipmentType.Compressor;
  compressor: {
    compressorType?: "reciprocating" | "screw" | "centrifugal" | "scroll";
    ratedCapacity?: { value: number; unit: UnitOfMeasure | string }; // flow
    dischargePressure?: { value: number; unit: UnitOfMeasure | string };
    ratedPower?: { value: number; unit: UnitOfMeasure | string };
    stages?: number;
    cooling?: "air" | "water" | "oil";
  };
}

export interface Motor extends EquipmentBase {
  type: EquipmentType.Motor;
  motor: {
    ratedPower?: { value: number; unit: UnitOfMeasure | string };
    ratedVoltage?: { value: number; unit: UnitOfMeasure | string };
    ratedCurrent?: { value: number; unit: UnitOfMeasure | string };
    ratedFrequency?: { value: number; unit: UnitOfMeasure | string };
    speed?: { value: number; unit: UnitOfMeasure | string };
    enclosure?: "TEFC" | "ODP" | "ExplosionProof" | string;
    frame?: string;
    efficiencyClass?: "IE1" | "IE2" | "IE3" | "IE4" | string;
  };
}

export type Equipment = Pump | Compressor | Motor;

// -------- Maintenance schedules and intervals --------

export enum TimeIntervalUnit {
  Minute = "minute",
  Hour = "hour",
  Day = "day",
  Week = "week",
  Month = "month",
  Year = "year",
}

export interface TimeBasedInterval {
  kind: "time";
  every: number; // e.g., 3
  unit: TimeIntervalUnit; // e.g., month
}

export interface UsageBasedInterval {
  kind: "usage";
  parameter: "runHours" | "starts" | "cycles" | string; // extensible
  threshold: number; // e.g., hours
}

export interface ConditionBasedInterval {
  kind: "condition";
  signal: SensorType | string;
  comparator: ">" | ">=" | "<" | "<=" | "==" | "!=";
  threshold: number;
  unit?: UnitOfMeasure | string;
  persistence?: { overReadings?: number; overMinutes?: number };
}

export type MaintenanceInterval =
  | TimeBasedInterval
  | UsageBasedInterval
  | ConditionBasedInterval;

export interface MaintenanceWindow {
  earliest?: ISODateTime;
  latest?: ISODateTime;
  allowedDaysOfWeek?: (0 | 1 | 2 | 3 | 4 | 5 | 6)[]; // 0=Sun
  allowedShift?: "day" | "swing" | "night" | "any";
}

export interface MaintenanceSchedule {
  id: UUID;
  name: string;
  description?: string;
  equipmentIds?: UUID[]; // specific assets
  equipmentTypes?: EquipmentType[]; // or by type
  intervals: MaintenanceInterval[]; // one or more rules
  window?: MaintenanceWindow;
  grace?: { beforeHours?: number; afterHours?: number };
  isActive: boolean;
  createdAt: ISODateTime;
  updatedAt?: ISODateTime;
  metadata?: KeyValue;
}

// -------- Maintenance task definitions --------

export enum TaskPriority {
  Low = "low",
  Medium = "medium",
  High = "high",
  Emergency = "emergency",
}

export interface ProcedureStep {
  stepNumber: number;
  title: string;
  instruction: string;
  required?: boolean;
  attachments?: Attachment[];
  check?: {
    type: "boolean" | "numeric" | "text" | "photo" | "reading";
    prompt?: string;
    unit?: UnitOfMeasure | string;
    min?: number;
    max?: number;
    regex?: string;
  };
}

export interface AcceptanceCriteria {
  description?: string;
  checks?: Array<{
    metric: string; // e.g., vibration.mm_s
    comparator: ">" | ">=" | "<" | "<=" | "==" | "!=";
    target: number | string | boolean;
    unit?: UnitOfMeasure | string;
  }>;
}

export interface MaintenanceTaskDefinition {
  id: UUID;
  code?: string; // e.g., PM-PUMP-001
  title: string;
  description?: string;
  priority?: TaskPriority;
  applicableEquipmentTypes?: EquipmentType[];
  estimatedDurationMinutes?: number;
  requiredSkills?: string[]; // e.g., Millwright, Electrician
  requiredTools?: string[];
  requiredParts?: string[]; // part numbers or SKUs
  safetyNotes?: string[];
  lockoutTagoutRequired?: boolean;
  steps?: ProcedureStep[];
  acceptance?: AcceptanceCriteria;
  documents?: Attachment[];
  createdAt: ISODateTime;
  updatedAt?: ISODateTime;
  metadata?: KeyValue;
}

// -------- Equipment health metrics and status indicators --------

export interface ThresholdBand {
  min?: number; // inclusive
  max?: number; // inclusive
  status: HealthStatus;
}

export interface MetricDefinition {
  key: string; // e.g., vibration.mm_s
  name: string;
  unit: UnitOfMeasure | string;
  preferredSensorType?: SensorType | string;
  thresholds?: ThresholdBand[]; // map ranges to status
  directionality?: "higher-is-better" | "lower-is-better" | "target-range";
}

export interface EquipmentHealth {
  equipmentId: UUID;
  status: HealthStatus;
  score?: number; // 0-100
  lastUpdated: ISODateTime;
  indicators: Array<{
    metricKey: string; // reference MetricDefinition.key
    value: number;
    unit: UnitOfMeasure | string;
    status: HealthStatus;
    observedAt: ISODateTime;
  }>;
  kpis?: {
    MTBFHours?: number; // Mean Time Between Failures
    MTTRHours?: number; // Mean Time To Repair
    availability?: number; // 0..1
  };
  notes?: string[];
  metadata?: KeyValue;
}

// -------- Self-performed maintenance workflows --------

export enum TaskStatus {
  Draft = "draft",
  Scheduled = "scheduled",
  InProgress = "in_progress",
  OnHold = "on_hold",
  Completed = "completed",
  Canceled = "canceled",
  Failed = "failed",
}

export interface Signature {
  byUserId: UUID;
  byName?: string;
  at: ISODateTime;
}

export interface ChecklistItem {
  id: UUID;
  stepNumber?: number;
  prompt: string;
  type: "boolean" | "numeric" | "text" | "photo" | "reading";
  valueBoolean?: boolean;
  valueNumber?: number;
  valueText?: string;
  valueAttachment?: Attachment;
  unit?: UnitOfMeasure | string;
  min?: number;
  max?: number;
  capturedAt?: ISODateTime;
}

export interface WorkLogEntry {
  at: ISODateTime;
  userId: UUID;
  message: string;
  metadata?: KeyValue;
}

export interface SelfPerformedMaintenance {
  id: UUID;
  equipmentId: UUID;
  taskDefinitionId?: UUID;
  title: string;
  description?: string;
  priority?: TaskPriority;
  status: TaskStatus;
  scheduledStart?: ISODateTime;
  scheduledEnd?: ISODateTime;
  actualStart?: ISODateTime;
  actualEnd?: ISODateTime;
  createdByUserId: UUID;
  assignedToUserId?: UUID;
  approvals?: Signature[];
  lockoutTagoutPerformed?: boolean;
  checklists?: ChecklistItem[];
  readings?: SensorReading[]; // captured during task
  attachments?: Attachment[]; // photos, docs
  logs?: WorkLogEntry[];
  acceptance?: {
    criteria?: AcceptanceCriteria;
    result?: "pass" | "fail";
    signedOffBy?: Signature;
  };
  followUpRecommendations?: string[];
  createdAt: ISODateTime;
  updatedAt?: ISODateTime;
  metadata?: KeyValue;
}

// -------- Events and history (optional but useful) --------

export interface MaintenanceEvent {
  id: UUID;
  equipmentId: UUID;
  type:
    | "inspection"
    | "preventive"
    | "corrective"
    | "failure"
    | "downtime"
    | "startup"
    | "shutdown";
  startedAt: ISODateTime;
  endedAt?: ISODateTime;
  description?: string;
  workOrderId?: UUID; // link to SelfPerformedMaintenance
  metadata?: KeyValue;
}

export interface FailureEvent extends MaintenanceEvent {
  type: "failure";
  failureMode?: string; // e.g., bearing failure
  severity?: "minor" | "major" | "catastrophic";
  cause?: string;
  correctiveAction?: string;
}

export interface InspectionFinding {
  id: UUID;
  equipmentId: UUID;
  observedAt: ISODateTime;
  description: string;
  severity?: "low" | "medium" | "high" | "critical";
  photos?: Attachment[];
  metadata?: KeyValue;
}

export type DomainModelVersion = "v1";

