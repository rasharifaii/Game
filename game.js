const $ = (selector) => document.querySelector(selector);

const playArea = $("#play-area");
const gameTitle = $("#game-title");
const gameContent = $("#game-content");

let totalScore = Number(localStorage.getItem("neonTotal")) || 0;
let bestScore = Number(localStorage.getItem("neonBest")) || 0;

function updateScores() {
  $("#total-score").textContent = totalScore;
  $("#stat-score").textContent = totalScore;
  $("#best-score").textContent = bestScore;
}

function awardPoints(points) {
  totalScore += points;
  bestScore = Math.max(bestScore, totalScore);

  localStorage.setItem("neonTotal", totalScore);
  localStorage.setItem("neonBest", bestScore);

  updateScores();
}

function renderGame(title, html) {
  gameTitle.textContent = title;
  gameContent.innerHTML = html;
  playArea.classList.remove("hidden");
  playArea.scrollIntoView({ behavior: "smooth", block: "start" });
}

function showResult(message) {
  const output = $("#game-message");
  if (output) output.textContent = message;
}

// Close the current game
$("#close-game").addEventListener("click", () => {
  playArea.classList.add("hidden");
  gameContent.innerHTML = "";
  $("#games").scrollIntoView({ behavior: "smooth" });
});

// Open a game
document.querySelectorAll("[data-game]").forEach((button) => {
  button.addEventListener("click", () => {
    const game = button.dataset.game;

    if (game === "guess") startGuessGame();
    if (game === "rps") startRPSGame();
    if (game === "memory") startMemoryGame();
  });
});

// =====================================
// GAME 1: GUESS THE NUMBER
// =====================================

function startGuessGame() {
  let secret = Math.floor(Math.random() * 100) + 1;
  let attempts = 10;
  let finished = false;

  renderGame(
    "🎯 Guess the Number",
    `
    <div class="game-ui">
      <h3>Find the secret number!</h3>
      <p>Choose a number between 1 and 100.</p>
      <p>Attempts remaining: <strong id="attempts">10</strong></p>

      <input
        class="game-input"
        id="guess-input"
        type="number"
        min="1"
        max="100"
        placeholder="Enter a number..."
        aria-label="Your guess"
      />

      <button class="action-btn" id="guess-btn">CHECK NUMBER</button>
      <p class="message" id="game-message" aria-live="polite">
        Good luck!
      </p>
      <button class="action-btn" id="guess-restart">NEW GAME</button>
    </div>
  `,
  );

  const input = $("#guess-input");
  const checkButton = $("#guess-btn");

  function checkGuess() {
    if (finished) return;

    const guess = Number(input.value);

    if (
      input.value.trim() === "" ||
      !Number.isInteger(guess) ||
      guess < 1 ||
      guess > 100
    ) {
      showResult("Enter a whole number from 1 to 100.");
      return;
    }

    attempts--;
    $("#attempts").textContent = attempts;

    if (guess === secret) {
      finished = true;
      showResult(
        `🎉 Correct! You earned 10 XP in ${11 - attempts} attempt(s)!`,
      );
      awardPoints(10);
      checkButton.disabled = true;
      input.disabled = true;
    } else if (attempts === 0) {
      finished = true;
      showResult(`Game over! The secret number was ${secret}.`);
      checkButton.disabled = true;
      input.disabled = true;
    } else {
      showResult(
        guess < secret
          ? "📈 Too low! Try a higher number."
          : "📉 Too high! Try a lower number.",
      );
    }

    input.value = "";
    if (!finished) input.focus();
  }

  checkButton.addEventListener("click", checkGuess);

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") checkGuess();
  });

  $("#guess-restart").addEventListener("click", startGuessGame);
}

// =====================================
// GAME 2: ROCK PAPER SCISSORS
// =====================================

function startRPSGame() {
  const choices = [
    { name: "rock", emoji: "✊" },
    { name: "paper", emoji: "✋" },
    { name: "scissors", emoji: "✌️" },
  ];

  let playerWins = 0;
  let computerWins = 0;
  let finished = false;

  renderGame(
    "✊ Rock Paper Scissors",
    `
    <div class="game-ui">
      <h3>First to 3 wins!</h3>
      <p>Choose your move and beat the computer.</p>

      <div class="choice-row">
        <button class="choice-btn" data-choice="rock" aria-label="Rock">✊</button>
        <button class="choice-btn" data-choice="paper" aria-label="Paper">✋</button>
        <button class="choice-btn" data-choice="scissors" aria-label="Scissors">✌️</button>
      </div>

      <p id="rps-score">YOU 0 — 0 COMPUTER</p>
      <p class="message" id="game-message" aria-live="polite">
        Make your move!
      </p>
      <button class="action-btn" id="rps-restart">PLAY AGAIN</button>
    </div>
  `,
  );

  const choiceButtons = document.querySelectorAll("[data-choice]");

  function playRound(playerChoice) {
    if (finished) return;

    const computerChoice =
      choices[Math.floor(Math.random() * choices.length)].name;

    let result;

    if (playerChoice === computerChoice) {
      result = "It's a draw! 🤝";
    } else if (
      (playerChoice === "rock" && computerChoice === "scissors") ||
      (playerChoice === "paper" && computerChoice === "rock") ||
      (playerChoice === "scissors" && computerChoice === "paper")
    ) {
      playerWins++;
      result = "You win this round! 🎉";
    } else {
      computerWins++;
      result = "Computer wins this round! 🤖";
    }

    const playerEmoji = choices.find(
      (item) => item.name === playerChoice,
    ).emoji;

    const computerEmoji = choices.find(
      (item) => item.name === computerChoice,
    ).emoji;

    showResult(`${playerEmoji} You vs ${computerEmoji} Computer — ${result}`);

    $("#rps-score").textContent =
      `YOU ${playerWins} — ${computerWins} COMPUTER`;

    if (playerWins === 3 || computerWins === 3) {
      finished = true;
      choiceButtons.forEach((button) => {
        button.disabled = true;
      });

      if (playerWins === 3) {
        showResult("🏆 YOU WON THE MATCH! +10 XP");
        awardPoints(10);
      } else {
        showResult("🤖 Computer won the match. Try again!");
      }
    }
  }

  choiceButtons.forEach((button) => {
    button.addEventListener("click", () => {
      playRound(button.dataset.choice);
    });
  });

  $("#rps-restart").addEventListener("click", startRPSGame);
}

// =====================================
// GAME 3: MEMORY MATCH
// =====================================

function startMemoryGame() {
  const symbols = ["🚀", "🎮", "👾", "💎", "⚡", "🌙"];
  const cards = [...symbols, ...symbols].sort(() => Math.random() - 0.5);

  let firstCard = null;
  let locked = false;
  let matches = 0;
  let moves = 0;
  let finished = false;
  let mismatchTimer = null;

  renderGame(
    "🧠 Memory Match",
    `
    <div class="game-ui">
      <h3>Find all 6 pairs!</h3>
      <p>Moves: <strong id="memory-moves">0</strong> ·
         Pairs: <strong id="memory-pairs">0</strong>/6</p>

      <div class="memory-grid" id="memory-grid"></div>

      <p class="message" id="game-message" aria-live="polite">
        Flip two cards to find a match.
      </p>

      <button class="action-btn" id="memory-restart">RESTART GAME</button>
    </div>
  `,
  );

  const grid = $("#memory-grid");

  cards.forEach((symbol, index) => {
    const card = document.createElement("button");

    card.className = "memory-card";
    card.textContent = "?";
    card.dataset.symbol = symbol;
    card.dataset.index = index;
    card.setAttribute("aria-label", `Hidden card ${index + 1}`);

    card.addEventListener("click", () => flipCard(card));

    grid.appendChild(card);
  });

  function flipCard(card) {
    if (
      locked ||
      finished ||
      card.disabled ||
      card === firstCard ||
      card.classList.contains("matched")
    ) {
      return;
    }

    card.textContent = card.dataset.symbol;
    card.classList.add("revealed");
    card.setAttribute("aria-label", card.dataset.symbol);

    if (!firstCard) {
      firstCard = card;
      return;
    }

    moves++;
    $("#memory-moves").textContent = moves;

    if (firstCard.dataset.symbol === card.dataset.symbol) {
      firstCard.classList.remove("revealed");
      card.classList.remove("revealed");

      firstCard.classList.add("matched");
      card.classList.add("matched");

      firstCard.disabled = true;
      card.disabled = true;

      matches++;
      $("#memory-pairs").textContent = matches;
      firstCard = null;

      if (matches === symbols.length) {
        finished = true;
        showResult(`🎉 Amazing! All pairs found in ${moves} moves! +15 XP`);
        awardPoints(15);
      } else {
        showResult("✨ Match found! Keep going!");
      }
    } else {
      locked = true;
      const previousCard = firstCard;
      firstCard = null;

      showResult("Not a match. Try again!");

      mismatchTimer = setTimeout(() => {
        previousCard.textContent = "?";
        card.textContent = "?";

        previousCard.classList.remove("revealed");
        card.classList.remove("revealed");

        previousCard.setAttribute("aria-label", "Hidden card");
        card.setAttribute("aria-label", "Hidden card");

        locked = false;
        mismatchTimer = null;
      }, 800);
    }
  }

  $("#memory-restart").addEventListener("click", startMemoryGame);
}

updateScores();
