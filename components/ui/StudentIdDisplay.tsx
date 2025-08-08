import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  getStudentIdInfo, 
  isValidStudentId, 
  displayStudentId,
  getCohortInfo,
  type DomainCode,
  DOMAIN_CODES 
} from '@/lib/student-id-generator';

interface StudentIdDisplayProps {
  studentId: string;
  format?: 'full' | 'short' | 'readable' | 'card';
  showCohort?: boolean;
  showDomain?: boolean;
  className?: string;
}

export function StudentIdDisplay({ 
  studentId, 
  format = 'full',
  showCohort = false,
  showDomain = false,
  className = '' 
}: StudentIdDisplayProps) {
  if (!studentId || !isValidStudentId(studentId)) {
    return (
      <span className={`text-gray-400 ${className}`}>
        {studentId || 'No ID'}
      </span>
    );
  }

  const info = getStudentIdInfo(studentId);
  const cohort = getCohortInfo(studentId);
  
  if (!info || !cohort) {
    return <span className={className}>{studentId}</span>;
  }

  if (format === 'card') {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-lg font-mono font-bold text-blue-600">
              {studentId}
            </span>
            <Badge variant="outline" className="text-xs">
              {info.domainCode}
            </Badge>
          </div>
          
          <div className="text-sm text-gray-600">
            <div>Cohort: {info.cohort}</div>
            <div>Domain: {info.domain}</div>
            <div>Sequence: #{info.sequenceNumber}</div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <span className="font-mono font-semibold text-blue-600">
        {format === 'readable' ? info.formatted : studentId}
      </span>
      
      {showDomain && (
        <Badge variant="secondary" className="text-xs">
          {info.domainCode}
        </Badge>
      )}
      
      {showCohort && (
        <span className="text-sm text-gray-500">
          ({cohort.cohortName})
        </span>
      )}
    </div>
  );
}

interface StudentIdInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  showValidation?: boolean;
}

export function StudentIdInput({ 
  value, 
  onChange, 
  placeholder = "Enter student ID (e.g., PS2506DS148)",
  className = '',
  showValidation = true 
}: StudentIdInputProps) {
  const isValid = !value || isValidStudentId(value);
  const info = value ? getStudentIdInfo(value) : null;

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          placeholder={placeholder}
          className={`
            font-mono uppercase
            ${className}
            ${!isValid ? 'border-red-500 focus:border-red-500' : ''}
          `}
          maxLength={11} // PS2506DS148 = 11 characters
        />
      </div>
      
      {showValidation && value && (
        <div className="text-sm">
          {isValid && info ? (
            <div className="text-green-600">
              ✓ Valid ID - {info.cohort}
            </div>
          ) : (
            <div className="text-red-600">
              ✗ Invalid format. Expected: PS2506DS148
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface CohortBadgeProps {
  studentId: string;
  className?: string;
}

export function CohortBadge({ studentId, className = '' }: CohortBadgeProps) {
  const cohort = getCohortInfo(studentId);
  
  if (!cohort) return null;

  const colors = {
    'WD': 'bg-blue-100 text-blue-800',
    'UD': 'bg-purple-100 text-purple-800', 
    'DS': 'bg-green-100 text-green-800',
    'PD': 'bg-yellow-100 text-yellow-800',
    'EP': 'bg-red-100 text-red-800',
    'FV': 'bg-indigo-100 text-indigo-800'
  };

  const colorClass = colors[cohort.domainCode as DomainCode] || 'bg-gray-100 text-gray-800';

  return (
    <Badge 
      variant="secondary" 
      className={`${colorClass} ${className}`}
    >
      {cohort.cohortName}
    </Badge>
  );
}

interface StudentIdStatsProps {
  studentIds: string[];
  className?: string;
}

export function StudentIdStats({ studentIds, className = '' }: StudentIdStatsProps) {
  const validIds = studentIds.filter(isValidStudentId);
  const domainCounts = validIds.reduce((acc, id) => {
    const info = getStudentIdInfo(id);
    if (info) {
      acc[info.domainCode] = (acc[info.domainCode] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{validIds.length}</div>
          <div className="text-sm text-gray-600">Total Students</div>
        </div>
        
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{studentIds.length - validIds.length}</div>
          <div className="text-sm text-gray-600">Invalid IDs</div>
        </div>
        
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{Object.keys(domainCounts).length}</div>
          <div className="text-sm text-gray-600">Active Domains</div>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="font-semibold">Domain Distribution</h4>
        {Object.entries(domainCounts).map(([code, count]) => (
          <div key={code} className="flex justify-between items-center">
            <span className="flex items-center gap-2">
              <Badge variant="outline">{code}</Badge>
              {DOMAIN_CODES[code as DomainCode]}
            </span>
            <span className="font-semibold">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Example usage component
export function StudentIdExample() {
  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <h3 className="font-semibold">Student ID Format Examples</h3>
      
      <div className="space-y-2">
        <StudentIdDisplay studentId="PS2506DS148" format="card" />
        <StudentIdDisplay studentId="PS2506WD001" showCohort showDomain />
        <StudentIdDisplay studentId="PS2507UD025" format="readable" />
      </div>
      
      <div className="text-sm text-gray-600">
        <p><strong>Format:</strong> PS + Year + Month + Domain + Sequence</p>
        <p><strong>Example:</strong> PS2506DS148 = June 2025, Data Science, Student #148</p>
      </div>
    </div>
  );
}