type LogEntry = {
  time: string;
  label: string;
  data?: any;
};

export function authLog(label: string, data?: any) {
  const entry: LogEntry = {
    time: new Date().toISOString(),
    label,
    data,
  };

  const logs = JSON.parse(
    localStorage.getItem("AUTH_DEBUG_LOGS") || "[]"
  );

  logs.push(entry);
  localStorage.setItem("AUTH_DEBUG_LOGS", JSON.stringify(logs));

  console.log(`🧠 AUTH LOG → ${label}`, data);
}

export function readAuthLogs() {
  return JSON.parse(
    localStorage.getItem("AUTH_DEBUG_LOGS") || "[]"
  );
}

export function clearAuthLogs() {
  localStorage.removeItem("AUTH_DEBUG_LOGS");
}
