import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
  FaBirthdayCake,
  FaBolt,
  FaCloudSun,
  FaClock,
  FaExclamationTriangle,
  FaGift,
  FaLink,
  FaMoon,
  FaStar,
  FaStickyNote,
  FaSun,
  FaTasks,
} from "react-icons/fa";

import dashboardDarkBg from "../assets/backgrounds/dashboard-dark.png";
import dashboardLightBg from "../assets/backgrounds/dashboard-light.png";

import Card from "../components/Card";
import Layout from "../components/Layout";
import LoadingSpinner from "../components/LoadingSpinner";
import WeatherWidget from "../components/WeatherWidget";

import { AuthContext } from "../context/AuthContext";
import useBreakpoint from "../hooks/useBreakpoint";
import api from "../services/api";

const QUICK_ACTIONS = [
  {
    label: "New Reminder",
    path: "/reminders?create=true",
    icon: FaClock,
  },
  {
    label: "New Note",
    path: "/notes?create=true",
    icon: FaStickyNote,
  },
  {
    label: "Add Birthday",
    path: "/birthdays?create=true",
    icon: FaBirthdayCake,
  },
  {
    label: "Save Link",
    path: "/links?create=true",
    icon: FaLink,
  },
];

const STAT_CONFIG = [
  {
    title: "Reminders",
    path: "/reminders",
    valueKey: "totalReminders",
    icon: FaClock,
    color: "#f59e0b",
  },
  {
    title: "Notes",
    path: "/notes",
    valueKey: "totalNotes",
    icon: FaStickyNote,
    color: "#10b981",
  },
  {
    title: "Birthdays",
    path: "/birthdays",
    valueKey: "totalBirthdays",
    icon: FaBirthdayCake,
    color: "#ec4899",
  },
  {
    title: "Links",
    path: "/links",
    valueKey: "totalLinks",
    icon: FaLink,
    color: "#8b5cf6",
  },
];

function getGreetingContent() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return {
      title: "Good Morning",
      message:
        "Let's get your day organized. Your nudges are waiting!",
      icon: FaSun,
      iconColor: "#facc15",
    };
  }

  if (hour < 17) {
    return {
      title: "Good Afternoon",
      message:
        "Hope your day is going well. Stay on top of today's nudges.",
      icon: FaCloudSun,
      iconColor: "#f59e0b",
    };
  }

  return {
    title: "Good Evening",
    message:
      "Time to wrap things up. Here's what's still left for today.",
    icon: FaMoon,
    iconColor: "#a78bfa",
  };
}

function getFormattedDate() {
  return new Date().toLocaleDateString(
    undefined,
    {
      weekday: "long",
      month: "long",
      day: "numeric",
    }
  );
}

function Dashboard() {
  const navigate = useNavigate();

  const { user } = useContext(AuthContext);
  const { isMobile, isTablet } =
    useBreakpoint();

  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const darkMode =
    user?.theme === "dark";

  const dashboardBackground = darkMode
    ? dashboardDarkBg
    : dashboardLightBg;

  const greeting = useMemo(
    () => getGreetingContent(),
    []
  );

  const formattedDate = useMemo(
    () => getFormattedDate(),
    []
  );

  const navigateTo = useCallback(
    (path) => {
      navigate(path);
    },
    [navigate]
  );

  useEffect(() => {
    const controller =
      new AbortController();

    const fetchDashboard = async () => {
      try {
        const response = await api.get(
          "/dashboard",
          {
            signal: controller.signal,
          }
        );

        setData(response.data);
        setError("");
      } catch (requestError) {
        if (
          requestError.name ===
            "CanceledError" ||
          requestError.code ===
            "ERR_CANCELED"
        ) {
          return;
        }

        console.error(requestError);

        const message =
          requestError.response?.data
            ?.message ||
          "Failed to load dashboard.";

        setError(message);
        toast.error(message);
      }
    };

    fetchDashboard();

    return () => {
      controller.abort();
    };
  }, []);

  const quickAccess = useMemo(
    () => (
      <Card
        className="nudge-sidebar"
        variant="glass"
      >
        <h1 className="nudge-sidebar-title">
          <FaBolt aria-hidden="true" />

          <span>Quick Access</span>
        </h1>

        <nav
          className="nudge-sidebar-actions"
          aria-label="Dashboard quick actions"
        >
          {QUICK_ACTIONS.map(
            ({
              label,
              path,
              icon: Icon,
            }) => (
              <button
                key={path}
                type="button"
                className="glow-top left nudge-sidebar-button"
                onClick={() =>
                  navigateTo(path)
                }
              >
                <Icon
                  aria-hidden="true"
                  className="nudge-sidebar-button-icon"
                />

                <span className="nudge-sidebar-button-text">
                  {label}
                </span>
              </button>
            )
          )}
        </nav>
      </Card>
    ),
    [navigateTo]
  );

  if (error) {
    return (
      <Layout
        backgroundImage={
          dashboardBackground
        }
        cardVariant="glass"
      >
        <Card
          variant="glass"
          style={{
            width: "100%",
            maxWidth: "650px",
            margin: "40px auto",
            textAlign: "center",
          }}
        >
          <h2>
            Unable to load dashboard
          </h2>

          <p
            style={{
              marginBottom: 0,
            }}
          >
            {error}
          </p>
        </Card>
      </Layout>
    );
  }

  if (!data) {
    return (
      <Layout
        backgroundImage={
          dashboardBackground
        }
        cardVariant="glass"
      >
        <LoadingSpinner text="Loading Dashboard..." />
      </Layout>
    );
  }

  const GreetingIcon =
    greeting.icon;

  return (
    <Layout
      sidebar={quickAccess}
      sidebarTitle="Quick Access"
      backgroundImage={dashboardBackground}
      cardVariant="glass"
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",

          width: "100%",
          minWidth: 0,

          gap: isMobile
            ? "22px"
            : "28px",
        }}
      >
        <Card
          variant="glass"
          style={{
            width: "100%",
            margin: 0,

            padding: isMobile
              ? "20px"
              : isTablet
                ? "24px"
                : "28px",
          }}
        >
          <div
            style={{
              display: "flex",

              flexDirection: isMobile
                ? "column"
                : "row",

              justifyContent: isMobile
                ? "flex-start"
                : "space-between",

              alignItems: isMobile
                ? "stretch"
                : "center",

              gap: isMobile
                ? "18px"
                : "30px",

              width: "100%",
              minWidth: 0,
            }}
          >
            <div
              style={{
                flexGrow: isMobile
                  ? 0
                  : 1,

                flexShrink: 1,

                flexBasis: isMobile
                  ? "auto"
                  : "320px",

                width: isMobile
                  ? "100%"
                  : "auto",

                minWidth: 0,
              }}
            >
              <h1
                style={{
                  margin: 0,

                  fontSize: isMobile
                    ? "1.7rem"
                    : isTablet
                      ? "1.85rem"
                      : "2rem",

                  fontWeight: 800,
                  letterSpacing: "-1px",

                  overflowWrap:
                    "anywhere",

                  userSelect: "none",
                }}
              >
                <span aria-hidden="true">
                  👋{" "}
                </span>

                <span
                  style={{
                    background:
                      "linear-gradient(90deg, #8d7cff 0%, #7d8dff 22%, #6da6ff 55%, #7fb9ff 100%)",

                    WebkitBackgroundClip:
                      "text",

                    WebkitTextFillColor:
                      "transparent",

                    backgroundClip:
                      "text",

                    color: "transparent",
                  }}
                >
                  {greeting.title}
                </span>

                {user?.fullName
                  ? `, ${user.fullName}`
                  : ""}
              </h1>

              <p
                style={{
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",

                  gap: "6px",

                  marginTop: "10px",
                  marginBottom: 0,

                  fontSize: isMobile
                    ? "1rem"
                    : "1.1rem",

                  lineHeight: 1.7,
                  opacity: 0.75,
                }}
              >
                <span>
                  {greeting.message}
                </span>

                <GreetingIcon
                  aria-hidden="true"
                  style={{
                    flexShrink: 0,
                    color:
                      greeting.iconColor,
                  }}
                />
              </p>
            </div>

            <div
              style={{
                width: isMobile
                  ? "100%"
                  : "auto",

                minWidth: isMobile
                  ? 0
                  : "220px",

                textAlign: isMobile
                  ? "center"
                  : "right",
              }}
            >
              <div
                style={{
                  marginBottom: "12px",

                  fontSize: "1rem",
                  fontWeight: 600,
                  opacity: 0.85,
                }}
              >
                {formattedDate}
              </div>

              <WeatherWidget />
            </div>
          </div>
        </Card>

        <section
          aria-labelledby="dashboard-statistics"
        >
          <h1
            id="dashboard-statistics"
            style={{
              marginBottom: "16px",
            }}
          >
            Statistics
          </h1>

          <div
            style={{
              display: "grid",

              gridTemplateColumns:
                isMobile
                  ? "repeat(4, minmax(0, 1fr))"
                  : isTablet
                    ? "repeat(2, minmax(0, 1fr))"
                    : "repeat(4, minmax(0, 1fr))",

              gap: isMobile
                ? "8px"
                : "24px",

              width: "100%",
            }}
          >
            {STAT_CONFIG.map(
              ({
                title,
                path,
                valueKey,
                icon: Icon,
                color,
              }) => (
                <Card
                  key={path}
                  variant="glass"
                  style={{
                    height: "100%",
                    minWidth: 0,
                    margin: 0,

                    padding: isMobile
                      ? "10px 4px"
                      : "14px",

                    borderRadius:
                      isMobile
                        ? "14px"
                        : "20px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      navigateTo(path)
                    }
                    aria-label={`Open ${title}`}
                    style={{
                      display: "flex",

                      flexDirection:
                        isMobile
                          ? "column"
                          : "row",

                      alignItems: "center",

                      justifyContent:
                        isMobile
                          ? "center"
                          : "flex-start",

                      width: "100%",
                      minWidth: 0,
                      height: "100%",

                      gap: isMobile
                        ? "5px"
                        : "14px",

                      margin: 0,
                      padding: 0,

                      color: "inherit",
                      background:
                        "transparent",

                      border: "none",

                      font: "inherit",

                      textAlign: isMobile
                        ? "center"
                        : "left",

                      cursor: "pointer",
                    }}
                  >
                    <span
                      style={{
                        display: "flex",
                        alignItems:
                          "center",

                        justifyContent:
                          "center",

                        width: isMobile
                          ? "38px"
                          : "54px",

                        height: isMobile
                          ? "38px"
                          : "54px",

                        flexShrink: 0,

                        borderRadius:
                          "50%",

                        color,

                        background:
                          `${color}22`,

                        boxShadow:
                          `0 0 14px ${color}33`,
                      }}
                    >
                      <Icon
                        aria-hidden="true"
                        size={
                          isMobile
                            ? 17
                            : 22
                        }
                      />
                    </span>

                    <span
                      style={{
                        display: "flex",
                        flexDirection:
                          "column",

                        alignItems:
                          isMobile
                            ? "center"
                            : "flex-start",

                        justifyContent:
                          "center",

                        minWidth: 0,

                        gap: isMobile
                          ? "4px"
                          : "6px",
                      }}
                    >
                      <span
                        style={{
                          maxWidth:
                            "100%",

                          fontSize:
                            isMobile
                              ? ".68rem"
                              : ".95rem",

                          fontWeight: 700,
                          lineHeight: 1.15,

                          overflow:
                            "hidden",

                          textOverflow:
                            "ellipsis",

                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        {title}
                      </span>

                      <span
                        style={{
                          fontSize:
                            isMobile
                              ? "1rem"
                              : "1.7rem",

                          lineHeight: 1,
                          fontWeight: 800,
                          userSelect:
                            "none",
                        }}
                      >
                        {data.stats?.[
                          valueKey
                        ] ?? 0}
                      </span>
                    </span>
                  </button>
                </Card>
              )
            )}
          </div>
        </section>

        <div
          className="dashboard-container"
          style={{
            display: "grid",

            gridTemplateColumns:
              isMobile
                ? "minmax(0, 1fr)"
                : "repeat(2, minmax(0, 1fr))",

            gap: isMobile
              ? "16px"
              : "24px",

            width: "100%",
            margin: 0,
          }}
        >
          <DashboardSection
            title="Favorite Links"
            icon={FaStar}
            items={
              data.favoriteLinks
            }
            emptyMessage="No favorite links"
            getItemLabel={(item) =>
              item.title
            }
            onItemClick={(item) =>
              navigateTo(
                `/links?linkId=${item._id}`
              )
            }
          />

          <DashboardSection
            title="Upcoming Birthdays"
            icon={FaBirthdayCake}
            items={data.upcomingBirthdays?.slice(
              0,
              5
            )}
            emptyMessage="No upcoming birthdays"
            getItemLabel={(
              birthday
            ) => (
              <>
                {birthday.name}{" "}

                {birthday.daysRemaining ===
                0 ? (
                  <span>
                    <FaGift
                      aria-hidden="true"
                      size={13}
                      style={{
                        marginInline:
                          "4px",
                      }}
                    />

                    Today!
                  </span>
                ) : (
                  `(${birthday.daysRemaining} day${
                    birthday.daysRemaining !==
                    1
                      ? "s"
                      : ""
                  } left)`
                )}
              </>
            )}
            onItemClick={(
              birthday
            ) =>
              navigateTo(
                `/birthdays?birthdayId=${birthday._id}`
              )
            }
          />

          <DashboardSection
            title="Overdue Reminders"
            icon={
              FaExclamationTriangle
            }
            iconColor="#ff6b6b"
            items={
              data.overdueReminders
            }
            emptyMessage={
              <>
                No overdue reminders{" "}

                <FaGift
                  aria-hidden="true"
                  style={{
                    color: "#ffd43b",
                  }}
                />
              </>
            }
            getItemLabel={(item) =>
              item.title
            }
            itemStyle={{
              color: "#ff6b6b",
              fontWeight: 700,
            }}
            onItemClick={(item) =>
              navigateTo(
                `/reminders?reminderId=${item._id}`
              )
            }
          />

          <DashboardSection
            title="Pending Reminders"
            icon={FaTasks}
            items={
              data.pendingReminders
            }
            emptyMessage="No pending reminders"
            getItemLabel={(item) =>
              item.title
            }
            onItemClick={(item) =>
              navigateTo(
                `/reminders?reminderId=${item._id}`
              )
            }
          />
        </div>
      </div>
    </Layout>
  );
}

function DashboardSection({
  title,
  icon: Icon,
  iconColor,
  items = [],
  emptyMessage,
  getItemLabel,
  onItemClick,
  itemStyle = {},
}) {
  const normalizedItems =
    Array.isArray(items)
      ? items
      : [];

  return (
    <Card
      variant="glass"
      style={{
        height: "100%",
        margin: 0,
      }}
    >
      <h2
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",

          gap: "8px",
          marginTop: 0,
        }}
      >
        <Icon
          aria-hidden="true"
          style={{
            color: iconColor,
          }}
        />

        {title}
      </h2>

      {normalizedItems.length ===
      0 ? (
        <p
          style={{
            marginBottom: 0,
            opacity: 0.75,
          }}
        >
          {emptyMessage}
        </p>
      ) : (
        normalizedItems.map(
          (item) => (
            <button
              key={item._id}
              type="button"
              className="search-result-item"
              onClick={() =>
                onItemClick(item)
              }
              style={{
                display: "block",

                width: "100%",
                margin: "12px 0",
                padding: "14px",

                color: "inherit",
                font: "inherit",
                textAlign: "left",

                background:
                  "transparent",

                cursor: "pointer",

                ...itemStyle,
              }}
            >
              {getItemLabel(item)}
            </button>
          )
        )
      )}
    </Card>
  );
}

export default Dashboard;