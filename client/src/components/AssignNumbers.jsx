import React, { useEffect, useState } from "react";
import {
  distributeNumbersEqually,
  generateTambolaTickets,
} from "../utils/game.js";

import socket from "../utils/websocket";
import { useNavigate } from "react-router-dom";

const AssignNumbers = (props) => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [finalTickets, setFinalTickets] = useState([]); // Store final structured tickets

  useEffect(() => {
    if (props.data && Array.isArray(props.data) && props.data.length > 0) {
      console.log("TicketsNumber from server:", props.data);
      const generatedTickets = distributeNumbersEqually(props.data);
      setTickets(generatedTickets);
      console.log("TicketsNumber after distributing:", generatedTickets);
    }
  }, [props.data]);
  // console.log("TicketsNumber after distributing:", tickets);
  useEffect(() => {
    if (tickets.length === 0) return;

    let ticketsData = {};
    tickets.forEach((ticket, index) => {
      ticketsData[index + 1] = generateTambolaTickets(ticket)[0]; // Ensure it returns a single 3x9 grid
    });

    setFinalTickets(ticketsData);
    console.log("Final Tickets:", ticketsData);
  }, [tickets]);

  // console.log("Final Tickets:", finalTickets);

  // for claims and click on number
  const [selectedNumbers, setSelectedNumbers] = useState([]);
  const handleNumberClick = (e) => {
    const number = parseInt(e.target.innerText);
    if (!selectedNumbers.includes(number)) {
      setSelectedNumbers([...selectedNumbers, number]);
    }
    if (selectedNumbers.includes(number)) {
      const index = selectedNumbers.indexOf(number);
      if (index > -1) {
        selectedNumbers.splice(index, 1);
      }
    }
  };

  const [drawNumber, setDrawNumber] = useState([]);
  useEffect(() => {
    const handleDrawNumber = (number) => {
      setDrawNumber((prevDrawNumber) => [...prevDrawNumber, number]);
    };
    const handleGameOver = () => {
      handleMessageBox("All the tickets claimed");
      setTimeout(() => {
        navigate("gameover");
      }, 2000);
    };

    socket.on("draw_number", handleDrawNumber);
    socket.on("claimed", handleMessageBox);
    socket.on("error", handleMessageBox);
    socket.on("claim_update", setClaimHistory);
    socket.on("room_data_stored", handleGameOver);

    return () => {
      socket.off("draw_number", handleDrawNumber);
      socket.off("claimed", handleMessageBox);
      socket.off("error", handleMessageBox);
      socket.off("claim_update", setClaimHistory);
    };
  }, []);
  // console.log("Draw Numbers:", drawNumber);

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ClaimHistory, setClaimHistory] = useState([]);
  const [disqualify, setDisqualify] = useState([]);
  const [claimMenu, setClaimMenu] = useState(false);
  const claimMenuToggle = (ticketindex) => {
    if (ticketindex) {
      setSelectedTicket(ticketindex);
    }
    setClaimMenu(!claimMenu);
  };
  const [messageBox, setMessageBox] = useState("");
  const handleMessageBox = (pattern) => {
    console.log("received message:", pattern);
    if (pattern === 1) {
      setMessageBox("First Line Claimed");
    } else if (pattern === 2) {
      setMessageBox("Second Line Claimed");
    } else if (pattern === 3) {
      setMessageBox("Third Line Claimed");
    } else if (pattern === 4) {
      setMessageBox("Early Five Claimed");
    } else if (pattern === 5) {
      setMessageBox("Corner Claimed");
    } else if (pattern === 6) {
      setMessageBox("Full House Claimed");
    } else {
      setMessageBox(pattern);
    }
    setTimeout(() => {
      setMessageBox("");
    }, 5000);
  };

  const claimClick = (id) => {
    if (id === 1) {
      if (!disqualify.includes(selectedTicket)) {
        if (finalTickets && Object.keys(finalTickets).length > 0) {
          let firstLine = finalTickets[selectedTicket][0];
          let firstLineNumbers = [];
          firstLine.forEach((num) => {
            if (num !== null && num !== undefined) {
              firstLineNumbers.push(num);
            }
          });
          if (firstLineNumbers.some((num) => !selectedNumbers.includes(num))) {
            handleMessageBox("Select all First Line Numbers");
            claimMenuToggle();
            return;
          }
          let isClaimed = firstLineNumbers.every(
            (num) => selectedNumbers.includes(num) && drawNumber.includes(num)
          );
          if (isClaimed) {
            let roomid = localStorage.getItem("roomid");
            let userid =
              localStorage.getItem("userid") || localStorage.getItem("hostid");
            const pattern = id;
            // console.log(roomid, userid, pattern);
            socket.emit("claim", roomid, userid, pattern);
          } else {
            handleMessageBox(`Ticket no ${selectedTicket} is disqualified`);
            setDisqualify((prev) => [...prev, selectedTicket]);
            claimMenuToggle();
          }
        }
      }
    } else if (id === 2) {
      if (!disqualify.includes(selectedTicket)) {
        if (finalTickets && Object.keys(finalTickets).length > 0) {
          let secondLine = finalTickets[selectedTicket][1];
          let secondLineNumbers = [];
          secondLine.forEach((num) => {
            if (num !== null && num !== undefined) {
              secondLineNumbers.push(num);
            }
          });
          if (secondLineNumbers.some((num) => !selectedNumbers.includes(num))) {
            handleMessageBox("Select all Second Line Numbers");
            claimMenuToggle();
            return;
          }
          let isClaimed = secondLineNumbers.every(
            (num) => selectedNumbers.includes(num) && drawNumber.includes(num)
          );
          if (isClaimed) {
            let roomid = localStorage.getItem("roomid");
            let userid =
              localStorage.getItem("userid") || localStorage.getItem("hostid");
            const pattern = id;
            console.log(roomid, userid, pattern);
            socket.emit("claim", roomid, userid, pattern);
          } else {
            handleMessageBox(`Ticket no ${selectedTicket} is disqualified`);
            setDisqualify((prev) => [...prev, selectedTicket]);
            claimMenuToggle();
          }
        }
      }
    } else if (id === 3) {
      if (!disqualify.includes(selectedTicket)) {
        if (finalTickets && Object.keys(finalTickets).length > 0) {
          let thirdLine = finalTickets[selectedTicket][2];
          let thirdLineNumbers = [];
          thirdLine.forEach((num) => {
            if (num !== null && num !== undefined) {
              thirdLineNumbers.push(num);
            }
          });
          if (thirdLineNumbers.some((num) => !selectedNumbers.includes(num))) {
            handleMessageBox("Select all Third Line Numbers");
            claimMenuToggle();
            return;
          }
          let isClaimed = thirdLineNumbers.every(
            (num) => selectedNumbers.includes(num) && drawNumber.includes(num)
          );
          if (isClaimed) {
            let roomid = localStorage.getItem("roomid");
            let userid =
              localStorage.getItem("userid") || localStorage.getItem("hostid");
            const pattern = id;
            console.log(roomid, userid, pattern);
            socket.emit("claim", roomid, userid, pattern);
          } else {
            handleMessageBox(`Ticket no ${selectedTicket} is disqualified`);
            setDisqualify((prev) => [...prev, selectedTicket]);
            claimMenuToggle();
          }
        }
      }
    } else if (id === 4) {
      if (!disqualify.includes(selectedTicket)) {
        if (finalTickets && Object.keys(finalTickets).length > 0) {
          if (selectedNumbers.length >= 5) {
            let earlyFiveNumbers = selectedNumbers.slice(0, 5);
            let isClaimed = earlyFiveNumbers.every((num) =>
              drawNumber.includes(num)
            );
            if (isClaimed) {
              let roomid = localStorage.getItem("roomid");
              let userid =
                localStorage.getItem("userid") ||
                localStorage.getItem("hostid");
              const pattern = id;
              console.log(roomid, userid, pattern);
              socket.emit("claim", roomid, userid, pattern);
            } else {
              handleMessageBox(`Ticket no ${selectedTicket} is disqualified`);
              setDisqualify((prev) => [...prev, selectedTicket]);
              claimMenuToggle();
            }
          } else {
            handleMessageBox("Select at least 5 numbers");
            claimMenuToggle();
          }
        }
      }
    } else if (id === 5) {
      if (!disqualify.includes(selectedTicket)) {
        if (finalTickets && Object.keys(finalTickets).length > 0) {
          let cornerNumbersLoop = [
            finalTickets[selectedTicket][0],
            finalTickets[selectedTicket][2],
          ];
          let cornerNumbers = [];
          cornerNumbersLoop.forEach((row) => {
            for (let i = 0; i < row.length; i++) {
              if (row[i] !== null && row[i] !== undefined) {
                cornerNumbers.push(row[i]);
                break;
              }
            }
            for (let i = row.length - 1; i >= 0; i--) {
              if (row[i] !== null && row[i] !== undefined) {
                cornerNumbers.push(row[i]);
                break;
              }
            }
          });
          if (cornerNumbers.length < 4) {
            handleMessageBox("Select all Valid Corner Numbers");
            claimMenuToggle();
            return;
          }
          let isClaimed = cornerNumbers.every((num) => {
            return selectedNumbers.includes(num) && drawNumber.includes(num);
          });
          if (isClaimed) {
            let roomid = localStorage.getItem("roomid");
            let userid =
              localStorage.getItem("userid") || localStorage.getItem("hostid");
            const pattern = id;
            console.log(roomid, userid, pattern);
            socket.emit("claim", roomid, userid, pattern);
          } else {
            handleMessageBox(`Ticket no ${selectedTicket} is disqualified`);
            setDisqualify((prev) => [...prev, selectedTicket]);
            claimMenuToggle();
          }
        }
      }
    } else if (id === 6) {
      if (!disqualify.includes(selectedTicket)) {
        if (finalTickets && Object.keys(finalTickets).length > 0) {
          let fullHouseNumbers = [];
          finalTickets[selectedTicket].forEach((row) => {
            row.forEach((num) => {
              if (num !== null && num !== undefined) {
                fullHouseNumbers.push(num);
              }
            });
          });
          let isvalid = fullHouseNumbers.every((num) => {
            return selectedNumbers.includes(num);
          });
          if (!isvalid) {
            handleMessageBox("Select all Numbers for full house");
            claimMenuToggle();
            return;
          }
          let isClaimed = fullHouseNumbers.every(
            (num) => selectedNumbers.includes(num) && drawNumber.includes(num)
          );
          if (isClaimed) {
            let roomid = localStorage.getItem("roomid");
            let userid =
              localStorage.getItem("userid") || localStorage.getItem("hostid");
            const pattern = id;
            // console.log(roomid, userid, pattern);
            socket.emit("claim", roomid, userid, pattern);
          } else {
            handleMessageBox(`Ticket no ${selectedTicket} is disqualified`);
            setDisqualify((prev) => [...prev, selectedTicket]);
            claimMenuToggle();
          }
        }
      }
    }
  };

  console.log(disqualify);

  return (
    <>
      <div className="flex flex-col gap-4 p-2">
        {Object.keys(finalTickets).map((ticketIndex) => (
          <>
            <div
              key={ticketIndex}
              className="bg-white p-4 h-fit rounded-lg relative overflow-hidden shadow-md w-[370px]"
            >
              <h2 className="text-center text-lg font-bold mb-2">
                Tambola Ticket {parseInt(ticketIndex)}
              </h2>
              <div className="grid grid-cols-9 bg-gray-200 p-1 rounded-md">
                {Array.isArray(finalTickets[ticketIndex]) &&
                  finalTickets[ticketIndex].map((row, rowIndex) => (
                    <React.Fragment key={rowIndex}>
                      {Array.isArray(row) &&
                        row.map((num, colIndex) => (
                          <div
                            key={`${rowIndex}-${colIndex}`}
                            onClick={(e) =>
                              num !== null && handleNumberClick(e)
                            }
                            className={`h-10 w-10 flex items-center justify-center text-lg font-semibold rounded-none border ${
                              num !== null
                                ? selectedNumbers.includes(num)
                                  ? "bg-blue-500 text-white"
                                  : "bg-white text-black"
                                : "bg-gray-300"
                            }`}
                          >
                            {num !== null ? num : ""}
                          </div>
                        ))}
                    </React.Fragment>
                  ))}
              </div>
              <button
                className="mt-4 bg-blue-500 text-center text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition duration-300"
                onClick={() => claimMenuToggle(ticketIndex)}
              >
                Claim
              </button>

              {disqualify.includes(ticketIndex) && (
                <div className="text-red-500 absolute flex justify-center items-center text-2xl w-full h-full top-0 left-0 p-2 bg-gray-600 opacity-90">
                  Ticket is disqualified
                </div>
              )}
            </div>
          </>
        ))}

        {claimMenu && (
          <div className="cont absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 p-4 bg-gray-500 rounded-lg shadow-lg">
            <div
              onClick={claimMenuToggle}
              className="closeButton absolute top-0 right-0 text-xl px-4 py-2 text-white cursor-pointer rounded-full hover:bg-red-500 hover:text-white transition duration-300"
            >
              X
            </div>
            <div className="claimsButton pt-4 flex flex-wrap gap-2">
              {[
                { name: "First Line", id: 1 },
                { name: "Second Line", id: 2 },
                { name: "Third Line", id: 3 },
                { name: "Early Five", id: 4 },
                { name: "Corner", id: 5 },
                { name: "Full House", id: 6 },
              ].map((claim) =>
                !ClaimHistory.includes(claim.id) ? (
                  <button
                    onClick={() => claimClick(claim.id)}
                    key={claim.id}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
                  >
                    {claim.name}
                  </button>
                ) : (
                  ""
                )
              )}
            </div>
          </div>
        )}

        {messageBox.length > 0 && (
          <div className="messageBox fixed top-10 left-1/2 transform -translate-x-1/2 p-4 bg-blue-400 text-white rounded-lg shadow-md">
            {messageBox}
          </div>
        )}
      </div>
    </>
  );
};

export default AssignNumbers;
