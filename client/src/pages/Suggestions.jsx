import {
  useCallback,
  useContext,
  useState,
} from "react";
import toast from "react-hot-toast";

import {
  FaCommentDots,
  FaHeading,
  FaLightbulb,
  FaPaperPlane,
} from "react-icons/fa";

import dashboardDarkBg from "../assets/backgrounds/dashboard-dark.png";
import dashboardLightBg from "../assets/backgrounds/dashboard-light.png";

import Card from "../components/Card";
import Layout from "../components/Layout";
import { AuthContext } from "../context/AuthContext";
import useBreakpoint from "../hooks/useBreakpoint";
import api from "../services/api";

const TITLE_MAX_LENGTH = 120;
const MESSAGE_MAX_LENGTH = 1500;

/**
 * Displays the suggestion form used to submit
 * product feedback and feature requests.
 */
function Suggestions() {
  const { user } = useContext(AuthContext);
  const { isMobile, isTablet } = useBreakpoint();

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const darkMode = user?.theme === "dark";

  const backgroundImage = darkMode
    ? dashboardDarkBg
    : dashboardLightBg;

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      if (submitting) return;

      const normalizedTitle = title.trim();
      const normalizedMessage = message.trim();

      if (!normalizedTitle || !normalizedMessage) {
        toast.error("Please fill all fields.");
        return;
      }

      try {
        setSubmitting(true);

        await api.post("/suggestions", {
          title: normalizedTitle,
          message: normalizedMessage,
        });

        toast.success(
          "Suggestion submitted successfully!"
        );

        setTitle("");
        setMessage("");
      } catch (error) {
        console.error(error);

        toast.error(
          error.response?.data?.message ||
            "Failed to submit suggestion."
        );
      } finally {
        setSubmitting(false);
      }
    },
    [
      message,
      submitting,
      title,
    ]
  );

  return (
    <Layout
      backgroundImage={backgroundImage}
      cardVariant="glass"
    >
      <div
        style={{
          width: "100%",
          maxWidth: "560px",
          minWidth: 0,

          margin: "0 auto",

          paddingBottom: isMobile
            ? "24px"
            : "40px",

          boxSizing: "border-box",
        }}
      >
        <Card
          variant="glass"
          style={{
            width: "100%",
            minWidth: 0,
            margin: 0,

            padding: isMobile
              ? "22px 18px"
              : isTablet
                ? "26px"
                : "30px",
          }}
        >
          <form
            noValidate
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "18px",
            }}
          >
            <header>
              <h1
                style={{
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",

                  gap: "10px",

                  marginTop: 0,
                  marginBottom: "12px",

                  fontSize: isMobile
                    ? "1.8rem"
                    : "2.2rem",
                }}
              >
                <FaLightbulb aria-hidden="true" />
                Suggestions
              </h1>

              <p
                style={{
                  margin: 0,

                  lineHeight: 1.75,
                  opacity: 0.8,
                }}
              >
                Help us improve Nudge by sharing your ideas,
                feature requests, or feedback.
              </p>
            </header>

            <div className="input-icon-wrapper">
              <FaHeading
                className="input-icon"
                aria-hidden="true"
              />

              <input
                id="suggestion-title"
                className="input-glow"
                type="text"
                name="title"
                autoComplete="off"
                maxLength={TITLE_MAX_LENGTH}
                placeholder="Suggestion title"
                aria-label="Suggestion title"
                value={title}
                disabled={submitting}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
              />
            </div>

            <div
              className="input-icon-wrapper"
              style={{
                width: "100%",
              }}
            >
              <FaCommentDots
                className="input-icon textarea-icon"
                aria-hidden="true"
              />

              <textarea
                id="suggestion-message"
                className="input-glow"
                name="message"
                rows={isMobile ? 7 : 8}
                maxLength={MESSAGE_MAX_LENGTH}
                placeholder="Describe your suggestion..."
                aria-label="Suggestion details"
                value={message}
                disabled={submitting}
                onChange={(event) =>
                  setMessage(event.target.value)
                }
                style={{
                  width: "100%",
                  minHeight: isMobile
                    ? "180px"
                    : "220px",

                  paddingLeft: "46px",
                  resize: "vertical",
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                flexDirection: isMobile
                  ? "column"
                  : "row",

                gap: "8px",

                marginTop: "-6px",

                fontSize: ".85rem",
                opacity: 0.65,
              }}
            >
              <span>
                Share one clear idea per submission.
              </span>

              <span>
                {message.length}/{MESSAGE_MAX_LENGTH}
              </span>
            </div>

            <button
              type="submit"
              className="glow-top"
              disabled={submitting}
              aria-busy={submitting}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",

                width: "100%",
                margin: 0,
              }}
            >
              <FaPaperPlane
                aria-hidden="true"
                size={14}
                style={{
                  marginRight: "7px",
                }}
              />

              {submitting
                ? "Submitting..."
                : "Submit Suggestion"}
            </button>
          </form>
        </Card>
      </div>
    </Layout>
  );
}

export default Suggestions;