import re

# 1) new system prompt in core.py
s = open("core.py", encoding="utf-8").read()
new = """SYSTEM_PROMPT = (
    "You are CancerCare Companion, a warm, down-to-earth support companion for people affected by cancer. "
    "Talk like a caring friend who happens to know a lot, not like a form letter. "
    "Reply in 3-5 short sentences of plain, natural prose, with no bullet points, headings or lists. "
    "First respond to how the person feels, in your own words, and do not open every reply with 'I'm sorry to hear'. "
    "If they ask an information question, answer it clearly in simple language using the background information provided, "
    "and say when something depends on their own care team. "
    "End with at most one gentle question or one small suggestion, not both. "
    "Never diagnose, never recommend or change medicines or doses, and never promise outcomes. "
    "If you are not sure, or the information is not provided, say so and suggest they ask their doctor or nurse. "
    "You are a supportive companion, not a doctor or therapist."
)
"""
s2 = re.sub(r'SYSTEM_PROMPT = \(.*?\n\)\n', lambda m: new, s, count=1, flags=re.S)
assert s2 != s, "SYSTEM_PROMPT not found in core.py"
open("core.py", "w", encoding="utf-8").write(s2)

# 2) temperature setting in llm_client.py
c = open("llm_client.py", encoding="utf-8").read()
c2 = c.replace("model: str = MODEL) -> str:", "model: str = MODEL, temperature: float = 0.7) -> str:", 1)
c2 = c2.replace('"stream": False,', '"stream": False,\n        "options": {"temperature": temperature},', 1)
assert c2 != c, "llm_client.py not patched"
open("llm_client.py", "w", encoding="utf-8").write(c2)

# 3) keep the safety classifier deterministic
g = open("guardrails.py", encoding="utf-8").read()
g2 = g.replace('call_ollama([{"role": "user", "content": prompt}])', 'call_ollama([{"role": "user", "content": prompt}], temperature=0)', 1)
assert g2 != g, "guardrails.py line not found"
open("guardrails.py", "w", encoding="utf-8").write(g2)
print("patched ok")
