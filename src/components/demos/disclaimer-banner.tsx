/**
 * Professional Demo Disclaimer Banner
 *
 * Displays transparent, confidence-building context about demo data
 * Positioned at top of demo pages to set proper expectations
 *
 * Design Philosophy:
 * - Professional, not apologetic
 * - Builds trust through transparency
 * - Encourages engagement with clear CTAs
 */

import { Info, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function DemoDisclaimerBanner() {
  return (
    <div className="bg-blue-50 border-l-4 border-blue-600 rounded-lg p-4 mb-6 shadow-sm">
      <div className="flex gap-3">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-blue-900 mb-1 text-sm">Demo Environment</p>
          <p className="text-sm text-gray-800 leading-relaxed">
            All metrics, workflows, and data shown are <strong>estimated examples</strong> for
            conceptual demonstration purposes. AVAIL's actual implementation is{' '}
            <strong>custom-tailored to each business's</strong> unique needs, industry, and goals.
            These demos showcase our platform's capabilities and potential ROI scenarios.
          </p>
          <Link
            href="/contact"
            className="text-blue-700 hover:text-blue-800 font-medium mt-2 inline-flex items-center gap-1 text-sm transition-colors group"
          >
            Learn about custom implementations
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * Compact variant for sidebars or limited-space contexts
 */
export function DemoDisclaimerCompact() {
  return (
    <div className="bg-blue-50/50 border border-blue-200 rounded-md px-3 py-2 text-xs text-gray-700">
      <span className="font-semibold text-blue-900">Demo data:</span> Estimated examples for
      illustration. Actual results customized per business.
    </div>
  );
}
