import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import axios from "axios";
import "./App.css";

const socket = io("http:.1.35:4900");

function App() {
  const [username, setUsername] = useState("");
  const [betAmount, setBetAmount] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [customOption, setCustomOption] = useState("");
  const [contestId, setContestId] = useState(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(true);

  useEffect(() => {
    socket.on("contestStart", (data) => {
      setContestId(data.contestId);
      setTimeLeft(60);
      setHasSubmitted(false);
      setSelectedOption("");
      setBetAmount("");
      setCustomOption("");
    });

    socket.on("winnerAnnounced", (winner) => {
      fetchHistory();
    });
    fetchHistory();
  }, []);

  useEffect(() => {
    if (timeLeft > 0) {
      const interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timeLeft]);

  const fetchHistory = async () => {
    const res = await axios.get("http://localhost:3000/history");
    setHistory(res.data);
  };

  const handlePlay = () => {
    const viewOption =
      selectedOption === "write" ? customOption : selectedOption;

    if (!username || !betAmount || !viewOption) {
      alert("⚠️ Please enter all fields");
      return;
    }

    if (timeLeft <= 10) {
      alert("⛔ Time is too short! Please wait for the next contest to join.");
      return;
    }

    if (hasSubmitted) {
      alert("✅ Bet already submitted!");
      return;
    }

    const betData = {
      name: username,
      betAmount,
      view: viewOption,
      contestId,
    };

    socket.emit("submitBet", betData);
    setHasSubmitted(true);
    alert("✅ Bet submitted successfully!");
  };

  return (
    <div className="app-container">
      <h1>🎮 PlusPlay Contest</h1>

      <div className="video-box">🎥 Live Video Placeholder</div>

      <p>
        ⏳ Time Left: <strong>{timeLeft}</strong> seconds
      </p>

      <div className="form-group">
        <input
          type="text"
          placeholder="Your Name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="number"
          placeholder="Bet Amount"
          value={betAmount}
          onChange={(e) => setBetAmount(e.target.value)}
        />

        <div className="option-buttons">
          {["10", "20", "30", "40", "write"].map((opt) => (
            <button
              key={opt}
              className={selectedOption === opt ? "selected" : ""}
              onClick={() => setSelectedOption(opt)}
            >
              {opt === "write" ? "✍️ Write Your Option" : opt}
            </button>
          ))}
        </div>

        {selectedOption === "write" && (
          <input
            type="text"
            placeholder="Enter your custom view"
            value={customOption}
            onChange={(e) => setCustomOption(e.target.value)}
          />
        )}

        <button onClick={handlePlay}>Play</button>

        <button
          className="toggle-history-btn"
          onClick={() => setShowHistory(!showHistory)}
        >
          {showHistory ? "Hide" : "Show"} History
        </button>
        {showHistory && (
          <>
            <h3>📜 Contest History</h3>
            <table>
              <thead>
                <tr>
                  <th>Contest ID</th>
                  <th>Winner</th>
                  <th>Live View</th>
                  <th>Player View</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item._id}>
                    <td>{item.contestId}</td>
                    <td>{item.name}</td>
                    <td>{item.liveView}</td>
                    <td>{item.view}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
