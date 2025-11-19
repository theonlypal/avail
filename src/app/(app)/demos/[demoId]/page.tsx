"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ScenarioIntro } from "@/components/demos/scenario-intro";
import { MetricsComparison } from "@/components/demos/metrics-comparison";
import { CTAButton } from "@/components/demos/cta-button";
import { CRMInteractive } from "@/components/demos/crm-interactive";
import { WebsiteInteractive } from "@/components/demos/website-interactive";
import { SMSInteractive } from "@/components/demos/sms-interactive";
import { ReviewsInteractive } from "@/components/demos/reviews-interactive";
import { SocialInteractive } from "@/components/demos/social-interactive";
import { AdsInteractive } from "@/components/demos/ads-interactive";
import { ArrowLeft, Rocket, Phone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function DemoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const demoId = params.demoId as string;

  const [demo, setDemo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (demoId) {
      fetch(`/api/demos/${demoId}`)
        .then((res) => {
          if (!res.ok) throw new Error("Demo not found");
          return res.json();
        })
        .then((data) => {
          setDemo(data.demo);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [demoId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading demo...</p>
        </div>
      </div>
    );
  }

  if (error || !demo) {
    return (
      <div className="text-center space-y-4 py-12">
        <div className="text-6xl">😕</div>
        <h2 className="text-2xl font-bold">Demo Not Found</h2>
        <p className="text-muted-foreground">The demo you're looking for doesn't exist.</p>
        <CTAButton onClick={() => router.push("/demos")}>
          ← Back to Demos
        </CTAButton>
      </div>
    );
  }

  const renderInteractiveDemo = () => {
    switch (demoId) {
      case "crm":
        return <CRMInteractive demoData={demo.demoData} />;
      case "website":
        return <WebsiteInteractive demoData={demo.demoData} />;
      case "sms":
        return <SMSInteractive demoData={demo.demoData} />;
      case "reviews":
        return <ReviewsInteractive demoData={demo.demoData} />;
      case "social":
        return <SocialInteractive demoData={demo.demoData} />;
      case "ads":
        return <AdsInteractive demoData={demo.demoData} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Back Button & Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push("/demos")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Demos
        </button>
        <CTAButton size="sm" icon={<Phone className="w-4 h-4" />}>
          Book Demo Call
        </CTAButton>
      </div>

      {/* Demo Title */}
      <div className="text-center space-y-2">
        <div className="text-6xl mb-4">{demo.icon}</div>
        <h1 className="text-4xl font-bold">{demo.title}</h1>
        <p className="text-xl text-muted-foreground">{demo.subtitle}</p>
      </div>

      {/* Top CTA */}
      <div className="flex justify-center">
        <CTAButton icon={<Rocket className="w-5 h-5" />}>
          Get This For Your Business
        </CTAButton>
      </div>

      {/* Scenario Introduction */}
      <ScenarioIntro {...demo.scenario} />

      {/* Try Live Demo Button (for Website demo) */}
      {demoId === 'website' && (
        <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
          <CardContent className="py-8 text-center">
            <h3 className="text-3xl font-bold mb-4">🚀 Experience the Real Thing!</h3>
            <p className="text-lg mb-6 text-green-100">
              Chat with a real AI assistant powered by Claude. See how it captures leads in real-time!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/demos-live/website')}
                className="bg-white text-green-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-green-50 transition-all shadow-lg hover:shadow-xl"
              >
                Try Live Website Demo →
              </button>
              <button
                onClick={() => router.push('/demos-live/website/dashboard')}
                className="bg-green-700 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-green-800 transition-all border-2 border-white/20"
              >
                View Lead Dashboard
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Interactive Demo */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-center">
          {demoId === 'website' ? 'Preview (Try the live demo above!)' : 'Try It Yourself'}
        </h2>
        {renderInteractiveDemo()}
      </div>

      {/* Metrics Comparison */}
      <MetricsComparison
        before={demo.metrics.before}
        after={demo.metrics.after}
        savings={demo.metrics.savings}
        title="Real Results"
      />

      {/* Features List */}
      <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <CardContent className="pt-6">
          <h3 className="text-2xl font-bold mb-6 text-center">Everything You Get</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {demo.features?.map((feature: string, idx: number) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-white dark:bg-slate-900 rounded-lg border">
                <span className="text-green-500 text-xl shrink-0">✓</span>
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bottom CTA Section */}
      <Card className="p-8 text-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-blue-200 dark:border-blue-800">
        <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto text-lg">
          See how {demo.title} can transform your business just like {demo.scenario.businessName}.
          Book a free consultation to discuss your specific needs.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <CTAButton size="lg" icon={<Rocket className="w-5 h-5" />}>
            Schedule Free Demo
          </CTAButton>
          <CTAButton size="lg" variant="outline" icon={<Phone className="w-5 h-5" />}>
            Call (626) 394-7645
          </CTAButton>
        </div>
        <div className="mt-6 text-sm text-muted-foreground">
          No credit card required • Free 30-day trial • Cancel anytime
        </div>
      </Card>

      {/* Other Demos */}
      <div className="text-center pt-8 border-t">
        <h3 className="text-xl font-semibold mb-4">Explore More Demos</h3>
        <button
          onClick={() => router.push("/demos")}
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          View All AVAIL Demos →
        </button>
      </div>
    </div>
  );
}
