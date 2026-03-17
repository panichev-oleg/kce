import React from "react";

type Props = {
  date: Date;
  onChange: (value: Date) => void;
};

export const DatePicker: React.FC<Props> = ({ date, onChange }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [calendarMonth, setCalendarMonth] = React.useState(() => {
    const d = new Date(date);
    d.setDate(1);
    return d;
  });

  React.useEffect(() => {
    const d = new Date(date);
    d.setDate(1);
    setCalendarMonth(d);
  }, [date]);

  const viewDate = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");

  const calendarMonthLabel = calendarMonth.toLocaleDateString("ru-RU", {
    month: "long",
    year: "numeric",
  });

  const calendarStartWeekday = (() => {
    const day = calendarMonth.getDay(); // 0 (Sun) - 6 (Sat)
    return (day + 6) % 7; // make Monday = 0
  })();

  const calendarDaysInMonth = new Date(
    calendarMonth.getFullYear(),
    calendarMonth.getMonth() + 1,
    0,
  ).getDate();

  return (
    <span className="App-date-wrapper">
      <u>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setIsOpen((open) => !open);
          }}
        >
          Дата: {viewDate} (
          {date.toLocaleDateString("RU-ru", { weekday: "short" })})
        </a>
      </u>
      {isOpen && (
        <div className="App-calendar">
          <div className="App-calendar-header">
            <button
              type="button"
              onClick={() =>
                setCalendarMonth((prev) => {
                  const d = new Date(prev);
                  d.setMonth(prev.getMonth() - 1);
                  return d;
                })
              }
            >
              ‹
            </button>
            <span>{calendarMonthLabel}</span>
            <button
              type="button"
              onClick={() =>
                setCalendarMonth((prev) => {
                  const d = new Date(prev);
                  d.setMonth(prev.getMonth() + 1);
                  return d;
                })
              }
            >
              ›
            </button>
            <button
              type="button"
              className="App-calendar-today"
              onClick={() => {
                const today = new Date();
                onChange(today);
                const firstOfMonth = new Date(today);
                firstOfMonth.setDate(1);
                setCalendarMonth(firstOfMonth);
                setIsOpen(false);
              }}
            >
              Сегодня
            </button>
          </div>
          <div className="App-calendar-grid">
            {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((w) => (
              <div key={w} className="App-calendar-weekday">
                {w}
              </div>
            ))}
            {Array.from({ length: calendarStartWeekday }).map((_, idx) => (
              <div
                key={`empty-${idx}`}
                className="App-calendar-cell App-calendar-cell-empty"
              />
            ))}
            {Array.from({ length: calendarDaysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const cellDate = new Date(
                calendarMonth.getFullYear(),
                calendarMonth.getMonth(),
                day,
              );
              const isSelected =
                cellDate.toDateString() === date.toDateString();
              const today = new Date();
              const isToday = cellDate.toDateString() === today.toDateString();

              return (
                <button
                  key={day}
                  type="button"
                  className={[
                    "App-calendar-day",
                    isSelected ? "App-calendar-day-selected" : "",
                    isToday ? "App-calendar-day-today" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => {
                    onChange(cellDate);
                    setIsOpen(false);
                  }}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </span>
  );
};

