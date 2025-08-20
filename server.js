import express from "express";
import cors from "cors";
import axios from "axios";
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json());
app.use(cors());

const WORQHAT_URL = "https://api.worqhat.com/flows/trigger/9075cb78-158f-4881-aa2b-90ac060d2b0f";
const API_KEY = "wh_mehdredz48qmAYbxehausIkCGvQ6umG59QuR7bbnJy0J";

app.post("/trigger-flow", async (req, res) => {
  try {
     console.log("Received request body:", req.body);
    const { problem_statement, code_solution, key_logs } = req.body;

    console.log("Extracted data:", { 
      problem_statement: problem_statement?.length,
      code_solution: code_solution?.length,
      key_logs: key_logs?.length 
    });

    const response = await axios.post(
      WORQHAT_URL,
      { problem_statement, code_solution, key_logs },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Worqhat response:", response.data); // Add this line

    res.json(response.data);
  } catch (error) {
    console.error("Error:", error.response ? error.response.data : error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(5000, () => {
  console.log("Backend running on http://localhost:5000");
});
