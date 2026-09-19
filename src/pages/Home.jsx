import { Link } from "react-router-dom";
import {
  ArrowRight,
  Brain,
  FileSearch,
  ShieldCheck,
  Sparkles,
  Activity,
  CheckCircle2,
} from "lucide-react";

import Navbar from "../components/Navbar";

function Home() {
  return (
    <div className="app-shell">
      <Navbar />

      <main>

        {/* HERO */}
        <section className="hero">
          <div className="hero-container">

            <div className="hero-content">

              <div className="eyebrow">
                <Sparkles size={15} />
                AI-Powered Blood Report Analysis
              </div>

              <h1>
                Understand your blood report
                <span> in simple language.</span>
              </h1>

              <p className="hero-description">
                Upload your blood test report and let BloodAI extract,
                organize and explain your results using intelligent
                document analysis.
              </p>

              <div className="hero-actions">
                <Link to="/upload" className="primary-button">
                  Analyze My Report
                  <ArrowRight size={18} />
                </Link>

                <a href="#how-it-works" className="secondary-button">
                  See How It Works
                </a>
              </div>

              <div className="trust-row">
                <div>
                  <CheckCircle2 size={16} />
                  OCR Extraction
                </div>

                <div>
                  <CheckCircle2 size={16} />
                  AI Insights
                </div>

                <div>
                  <CheckCircle2 size={16} />
                  Clear Visuals
                </div>
              </div>

            </div>

            {/* HERO REPORT CARD */}
            <div className="hero-visual">

              <div className="floating-badge">
                <Activity size={16} />
                AI Analysis Ready
              </div>

              <div className="report-card">

                <div className="report-card-header">
                  <div>
                    <p className="small-label">BLOOD REPORT</p>
                    <h3>Complete Blood Count</h3>
                  </div>

                  <div className="status-dot">
                    <CheckCircle2 size={18} />
                  </div>
                </div>

                <div className="report-patient">
                  <div>
                    <span>Patient</span>
                    <strong>John Doe</strong>
                  </div>

                  <div>
                    <span>Age</span>
                    <strong>21 Years</strong>
                  </div>

                  <div>
                    <span>Date</span>
                    <strong>15 Sep 2026</strong>
                  </div>
                </div>

                <div className="mini-parameters">

                  <div className="mini-parameter">
                    <div>
                      <span>Hemoglobin</span>
                      <strong>10.2 g/dL</strong>
                    </div>

                    <span className="badge-low">LOW</span>
                  </div>

                  <div className="mini-parameter">
                    <div>
                      <span>WBC Count</span>
                      <strong>8,200 /µL</strong>
                    </div>

                    <span className="badge-normal">NORMAL</span>
                  </div>

                  <div className="mini-parameter">
                    <div>
                      <span>Platelets</span>
                      <strong>250k /µL</strong>
                    </div>

                    <span className="badge-normal">NORMAL</span>
                  </div>

                </div>

                <div className="ai-preview">
                  <div className="ai-icon">
                    <Brain size={18} />
                  </div>

                  <div>
                    <span>AI INSIGHT</span>
                    <p>
                      3 parameters may require attention.
                    </p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </section>


        {/* FEATURES */}
        <section className="features-section">

          <div className="section-heading">
            <span className="section-label">POWERFUL ANALYSIS</span>

            <h2>
              From report to meaningful insights.
            </h2>

            <p>
              BloodAI combines document processing, intelligent
              analysis and visualization in one workflow.
            </p>
          </div>

          <div className="features-grid">

            <div className="feature-card">
              <div className="feature-icon">
                <FileSearch />
              </div>

              <h3>Smart Extraction</h3>

              <p>
                Extract blood parameters directly from PDF or image
                reports using OCR technology.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <Activity />
              </div>

              <h3>Parameter Analysis</h3>

              <p>
                Compare extracted values against the reference ranges
                provided by the laboratory.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <Brain />
              </div>

              <h3>AI Explanation</h3>

              <p>
                Convert complex laboratory results into simple,
                understandable explanations.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <ShieldCheck />
              </div>

              <h3>Safety First</h3>

              <p>
                Clearly distinguish informational analysis from
                medical diagnosis and professional advice.
              </p>
            </div>

          </div>

        </section>


        {/* HOW IT WORKS */}
        <section className="how-section" id="how-it-works">

          <div className="section-heading">
            <span className="section-label">HOW IT WORKS</span>

            <h2>
              Three simple steps.
            </h2>
          </div>

          <div className="steps-grid">

            <div className="step-card">
              <div className="step-number">01</div>
              <h3>Upload</h3>
              <p>
                Upload your blood report as a PDF, JPG or PNG.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">02</div>
              <h3>Analyze</h3>
              <p>
                AI extracts and analyzes the parameters in your report.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">03</div>
              <h3>Understand</h3>
              <p>
                View visual insights and easy-to-understand explanations.
              </p>
            </div>

          </div>

        </section>


        {/* CTA */}
        <section className="cta-section">

          <div>
            <span className="section-label">READY TO ANALYZE?</span>

            <h2>
              Turn a complicated report into clear insights.
            </h2>

            <p>
              Upload a sample report and explore the BloodAI workflow.
            </p>
          </div>

          <Link to="/upload" className="primary-button">
            Start Analysis
            <ArrowRight size={18} />
          </Link>

        </section>

      </main>

      <footer className="footer">
        <div>
          <strong>BloodAI</strong>
          <span>AI Blood Report Analyzer</span>
        </div>

        <p>
          For educational and informational purposes only. Not a medical
          diagnosis.
        </p>
      </footer>

    </div>
  );
}

export default Home;