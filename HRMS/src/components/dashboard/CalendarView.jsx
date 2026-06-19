import { useState } from "react";
import dayjs from "dayjs";
import { ChevronLeft, ChevronRight } from "lucide-react";

const CalendarView = ({ holidays = [], leaves = [] }) => {
  const [currentDate, setCurrentDate] = useState(dayjs());

  const daysInMonth = currentDate.daysInMonth();
  const firstDayOfMonth = currentDate.startOf("month").day();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const paddingDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const prevMonth = () => setCurrentDate(currentDate.subtract(1, "month"));
  const nextMonth = () => setCurrentDate(currentDate.add(1, "month"));

  const getDayStatus = (day) => {
    const dateStr = currentDate.date(day).format("YYYY-MM-DD");
    const isHoliday = holidays.some(
      (h) => dayjs(h.date || h.holidayDate).format("YYYY-MM-DD") === dateStr
    );
    const isLeave = leaves.some(
      (l) => dayjs(l.date || l.leaveDate).format("YYYY-MM-DD") === dateStr
    );
    const isToday = dayjs().format("YYYY-MM-DD") === dateStr;

    return { isHoliday, isLeave, isToday };
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-950">
          {currentDate.format("MMMM YYYY")}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ChevronRight size={20} className="text-gray-600" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-xs font-semibold text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {paddingDays.map((_, idx) => (
          <div key={`padding-${idx}`} className="p-2"></div>
        ))}
        {days.map((day) => {
          const { isHoliday, isLeave, isToday } = getDayStatus(day);
          
          let bgColor = "hover:bg-gray-50";
          let textColor = "text-gray-700";
          let indicator = null;

          if (isToday) {
            bgColor = "bg-blue-600 text-white hover:bg-blue-700";
            textColor = "text-white";
          } else if (isHoliday) {
            bgColor = "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200";
            textColor = "text-green-700";
          } else if (isLeave) {
            bgColor = "bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200";
            textColor = "text-orange-700";
          }

          return (
            <div
              key={day}
              className={`p-2 rounded-lg cursor-pointer transition-colors flex flex-col items-center justify-center h-12 w-12 mx-auto ${bgColor}`}
            >
              <span className={`text-sm font-medium ${textColor}`}>{day}</span>
              {(isHoliday || isLeave) && !isToday && (
                <div
                  className={`h-1.5 w-1.5 rounded-full mt-1 ${
                    isHoliday ? "bg-green-500" : "bg-orange-500"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-blue-600"></div>
          <span>Today</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span>Holiday</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-orange-500"></div>
          <span>Leave</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
