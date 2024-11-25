
interface TimeDisplayProps {
  startDate: string | Date;
  endDate: string | Date | undefined;
}

export default function TimeDisplay(props:TimeDisplayProps) {
    return (
      <div className="flex row basis-2/3"> {/* dates */}
        <p style={{ fontSize: "30px" }}>🕒</p>
        <div className='dateContainer'>
          <div className='dateLabel' style={{ width: "100%" }}>
            {typeof props.startDate === "string" ? new Date(props.startDate).toLocaleString() : props.startDate.toLocaleString()}
          </div>
          <div className='dateLabel' style={{ width: "100%" }}>
            {(typeof props.endDate === "string" ? new Date(props.endDate).toLocaleString() : props.endDate?.toLocaleString()) || "No end date"}
          </div>
        </div>
      </div>
    );
}