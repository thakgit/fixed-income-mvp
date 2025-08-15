import re, math, hashlib, json, uuid
from typing import List

DIM = 128
TOKEN_RE = re.compile(r"[A-Za-z0-9_]+")


def _tokenize(text: str) -> List[str]:
    return TOKEN_RE.findall(text.lower())


def _bucket(tok: str) -> int:
    # deterministic bucket via sha1
    h = hashlib.sha1(tok.encode()).digest()
    return int.from_bytes(h[:2], 'big') % DIM


def embed(text: str) -> List[float]:
    vec = [0.0]*DIM
    toks = _tokenize(text)
    if not toks:
        return vec
    for t in toks:
        vec[_bucket(t)] += 1.0
    # l2 normalize
    norm = math.sqrt(sum(x*x for x in vec)) or 1.0
    return [x/norm for x in vec]


def cosine(a: List[float], b: List[float]) -> float:
    return float(sum(x*y for x,y in zip(a,b)))


def chunk(text: str, target=800, overlap=100) -> List[str]:
    words = text.split()
    chunks, i = [], 0
    while i < len(words):
        piece = words[i:i+target]
        if not piece: break
        chunks.append(" ".join(piece))
        i += target - overlap
    return chunks or ([text] if text else [])