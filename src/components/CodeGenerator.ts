import { AppModel, AssistantPersona } from "../types";

export function getAppPyCode(model: AppModel, persona: AssistantPersona, systemInstruction: string): string {
  const personaComments = {
    [AssistantPersona.STUDY_SUPPORT]: "# Specially focused on general study, math, and scientific concepts.",
    [AssistantPersona.CODING_ASSISTANCE]: "# Tailored to help debug, explain, and write clean code snippets.",
    [AssistantPersona.CAREER_GUIDANCE]: "# Configured to offer career planning tips, learning paths, and resume guidelines.",
    [AssistantPersona.GENERAL_CONVERSATION]: "# Great for everyday chatter, jokes, motivation, and warm greetings.",
  };

  return `import streamlit as st
import ollama

# Set Page Config - White background and standard clean layout
st.set_page_config(
    page_title="Local AI Chatbot",
    page_icon="💬",
    layout="centered",
    initial_sidebar_state="expanded"
)

# Custom Theme Styling using Streamlit Markdown CSS Inject
st.markdown("""
<style>
    /* Styling Streamlit Main Container to keep it clean and minimal */
    .stApp {
        background-color: #FFFFFF;
        color: #111111;
    }
    
    /* Elegant styling for buttons */
    div.stButton > button {
        background-color: #E1F5FE; /* Light blue accent */
        color: #0277BD;
        border: 1px solid #B3E5FC;
        border-radius: 4px;
        padding: 6px 16px;
        font-weight: 500;
        transition: all 0.2s ease-in-out;
    }
    div.stButton > button:hover {
        background-color: #0277BD;
        color: #FFFFFF;
        border-color: #0277BD;
    }
    
    /* Warning or Error styled alerts */
    .stAlert {
        border-radius: 4px;
    }
</style>
""", unsafe_allow_html=True)

# Page Header
st.title("Local AI Chatbot")
st.write("### A locally hosted AI assistant powered by Ollama and ${model}")

# Set Assistant Persona Prompt
SYSTEM_PROMPT = """${systemInstruction.replace(/"/g, '\\"')}"""

# Initialize Chat Session State for History
if "messages" not in st.session_state:
    st.session_state["messages"] = [
        {"role": "assistant", "content": "Hello! I am your locally running ${model} chatbot. How can I assist you with your studies, coding, or career planning today?"}
    ]

# Sidebar Configuration
with st.sidebar:
    st.title("⚙️ Workspace Options")
    st.markdown("---")
    st.info("💡 **Local Project Mode**\\nThis application runs 100% locally on your system using Ollama. No API keys are required.")
    
    # Selected Model info
    st.markdown("### Selected LLM")
    st.code("${model}")
    
    st.markdown("### Current Active Focus")
    st.info("${persona.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}")
    
    # Quick utility to restart chat
    st.markdown("---")
    if st.button("🧼 Clear Chat History"):
        st.session_state["messages"] = [
            {"role": "assistant", "content": "Session cleared! Hello again, ready to chat!"}
        ]
        st.rerun()

# Display Chat History
for msg in st.session_state["messages"]:
    if msg["role"] == "user":
        with st.chat_message("user"):
            st.write(msg["content"])
    else:
        with st.chat_message("assistant"):
            st.write(msg["content"])

# User Chat Input
if user_input := st.chat_input("Ask a question (e.g. 'Explain Python loops')..."):
    # Add User Content to memory
    st.session_state["messages"].append({"role": "user", "content": user_input})
    with st.chat_message("user"):
        st.write(user_input)

    # Spinner while contacting Ollama Local Server
    with st.spinner("Llama 3.2 is thinking..."):
        try:
            # Build query with system instruction injected at top
            formatted_messages = [{"role": "system", "content": SYSTEM_PROMPT}]
            for msg in st.session_state["messages"]:
                formatted_messages.append({"role": msg["role"], "content": msg["content"]})

            # Call local Ollama client library
            response = ollama.chat(
                model="${model}",
                messages=formatted_messages,
                options={
                    "temperature": 0.7
                }
            )
            
            assistant_response = response["message"]["content"]
            
            # Show assistant message in UI
            st.session_state["messages"].append({"role": "assistant", "content": assistant_response})
            with st.chat_message("assistant"):
                st.write(assistant_response)
                
        except ollama.ResponseError as e:
            if e.status_code == 404:
                st.error("Model not found. Please run:\\n\\n\`ollama pull ${model}\`")
            else:
                st.error(f"Ollama server response error: {e.error}")
        except Exception as e:
            st.error("Ollama is not running. Please start Ollama and try again.")
`;
}

export function getRequirementsTxt(): string {
  return `streamlit>=1.35.0
ollama>=0.2.1
`;
}

export function getReadmeMd(model: AppModel): string {
  return `# Local AI Chatbot using Ollama

A simple, lightweight, locally-hosted AI chatbot that provides conversational assistance, study support, general guidance, and question answering using Large Language Models running entirely on the user's computer via Ollama. 

This project is beginner-friendly and serves as an excellent demonstration of **Python, Streamlit, Generative AI, and Private LLMs** for a student resume or portfolio.

---

## 🚀 Key Features
- **Study Support**: Instant explanations of complex concepts (loops, data models, neural networks).
- **Coding Assistance**: Fast code explanations, function writing, and syntax debugging.
- **Career Guidance**: Real resume tips, learning roadmaps, and career development tricks.
- **Private & Secular**: Calls run 100% on localhost. No cloud servers, no premium API keys needed!
- **Sleek UI**: Minimalist, high contrast Streamlit dashboard.

---

## 🛠️ Step-by-Step Local Setup

### Step 1: Install Ollama
1. Download Ollama for your operating system (Mac, Windows, or Linux) from [ollama.com](https://ollama.com/).
2. Install the executable on your system.

### Step 2: Retrieve the AI Model
Launch your system terminal (Command Prompt, terminal, etc.) and download the lightweight 3B parameter model:
\`\`\`bash
ollama pull ${model}
\`\`\`
Verify it works by starting a quick terminal conversation:
\`\`\`bash
ollama run ${model}
\`\`\`
Type \`/exit\` to exit.

### Step 3: Setup Project Directory
1. Assemble a new folder called \`local-ollama-chatbot\` and open it in VS Code or your editor of choice.
2. Create standard files:
   - \`app.py\` (paste the generated web interface code)
   - \`requirements.txt\` (paste library dependencies)

### Step 4: Install Dependencies
Open your shell terminal in the project directory, and run:
\`\`\`bash
pip install -r requirements.txt
\`\`\`

### Step 5: Execute Streamlit
With Ollama running in the background, run the script:
\`\`\`bash
streamlit run app.py
\`\`\`
This will load and launch a local webserver and launch your brand-new chatbot UI in your browser at:
**\`http://localhost:8501\`**

---

## 🧠 Technology Stack
- **Python 3.10+** (Core environment)
- **Streamlit** (Clean responsive web-interface)
- **Ollama** (Private hardware-optimized LLM agent router)
- **${model}** (Lightweight high-intelligence local LLM)

## 🧼 Error Resolution
- **"Ollama is not running"**: Make sure you opened the Ollama service on your taskbar.
- **"Model not found"**: Type \`ollama pull ${model}\` in the command prompt.
`;
}

export function getGitignore(): string {
  return `# Byte-compiled / optimized / DLL files
__pycache__/
*.py[cod]
*$py.class

# Distribution / packaging
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
share/python-wheels/
*.egg-info/
.installed.cfg
*.egg

# Virtual environments
.venv/
venv/
ENV/
env/
active_env/

# IDE files
.vscode/
.idea/
.DS_Store
`;
}
