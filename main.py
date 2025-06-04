from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from linter import lint_python
import uvicorn

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or restrict to ["http://localhost:1234"] if you want
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Code(BaseModel):
    code: str

@app.post("/lint")
def lint(code: Code):
    x = lint_python(code.code)
    print(x)
    return x

if __name__ == "__main__":
    uvicorn.run("main:app", reload=True)
