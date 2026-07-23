interface TelemetryPayload {
  studentEmail?: string;
  studentName?: string;
  eventType: 'login' | 'page_click' | 'button_click' | 'practice_attempt' | 'dropout';
  eventTarget: string;
  metadata?: Record<string, any>;
}

export function logTelemetryEvent(payload: TelemetryPayload) {
  let studentEmail = payload.studentEmail;
  let studentName = payload.studentName;

  if (!studentEmail || !studentName) {
    const saved = localStorage.getItem("finance_prep_student_info");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!studentEmail) studentEmail = parsed.email;
        if (!studentName) studentName = parsed.name;
      } catch (e) {
        // ignore
      }
    }
  }

  const finalPayload = {
    studentEmail: studentEmail || "anonymous@pfainstitute.com",
    studentName: studentName || "Anonymous Learner",
    eventType: payload.eventType,
    eventTarget: payload.eventTarget,
    metadata: {
      ...payload.metadata,
      url: window.location.href,
      screenSize: `${window.innerWidth}x${window.innerHeight}`,
    }
  };

  fetch("/api/submit-telemetry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(finalPayload)
  }).catch(err => {
    console.warn("Failed to record telemetry event:", err);
  });
}
