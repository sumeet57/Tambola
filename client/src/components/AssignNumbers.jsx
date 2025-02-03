import React, { useEffect, useState } from "react";
import {
  distributeNumbersEqually,
  generateTambolaTicket,
} from "../utils/game.js";

const AssignNumbers = (props) => {
  const [tickets, setTickets] = useState([]);
  const [finalTickets, setFinalTickets] = useState({}); // Store final structured tickets

  useEffect(() => {
    if (props.data && Array.isArray(props.data) && props.data.length > 0) {
      console.log("Data: ", props.data); // Debugging step to check the data structure
      const generatedTickets = distributeNumbersEqually(props.data);
      setTickets(generatedTickets);
      console.log("Generated Tickets distributed numbers: ", generatedTickets);
    }
  }, [props.data]);

  useEffect(() => {
    if (tickets.length === 0) return;

    console.log("Tickets: ", tickets); // Debugging step to check the tickets' structure

    let ticketsData = {};
    tickets.forEach((ticket, index) => {
      ticketsData[index + 1] = generateTambolaTicket(ticket);
    });

    setFinalTickets(ticketsData);
  }, [tickets]);

  console.log(finalTickets); // Check if the final tickets are updated properly

  return (
    <>
      <div className="flex flex-col gap-4 p-2">
        {finalTickets &&
          Object.keys(finalTickets).map((ticketIndex) => {
            return (
              <div key={ticketIndex} className="mb-1">
                <h2 className="text-center text-xl font-bold mb-1">
                  Tambola Ticket {ticketIndex}
                </h2>
                <div className="grid grid-cols-9 gap-1 p-2 bg-gray-100 rounded-lg overflow-x-auto">
                  {finalTickets[ticketIndex].map((row, rowIndex) => (
                    <React.Fragment key={rowIndex}>
                      {row.map((num, colIndex) => (
                        <div
                          key={`${rowIndex}-${colIndex}`}
                          className={`h-8 w-8 flex items-center justify-center text-sm font-semibold rounded-md border ${
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
          })}
      </div>
    </>
  );
};

export default AssignNumbers;
