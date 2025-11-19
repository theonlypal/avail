/**
 * Metric Context Card Component
 *
 * Explains WHY metrics matter and sets realistic expectations
 * Builds confidence while maintaining transparency
 *
 * Design: Clean, informative, professional
 */

import { TrendingUp, Users, Clock, DollarSign } from 'lucide-react';

interface MetricExplanation {
  metric: string;
  icon: React.ElementType;
  why: string;
}

const metricExplanations: MetricExplanation[] = [
  {
    metric: 'Lead capture rate',
    icon: Users,
    why: "Demonstrates AI's ability to engage visitors 24/7, capturing leads that would otherwise be lost during off-hours or high-volume periods",
  },
  {
    metric: 'Response time',
    icon: Clock,
    why: 'Shows instant AI replies vs. delayed human responses. Speed directly impacts conversion—leads expect immediate engagement',
  },
  {
    metric: 'Conversion lift',
    icon: TrendingUp,
    why: 'Illustrates automated follow-up effectiveness. Consistent, timely communication dramatically improves qualification and booking rates',
  },
  {
    metric: 'Revenue impact',
    icon: DollarSign,
    why: 'Estimated based on industry benchmarks for home services. Real impact varies by business model, market, and implementation depth',
  },
];

export function MetricContextCard() {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 mt-4 shadow-sm">
      <h4 className="font-semibold text-sm text-gray-900 mb-4 flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-blue-600" />
        Why These Numbers Matter
      </h4>

      <div className="space-y-4">
        {metricExplanations.map(({ metric, icon: Icon, why }) => (
          <div key={metric} className="flex gap-3">
            <div className="w-8 h-8 bg-blue-50 rounded-md flex items-center justify-center flex-shrink-0">
              <Icon className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 mb-0.5">{metric}</p>
              <p className="text-xs text-gray-700 leading-relaxed">{why}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 pt-4 border-t border-gray-300">
        <p className="text-xs text-gray-600 leading-relaxed">
          <strong className="text-gray-900">Your results will vary:</strong> Actual performance
          depends on your industry, existing processes, lead quality, and custom workflow
          configuration. Schedule a consultation for projections specific to your business model and
          market conditions.
        </p>
      </div>
    </div>
  );
}

/**
 * Simplified version for smaller contexts
 */
interface SimpleMetricContextProps {
  industry?: string;
  baselineVisitors?: number;
  baselineConversion?: number;
}

export function SimpleMetricContext({
  industry = 'home services',
  baselineVisitors = 47,
  baselineConversion = 5,
}: SimpleMetricContextProps) {
  return (
    <div className="bg-blue-50/50 border border-blue-200 rounded-md p-3 text-xs space-y-1.5">
      <p className="text-gray-800">
        <strong className="text-blue-900">Industry context:</strong> Typical for {industry}{' '}
        businesses
      </p>
      <p className="text-gray-800">
        <strong className="text-blue-900">Baseline assumptions:</strong> {baselineVisitors} monthly
        visitors, {baselineConversion}% organic conversion
      </p>
      <p className="text-gray-700 pt-1.5 border-t border-blue-200">
        <strong>Custom implementation:</strong> This workflow adapts to your specific business
        needs, market, and existing processes
      </p>
    </div>
  );
}
