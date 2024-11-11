import { IEventForm } from "../../interfaces";

export function formatForCosineModelCompute(eventForm: IEventForm[]) {
    // this format of text Pregunta: {pregunta}, Respuesta: {respuesta}... Pregunta: {pregunta}, Respuesta: {respuesta}

    const matrix = eventForm.map((eventForm) => {
        return `Pregunta: ${eventForm.question.question} Respuesta: ${eventForm.answer}`;
    });

    return matrix.join('... ');
    
}