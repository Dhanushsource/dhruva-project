# Career recommendation ML pipeline

`data/career_recommendation.csv` is a small, clearly labelled synthetic development dataset. It exists to make local demos reproducible and must not be presented as a real-world benchmark.

Run `python ml/training/train_models.py` after installing `requirements.txt`. The script compares Decision Tree, Random Forest, and KNN using accuracy, precision, recall, and F1, then saves the best model and metrics under `ml/models/`.
