export type NotificationType = 
  | 'maintenance_due'
  | 'maintenance_overdue'
  | 'part_reorder'
  | 'equipment_status'
  | 'custom_reminder'
  | 'system_alert';

export type NotificationChannel = 
  | 'email'
  | 'sms'
  | 'in_app'
  | 'push';

export type NotificationFrequency = 
  | 'once'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'custom';

export type NotificationCondition = 
  | 'days_before'
  | 'days_after'
  | 'on_date'
  | 'when_status_changes'
  | 'when_below_threshold'
  | 'custom_schedule';

export type NotificationStatus = 
  | 'active'
  | 'paused'
  | 'expired'
  | 'draft';

export interface NotificationRule {
  id: string;
  name: string;
  description: string;
  type: NotificationType;
  status: NotificationStatus;
  
  // Trigger conditions
  condition: NotificationCondition;
  conditionValue?: string | number; // e.g., "7" for 7 days before
  
  // Targeting
  assetIds?: string[]; // Specific assets, empty = all assets
  equipmentTypes?: string[]; // Filter by equipment type
  criticalityLevels?: string[]; // Filter by criticality
  locations?: string[]; // Filter by location
  
  // Delivery
  channels: NotificationChannel[];
  recipients: string[]; // Email addresses or phone numbers
  
  // Schedule
  frequency: NotificationFrequency;
  customSchedule?: {
    startDate: string;
    endDate?: string;
    cronExpression?: string;
  };
  
  // Content
  subject: string;
  message: string;
  includeAssetDetails: boolean;
  
  // Metadata
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  lastTriggered?: string;
  nextTrigger?: string;
}

export interface NotificationHistory {
  id: string;
  ruleId: string;
  ruleName: string;
  assetId?: string;
  assetName?: string;
  channel: NotificationChannel;
  recipient: string;
  subject: string;
  message: string;
  sentAt: string;
  status: 'sent' | 'failed' | 'pending';
  error?: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: NotificationType;
  subject: string;
  message: string;
  variables: string[]; // Available template variables like {{assetName}}, {{dueDate}}
  isDefault: boolean;
}

export interface NotificationStats {
  totalRules: number;
  activeRules: number;
  sentToday: number;
  sentThisWeek: number;
  sentThisMonth: number;
  failureRate: number;
  averageDeliveryTime: number;
}
