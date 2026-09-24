# Dataset Information

The training dataset used for this project is **WELFake** (Word Embedding Over Linguistic Features for Fake News Detection).

- **Total records:** 72,134 news articles (35,028 Real, 37,106 Fake)
- **Source:** [Kaggle WELFake Dataset](https://www.kaggle.com/datasets/saurabhshahane/fake-news-classification) / IEEE DataPort
- **Format:** `Dataset.csv` containing columns `['Unnamed: 0', 'title', 'text', 'label']`

> **Note:** Due to GitHub's file size limit (100MB), the 245MB `Dataset.csv` file is excluded from this repository via `.gitignore`. Download `Dataset.csv` from Kaggle and place it inside this `data/` folder before running `python scripts/train.py`.
