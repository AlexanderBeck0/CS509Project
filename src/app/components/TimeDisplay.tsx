
interface TimeDisplayProps {
  startDate?: string | Date;
  endDate?: string | Date;
}

export default function TimeDisplay(props: TimeDisplayProps) {
  return (
    <div className="flex row basis-2/3"> {/* dates */}
      <p style={{ fontSize: "30px" }}>🕒</p>
      <div className='dateContainer'>
        {props.startDate && (
          <div className='dateLabel' style={{ width: "100%" }}>
            <p>Start Date: {typeof props.startDate === "string" ? new Date(props.startDate).toLocaleString() : props.startDate.toLocaleString()}</p>
          </div>
        )}
        {props.endDate && (
          <div className='dateLabel' style={{ width: "100%" }}>
            <p>End Date: {(typeof props.endDate === "string" ? new Date(props.endDate).toLocaleString() : props.endDate?.toLocaleString()) || "No end date"}</p>
          </div>
        )}
      </div>
    </div>
  );
}