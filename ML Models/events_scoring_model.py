import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Load the user responses data

class CosineRecommendationSystem:
    def __init__(self, df: pd.DataFrame):
        self.df = df
        self.tkndata = None;

    def tokenize(self, column: str):
        """
        Tokenize the given column of the dataframe and save the result internally.
        
        Parameters
        ----------
        column : str
            The column of the dataframe to tokenize.
        
        Returns
        -------
        None
        """
        
        self.tfidf = TfidfVectorizer()
        tfidf_matrix = self.tfidf.fit_transform(self.df[column])
        self.tknmatrix = tfidf_matrix

    def transform(self, new_user_answers: str):
        """
        Predict the top similar users based on the new user's answers.

        Parameters
        ----------
        new_user_answers : str
            The new user's answers.

        Returns
        -------
        pd.DataFrame
            The top similar users based on the new user's answers.
        """
        new_user_vector = self.tfidf.transform([new_user_answers])
        self.tkndata = new_user_vector



    def cosine_similarity(self):
        if (self.tkndata is None) or (self.tknmatrix is None):
            raise ValueError("Please tokenize and transform the data first.")
        self.cosine_sim = cosine_similarity(self.tkndata, self.tknmatrix).flatten()
        return self.cosine_sim

    def get_top_n(self, n: int):
        top_indx = self.cosine_sim.argsort()[-n:][::-1]
        return self.df.iloc[top_indx[1:]]

df = pd.DataFrame({
    'user_id': [1, 2, 3, 4, 5],
    'answers': [
        "outdoor, evening, buffet, live-music",
        "indoor, morning, vegan, DJ",
        "outdoor, afternoon, buffet, live-band",
        "indoor, evening, snacks, acoustic-music",
        "outdoor, morning, plated-meal, DJ"
    ]
})


# Vectorize the answers using TF-IDF
cossystem = CosineRecommendationSystem(df)
cossystem.tokenize('answers')
cossystem.transform("outdoor, snacks, acoustic-music")
cossystem.cosine_similarity()
top_similar_users = cossystem.get_top_n(4)

print("Top similar users based on answers:")
print(top_similar_users)