"""
setup_nltk.py
-------------
Downloads required NLTK datasets and resources for text preprocessing in the Fake News Detection pipeline.
Resources:
- stopwords: Common words (e.g. 'the', 'is') filtered during text normalization.
- punkt & punkt_tab: Sentence and word tokenizers.
- wordnet & omw-1.4: Lexical database for lemmatization.
"""

import sys

def download_nltk_resources():
    print("[*] Checking and downloading required NLTK resources...")
    try:
        import nltk
    except ImportError:
        print("[!] Error: nltk is not installed. Please install requirements first.", file=sys.stderr)
        sys.exit(1)

    resources = [
        "stopwords",
        "punkt",
        "punkt_tab",
        "wordnet",
        "omw-1.4"
    ]

    for resource in resources:
        try:
            print(f" -> Downloading '{resource}'...")
            nltk.download(resource, quiet=False)
        except Exception as e:
            print(f"[!] Warning: Could not download '{resource}': {e}", file=sys.stderr)

    print("\n[+] All core NLTK resources downloaded and verified successfully!")

if __name__ == "__main__":
    download_nltk_resources()
