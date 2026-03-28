import { ArrowRight, Activity, Shield, Zap, Target, ChevronRight, Terminal, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { FloatingHeader } from "@/components/ui/floating-header";
import { GridAnimation } from "@/components/ui/mouse-following-line";
import { MinimalFooter } from "@/components/ui/minimal-footer";

export default function Home() {
  const pipelineSteps = [
    { layer: "LAYER 1", name: "NER Anonymization", desc: "BERT-NER + scispacy strips PII for HIPAA compliance", status: "active" },
    { layer: "LAYER 2", name: "Rule Engine", desc: "Deterministic matching for age, gender, ECOG, labs", status: "active" },
    { layer: "LAYER 3", name: "Vector Search", desc: "PubMedBERT computes semantic similarity scores", status: "active" },
    { layer: "LAYER 4", name: "LLM Reasoning", desc: "Mistral-7B generates explainable eligibility verdicts", status: "active" },
  ];

  const features = [
    { 
      icon: <Shield className="w-6 h-6" strokeWidth={2} />,
      title: "HIPAA Compliant",
      desc: "PII stripped at ingestion. Patient data never leaves the pipeline unmasked."
    },
    { 
      icon: <Zap className="w-6 h-6" strokeWidth={2} />,
      title: "<15 Second SLA",
      desc: "From raw patient record to ranked trial list in under 15 seconds."
    },
    { 
      icon: <Target className="w-6 h-6" strokeWidth={2} />,
      title: "Explainable AI",
      desc: "Every match comes with transparent reasoning. No black boxes."
    },
  ];

  const sampleOutput = [
    { criterion: "Age 18-75", patient: "54", status: "ELIGIBLE", confidence: 98 },
    { criterion: "ECOG <= 2", patient: "1", status: "ELIGIBLE", confidence: 95 },
    { criterion: "Platelets >= 100K", patient: "112K", status: "ELIGIBLE", confidence: 92 },
    { criterion: "No prior chemo", patient: "N/A", status: "UNCLEAR", confidence: 60 },
  ];

  return (
    <div className="min-h-screen bg-paper font-mono relative bg-grid-clinical overflow-x-hidden">
      <div className="relative z-50 pt-4">
        <FloatingHeader />
      </div>

      <main className="flex flex-col relative z-10">
        <section className="relative px-6 py-16 md:px-12 md:py-24 border-clinical-b bg-transparent overflow-hidden">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 relative z-10">
            
            <div className="flex flex-col justify-center z-10 w-full">
              <div className="mb-6 flex items-center gap-3">
                <Activity className="w-10 h-10 text-cobalt" strokeWidth={2} />
                <span className="font-mono text-sm font-bold uppercase tracking-[0.2em] text-charcoal/60">CogniStream v2.0</span>
              </div>
              
              <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold uppercase tracking-tight leading-[0.95] mb-6 text-charcoal">
                Clinical Trial<br />
                <span className="text-cobalt">Matching Engine</span>
              </h1>

              <p className="font-mono text-lg md:text-xl max-w-lg mb-8 leading-relaxed text-charcoal/70 border-l-2 border-cobalt pl-4">
                Reducing manual screening from 30+ minutes to under 15 seconds. 
                Transparent, explainable AI for clinical trial eligibility.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/simulator"
                  className="inline-flex w-max items-center justify-center gap-3 bg-cobalt clinical-btn px-8 py-4 text-base text-white hover:bg-charcoal"
                >
                  Launch Demo <ArrowRight className="w-5 h-5" strokeWidth={2} />
                </Link>
                <a
                  href="#architecture"
                  className="inline-flex w-max items-center justify-center gap-3 bg-white clinical-btn px-8 py-4 text-base text-charcoal hover:bg-charcoal hover:text-white"
                >
                  View Architecture <ChevronRight className="w-5 h-5" strokeWidth={2} />
                </a>
              </div>
            </div>

            <div className="relative z-10 flex items-center justify-center lg:justify-end">
              <div className="relative w-full max-w-[520px]">
                <div className="bg-charcoal text-white border-clinical shadow-clinical overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b-2 border-white/10">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-surgical" strokeWidth={2} />
                      <span className="font-mono text-xs font-bold uppercase tracking-wider text-white/60">4-Layer Pipeline Output</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-surgical animate-pulse" />
                      <span className="font-mono text-[10px] font-bold uppercase text-surgical">LIVE</span>
                    </div>
                  </div>
                  <div className="p-4 font-mono text-sm">
                    {sampleOutput.map((row, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-white/10 last:border-0">
                        <div className="flex items-center gap-3">
                          {row.status === "ELIGIBLE" ? (
                            <CheckCircle2 className="w-4 h-4 text-surgical" strokeWidth={2} />
                          ) : row.status === "INELIGIBLE" ? (
                            <XCircle className="w-4 h-4 text-iodine" strokeWidth={2} />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-amber-500" strokeWidth={2} />
                          )}
                          <span className="text-white/80">{row.criterion}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-white/40 text-xs">[{row.patient}]</span>
                          <span className={`font-bold text-xs ${
                            row.status === "ELIGIBLE" ? "text-surgical" : 
                            row.status === "INELIGIBLE" ? "text-iodine" : "text-amber-500"
                          }`}>
                            {row.status}
                          </span>
                          <span className="text-cobalt text-xs font-bold">{row.confidence}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-3 border-t-2 border-white/10 bg-white/5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-white/40 uppercase">Composite Score</span>
                      <span className="font-heading text-2xl font-bold text-surgical">86<span className="text-sm text-white/40">/100</span></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="architecture" className="px-6 py-20 md:px-12 md:py-28 bg-cream border-clinical-b">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <span className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-cobalt mb-4 block">System Architecture</span>
              <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold uppercase tracking-tight text-charcoal">
                4-Layer Processing Pipeline
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {pipelineSteps.map((step, i) => (
                <div key={i} className="bg-white border-clinical shadow-clinical-sm p-6 hover:shadow-clinical transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-charcoal/40">{step.layer}</span>
                    <div className="w-2 h-2 rounded-full bg-surgical" />
                  </div>
                  <h3 className="font-heading text-lg font-bold uppercase tracking-tight text-charcoal mb-2">{step.name}</h3>
                  <p className="font-mono text-sm text-charcoal/60 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-8 flex items-center justify-center">
              <div className="flex items-center gap-2 font-mono text-xs text-charcoal/50">
                <span className="font-bold">Composite Formula:</span>
                <code className="bg-white border-clinical px-3 py-1.5 text-charcoal">(0.30 × Rule) + (0.20 × Embedding) + (0.35 × LLM) + (0.15 × Geo)</code>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="px-6 py-20 md:px-12 md:py-28 bg-charcoal text-white">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.map((feature, i) => (
                <div key={i} className="border-2 border-white/20 p-8 hover:border-cobalt transition-colors">
                  <div className="w-12 h-12 border-2 border-cobalt flex items-center justify-center mb-6 text-cobalt">
                    {feature.icon}
                  </div>
                  <h3 className="font-heading text-xl font-bold uppercase tracking-tight mb-3">{feature.title}</h3>
                  <p className="font-mono text-sm text-white/60 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="px-6 py-24 md:px-12 md:py-32 bg-surgical/10 border-clinical-t flex flex-col items-center justify-center text-center relative overflow-hidden">
          <GridAnimation 
            cols={50} 
            rows={20} 
            spacing={40} 
            strokeLength={12} 
            strokeWidth={1} 
            lineColor="rgba(15,15,15,0.08)"
            className="absolute inset-0 w-full h-full"
          />
          
          <div className="relative z-10 flex flex-col items-center max-w-3xl">
            <span className="font-mono text-xs font-bold uppercase tracking-[0.3em] text-cobalt mb-4">Ready to Test</span>
            <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold uppercase tracking-tight text-charcoal mb-6">
              See It In Action
            </h2>
            <p className="font-mono text-lg text-charcoal/70 mb-10 max-w-xl">
              Test the complete pipeline with synthetic patient data. View explainable AI reasoning in real-time.
            </p>
            <Link
              href="/simulator"
              className="inline-flex items-center gap-3 bg-charcoal text-white clinical-btn px-10 py-5 text-lg hover:bg-cobalt hover:border-cobalt"
            >
              Launch The Simulator <ArrowRight className="w-6 h-6" strokeWidth={2} />
            </Link>
          </div>
        </section>

        <div className="bg-paper px-4 py-8 pb-12 w-full flex justify-center">
          <MinimalFooter />
        </div>
      </main>
    </div>
  );
}
