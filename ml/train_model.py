"""
SafeRoute AI - safety scoring model training script.

Trains a RandomForestClassifier on synthetic route-segment data to predict
whether a segment is "safe" (1) or "risky" (0), using the same feature set
the backend's heuristic scorer (backend/src/services/safetyScoring.js) is
modeled after:

  - lighting_score        (0-1, streetlight density proxy)
  - crowd_density         (0-1, footfall estimate)
  - incident_rate         (0-1, historical incident density)
  - distance_to_safe_point_km (proximity to police/hospital/open shop)
  - hour_of_day           (0-23)

Replace `generate_synthetic_data()` with a loader for real open crime /
city-safety datasets once available, then re-run this script to produce
an updated model.joblib for the backend (or a FastAPI model-serving layer)
to load.

Usage:
    pip install -r requirements.txt
    python train_model.py
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, roc_auc_score
import joblib

RANDOM_SEED = 42


def generate_synthetic_data(n=4000, seed=RANDOM_SEED):
    rng = np.random.default_rng(seed)

    lighting_score = rng.uniform(0, 1, n)
    crowd_density = rng.uniform(0, 1, n)
    incident_rate = rng.uniform(0, 1, n)
    distance_to_safe_point_km = rng.exponential(1.0, n).clip(0, 5)
    hour_of_day = rng.integers(0, 24, n)

    # Night hours penalize safety; encode as a simple risk multiplier
    night_penalty = np.where((hour_of_day >= 22) | (hour_of_day < 5), 0.35, 0.0)
    dusk_penalty = np.where((hour_of_day >= 19) & (hour_of_day < 22), 0.15, 0.0)

    # Ground-truth "safety probability" combines features with the same
    # intuition the pitch describes, plus noise so the model has something
    # non-trivial to learn.
    safety_prob = (
        0.30 * lighting_score
        + 0.18 * crowd_density
        + 0.30 * (1 - incident_rate)
        + 0.12 * (1 - (distance_to_safe_point_km / 5))
        - night_penalty
        - dusk_penalty
        + rng.normal(0, 0.05, n)
    )
    safety_prob = np.clip(safety_prob, 0, 1)
    label = (safety_prob > 0.5).astype(int)

    df = pd.DataFrame(
        {
            "lighting_score": lighting_score,
            "crowd_density": crowd_density,
            "incident_rate": incident_rate,
            "distance_to_safe_point_km": distance_to_safe_point_km,
            "hour_of_day": hour_of_day,
            "is_safe": label,
        }
    )
    return df


def main():
    df = generate_synthetic_data()
    feature_cols = [
        "lighting_score",
        "crowd_density",
        "incident_rate",
        "distance_to_safe_point_km",
        "hour_of_day",
    ]
    X = df[feature_cols]
    y = df["is_safe"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=RANDOM_SEED, stratify=y
    )

    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=8,
        random_state=RANDOM_SEED,
        class_weight="balanced",
    )
    model.fit(X_train, y_train)

    preds = model.predict(X_test)
    probs = model.predict_proba(X_test)[:, 1]

    print("Classification report:")
    print(classification_report(y_test, preds))
    print(f"ROC AUC: {roc_auc_score(y_test, probs):.3f}")

    print("\nFeature importances (use these to sanity-check backend weights):")
    for name, importance in sorted(
        zip(feature_cols, model.feature_importances_), key=lambda x: -x[1]
    ):
        print(f"  {name:28s} {importance:.3f}")

    joblib.dump(model, "model.joblib")
    print("\nSaved trained model to ml/model.joblib")


if __name__ == "__main__":
    main()
