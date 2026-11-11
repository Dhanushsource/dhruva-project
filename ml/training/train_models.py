"""Train and compare development models on the documented synthetic dataset."""
from pathlib import Path
import json

import pandas as pd
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
import joblib


ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "ml" / "data" / "career_recommendation.csv"
MODEL_DIR = ROOT / "ml" / "models"


def main() -> None:
    dataframe = pd.read_csv(DATA)
    features = dataframe.drop(columns=["recommended_domain", "education_level", "stream"])
    labels = LabelEncoder().fit_transform(dataframe["recommended_domain"])
    train_features, test_features, train_labels, test_labels = train_test_split(features, labels, test_size=.4, random_state=42, stratify=labels)
    candidates = {"decision_tree": DecisionTreeClassifier(max_depth=5, random_state=42), "random_forest": RandomForestClassifier(n_estimators=100, random_state=42), "knn": KNeighborsClassifier(n_neighbors=3)}
    metrics = {}
    best_name, best_f1 = "", -1
    for name, model in candidates.items():
        model.fit(train_features, train_labels)
        predictions = model.predict(test_features)
        result = {"accuracy": accuracy_score(test_labels, predictions), "precision": precision_score(test_labels, predictions, average="weighted", zero_division=0), "recall": recall_score(test_labels, predictions, average="weighted", zero_division=0), "f1": f1_score(test_labels, predictions, average="weighted", zero_division=0)}
        metrics[name] = result
        if result["f1"] > best_f1:
            best_name, best_f1 = name, result["f1"]
    MODEL_DIR.mkdir(exist_ok=True)
    joblib.dump(candidates[best_name], MODEL_DIR / "career_domain_model.joblib")
    (MODEL_DIR / "metrics.json").write_text(json.dumps({"dataset": "synthetic development dataset", "selected_model": best_name, "models": metrics}, indent=2), encoding="utf-8")
    print(json.dumps({"selected_model": best_name, "metrics": metrics}, indent=2))


if __name__ == "__main__":
    main()
