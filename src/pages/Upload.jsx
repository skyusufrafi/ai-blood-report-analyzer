import { uploadReport } from "../services/api";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  X,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

import Navbar from "../components/Navbar";

function Upload() {
  const [file, setFile] = useState(null);
const [isUploading, setIsUploading] = useState(false);
const [uploadError, setUploadError] = useState("");
  const navigate = useNavigate();

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      alert("Please upload a PDF, JPG or PNG file.");
      return;
    }

    // 10 MB limit
    if (selectedFile.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10 MB.");
      return;
    }

    setFile(selectedFile);
  };

  const handleDrop = (event) => {
    event.preventDefault();

    const droppedFile = event.dataTransfer.files[0];

    handleFile(droppedFile);
  };

  const removeFile = () => {
    setFile(null);
  };

  const handleAnalyze = async () => {
  if (!file) return;

  try {
    setIsUploading(true);
    setUploadError("");

    const result = await uploadReport(file);

    console.log("Upload response:", result);

    if (result.success) {
      // Store report ID temporarily
      sessionStorage.setItem(
        "reportId",
        result.report_id
      );

      sessionStorage.setItem(
        "reportFilename",
        result.filename
      );

      navigate("/dashboard");
    }

  } catch (error) {

    console.error("Upload failed:", error);

    const message =
      error.response?.data?.detail ||
      "Unable to upload the report. Please try again.";

    setUploadError(message);

  } finally {
    setIsUploading(false);
  }
};

  return (
    <div className="app-shell">

      <Navbar />

      <main className="upload-page">

        {/* TOP BAR */}

        <div className="page-top">

          <Link to="/" className="back-link">
            <ArrowLeft size={16} />
            Back to Home
          </Link>

          <div className="page-label">
            STEP 1 OF ANALYSIS
          </div>

        </div>


        {/* HEADING */}

        <div className="upload-container">

          <div className="upload-heading">

            <span className="section-label">
              REPORT UPLOAD
            </span>

            <h1>
              Upload your blood report
            </h1>

            <p>
              Upload a clear PDF or image of your laboratory blood
              report. BloodAI will extract the available parameters
              and prepare them for analysis.
            </p>

          </div>


          {/* UPLOAD AREA */}

          {!file ? (

            <div
              className="drop-zone"
              onDragOver={(event) => {
                event.preventDefault();
              }}
              onDrop={handleDrop}
            >

              <div className="upload-icon">
                <UploadCloud size={32} />
              </div>

              <h3>
                Drag & drop your report here
              </h3>

              <p>
                or choose a file from your computer
              </p>


              <label className="file-button">

                Choose Report

                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  hidden
                  onChange={(event) => {
                    handleFile(event.target.files[0]);
                  }}
                />

              </label>


              <div className="supported-files">

                <span>
                  <FileText size={15} />
                  PDF
                </span>

                <span>
                  <ImageIcon size={15} />
                  JPG / PNG
                </span>

                <span>
                  Max 10 MB
                </span>

              </div>

            </div>

          ) : (

            /* SELECTED FILE */

            <div className="selected-file-card">

              <div className="selected-file-icon">

                {file.type === "application/pdf" ? (
                  <FileText size={28} />
                ) : (
                  <ImageIcon size={28} />
                )}

              </div>


              <div className="selected-file-info">

                <strong>
                  {file.name}
                </strong>

                <span>
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </span>

              </div>


              <button
                className="remove-file"
                onClick={removeFile}
                type="button"
                title="Remove file"
              >
                <X size={18} />
              </button>

            </div>

          )}


          {/* ACTIONS */}

{uploadError && (
  <div
    style={{
      marginTop: "18px",
      padding: "12px 14px",
      borderRadius: "9px",
      background: "#fff0ef",
      color: "#c54c47",
      fontSize: "12px",
      fontWeight: "600",
    }}
  >
    {uploadError}
  </div>
)}
          <div className="upload-actions">

            <div className="privacy-note">

              <ShieldCheck size={18} />

              <span>
                Use sample or authorized reports for demonstrations.
              </span>

            </div>


            <button
  className="analyze-button"
  onClick={handleAnalyze}
  disabled={!file || isUploading}
>
  {isUploading ? (
    <>
      Uploading...
    </>
  ) : (
    <>
      Analyze Report
      <ArrowRight size={18} />
    </>
  )}
</button>

          </div>


          {/* DISCLAIMER */}

          <div className="medical-disclaimer">

            <strong>
              Important:
            </strong>

            <span>
              BloodAI is an educational and informational prototype.
              It does not provide a medical diagnosis or replace
              advice from a qualified healthcare professional.
            </span>

          </div>

        </div>

      </main>

    </div>
  );
}

export default Upload;