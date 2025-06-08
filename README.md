# Perplex\_GPT: Perplexity-Inspired Grounded LLM Search Engine 🌐🔍

**Perplex\_GPT** is a Perplexity.ai-inspired search engine that combines real-time internet search with an LLM-based response system. It grounds responses in fresh, verifiable data from the web — helping users get accurate and up-to-date answers.

---

## ✨ Features

* 🔎 **Real-time Web Search**
  Integrates with DuckDuckGo to fetch the latest search results.

* 🧠 **LLM-Based Answer Generation**
  Uses OpenAI models (e.g. GPT-4/3.5) to synthesize natural language answers.

* 📚 **Grounded Responses**
  Embeds retrieved documents using OpenAI embeddings + FAISS vector search to ensure factual grounding and reduce hallucination.

* ⚡ **Streaming Interface**
  FastAPI backend streams responses token-by-token to a responsive Next.js frontend.

* 💻 **Modern UI**
  Next.js based search UI inspired by Perplexity.ai design.

---

## 🏗️ Project Structure

```
PERPLEX_GPT/
├── backend/             # FastAPI app for search, embeddings, LLM orchestration
├── frontend/search-ui/  # Next.js frontend UI
├── .env                 # API keys and config (ignored)
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/abhijnanacharya/PPLX_GPT.git
cd perplex_gpt
```

### 2️⃣ Backend Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Configure your `.env` file:

```env
OPENAI_API_KEY=your_openai_key
DUCKDUCKGO_API_URL=optional_custom_api_if_any<for_Unlimited_Search> I AM TOO BROKE TOO AFFORD API KEYS LOL :')
```

Run the backend:

```bash
uvicorn app:app --reload
```

### 3️⃣ Frontend Setup

```bash
cd frontend/search-ui
npm install
```

Configure your `.env` for Next.js if needed.

Run the frontend:

```bash
npm run dev
```

---

## 🗉️ Demo Screenshot

<img width="1510" alt="Screenshot 2025-06-07 at 11 31 34 PM" src="https://github.com/user-attachments/assets/53e3b699-c216-43c3-bd00-f6e1f7e3abcb" />


---

## 📜 Tech Stack

* **Backend:** FastAPI, FAISS, OpenAI Embeddings + LLM APIs
* **Frontend:** Next.js, React, TypeScript, TailwindCSS
* **Search:** DuckDuckGo API (or other web search APIs)
* **Streaming:** Token-based streaming via FastAPI + React Hooks

---

## 🗟️ Roadmap

* [ ] Add support for citations in the UI
* [ ] Implement user query history
* [ ] Add caching for repeated queries
* [ ] Deploy on Vercel + Fly.io / Render backend
* [ ] Explore multi-search source fusion (news + Wikipedia + academic)

---

## 🤝 Contributing

PRs welcome! Please open an issue first to discuss major changes.

---

## 📝 License

MIT License.

---

## Acknowledgements

* Inspired by **Perplexity.ai**.
* Powered by **OpenAI**, **FAISS**, **DuckDuckGo**.

---
