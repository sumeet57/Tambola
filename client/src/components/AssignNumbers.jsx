import React, { useEffect, useState, useContext } from "react";
import {
  distributeNumbersEqually,
  generateTambolaTickets,
} from "../utils/game.js";

import socket from "../utils/websocket";
import { useNavigate } from "react-router-dom";
//for context import
import { PlayerContext } from "../context/PlayerContext.jsx";
import { GameContext } from "../context/GameContext.jsx";

// for loading
import Loading from "./Loading.jsx";

// toastify
import { toast } from "react-toastify";

const AssignNumbers = () => {
  const navigate = useNavigate();

  //for tickets
  const [tickets, setTickets] = useState([]);
  const [finalTickets, setFinalTickets] = useState([]); // Store final structured tickets

  // for context
  const { Player } = useContext(PlayerContext);
  const { gameState, updateGameState } = useContext(GameContext);

  //loding
  const [loading, setLoading] = useState(false);

  // warning message
  const [warningMessage, setWarningMessage] = useState("");
  const [warningToggle, setWarningToggle] = useState(false);
  const handleWarningMessage = (message) => {
    setWarningMessage(message);
    setWarningToggle(true);
    setTimeout(() => {
      setWarningToggle(false);
      navigate(`/`); // Redirect to home page after 10 seconds
    }, 10000);
  };

  // claim guide table
  const claimGuide = {
    1: "Early Five",
    2: "Middle Number",
    3: "Early Seven",
    4: "First Line",
    5: "Second Line",
    6: "Third Line",
    7: "Corner",
    8: "Full House",
  };

  useEffect(() => {
    if (gameState.assign_numbers.length > 14) {
      const generatedTickets = distributeNumbersEqually(
        gameState.assign_numbers
      );
      setTickets(generatedTickets);
      setLoading(false);
    } else {
    }
  }, []);

  useEffect(() => {
    if (tickets.length === 0) return;

    let ticketsData = {};
    setLoading(true);

    // Initial generation
    tickets.forEach((ticket, index) => {
      ticketsData[index + 1] = generateTambolaTickets(ticket)[0];
    });

    const isValidTicket = (ticket) => {
      if (!Array.isArray(ticket) || ticket.length !== 3) return false;
      const flat = ticket.flat();
      const nonNullValues = flat.filter((val) => typeof val === "number");
      return nonNullValues.length === 15;
    };

    // Validate initially
    let validTicketsCount =
      Object.values(ticketsData).filter(isValidTicket).length;

    let success = validTicketsCount == gameState?.ticketCount;

    // Retry generation if invalid
    if (!success) {
      for (let i = 0; i < 5; i++) {
        Object.keys(ticketsData).forEach((key) => {
          const newTicket = generateTambolaTickets(tickets[key - 1])[0];
          if (!isValidTicket(ticketsData[key])) {
            ticketsData[key] = newTicket;
          }
        });

        validTicketsCount =
          Object.values(ticketsData).filter(isValidTicket).length;

        if (validTicketsCount == gameState?.ticketCount) {
          success = true;
          break;
        }
      }
    }

    if (!success) {
      handleWarningMessage(
        "Unable to generate valid tickets. Please Reconnect."
      );
      setLoading(false);
      return;
    }

    // Check for localStorage
    const existingTickets = localStorage.getItem(`${gameState?.roomid}`);
    if (existingTickets) {
      const parsed = JSON.parse(existingTickets);
      if (Object.keys(parsed).length === gameState?.ticketCount) {
        setFinalTickets(parsed);
        setLoading(false);
        return;
      }
    }

    // No valid stored ticket, save and set new one
    localStorage.setItem(`${gameState?.roomid}`, JSON.stringify(ticketsData));
    setFinalTickets(ticketsData);
    setLoading(false);
  }, [tickets]);

  // for claims and click on number
  const [selectedNumbers, setSelectedNumbers] = useState([]);

  const handleNumberClick = (e) => {
    const number = parseInt(e.target.innerText);

    setSelectedNumbers((prevSelected) => {
      if (prevSelected.includes(number)) {
        return prevSelected.filter((num) => num !== number); // Remove number correctly
      } else {
        return [...prevSelected, number]; // Add number correctly
      }
    });
  };

  const [drawNumber, setDrawNumber] = useState(gameState.drawnNumbers);
  useEffect(() => {
    setDrawNumber(gameState.drawnNumbers);
  }, [gameState.drawnNumbers]);

  const handleClaimMessage = (data) => {
    toast.success(data.message, {
      autoClose: 5000,
    });
  };

  useEffect(() => {
    const handleGameOver = () => {
      toast.info("Game Over!");
      localStorage.removeItem(`${gameState?.roomid}`);
      setTimeout(() => {
        navigate("gameover");
      }, 1000);
    };
    const handleClaimList = (claimedList) => {
      updateGameState({
        claimTrack: claimedList,
      });
    };

    const handleTickNumbers = (data) => {
      if (data.length > 0) {
        if (gameState.assign_numbers) {
          let commonNumbers = gameState.assign_numbers.filter((num) =>
            data.includes(num)
          );
          if (commonNumbers.length > 0) {
            setSelectedNumbers((prev) => [...prev, ...commonNumbers]);
          }
        }
      }
    };

    socket.on("reconnectedPlayer", handleTickNumbers);

    socket.on("pattern_claimed", handleClaimMessage);
    // socket.on("error", handleMessageBox);
    socket.on("claimedList", handleClaimList);
    socket.on("game_over", handleGameOver);
    socket.on("room_data_stored", handleGameOver);

    return () => {
      socket.off("pattern_claimed", handleClaimMessage);
      // socket.off("error", handleMessageBox);
      socket.off("claimedList", handleClaimList);
      socket.off("game_over", handleGameOver);
      socket.off("room_data_stored", handleGameOver);
      socket.off("reconnectedPlayer", handleTickNumbers);
    };
  }, []);

  const [ClaimHistory, setClaimHistory] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [disqualify, setDisqualify] = useState([]);
  const [claimMenu, setClaimMenu] = useState(false);
  const claimMenuToggle = (ticketindex) => {
    if (ticketindex) {
      setSelectedTicket(ticketindex);
    }
    setClaimMenu(!claimMenu);
  };
  const [messageBox, setMessageBox] = useState("");
  const handleMessageBox = (pattern, name) => {
    if (pattern && name) {
      setMessageBox(pattern + " claimed by " + name);
      setClaimHistory(...ClaimHistory, parseInt(pattern));
    } else {
      setMessageBox(pattern);
    }
    setTimeout(() => {
      setMessageBox("");
    }, 5000);
  };

  const claimClick = (id) => {
    if (id === 4) {
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
            toast.warning("Select all First Line Numbers");
            claimMenuToggle();
            return;
          }
          let isClaimed = firstLineNumbers.every(
            (num) => selectedNumbers.includes(num) && drawNumber.includes(num)
          );
          if (isClaimed) {
            const pattern = parseInt(id);

            // console.log(roomid, userid, pattern);
            socket.emit("claim", Player, gameState.roomid, pattern);
            claimMenuToggle();
          } else {
            toast.error(`Ticket no ${selectedTicket} is disqualified`);
            setDisqualify((prev) => [...prev, selectedTicket]);
            claimMenuToggle();
          }
        }
      }
    } else if (id === 5) {
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
            toast.warning("Select all Second Line Numbers");
            claimMenuToggle();
            return;
          }
          let isClaimed = secondLineNumbers.every(
            (num) => selectedNumbers.includes(num) && drawNumber.includes(num)
          );
          if (isClaimed) {
            const pattern = parseInt(id);
            // console.log(roomid, userid, pattern);
            socket.emit("claim", Player, gameState.roomid, pattern);
            claimMenuToggle();
          } else {
            toast.error(`Ticket no ${selectedTicket} is disqualified`);
            setDisqualify((prev) => [...prev, selectedTicket]);
            claimMenuToggle();
          }
        }
      }
    } else if (id === 6) {
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
            toast.warning("Select all Third Line Numbers");
            claimMenuToggle();
            return;
          }
          let isClaimed = thirdLineNumbers.every(
            (num) => selectedNumbers.includes(num) && drawNumber.includes(num)
          );
          if (isClaimed) {
            const pattern = parseInt(id);
            socket.emit("claim", Player, gameState.roomid, pattern);
            claimMenuToggle();
          } else {
            toast.error(`Ticket no ${selectedTicket} is disqualified`);
            setDisqualify((prev) => [...prev, selectedTicket]);
            claimMenuToggle();
          }
        }
      }
    } else if (id === 1) {
      if (!disqualify.includes(selectedTicket)) {
        if (finalTickets && Object.keys(finalTickets).length > 0) {
          let earlyFiveNumbers = [];
          finalTickets[selectedTicket].forEach((row) => {
            row.forEach((num) => {
              if (num !== null && num !== undefined) {
                earlyFiveNumbers.push(num);
              }
            });
          });
          let isvalid =
            selectedNumbers.filter((num) => earlyFiveNumbers.includes(num))
              .length >= 5;
          if (!isvalid) {
            toast.warning("Select all Numbers for Early Five");
            claimMenuToggle();
            return;
          }
          let isClaimed =
            selectedNumbers.filter(
              (num) =>
                drawNumber.includes(num) && earlyFiveNumbers.includes(num)
            ).length >= 5;
          if (isClaimed) {
            const pattern = id;
            socket.emit("claim", Player, gameState.roomid, pattern);
            claimMenuToggle();
          } else {
            toast.error(`Ticket no ${selectedTicket} is disqualified`);
            setDisqualify((prev) => [...prev, selectedTicket]);
            claimMenuToggle();
          }
        }
      }
    } else if (id === 2) {
      // only middle number claim, not middle line claim
      if (!disqualify.includes(selectedTicket)) {
        if (finalTickets && Object.keys(finalTickets).length > 0) {
          let middleNumbers = finalTickets[selectedTicket][1];
          let allMiddleNumbers = middleNumbers.filter(
            (num) => num !== null && num !== undefined
          );
          let middleNumber =
            allMiddleNumbers[Math.floor(allMiddleNumbers.length / 2)];
          if (
            middleNumber === null ||
            middleNumber === undefined ||
            !selectedNumbers.includes(middleNumber)
          ) {
            toast.warning("Select Middle Number");
            claimMenuToggle();
            return;
          }
          let isClaimed =
            selectedNumbers.includes(middleNumber) &&
            drawNumber.includes(middleNumber);
          if (isClaimed) {
            const pattern = id;
            socket.emit("claim", Player, gameState.roomid, pattern);
            claimMenuToggle();
          } else {
            toast.error(`Ticket no ${selectedTicket} is disqualified`);
            setDisqualify((prev) => [...prev, selectedTicket]);
            claimMenuToggle();
          }
        }
      }
    } else if (id === 3) {
      if (!disqualify.includes(selectedTicket)) {
        if (finalTickets && Object.keys(finalTickets).length > 0) {
          let earlySevenNumbers = [];
          finalTickets[selectedTicket].forEach((row) => {
            row.forEach((num) => {
              if (num !== null && num !== undefined) {
                earlySevenNumbers.push(num);
              }
            });
          });
          let isvalid =
            selectedNumbers.filter((num) => earlySevenNumbers.includes(num))
              .length >= 7;
          if (!isvalid) {
            toast.warning("Select all Numbers for Early Seven");
            claimMenuToggle();
            return;
          }
          let isClaimed =
            selectedNumbers.filter(
              (num) =>
                drawNumber.includes(num) && earlySevenNumbers.includes(num)
            ).length >= 7;
          if (isClaimed) {
            const pattern = id;
            socket.emit("claim", Player, gameState.roomid, pattern);
            claimMenuToggle();
          } else {
            toast.error(`Ticket no ${selectedTicket} is disqualified`);
            setDisqualify((prev) => [...prev, selectedTicket]);
            claimMenuToggle();
          }
        }
      }
    } else if (id === 7) {
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
          let isvalid = cornerNumbers.every((num) => {
            return selectedNumbers.includes(num);
          });
          if (!isvalid) {
            toast.warning("Select all Corner Numbers");
            claimMenuToggle();
            return;
          }
          let isClaimed = cornerNumbers.every((num) => {
            return selectedNumbers.includes(num) && drawNumber.includes(num);
          });
          if (isClaimed) {
            const pattern = parseInt(id);

            socket.emit("claim", Player, gameState.roomid, pattern);
            claimMenuToggle();
          } else {
            toast.error(`Ticket no ${selectedTicket} is disqualified`);
            setDisqualify((prev) => [...prev, selectedTicket]);
            claimMenuToggle();
          }
        }
      }
    } else if (id === 8) {
      if (!disqualify.includes(selectedTicket)) {
        if (
          ClaimHistory.includes(1) &&
          ClaimHistory.includes(2) &&
          ClaimHistory.includes(3) &&
          ClaimHistory.includes(4) &&
          ClaimHistory.includes(5)
        ) {
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
              toast.warning("Select all Full House Numbers");
              claimMenuToggle();
              return;
            }
            let isClaimed = fullHouseNumbers.every(
              (num) => selectedNumbers.includes(num) && drawNumber.includes(num)
            );
            if (isClaimed) {
              const pattern = parseInt(id);

              socket.emit("claim", Player, gameState.roomid, pattern);
              claimMenuToggle();
            } else {
              toast.error(`Ticket no ${selectedTicket} is disqualified`);
              setDisqualify((prev) => [...prev, selectedTicket]);
              claimMenuToggle();
            }
          }
        } else {
          toast.warning("Claim all patterns before claiming Full House");
          claimMenuToggle();
        }
      }
    }
  };

  return loading ? (
    <Loading />
  ) : (
    <React.Fragment>
      <div className="flex flex-col gap-1 items-center relative">
        {Object.keys(finalTickets).map((ticketIndex) => (
          <React.Fragment key={ticketIndex}>
            <div
              key={ticketIndex}
              className="bg-white w-full h-fit p-1 relative overflow-hidden border-2 border-zinc-900 rounded-lg shadow-md"
            >
              <div className="grid grid-cols-9 bg-gradient-to-r from-blue-100 via-teal-100 to-green-100 rounded-md">
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
                            className={`w-full h-10 flex items-center justify-center text-base select-none font-semibold rounded-none border ${
                              num !== null
                                ? selectedNumbers.includes(num)
                                  ? "bg-gradient-to-b from-green-400 to-green-500 text-white"
                                  : "bg-gradient-to-r from-white to-gray-100 text-black"
                                : "bg-gray-300"
                            } ${
                              window.innerWidth < 370
                                ? "w-full h-8 text-[12px]"
                                : ""
                            }`}
                          >
                            {num !== null ? num : ""}
                          </div>
                        ))}
                    </React.Fragment>
                  ))}
              </div>
              <button
                className="mt-1 bg-gradient-to-r from-yellow-200 via-orange-200 to-pink-200 text-black text-center font-medium tracking-wider px-4 py-1 transition-all active:scale-90 rounded-lg hover:from-yellow-300 hover:via-orange-300 hover:to-pink-300 shadow-lg"
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
          </React.Fragment>
        ))}

        {claimMenu && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-0 bg-black/30 backdrop-blur-sm">
            <div className="relative w-full max-w-md rounded-3xl border border-white/30 bg-white/30 backdrop-blur-md shadow-2xl p-6 sm:p-8">
              {/* Close Button */}
              <button
                onClick={claimMenuToggle}
                className="absolute top-4 right-4 w-10 h-10 rounded-full text-xl sm:text-2xl font-bold text-red-600 hover:bg-red-500 hover:text-white bg-white shadow transition-all duration-200 grid place-items-center active:scale-90"
                aria-label="Close"
              >
                &times;
              </button>

              {/* Title */}
              <h2 className="text-center text-xl sm:text-2xl font-bold text-gray-800 mb-6">
                Select a Claim Pattern
              </h2>

              {/* Claim Buttons */}
              <div className="grid grid-cols-2 gap-4">
                {gameState?.patterns.map((claim) => {
                  if (!ClaimHistory?.includes(claim.id)) {
                    const foundClaim = gameState?.claimTrack.find(
                      (item) => item.id === claim.id
                    );
                    const winners = foundClaim?.winners;

                    return (
                      <button
                        key={claim.id}
                        onClick={() => {
                          if (winners !== 0 && foundClaim) {
                            claimClick(parseInt(claim.id));
                          }
                        }}
                        disabled={winners === 0}
                        className={`text-center py-2 px-3 text-sm sm:text-base font-semibold rounded-xl shadow-md transition-all duration-200
                  ${
                    winners === 0
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-br from-green-300 via-blue-300 to-purple-300 hover:from-green-400 hover:to-purple-400 text-gray-800 hover:scale-105 active:scale-95"
                  }`}
                      >
                        {`${claimGuide[claim.id] || "Unknown"} (${
                          winners !== undefined ? winners : "claimed"
                        })`}
                      </button>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          </div>
        )}

        {warningToggle && (
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 px-6 py-4 max-w-md w-full bg-gradient-to-br from-zinc-800 via-zinc-900 to-black text-white rounded-3xl shadow-2xl border border-red-500 animate-pulse-slow z-50">
            <div className="flex flex-col items-center gap-4">
              <div className="text-red-400 text-4xl">⚠️</div>
              <p className="text-center text-xl font-semibold text-red-300">
                {warningMessage}
              </p>
              <p className="text-center text-sm text-gray-400">
                Please reconnect or join a new game.
                <br />
                <span className="text-xs">
                  This message will disappear in 10 seconds.
                </span>
              </p>
              <button
                className="bg-gradient-to-r from-red-400 via-yellow-300 to-orange-400 text-black font-semibold tracking-wide px-5 py-2 rounded-lg hover:from-red-500 hover:to-orange-500 transition-all duration-200 shadow-md active:scale-95"
                onClick={() => {
                  setWarningToggle(false);
                  navigate(`/`);
                }}
              >
                Reconnect
              </button>
            </div>
          </div>
        )}
      </div>
    </React.Fragment>
  );
};

export default AssignNumbers;
