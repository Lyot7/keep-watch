export interface ApiQuotaUsage {
  id: string;
  date: Date;
  quotaUsed: number;
  description?: string;
}
