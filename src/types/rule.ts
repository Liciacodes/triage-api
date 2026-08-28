export type IssueSeverity = 'low' | 'medium' | 'high';

export interface RuleResult {
    issue: string;
    severity: IssueSeverity;
    reason: string;
}