
import { useState } from "react";
import { Link } from "react-router-dom";
import LocationPicker from "../assets/components/LocationPicker";
import {
  sendComplaint,
  uploadComplaintImages,
} from "../services/api";

function SubmitComplaint() {
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [imageName, setImageName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (isSubmitting) return;

    const form = e.currentTarget;
    const formData = new FormData(form);
    const description = formData.get("description")?.trim() || "";

    if (!description) {
      setMessageType("error");
      setMessage("Please describe the civic issue.");
      return;
    }

    if (description.length < 10) {
      setMessageType("error");
      setMessage(
        "Please describe the problem in at least 10 characters."
      );
      return;
    }

    if (!selectedLocation) {
      setMessageType("error");
      setMessage("Please select the complaint location on the map.");
      return;
    }

    const complaintData = {
      description,
      address: selectedLocation.address || "",
      location: {
        addressDetails: selectedLocation.address || "",
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
      },
    };

    setIsSubmitting(true);
    setMessage("");
    setMessageType("");

    try {
      const uploadedNames = selectedFile
        ? await uploadComplaintImages([selectedFile])
        : [];

      const payload = {
        ...complaintData,
        ...(uploadedNames.length
          ? { imageNames: uploadedNames }
          : {}),
      };

      const result = await sendComplaint(payload);

      setMessageType("success");
      setMessage(
        result.message || "Complaint submitted successfully."
      );

      form.reset();
      setImageName("");
      setSelectedFile(null);
      setSelectedLocation(null);
    } catch (error) {
      console.error("Complaint processing error:", error);
      setMessageType("error");
      setMessage(
        error.message ||
          "Unable to submit your complaint. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleImageChange(e) {
    const file = e.target.files?.[0];

    if (!file) {
      setImageName("");
      setSelectedFile(null);
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setImageName("");
      setSelectedFile(null);
      e.target.value = "";
      setMessageType("error");
      setMessage("Please select a JPG, PNG, or WEBP image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageName("");
      setSelectedFile(null);
      e.target.value = "";
      setMessageType("error");
      setMessage("Please select an image smaller than 5 MB.");
      return;
    }

    setImageName(file.name);
    setSelectedFile(file);
    setMessage("");
    setMessageType("");
  }

  return (
    <div className="complaint-page">
      <nav className="dashboard-navbar">
        <Link to="/dashboard" className="dashboard-brand">
          <span className="dashboard-brand-icon">C</span>
          CivicCare
        </Link>

        <div className="dashboard-nav-links">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/my-complaints">My Complaints</Link>
        </div>
      </nav>

      <main className="complaint-main">
        <div className="complaint-heading">
          <span className="dashboard-tag">CITIZEN PORTAL</span>
          <h1>Report a Civic Issue</h1>
          <p>
            Describe the problem, upload a photo, and select
            the location.
          </p>
        </div>

        <div className="complaint-layout">
          <section className="complaint-form-card">
            <div className="complaint-card-heading">
              <h2>Submit Complaint</h2>
              <p>Provide the details of the civic issue below.</p>
            </div>

            <form
              className="complaint-form"
              onSubmit={handleSubmit}
              noValidate
            >
              <div className="complaint-field">
                <label htmlFor="description">
                  Description *
                </label>

                <textarea
                  id="description"
                  name="description"
                  rows="5"
                  minLength="10"
                  maxLength="2000"
                  placeholder="Describe the civic issue clearly..."
                  required
                  disabled={isSubmitting}
                />

                <span className="complaint-hint">
                  Please enter at least 10 characters.
                </span>
              </div>

              <div className="complaint-field">
                <label>Location *</label>

                <LocationPicker
                  value={selectedLocation}
                  onChange={setSelectedLocation}
                />

                <span className="complaint-hint">
                  Select the issue location on the map.
                </span>
              </div>

              <div className="complaint-field">
                <label htmlFor="evidence">
                  Upload Photo
                </label>

                <label
                  className="complaint-upload"
                  htmlFor="evidence"
                >
                  <span className="upload-icon">↑</span>
                  <span>
                    <strong>Choose a photo</strong>
                    <small>
                      JPG, PNG or WEBP · Maximum 5 MB
                    </small>
                  </span>
                </label>

                <input
                  className="complaint-file-input"
                  id="evidence"
                  name="evidence"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  disabled={isSubmitting}
                />

                {imageName && (
                  <p className="selected-image">
                    Selected: {imageName}
                  </p>
                )}
              </div>

              {message && (
                <p
                  className={
                    messageType === "error"
                      ? "complaint-message complaint-message-error"
                      : "complaint-message"
                  }
                  role={messageType === "error" ? "alert" : "status"}
                  aria-live="polite"
                >
                  {message}
                </p>
              )}

              <button
                className="complaint-submit-btn"
                type="submit"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="complaint-spinner" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Complaint <span>→</span>
                  </>
                )}
              </button>
            </form>
          </section>
        </div>
      </main>

      <footer className="dashboard-footer">
        <p>
          © {new Date().getFullYear()} CivicCare. Building
          better communities together.
        </p>
      </footer>
    </div>
  );
}

export default SubmitComplaint;
