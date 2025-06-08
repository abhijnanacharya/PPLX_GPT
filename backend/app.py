from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from duckduckgo_search import DDGS
from openai import AsyncOpenAI
import os
import faiss
import numpy as np

load_dotenv()
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

chat_sessions = {}

async def get_embedding(text: str) -> list[float]:
    response = await client.embeddings.create(
        model="text-embedding-3-small",
        input=[text]
    )
    return response.data[0].embedding

async def search_and_embed(query: str, num_results=8, top_k=4):
    with DDGS() as ddgs:
        raw_results = list(ddgs.text(query, max_results=num_results))

    docs = [
        f"{r.get('title', '')}: {r.get('body', '')}" for r in raw_results
    ]

    embeddings = []
    for doc in docs:
        emb = await get_embedding(doc)
        embeddings.append(emb)

    dimension = len(embeddings[0])
    index = faiss.IndexFlatL2(dimension)
    index.add(np.array(embeddings))

    query_emb = np.array([await get_embedding(query)])
    distances, indices = index.search(query_emb, top_k)

    selected = []
    citation_map = {}
    for idx, rank in enumerate(indices[0]):
        r = raw_results[rank]
        snippet = f"[{idx+1}] {r['title']}: {r['body']} ({r['href']})"
        citation_map[str(idx+1)] = {"title": r['title'], "url": r['href']}
        selected.append(snippet)

    return "\n".join(selected), citation_map

@app.post("/ask/stream")
async def ask_stream(request: Request):
    data = await request.json()
    question = data["question"]
    user_id = data.get("user_id", "default")

    if user_id not in chat_sessions:
        chat_sessions[user_id] = []

    context, citation_map = await search_and_embed(question)

    conversation_history = "\n".join(
        [f"Q: {entry['question']}\nA: {entry['answer']}" for entry in chat_sessions[user_id]]
    )

    synth_prompt = (
        f"You are a helpful assistant. Use the following search result snippets to answer the question. "
        f"Try to extract relevant factual data, and if it includes temperatures in Fahrenheit, convert it to Celsius when asked. "
        f"If you find multiple values, use the most recent one mentioned. Include citation numbers like [1] when appropriate.\n\n"
        f"Make sure to include the correct citation number in your answer.\n"
        f"Combine your knowledge with the search results to provide a detailed answer.\n\n"
        f"Search Results:\n{context}\n"
        f"Conversation History:\n{conversation_history}\n"
        f"User Question: {question}\n"
        f"Answer:"
    )



    async def event_stream():
        accumulated_content = []
        try:
            stream = await client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": synth_prompt}],
                stream=True,
                temperature=0.2,
                max_tokens=1000
            )

            async for chunk in stream:
                content = chunk.choices[0].delta.content or ""
                if content:
                    accumulated_content.append(content)
                    yield content

            full_answer = "".join(accumulated_content)
            chat_sessions[user_id].append({
                "question": question,
                "answer": full_answer,
                "sources": citation_map
            })

        except Exception as e:
            yield f"Error: {str(e)}\n"
            chat_sessions[user_id].append({
                "question": question,
                "answer": f"Error: {str(e)}",
                "sources": []
            })

    return StreamingResponse(event_stream(), media_type="text/plain")

@app.post("/ask/sources")
async def ask_sources(request: Request):
    data = await request.json()
    question = data["question"]
    context, citation_map = await search_and_embed(question)
    sources_with_snippet = []
    for ref_num, ref in citation_map.items():
        # Extract the corresponding snippet from the search result using the context text
        lines = context.split("\n")
        snippet_line = next((line for line in lines if line.startswith(f"[{ref_num}]")), "")
        snippet = snippet_line.split(":", 1)[-1].strip() if ":" in snippet_line else ""

        sources_with_snippet.append({
            "title": ref["title"],
            "url": ref["url"],
            "snippet": snippet
        })

    return {"sources": sources_with_snippet}