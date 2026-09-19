import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Activity,
  RefreshCw,
  User,
  CalendarDays,
  FileText,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  Search,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Copy,
  Check,
  Info,
  BarChart3,
  HeartPulse,
} from "lucide-react";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";

import Navbar from "../components/Navbar";
import { getReportAnalysis } from "../services/api";


/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard() {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [showOCR, setShowOCR] = useState(false);
  const [copiedOCR, setCopiedOCR] = useState(false);

  const reportId = sessionStorage.getItem("reportId");
  const filename = sessionStorage.getItem("reportFilename");

  useEffect(() => {
    const loadAnalysis = async () => {
      if (!reportId) {
        setError("No report found. Please upload a report first.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await getReportAnalysis(reportId);

        if (response.success) {
          setData(response.data);
        } else {
          setError("Unable to analyze the report.");
        }
      } catch (err) {
        console.error(err);

        setError(
          err.response?.data?.detail ||
            "Unable to load report analysis."
        );
      } finally {
        setLoading(false);
      }
    };

    loadAnalysis();
  }, [reportId]);

  const handleNewReport = () => {
    sessionStorage.removeItem("reportId");
    sessionStorage.removeItem("reportFilename");
    navigate("/upload");
  };

  const patient = data?.patient || {};
  const summary = data?.summary || {};
  const parameters = data?.parameters || [];

  const filteredParameters = useMemo(() => {
    const query = search.trim().toLowerCase();

    return parameters.filter((parameter) => {
      const matchesSearch =
        !query ||
        parameter.name?.toLowerCase().includes(query);

      const matchesFilter =
        filter === "All" ||
        parameter.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [parameters, search, filter]);

  const chartData = [
    {
      name: "Normal",
      value: summary.normal || 0,
    },
    {
      name: "Low",
      value: summary.low || 0,
    },
    {
      name: "High",
      value: summary.high || 0,
    },
  ];

  const copyOCR = async () => {
    const text = data?.ocr_text || "";

    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      setCopiedOCR(true);

      setTimeout(() => {
        setCopiedOCR(false);
      }, 1800);
    } catch (err) {
      console.error("Unable to copy OCR text:", err);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />

        <main className="advanced-dashboard">
          <div className="dashboard-loader">
            <div className="loader-icon">
              <Activity size={28} />
            </div>

            <h2>Analyzing Blood Report</h2>

            <p>
              Extracting laboratory values and preparing AI insights...
            </p>

            <div
              style={{
                width: "220px",
                height: "4px",
                borderRadius: "999px",
                margin: "22px auto 0",
                background: "rgba(255,255,255,0.08)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: "45%",
                  height: "100%",
                  borderRadius: "999px",
                  background:
                    "linear-gradient(90deg, #7c72ff, #55dca8)",
                  animation: "bloodAiLoading 1.3s ease-in-out infinite",
                }}
              />
            </div>
          </div>

          <style>{`
            @keyframes bloodAiLoading {
              0% { transform: translateX(-120%); }
              50% { transform: translateX(120%); }
              100% { transform: translateX(260%); }
            }
          `}</style>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />

        <main className="advanced-dashboard">
          <div className="dashboard-error">
            <XCircle size={48} />

            <h2>Analysis Unavailable</h2>

            <p>{error}</p>

            <button
              className="dashboard-primary-btn"
              onClick={handleNewReport}
            >
              Upload New Report
            </button>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="advanced-dashboard">

        {/* =================================================
            HEADER
        ================================================= */}

        <section className="analysis-header">
          <div>
            <div className="analysis-title">
              <div className="analysis-logo">
                <Activity size={27} />
              </div>

              <div>
                <div className="analysis-status">
                  <span></span>
                  ANALYSIS COMPLETED
                </div>

                <h1>Blood Report Analysis</h1>

                <p>
                  AI-powered analysis of your laboratory report
                </p>
              </div>
            </div>
          </div>

          <button
            className="new-report-btn"
            onClick={handleNewReport}
          >
            <RefreshCw size={17} />
            New Report
          </button>
        </section>


        {/* =================================================
            PATIENT INFORMATION
        ================================================= */}

        <section className="patient-panel">
          <div className="panel-top">
            <div className="panel-title">
              <div className="panel-icon">
                <User size={20} />
              </div>

              <div>
                <h2>Patient Information</h2>

                <p>
                  Information detected from uploaded document
                </p>
              </div>
            </div>

            <div className="report-file">
              <FileText size={16} />

              <span>
                {filename || "Blood Report"}
              </span>
            </div>
          </div>

          <div className="patient-details">
            <div className="patient-detail">
              <span>Patient Name</span>
              <strong>
                {patient.name || "Not detected"}
              </strong>
            </div>

            <div className="patient-detail">
              <span>Age</span>
              <strong>
                {patient.age || "Not detected"}
              </strong>
            </div>

            <div className="patient-detail">
              <span>Gender</span>
              <strong>
                {patient.gender || "Not detected"}
              </strong>
            </div>

            <div className="patient-detail">
              <span>Report Date</span>
              <strong>
                <CalendarDays size={15} />
                {patient.date || "Not detected"}
              </strong>
            </div>
          </div>
        </section>


        {/* =================================================
            SUMMARY
        ================================================= */}

        <section className="advanced-summary">
          <SummaryCard
            icon={<Activity size={20} />}
            title="Total Parameters"
            value={summary.total || 0}
            description="Detected values"
            type="total"
          />

          <SummaryCard
            icon={<CheckCircle2 size={20} />}
            title="Normal"
            value={summary.normal || 0}
            description="Within range"
            type="normal"
          />

          <SummaryCard
            icon={<AlertTriangle size={20} />}
            title="Low"
            value={summary.low || 0}
            description="Below range"
            type="low"
          />

          <SummaryCard
            icon={<XCircle size={20} />}
            title="High"
            value={summary.high || 0}
            description="Above range"
            type="high"
          />
        </section>


        {/* =================================================
            NEW REPORT RANGE SCORE
        ================================================= */}

        <ReportRangeScore summary={summary} />


        {/* =================================================
            ANALYTICS
        ================================================= */}

        <section className="analytics-grid">

          {/* REPORT DISTRIBUTION */}

          <div className="analytics-panel">
            <div className="panel-heading">
              <div>
                <h2>Report Analytics</h2>

                <p>
                  Distribution of detected parameters
                </p>
              </div>

              <Activity size={19} />
            </div>

            <div className="chart-wrapper">
              <ResponsiveContainer
                width="100%"
                height={260}
              >
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={72}
                    outerRadius={105}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell fill="#55dca8" />
                    <Cell fill="#f4c65e" />
                    <Cell fill="#f07878" />
                  </Pie>

                  <Tooltip
                    contentStyle={{
                      background: "#111827",
                      color: "#ffffff",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "10px",
                    }}
                    itemStyle={{
                      color: "#ffffff",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="chart-center-text">
                <strong>
                  {summary.total || 0}
                </strong>

                <span>
                  Parameters
                </span>
              </div>
            </div>

            <div className="analytics-legend">
              <Legend
                label="Normal"
                value={summary.normal || 0}
                type="normal"
              />

              <Legend
                label="Low"
                value={summary.low || 0}
                type="low"
              />

              <Legend
                label="High"
                value={summary.high || 0}
                type="high"
              />
            </div>
          </div>


          {/* ANALYSIS OVERVIEW */}

          <div className="quick-insight-panel">
            <div className="panel-heading">
              <div>
                <h2>Analysis Overview</h2>

                <p>
                  Quick report insights
                </p>
              </div>

              <Sparkles size={19} />
            </div>

            <div className="overview-item">
              <div className="overview-icon">
                <FileText size={17} />
              </div>

              <div>
                <span>Parameters analyzed</span>
                <strong>{summary.total || 0}</strong>
              </div>
            </div>

            <div className="overview-item">
              <div className="overview-icon normal">
                <CheckCircle2 size={17} />
              </div>

              <div>
                <span>Within configured range</span>
                <strong>{summary.normal || 0}</strong>
              </div>
            </div>

            <div className="overview-item">
              <div className="overview-icon attention">
                <AlertTriangle size={17} />
              </div>

              <div>
                <span>Outside configured range</span>

                <strong>
                  {(summary.low || 0) +
                    (summary.high || 0)}
                </strong>
              </div>
            </div>

            <div className="privacy-box">
              <ShieldCheck size={18} />

              <div>
                <strong>Informational Analysis</strong>

                <p>
                  Results are compared against configured
                  reference ranges and are not a diagnosis.
                </p>
              </div>
            </div>
          </div>
        </section>


        {/* =================================================
            PARAMETER VALUE CHART
        ================================================= */}

        <ParameterChart parameters={parameters} />


        {/* =================================================
            LABORATORY PARAMETERS
        ================================================= */}

        <section className="parameters-panel">

          <div className="parameters-header">
            <div>
              <h2>Laboratory Parameters</h2>

              <p>
                Detected values, reference ranges and AI explanations
              </p>
            </div>

            <div className="parameter-tools">
              <div className="search-box">
                <Search size={16} />

                <input
                  type="text"
                  placeholder="Search parameter..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                />
              </div>

              <select
                value={filter}
                onChange={(e) =>
                  setFilter(e.target.value)
                }
              >
                <option value="All">All</option>
                <option value="Normal">Normal</option>
                <option value="Low">Low</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div className="parameter-table">

            <div className="table-header">
              <span>PARAMETER</span>
              <span>RESULT</span>
              <span>REFERENCE RANGE</span>
              <span>STATUS</span>
            </div>

            {filteredParameters.length === 0 ? (
              <div className="no-results">
                <Search size={30} />

                <p>
                  No matching parameters found.
                </p>
              </div>
            ) : (
              filteredParameters.map((parameter, index) => (
                <ParameterRow
                  key={`${parameter.name}-${index}`}
                  parameter={parameter}
                />
              ))
            )}
          </div>
        </section>


        {/* =================================================
            AI INSIGHTS
        ================================================= */}

        <AIInsightCard
          summary={
            data?.ai_summary ||
            "No AI summary available."
          }
        />


        {/* =================================================
            EDUCATIONAL INSIGHTS
        ================================================= */}

        <RecommendationCard
          parameters={parameters}
        />


        {/* =================================================
            OCR VIEWER
        ================================================= */}

        <section className="ocr-panel">

          <button
            className="ocr-header"
            onClick={() => setShowOCR(!showOCR)}
          >
            <div>
              <FileText size={18} />

              <div>
                <strong>
                  Extracted Report Text
                </strong>

                <span>
                  Raw text detected through OCR
                </span>
              </div>
            </div>

            {showOCR ? (
              <ChevronUp size={19} />
            ) : (
              <ChevronDown size={19} />
            )}
          </button>

          {showOCR && (
            <div className="ocr-content">
              <div className="ocr-toolbar">
                <span>
                  {data?.ocr_text
                    ? `${data.ocr_text.length} characters extracted`
                    : "No OCR text available"}
                </span>

                <button
                  type="button"
                  className="ocr-copy-btn"
                  onClick={copyOCR}
                  disabled={!data?.ocr_text}
                >
                  {copiedOCR ? (
                    <>
                      <Check size={15} />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy size={15} />
                      Copy Text
                    </>
                  )}
                </button>
              </div>

              <div className="ocr-text">
                {data?.ocr_text ||
                  "No OCR text available."}
              </div>
            </div>
          )}
        </section>


        {/* =================================================
            FOOTER DISCLAIMER
        ================================================= */}

        <div className="dashboard-disclaimer">
          <AlertTriangle size={17} />

          <span>
            BloodAI is an educational and informational
            prototype. Reference ranges are configured for
            demonstration and laboratory ranges may vary.
            This analysis does not provide a medical diagnosis.
          </span>
        </div>

      </main>
    </>
  );
}


/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({
  icon,
  title,
  value,
  description,
  type,
}) {
  return (
    <div className={`advanced-summary-card ${type}`}>
      <div className="summary-icon-box">
        {icon}
      </div>

      <div className="summary-content">
        <span>{title}</span>
        <strong>{value}</strong>
        <small>{description}</small>
      </div>
    </div>
  );
}


/* =========================================================
   REPORT RANGE SCORE
========================================================= */

function ReportRangeScore({ summary }) {
  const total = Number(summary.total || 0);
  const normal = Number(summary.normal || 0);
  const low = Number(summary.low || 0);
  const high = Number(summary.high || 0);

  const outside = low + high;

  const score = total
    ? Math.round((normal / total) * 100)
    : 0;

  let label = "Needs Attention";
  let description =
    "Several detected values are outside the configured range.";

  if (total === 0) {
    label = "No Data";
    description = "No supported parameters were detected.";
  } else if (score === 100) {
    label = "All Within Range";
    description =
      "All detected parameters are within the configured reference ranges.";
  } else if (score >= 70) {
    label = "Mostly Within Range";
    description =
      "Most detected parameters are within the configured reference ranges.";
  } else if (score >= 50) {
    label = "Mixed Results";
    description =
      "Some detected parameters are outside the configured reference ranges.";
  }

  const circumference = 2 * Math.PI * 56;
  const dashOffset =
    circumference - (score / 100) * circumference;

  return (
    <section
      style={{
        margin: "24px 0",
        display: "grid",
        gridTemplateColumns:
          "minmax(250px, 0.8fr) minmax(300px, 1.5fr)",
        gap: "18px",
      }}
      className="bloodai-score-grid"
    >
      <div
        style={{
          borderRadius: "24px",
          padding: "26px",
          background:
            "linear-gradient(145deg, rgba(17,28,52,.96), rgba(10,18,35,.96))",
          border: "1px solid rgba(255,255,255,.08)",
          display: "flex",
          alignItems: "center",
          gap: "24px",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "140px",
            height: "140px",
            flexShrink: 0,
          }}
        >
          <svg
            width="140"
            height="140"
            viewBox="0 0 140 140"
            style={{
              transform: "rotate(-90deg)",
            }}
          >
            <circle
              cx="70"
              cy="70"
              r="56"
              fill="none"
              stroke="rgba(255,255,255,.07)"
              strokeWidth="10"
            />

            <circle
              cx="70"
              cy="70"
              r="56"
              fill="none"
              stroke={
                score >= 70
                  ? "#55dca8"
                  : score >= 50
                    ? "#f4c65e"
                    : "#f07878"
              }
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
            />
          </svg>

          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
            }}
          >
            <strong
              style={{
                fontSize: "32px",
                lineHeight: 1,
                color: "#ffffff",
              }}
            >
              {score}
            </strong>

            <span
              style={{
                marginTop: "5px",
                fontSize: "11px",
                color: "#8e9bb3",
              }}
            >
              RANGE SCORE
            </span>
          </div>
        </div>

        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#7c72ff",
              marginBottom: "8px",
            }}
          >
            <HeartPulse size={17} />
            <span
              style={{
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: ".08em",
              }}
            >
              BLOODAI ANALYTICS
            </span>
          </div>

          <h2
            style={{
              margin: "0 0 7px",
              color: "#ffffff",
              fontSize: "21px",
            }}
          >
            {label}
          </h2>

          <p
            style={{
              margin: 0,
              color: "#8e9bb3",
              lineHeight: 1.55,
              fontSize: "13px",
            }}
          >
            {description}
          </p>
        </div>
      </div>

      <div
        style={{
          borderRadius: "24px",
          padding: "26px",
          background: "rgba(10,20,39,.78)",
          border: "1px solid rgba(255,255,255,.08)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "18px",
          }}
        >
          <BarChart3 size={19} color="#7c72ff" />

          <div>
            <h3
              style={{
                margin: 0,
                color: "#ffffff",
                fontSize: "17px",
              }}
            >
              Range Status Breakdown
            </h3>

            <p
              style={{
                margin: "4px 0 0",
                color: "#71809a",
                fontSize: "12px",
              }}
            >
              Based on the configured reference ranges
            </p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(3, minmax(0,1fr))",
            gap: "12px",
          }}
        >
          <ScoreMiniCard
            label="Normal"
            value={normal}
            icon={<CheckCircle2 size={17} />}
            className="normal"
          />

          <ScoreMiniCard
            label="Low"
            value={low}
            icon={<AlertTriangle size={17} />}
            className="low"
          />

          <ScoreMiniCard
            label="High"
            value={high}
            icon={<XCircle size={17} />}
            className="high"
          />
        </div>

        <div
          style={{
            marginTop: "17px",
            paddingTop: "15px",
            borderTop:
              "1px solid rgba(255,255,255,.07)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "#71809a",
            fontSize: "11px",
          }}
        >
          <Info size={14} />
          This is a report-range metric, not a medical health score.
        </div>
      </div>
    </section>
  );
}


function ScoreMiniCard({
  label,
  value,
  icon,
  className,
}) {
  return (
    <div
      className={`bloodai-score-mini ${className}`}
      style={{
        padding: "15px",
        borderRadius: "15px",
        background: "rgba(255,255,255,.035)",
        border: "1px solid rgba(255,255,255,.06)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "7px",
          color:
            className === "normal"
              ? "#55dca8"
              : className === "low"
                ? "#f4c65e"
                : "#f07878",
        }}
      >
        {icon}

        <span
          style={{
            color: "#a8b2c4",
            fontSize: "12px",
          }}
        >
          {label}
        </span>
      </div>

      <strong
        style={{
          display: "block",
          marginTop: "8px",
          color: "#ffffff",
          fontSize: "25px",
        }}
      >
        {value}
      </strong>
    </div>
  );
}


/* =========================================================
   PARAMETER BAR CHART
========================================================= */

function ParameterChart({ parameters }) {
  if (!parameters.length) {
    return null;
  }

  const chartData = parameters.map((parameter) => ({
    name: parameter.name,
    value: Number(parameter.value) || 0,
    status: parameter.status,
  }));

  return (
    <section
      style={{
        margin: "24px 0",
        padding: "24px",
        borderRadius: "24px",
        background: "rgba(10,20,39,.78)",
        border: "1px solid rgba(255,255,255,.08)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "15px",
          marginBottom: "20px",
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              color: "#ffffff",
              fontSize: "18px",
            }}
          >
            Parameter Values
          </h2>

          <p
            style={{
              margin: "5px 0 0",
              color: "#71809a",
              fontSize: "12px",
            }}
          >
            Visual comparison of detected laboratory values
          </p>
        </div>

        <BarChart3 size={19} color="#7c72ff" />
      </div>

      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 10,
              right: 10,
              left: 0,
              bottom: 55,
            }}
          >
            <CartesianGrid
              stroke="rgba(255,255,255,.07)"
              strokeDasharray="4 4"
            />

            <XAxis
              dataKey="name"
              tick={{
                fill: "#8e9bb3",
                fontSize: 10,
              }}
              angle={-25}
              textAnchor="end"
              interval={0}
            />

            <YAxis
              tick={{
                fill: "#8e9bb3",
                fontSize: 10,
              }}
            />

            <Tooltip
              contentStyle={{
                background: "#111827",
                border:
                  "1px solid rgba(255,255,255,.1)",
                borderRadius: "10px",
              }}
              labelStyle={{
                color: "#ffffff",
              }}
              itemStyle={{
                color: "#ffffff",
              }}
            />

            <Bar
              dataKey="value"
              name="Reported Value"
              fill="#7c72ff"
              radius={[7, 7, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}


/* =========================================================
   LEGEND
========================================================= */

function Legend({
  label,
  value,
  type,
}) {
  return (
    <div className="analytics-legend-item">
      <span
        className={`legend-circle ${type}`}
      ></span>

      <div>
        <strong>{label}</strong>

        <small>
          {value} parameter(s)
        </small>
      </div>
    </div>
  );
}


/* =========================================================
   PARAMETER ROW
========================================================= */

function ParameterRow({ parameter }) {
  const status = parameter.status?.toLowerCase();

  let Icon = CheckCircle2;

  if (status === "low") {
    Icon = AlertTriangle;
  }

  if (status === "high") {
    Icon = XCircle;
  }

  const value = Number(parameter.value);
  const rangeParts = String(
    parameter.reference_range || ""
  )
    .split("-")
    .map((item) => Number(item.trim()));

  const min = rangeParts[0];
  const max = rangeParts[1];

  let markerPosition = 50;

  if (
    Number.isFinite(value) &&
    Number.isFinite(min) &&
    Number.isFinite(max) &&
    max > min
  ) {
    const range = max - min;

    if (value < min) {
      markerPosition = Math.max(
        8,
        50 - ((min - value) / range) * 30
      );
    } else if (value > max) {
      markerPosition = Math.min(
        92,
        50 + ((value - max) / range) * 30
      );
    } else {
      markerPosition =
        20 + ((value - min) / range) * 60;
    }
  }

  return (
    <div
      className="advanced-parameter-card"
      style={{
        color: "#172033",
      }}
    >

      {/* TOP ROW */}

      <div className="advanced-parameter-top">

        <div className="advanced-parameter-name">
          <div
            className={`parameter-status-dot ${status}`}
          />

          <div>
            <strong
              style={{
                color: "#172033",
              }}
            >
              {parameter.name}
            </strong>

            <span
              style={{
                color: "#667085",
              }}
            >
              Reference: {parameter.reference_range}
            </span>
          </div>
        </div>

        <div
          className="advanced-parameter-result"
          style={{
            color: "#172033",
          }}
        >
          <strong
            style={{
              color: "#172033",
            }}
          >
            {parameter.value}
          </strong>

          <span
            style={{
              color: "#667085",
            }}
          >
            {parameter.unit}
          </span>
        </div>

        <span
          className={`advanced-status ${status}`}
        >
          <Icon size={14} />
          {parameter.status}
        </span>
      </div>


      {/* RANGE VISUALIZATION */}

      <div className="range-section">

        <div
          className="range-labels"
          style={{
            color: "#667085",
          }}
        >
          <span>
            Reference Range
          </span>

          <span>
            {parameter.reference_range}{" "}
            {parameter.unit}
          </span>
        </div>

        <div
          className={`range-bar ${status}`}
          style={{
            position: "relative",
          }}
        >
          <div className="range-normal-zone"></div>

          <div
            className="range-marker"
            style={{
              left: `${markerPosition}%`,
            }}
          ></div>
        </div>

        <div
          className="range-scale"
          style={{
            color: "#667085",
          }}
        >
          <span>Low</span>
          <span>Normal</span>
          <span>High</span>
        </div>
      </div>


      {/* AI EXPLANATION */}

      {parameter.explanation && (
        <div className="advanced-explanation">
          <div className="explanation-icon">
            <Sparkles size={15} />
          </div>

          <div>
            <strong
              style={{
                color: "#6558d3",
              }}
            >
              AI Explanation
            </strong>

            <p
              style={{
                color: "#667085",
              }}
            >
              {parameter.explanation}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}


/* =========================================================
   AI INSIGHT CARD
========================================================= */

function AIInsightCard({ summary }) {
  return (
    <section
      className="ai-panel"
      style={{
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-90px",
          right: "-80px",
          width: "220px",
          height: "220px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(124,114,255,.16), transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div className="ai-panel-header">
        <div className="ai-main-icon">
          <Sparkles size={23} />
        </div>

        <div>
          <div className="ai-label">
            AI INSIGHTS
          </div>

          <h2>
            Gemini Report Summary
          </h2>
        </div>
      </div>

      <div className="ai-text">
        <p>
          {summary}
        </p>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "7px",
          marginTop: "16px",
          color: "#7f8ba1",
          fontSize: "11px",
        }}
      >
        <Info size={13} />
        AI-generated educational interpretation based on detected values.
      </div>
    </section>
  );
}


/* =========================================================
   EDUCATIONAL RECOMMENDATIONS
========================================================= */

function RecommendationCard({ parameters }) {
  const low = parameters.filter(
    (parameter) =>
      parameter.status === "Low"
  );

  const high = parameters.filter(
    (parameter) =>
      parameter.status === "High"
  );

  const normal = parameters.filter(
    (parameter) =>
      parameter.status === "Normal"
  );

  return (
    <section
      style={{
        margin: "24px 0",
        padding: "24px",
        borderRadius: "24px",
        background: "rgba(10,20,39,.78)",
        border:
          "1px solid rgba(255,255,255,.08)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "18px",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "13px",
            background:
              "rgba(85,220,168,.10)",
            color: "#55dca8",
          }}
        >
          <ShieldCheck size={20} />
        </div>

        <div>
          <h2
            style={{
              margin: 0,
              color: "#ffffff",
              fontSize: "18px",
            }}
          >
            Educational Insights
          </h2>

          <p
            style={{
              margin: "4px 0 0",
              color: "#71809a",
              fontSize: "12px",
            }}
          >
            Simple observations from the configured ranges
          </p>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "12px",
        }}
      >
        {low.length > 0 && (
          <InsightBox
            icon={<AlertTriangle size={18} />}
            title="Below Range"
            text={`${low
              .map((parameter) => parameter.name)
              .join(", ")} ${low.length === 1 ? "is" : "are"} marked Low.`}
            type="warning"
          />
        )}

        {high.length > 0 && (
          <InsightBox
            icon={<XCircle size={18} />}
            title="Above Range"
            text={`${high
              .map((parameter) => parameter.name)
              .join(", ")} ${high.length === 1 ? "is" : "are"} marked High.`}
            type="danger"
          />
        )}

        {normal.length > 0 && (
          <InsightBox
            icon={<CheckCircle2 size={18} />}
            title="Within Range"
            text={`${normal.length} detected ${
              normal.length === 1
                ? "parameter is"
                : "parameters are"
            } within the configured range.`}
            type="success"
          />
        )}

        {low.length === 0 &&
          high.length === 0 && (
            <InsightBox
              icon={<CheckCircle2 size={18} />}
              title="No Out-of-Range Values"
              text="All detected parameters are within the configured demonstration ranges."
              type="success"
            />
          )}
      </div>

      <div
        style={{
          marginTop: "17px",
          padding: "14px 16px",
          borderRadius: "13px",
          background: "rgba(124,114,255,.07)",
          border:
            "1px solid rgba(124,114,255,.12)",
          display: "flex",
          gap: "10px",
          alignItems: "flex-start",
        }}
      >
        <Info
          size={16}
          color="#8c83ff"
          style={{
            flexShrink: 0,
            marginTop: "2px",
          }}
        />

        <p
          style={{
            margin: 0,
            color: "#8793a8",
            fontSize: "11px",
            lineHeight: 1.6,
          }}
        >
          These are educational observations, not medical
          recommendations. Results outside a laboratory's
          reference range should be discussed with a qualified
          healthcare professional.
        </p>
      </div>
    </section>
  );
}


function InsightBox({
  icon,
  title,
  text,
  type,
}) {
  const styles = {
    success: {
      color: "#55dca8",
      background: "rgba(85,220,168,.06)",
      border: "rgba(85,220,168,.12)",
    },
    warning: {
      color: "#f4c65e",
      background: "rgba(244,198,94,.06)",
      border: "rgba(244,198,94,.12)",
    },
    danger: {
      color: "#f07878",
      background: "rgba(240,120,120,.06)",
      border: "rgba(240,120,120,.12)",
    },
  };

  const style = styles[type];

  return (
    <div
      style={{
        padding: "17px",
        borderRadius: "16px",
        background: style.background,
        border: `1px solid ${style.border}`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          color: style.color,
          marginBottom: "8px",
        }}
      >
        {icon}

        <strong
          style={{
            color: "#ffffff",
            fontSize: "13px",
          }}
        >
          {title}
        </strong>
      </div>

      <p
        style={{
          margin: 0,
          color: "#8894a8",
          fontSize: "12px",
          lineHeight: 1.55,
        }}
      >
        {text}
      </p>
    </div>
  );
}


/* =========================================================
   DEFAULT EXPORT
========================================================= */

export default Dashboard;
