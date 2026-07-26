import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";
import Layout from "../components/Layout";
import Card from "../components/Card";

import profileLightBg from "../assets/backgrounds/dashboard-light.png";
import profileDarkBg from "../assets/backgrounds/dashboard-dark.png";

import {
  FaEnvelope,
  FaGithub,
  FaLinkedin,
  FaClock,
  FaHeart,
  FaCopy,
  FaExternalLinkAlt,
} from "react-icons/fa";

function Contact() {
  const { user } = useContext(AuthContext);

  const darkMode = user?.theme === "dark";

  const background = darkMode
    ? profileDarkBg
    : profileLightBg;

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(
        "asjidahmed6@gmail.com"
      );

      toast.success("Email copied to clipboard.");
    } catch {
      toast.error("Failed to copy email.");
    }
  };

  return (
    <Layout
      backgroundImage={background}
      cardVariant="glass"
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          paddingBottom: "40px",
        }}
      >
        <Card
          variant="glass"
          style={{
            padding: "40px",
          }}
        >

        <h1
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "10px",
          }}
        >
          <FaEnvelope />
          Contact
        </h1>

        <p
            style={{
                opacity: .8,
                marginBottom: "40px",
                lineHeight: 1.8,
            }}
            >
            Have a question, found a bug, or simply want to
            connect? I'd love to hear from you.
        </p>

        <Card
            variant="glass"
            style={{
                padding: "25px",
                marginBottom: "25px",
            }}
            >
            <h2
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <FaEnvelope />
              Email
            </h2>

            <p
                style={{
                opacity: .8,
                marginTop: "12px",
                marginBottom: "20px",
                }}
            >
                asjidahmed6@gmail.com
            </p>

            <button
                className="glow-top"
                onClick={copyEmail}
            >
                <>
                  <FaCopy size={14} style={{ marginRight: "6px" }} />
                  Copy Email
                </>
            </button>
            </Card>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
                    gap: "20px",
                    marginBottom: "25px",
                }}
                ><Card
                variant="glass"
                style={{
                    padding: "25px",
                }}
                >
                <h2
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <FaGithub />
                  GitHub
                </h2>

                <p
                    style={{
                    opacity: .8,
                    margin: "15px 0 20px",
                    }}
                >
                    Explore the source code and projects.
                </p>

                <button
                    className="glow-top"
                    onClick={() =>
                    window.open(
                        "https://github.com/frost64",
                        "_blank"
                    )
                    }
                >
                    <>
                      <FaExternalLinkAlt
                        size={13}
                        style={{ marginRight: "6px" }}
                      />
                      Visit GitHub
                    </>
                </button>
                </Card>
                <Card
                    variant="glass"
                    style={{
                        padding: "25px",
                    }}
                    >
                    <h2
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <FaLinkedin />
                      LinkedIn
                    </h2>

                    <p
                        style={{
                        opacity: .8,
                        margin: "15px 0 20px",
                        }}
                    >
                        Let's connect professionally.
                    </p>

                    <button
                        className="glow-top"
                        onClick={() =>
                        window.open(
                            "https://www.linkedin.com/in/asjid-ahmed-a1031b2a4/",
                            "_blank"
                        )
                        }
                    >
                        <>
                          <FaExternalLinkAlt
                            size={13}
                            style={{ marginRight: "6px" }}
                          />
                          Connect
                        </>
                    </button>
                    </Card>
            </div>
        </Card>
        <Card
  variant="glass"
  style={{
    padding: "25px",
    marginBottom: "25px",
  }}
>
  <h2
    style={{
      display: "flex",
      alignItems: "center",
      gap: "10px",
    }}
  >
    <FaClock />
    Response Time
  </h2>

  <p
    style={{
      marginTop: "15px",
      lineHeight: 1.8,
      opacity: 0.8,
    }}
  >
    I usually respond to emails and messages within
    <strong> 24–48 hours</strong>. If your inquiry is
    related to a bug report or feature request for
    Nudge, I'll do my best to get back to you as soon
    as possible.
  </p>
</Card>

<div
  style={{
    textAlign: "center",
    marginTop: "40px",
  }}
>
  <h2
  style={{
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "10px",
    marginBottom: "12px",
  }}
>
  <FaHeart
    style={{
      color: "#ff0000",
    }}
  />
  Thank You
</h2>

  <p
    style={{
      maxWidth: "620px",
      margin: "0 auto",
      lineHeight: 1.8,
      opacity: 0.8,
    }}
  >
    Thank you for using <strong>Nudge</strong>. Your
    feedback, ideas, and support help make the app
    better with every update. Whether you're reporting
    an issue, suggesting a feature, or simply saying
    hello, I'd love to hear from you.
  </p>
</div>
      </div>
    </Layout>
  );
}

export default Contact;