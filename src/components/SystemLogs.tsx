import React from "react";

interface LogEvent {
  [logId: string]: string[];
}

export function SystemLogs() {
  const [logs, setLogs] = React.useState<LogEvent[]>([]);

  const fetchLogs = React.useCallback(async () => {
    try {
      const response = await fetch(
        "https://nuclear.dacoder.io/reactors/logs?apiKey=1bb4dff552124f3c"
      );
      if (!response.ok) {
        throw new Error("Failed to fetch logs");
      }
      const data = await response.json();
      setLogs(data);
    } catch (error) {
      console.error("Error fetching logs:", error);
    }
  }, []);

  React.useEffect(() => {
    fetchLogs();
    const intervalId = setInterval(fetchLogs, 1000);
    return () => clearInterval(intervalId);
  }, [fetchLogs]);

  const sortedLogs = React.useMemo(() => {
    const allEvents: { date: Date; text: string }[] = [];

    logs.forEach((log) => {
      Object.values(log).forEach((events) => {
        events.forEach((event) => {
          const dateMatch = event.match(
            /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/
          );
          if (dateMatch) {
            allEvents.push({
              date: new Date(dateMatch[1]),
              text: event,
            });
          }
        });
      });
    });

    return allEvents.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [logs]);

  const containerStyle: React.CSSProperties = {
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "1rem",
    backgroundColor: "#ffffff",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    maxHeight: "500px",
    overflowY: "auto",
  };

  const logItemStyle: React.CSSProperties = {
    fontSize: "0.875rem",
    color: "#374151",
    borderBottom: "1px solid #f3f4f6",
    paddingBottom: "0.5rem",
    marginBottom: "0.5rem",
  };

  if (sortedLogs.length === 0) {
    return (
      <div style={containerStyle}>
        <p style={{ color: "#6b7280", fontSize: "0.7rem" }}>
          No logs available
        </p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {sortedLogs.map((log, index) => (
        <div
          key={index}
          style={{
            ...logItemStyle,
            borderBottom:
              index === sortedLogs.length - 1
                ? "none"
                : logItemStyle.borderBottom,
            marginBottom:
              index === sortedLogs.length - 1 ? 0 : logItemStyle.marginBottom,
          }}
        >
          {log.text}
        </div>
      ))}
    </div>
  );
}
