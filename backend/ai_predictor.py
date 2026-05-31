import os

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer


class AIPredictor:
    def __init__(self, incident_csv_path: str):
        self.incident_csv_path = incident_csv_path
        self.model = None
        self.feature_pipeline = None

    def train(self):
        if not os.path.exists(self.incident_csv_path):
            self._create_default_dataset()

        df = pd.read_csv(self.incident_csv_path)
        if 'risk_score' not in df.columns:
            raise ValueError('Incident dataset must contain risk_score column.')

        feature_columns = ['location', 'hour', 'day_of_week', 'traffic_level', 'weather']
        X = df[feature_columns]
        y = df['risk_score']

        categorical_features = ['location', 'weather']
        numeric_features = ['hour', 'day_of_week', 'traffic_level']

        self.feature_pipeline = ColumnTransformer(
            transformers=[
                ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features),
                ('num', StandardScaler(), numeric_features),
            ]
        )

        self.model = Pipeline(
            steps=[
                ('preprocessor', self.feature_pipeline),
                ('regressor', RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)),
            ]
        )

        self.model.fit(X, y)

    def predict(self, locations):
        if self.model is None:
            raise RuntimeError('AI predictor has not been trained.')

        rows = []
        for location in locations:
            rows.append(
                {
                    'location': location,
                    'hour': 12,
                    'day_of_week': 3,
                    'traffic_level': 3,
                    'weather': 'clear',
                }
            )

        X = pd.DataFrame(rows)
        predictions = self.model.predict(X)
        predictions = np.clip(predictions, 0.0, 1.0)
        return [{'location': row['location'], 'score': float(score)} for row, score in zip(rows, predictions)]

    def _create_default_dataset(self):
        rows = []
        locations = [
            'Aga Khan Hospital',
            'City Hospital',
            'Liaquat Hospital',
            'Saddar',
            'Clifton',
            'Gulshan',
            'PECHS',
            'Defence',
            'Korangi',
            'Landhi',
            'Malir',
            'Lyari',
            'North Nazimabad',
            'Orangi',
        ]
        weather = ['clear', 'rainy', 'foggy']
        for location in locations:
            for hour in [8, 12, 17, 21]:
                for day in [1, 3, 5]:
                    for traffic in [1, 2, 3, 4, 5]:
                        base = 0.2
                        if location in ['Lyari', 'Korangi', 'Landhi']:
                            base += 0.25
                        if traffic >= 4:
                            base += 0.2
                        if weather[traffic % len(weather)] == 'rainy':
                            base += 0.15
                        risk = min(1.0, max(0.0, base + hour / 48 - day * 0.02 + np.random.normal(0, 0.05)))
                        rows.append(
                            {
                                'location': location,
                                'hour': hour,
                                'day_of_week': day,
                                'traffic_level': traffic,
                                'weather': weather[traffic % len(weather)],
                                'risk_score': round(risk, 3),
                            }
                        )
        os.makedirs(os.path.dirname(self.incident_csv_path), exist_ok=True)
        pd.DataFrame(rows).to_csv(self.incident_csv_path, index=False)
