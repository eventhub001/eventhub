from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd

from events_scoring_model import CosineRecommendationSystem


model = SentenceTransformer('bert-base-nli-mean-tokens')
def get_embedding(sentences: list[str]):
    return model.encode(sentences=sentences)

def predict(sentence: str, test: list[str]):
    sentence_embedded = get_embedding(sentence)
    test_embedded = get_embedding(test)
    return cosine_similarity([sentence_embedded], test_embedded)

if __name__ == "__main__":
    sentences = [
        '''
        Pregunta: ¿Qué necesitas para tu evento? Alfombra roja, Barra de bebidas, DJ,
        Pregunta: ¿Qué rango de personas? 20-70,
        Pregunta: ¿Cuál es el objetivo de tu evento? Celebrar el amor, experiencia memorable, ambiente romántico,
        Pregunta: ¿Qué elementos contiene el lugar del evento? Carpa exterior, Pista de baile, Sistema de sonido,
        Pregunta: ¿Qué rango de presupuesto considera? Medio presupuesto,
        ''',
        '''
        Pregunta: ¿Qué necesitas para tu evento? Carpa, Centros de mesa, Iluminación,
        Pregunta: ¿Qué rango de presupuesto considera? Presupuesto pequeño,
        Pregunta: ¿Cuál es el objetivo de tu evento? Crear recuerdos, ambiente temático, interacción social,
        Pregunta: ¿Qué elementos contiene el lugar del evento? Zona infantil, Karaoke, Cabina de fotos,
        Pregunta: ¿Qué rango de personas? 10-30,
        ''',
        '''
        Pregunta: ¿Qué rango de presupuesto considera? Sin limite,
        Pregunta: ¿Qué elementos contiene el lugar del evento? Escenario, Zona de fotos, Decoración temática,
        Pregunta: ¿Cuál es el objetivo de tu evento? Reconocer logros, fortalecer lazos, celebrar éxitos,
        Pregunta: ¿Qué rango de personas? Más de 70,
        Pregunta: ¿Qué necesitas para tu evento? Flores, Presentador, DJ,
        ''',
        '''
        Pregunta: ¿Qué rango de presupuesto considera? Sin limite,
        Pregunta: ¿Qué elementos contiene el lugar del evento? Altar simbólico, Espacio techado, Pista de baile,
        Pregunta: ¿Cuál es el objetivo de tu evento? Celebrar el amor, crear ambiente romántico, experiencia memorable,
        Pregunta: ¿Qué rango de personas? Más de 70,
        Pregunta: ¿Qué necesitas para tu evento? Barra de bebidas, Flores, Sonido profesional,        
        '''
    ]

    frame = pd.DataFrame({
            'id': range(1, len(sentences) + 1),
            'event_form_answers': sentences
    })

    print(predict(sentences[0], sentences[1:]))

    model = CosineRecommendationSystem(frame)
    model.tokenize("event_form_answers")
    model.transform(sentences[0])
    model.cosine_similarity()
    print(model.get_top_n(3).iloc[0]["event_form_answers"])