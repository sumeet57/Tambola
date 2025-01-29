import React, { useEffect, useState } from "react";

const AssignNumbers = (props) => {
  const distributeNumbersEqually = (data) => {
    let receivedNumbers = data;
    const ticket_count = Math.floor(receivedNumbers.length / 15); // Total tickets
    if (ticket_count < 1) return []; // Ensure at least one ticket

    const ranges = Array.from({ length: 9 }, () => []); // Create 9 empty range buckets

    // Step 1: Categorize numbers into respective ranges
    receivedNumbers.forEach((num) => {
      let rangeIndex = Math.floor((num - 1) / 10); // Determine range
      ranges[rangeIndex].push(num);
    });

    // Step 2: Distribute numbers equally among tickets
    const tickets = Array.from({ length: ticket_count }, () => []);

    ranges.forEach((rangeNumbers) => {
      let index = 0;
      rangeNumbers.forEach((num) => {
        if (tickets[index % ticket_count].length < 15) {
          // Ensure each ticket gets at most 15 numbers
          tickets[index % ticket_count].push(num);
        }
        index++;
      });
    });

    // Step 3: Balance tickets so each has exactly 15 numbers
    let allNumbers = tickets.flat(); // Collect all assigned numbers
    let remainingNumbers = receivedNumbers.filter(
      (num) => !allNumbers.includes(num)
    ); // Find unassigned numbers

    tickets.forEach((ticket) => {
      while (ticket.length > 15) {
        remainingNumbers.push(ticket.pop()); // Remove extra numbers & store them
      }
    });

    tickets.forEach((ticket) => {
      while (ticket.length < 15 && remainingNumbers.length > 0) {
        ticket.push(remainingNumbers.pop()); // Fill missing numbers
      }
    });

    return tickets;
  };

  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    const generatedTickets = distributeNumbersEqually(props.data);
    setTickets(generatedTickets);
  }, [props.data]);

  return (
    <>
      <div className="flex flex-col gap-4">
        {tickets.map((ticket, index) => (
          <div key={index} className="flex flex-col gap-2">
            <h3 className="text-lg font-bold">Ticket {index + 1}</h3>
            <div className="flex flex-wrap gap-2">
              {ticket.map((num) => (
                <div
                  key={num}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-500 text-white"
                >
                  {num}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default AssignNumbers;
