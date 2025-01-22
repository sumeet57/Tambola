import React, { useEffect, useState } from "react";

const AssignNumbers = (props) => {
  const [assignNumbers, setAssignNumbers] = useState([]);

  useEffect(() => {
    setAssignNumbers(props.data);
  }, [props.data]);

  return (
    <>
      <div className="flex justify-start flex-wrap gap-4">
        {assignNumbers?.map((number, index) => (
          <span key={index} className="m-2 border-2 p-2 rounded">
            {number}
          </span>
        ))}
      </div>
    </>
  );
};

export default AssignNumbers;
