// generatePlayers.js
import { faker } from "@faker-js/faker";
import fs from "fs";

// Utility to get random number in range
const rand = (min, max, decimals = 2) =>
  parseFloat((Math.random() * (max - min) + min).toFixed(decimals));

const roles = ["Batsman", "Bowler", "All-Rounder", "Wicketkeeper"];
const nationalities = [
  "Indian",
  "Australian",
  "English",
  "South African",
  "New Zealander",
  "Sri Lankan",
  "Bangladeshi",
  "Pakistani",
  "West Indian",
  "Afghan",
];

function generatePlayer(id) {
  const role = faker.helpers.arrayElement(roles);
  const nationality = faker.helpers.arrayElement(nationalities);
  const age = rand(19, 38, 0);
  const matches = rand(20, 200, 0);
  const basePrice = rand(0.5, 5, 2);

  // Initialize all stats to 0
  let runs = 0,
    highestScore = 0,
    wickets = 0,
    bestBowling = 0 + "/" + 0,
    battingAverage = 0,
    battingStrikeRate = 0,
    bowlingAverage = 0,
    bowlingEconomy = 0,
    bowlingStrikeRate = 0;

  switch (role) {
    case "Batsman":
      runs = rand(800, 6000, 0);
      highestScore = rand(10, 125, 0);
      battingAverage = rand(25, 55, 2);
      battingStrikeRate = rand(110, 170, 2);
      break;

    case "Bowler":
      wickets = rand(40, 250, 0);
      bestBowling = 4 + "-" + rand(40, 250, 0);
      bowlingAverage = rand(18, 35, 2);
      bowlingEconomy = rand(5.5, 9.5, 2);
      bowlingStrikeRate = rand(12, 45, 2);
      break;

    case "All-Rounder":
      runs = rand(500, 4000, 0);
      wickets = rand(30, 180, 0);
      battingAverage = rand(25, 45, 2);
      battingStrikeRate = rand(100, 150, 2);
      bowlingAverage = rand(20, 35, 2);
      bowlingEconomy = rand(6.0, 9.0, 2);
      bowlingStrikeRate = rand(15, 40, 2);
      break;

    case "Wicketkeeper":
      runs = rand(1000, 4500, 0);
      battingAverage = rand(28, 48, 2);
      battingStrikeRate = rand(110, 160, 2);
      break;
  }

  return {
    id,
    name: faker.person.fullName(),
    role,
    age,
    nationality,
    basePrice,
    matches,
    runs,
    highestScore,
    wickets,
    bestBowling,
    battingAverage,
    battingStrikeRate,
    bowlingAverage,
    bowlingEconomy,
    bowlingStrikeRate,
    image: `/images/players/player${(id % 10) + 1}.png`,
  };
}

// Generate all players
const players = [];
for (let i = 1; i <= 500; i++) {
  players.push(generatePlayer(i));
}

// Save to file
fs.writeFileSync("players.json", JSON.stringify(players, null, 2));
console.log("✅ 500 players generated successfully in players.json!");
