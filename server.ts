import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

let aiClient: GoogleGenAI | null = null;

function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

function generateSimulatedResponse(query: string): string {
  const normalized = query.toLowerCase().trim();

  // 1. Study Questions
  if (normalized.includes("what is ai") || normalized.includes("what is artificial intelligence")) {
    return `Artificial Intelligence (AI) refers to the simulation of human intelligence processes by computer systems. These processes include learning, reasoning, problem-solving, perception, and natural language understanding.

By deploying lightweight LLMs like **Llama 3.2** locally via **Ollama**, students can build fully private, high-performance AI implementations on consumer hardware without paying for cloud subscriptions!`;
  }

  if (normalized.includes("machine learning") || normalized.includes("explain ml") || normalized.includes("explain machine learning")) {
    return `**Machine Learning (ML)** is a subset of Artificial Intelligence focused on building systems that learn—or improve performance—based on the data they process. 

Rather than being explicitly programmed with static rules, ML algorithms identify patterns in historical data to make generalizations, predictions, or decisions. Key fields include:
- **Supervised Learning**: Training models on labeled datasets (e.g., classifying emails as spam).
- **Unsupervised Learning**: Discovering hidden structures in unlabeled datasets (e.g., customer segmentation).
- **Reinforcement Learning**: Teaching agents to maximize cumulative rewards in dynamic environments.`;
  }

  if (normalized.includes("what is python") || normalized.includes("why python") || normalized === "python") {
    return `**Python** is a high-level, interpreted, general-purpose programming language celebrated for its dynamic readability and clear, expressive syntax.

In modern AI engineering:
- It serves as the primary ecosystem for major libraries (**PyTorch**, **TensorFlow**, **scikit-learn**).
- Its simple syntax allows rapid iteration of web dashboards via **Streamlit**.
- It integrates seamlessly with native endpoints using client wrappers like the **Ollama Python API**.`;
  }

  // 2. Coding Questions
  if (normalized.includes("python loop") || normalized.includes("write a loop") || normalized.includes("for loop") || normalized.includes("while loop")) {
    return `Here is a clean demonstration of **for** and **while** loops in Python:

\`\`\`python
# 1. Standard For Loop (iterating through a list)
frameworks = ["Streamlit", "Ollama", "Llama 3.2"]
print("Exploring Local AI Tools:")
for tool in frameworks:
    print(f" -> Active: {tool}")

# 2. Daily Counter (While Loop)
token_count = 0
while token_count < 3:
    print(f"Generating token pack {token_count + 1} offline...")
    token_count += 1
\`\`\`

These constructs allow you to process collections of records or manage state logic iteratively within Python!`;
  }

  if (normalized.includes("recursion") || normalized.includes("recursive")) {
    return `**Recursion** is an essential programming technique where a function calls itself, directly or indirectly, to break a complex problem down into self-similar sub-problems.

Every robust recursive function requires:
1. **Base Case**: A terminating condition that stops the recursion and returns a value. Without this, the system will encounter a 'RecursionError: maximum recursion depth exceeded' (stack overflow).
2. **Recursive Step**: The function logic where it calls itself with modified parameters that move closer to the base case.

**Example: Factorial Calculation in Python**
\`\`\`python
def factorial(n):
    # Base Case: Stop when n diminishes to 1
    if n <= 1:
        return 1
    # Recursive Step: n multiplied by factorial of (n-1)
    return n * factorial(n - 1)

print(factorial(5)) # Outputs 120
\`\`\``;
  }

  // 3. Resume & Interview Questions
  if (normalized.includes("include") && normalized.includes("resume")) {
    return `To make your resume look professional and appealing to tech-recruiters:
- **Categorized Technical Skills**: Avoid listing tools in a bulk line. Instead, structure them: *Languages (Python), Frameworks (Streamlit), Tools (Ollama API, Git, VS Code)*.
- **Hands-On Projects**: Detail projects showing physical constraints you solved. Mentioning how you integrated a **Local LLM like Llama 3.2** to achieve 100% private host inference shows you understand CORS, low-latency, and data governance.
- **Quantitative Metrics**: Use clear KPIs wherever possible (e.g., *"Created a functional, custom local chat application using Ollama, reducing token latency to 30ms"*).`;
  }

  if (normalized.includes("improve") && normalized.includes("resume")) {
    return `Here are some high-impact ways to improve your engineering resume immediately:
1. **Highlight constraints**: Recruiters love engineers who know *why* they built something offline. Highlight issues like *\"Architected an offline chatbot solution bypasses heavy cloud subscription APIs and maintains enterprise data privacy constraints.\"*
2. **Standardize Layouts**: Keep formatting ATS-compliant, black-and-white, single-page, with clean sans-serif/serif typography.
3. **Use Strong Action Verbs**: Begin project descriptions with impactful verbs like *Optimized*, *Architected*, *Engineered*, *Deployed*, or *Refactored*.`;
  }

  if (normalized.includes("prepare") && normalized.includes("interview")) {
    return `To successfully prepare for technical & behavioral interviews:
1. **Master the STAR Method**: Frame your project stories by explaining the **S**ituation, **T**ask, **A**ction, and **R**esult. (e.g., *"Because our api keys had quota limits, I configured a resilient offline local simulation layer to keep chatbot runtimes completely uninterrupted."*)
2. **Code walkthroughs**: Practice articulating your thoughts out loud while writing algorithms (recursion, array manipulation, loop optimization).
3. **Understand your architecture**: Be prepared to explain why you chose Streamlit and Ollama (minimal overhead, quick setup, local privacy).`;
  }

  if (normalized.includes("data science") || normalized.includes("skills") && normalized.includes("data")) {
    return `Key skills needed to break into **Data Science** in 2026:
1. **Mathematics & Stats**: Probability, linear algebra, hypothesis testing, and regression analysis.
2. **Programming Core**: Solid mastery of **Python** and structured **SQL** databases.
3. **Data Manipulation**: Manipulation using libraries like \`pandas\`, \`numpy\`, and \`scikit-learn\`.
4. **LLM Integration**: Knowledge of deploying lightweight models locally via **Ollama**, optimizing memory usages, and structured prompting.`;
  }

  // 4. Greetings and general conversations
  if (normalized === "hi" || normalized === "hello" || normalized === "hey") {
    return `Hello! I am Jahnavi's AI Assistant, powered by Llama 3.2 and running locally through Ollama.

How can I help you today?`;
  }

  if (normalized.includes("joke")) {
    return `Here is a local developer joke for you:

**Why do programmers prefer using an offline dark mode?**
*Because light attracts bugs!* 💡🐛

(Running local inference also saves you from cloud-based laughter charges!)`;
  }

  if (normalized.includes("quote") || normalized.includes("motivation")) {
    return `Here is some motivation for your coding journey:

> *"The best way to predict the future is to invent it."* — Alan Kay

Whether you are debugging a python script or configuring complex local models on your computer, every error solved is a step towards greatness. Keep building!`;
  }

  // Default smart fallback response based on input keyword
  const keywords = query.split(" ").filter(w => w.length > 4).slice(0, 3);
  const keywordSection = keywords.length > 0 ? `regarding your query on **${keywords.join(" ")}**` : "to your input";

  return `Hello! As a local **Llama 3.2** assistant simulated offline, here is some insight ${keywordSection}:

Running your LLM prompts completely locally on port 11434 with Ollama provides excellent security, infinite free testing, and instant feedback.

To address this study, code, or project planning question:
1. **Verify Ollama daemon**: Always open the Ollama terminal or system tray on your desktop before executing \`streamlit run app.py\`.
2. **Model deployment check**: Confirm the Llama 3.2 weights are loaded locally on your machine.
3. **Code integrations**: Use Python's native \`ollama.chat(model='llama3.2', messages=[...])\` inside your code to route request payloads offline.

Let me know if you would like me to explain more about python lists, recursive functions, or portfolio resume write-ups!`;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for simulated chatbot using Gemini 3.5 Flash
  app.post("/api/chat", async (req, res) => {
    const { messages, systemInstruction } = req.body;

    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: "Invalid request payload. 'messages' must be an array." });
      return;
    }

    // Custom Greeting check
    const lastUserMessage = messages.length > 0 ? messages[messages.length - 1] : null;
    if (lastUserMessage && lastUserMessage.role === "user") {
      const text = (lastUserMessage.content || "").trim().toLowerCase().replace(/[!.?]$/, "");
      if (text === "hi" || text === "hello" || text === "hey") {
        res.json({
          content: "Hello! I am Jahnavi's AI Assistant, powered by Llama 3.2 and running locally through Ollama.\n\nHow can I help you today?",
        });
        return;
      }
    }

    try {
      const client = getGeminiClient();

      // Convert standard chat history (role: user/assistant) to Gemini structure (role: user/model)
      const formattedContents = messages.map((m: { role: string; content: string }) => {
        return {
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        };
      });

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: formattedContents,
        config: {
          systemInstruction: systemInstruction || "You are Llama 3.2, a lightweight locally hosted AI assistant powered by Ollama. Answer in a cheerful, clear, and beginner-friendly conversational manner appropriate for students.",
          temperature: 0.7,
        },
      });

      res.json({
        content: response.text || "I'm sorry, I couldn't generate a response. Please try again.",
      });
    } catch (error: any) {
      console.warn("Gemini API Error - Switching to Simulator Local Fallback:", error.message || error);
      
      // Get the last user message to extract subject
      const userMessage = messages.length > 0 ? messages[messages.length - 1].content : "Hello";
      const fallbackResponse = generateSimulatedResponse(userMessage);

      res.json({
        content: fallbackResponse,
      });
    }
  });

  // Serve static assets or mount Vite middleware
  if (process.env.NODE_ENV !== "production") {
    console.log("Running in development mode with Vite middleware.");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Running in production mode, serving pre-built static files.");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start Express/Vite server:", err);
});
