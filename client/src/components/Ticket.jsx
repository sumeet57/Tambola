import React from "react";

const Ticket = ({ ticket }) => {
  if (
    !Array.isArray(ticket) ||
    ticket.length !== 3 ||
    !ticket.every((row) => Array.isArray(row) && row.length === 9)
  ) {
    return <p className="text-red-500 text-center">Invalid ticket data</p>;
  }

  return (
    <div className="max-w-xl mx-auto p-4 bg-white shadow-lg rounded-2xl border border-gray-300">
      <h2 className="text-center text-xl font-bold mb-3">Tambola Ticket</h2>
      <div className="grid grid-cols-9 gap-1 p-2 bg-gray-100 rounded-lg">
        {ticket.map((row, rowIndex) => (
          <React.Fragment key={rowIndex}>
            {row.map((num, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`h-12 w-12 flex items-center justify-center text-lg font-semibold rounded-md border ${
                  num !== null && num !== undefined
                    ? "bg-blue-500 text-white"
                    : "bg-gray-300"
                }`}
              >
                {num !== null && num !== undefined ? num : ""}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default Ticket;
