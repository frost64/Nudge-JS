import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";

import Layout from "../components/Layout";
import Card from "../components/Card";

import dashboardLightBg from "../assets/backgrounds/dashboard-light.png";
import dashboardDarkBg from "../assets/backgrounds/dashboard-dark.png";

import toast from "react-hot-toast";
import api from "../services/api";
import { 
    FaLightbulb,
    FaHeading,
    FaCommentDots 
} from "react-icons/fa";


function Suggestions() {
  const { user } = useContext(AuthContext);

  const darkMode = user?.theme === "dark";
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const backgroundImage = darkMode
    ? dashboardDarkBg
    : dashboardLightBg;

    const handleSubmit = async () => {
    if (!title.trim() || !message.trim()) {
        return toast.error("Please fill all fields.");
    }

    try {
        setSubmitting(true);

        await api.post("/suggestions", {
        title,
        message,
        });

        toast.success("Suggestion submitted successfully!");

        setTitle("");
        setMessage("");
    } catch (error) {
        toast.error(
        error.response?.data?.message ||
        "Failed to submit suggestion."
        );
    } finally {
        setSubmitting(false);
    }
    };

  return (
    <Layout
      backgroundImage={backgroundImage}
      cardVariant="glass"
    >
      <Card
        variant="glass"
        style={{
            maxWidth: "500px",
            margin: "0 auto",
            padding: "30px",
        }}
        >
        <h1><FaLightbulb/> Suggestions</h1>

        <p
            style={{
            opacity: .8,
            marginBottom: "25px",
            }}
        >
            Help us improve Nudge by sharing your ideas,
            feature requests or feedback.
        </p>

        <div className="input-icon-wrapper">
        <FaHeading className="input-icon" />

        <input
            className="input-glow"
            type="text"
            placeholder="Suggestion title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
        />
        </div>

        <div
            className="input-icon-wrapper"
            style={{ alignItems: "flex-start", marginTop: "15px" }}
        >
            <FaCommentDots
                className="input-icon textarea-icon"
            />

            <textarea
                className="input-glow"
                rows={8}
                placeholder="Describe your suggestion..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={{
                resize: "vertical",
                width: "100%",
                paddingLeft: "42px",
                }}
            />
        </div>

        <button
            className="glow-top"
            onClick={handleSubmit}
            disabled={submitting}
            style={{
                width: "100%",
                marginTop: "20px",
            }}
            >
            {submitting ? "Submitting..." : "Submit Suggestion"}
        </button>
        </Card>
    </Layout>
  );
}

export default Suggestions;