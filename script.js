// Este URL será o do seu backend no Railway.app após o deploy.
// Por enquanto, usaremos um placeholder. Lembre-se de ATUALIZAR este valor!
const BACKEND_BASE_URL = 'https://seu-backend-aqui.railway.app'; // Ex: https://enem-encceja-backend-xxxx.railway.app

const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const submitAnswerBtn = document.getElementById('submit-answer-btn');
const loadNextQuestionBtn = document.getElementById('load-next-question-btn');
const feedbackMessage = document.getElementById('feedback-message');
const correctCountSpan = document.getElementById('correct-count');
const incorrectCountSpan = document.getElementById('incorrect-count');

let currentQuestion = null;
let correctAnswers = 0;
let incorrectAnswers = 0;

// Função para carregar uma nova questão do backend
async function loadQuestion() {
    questionText.textContent = 'Carregando questão...';
    optionsContainer.innerHTML = '';
    feedbackMessage.style.display = 'none';
    submitAnswerBtn.style.display = 'block'; // Mostra o botão de responder
    loadNextQuestionBtn.style.display = 'none'; // Esconde o botão de próxima questão

    try {
        // Exemplo: buscando uma questão de Matemática. Você pode adicionar filtros no futuro.
        const response = await fetch(`${BACKEND_BASE_URL}/questoes?materia=Matemática`);
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        const data = await response.json();

        if (data.length > 0) {
            currentQuestion = data[0]; // Pega a primeira questão retornada
            renderQuestion(currentQuestion);
        } else {
            questionText.textContent = 'Nenhuma questão encontrada. Tente novamente mais tarde.';
            submitAnswerBtn.style.display = 'none';
        }
    } catch (error) {
        console.error('Erro ao carregar questão:', error);
        questionText.textContent = 'Erro ao carregar questão. Verifique a conexão com o backend.';
        submitAnswerBtn.style.display = 'none';
    }
}

// Função para renderizar a questão na interface
function renderQuestion(question) {
    questionText.innerHTML = `<strong>${question.materia} - ${question.tema}</strong><br>${question.enunciado}`;
    optionsContainer.innerHTML = '';

    // As opções vêm como um objeto, { "A": "Opção A", "B": "Opção B" }
    for (const key in question.opcoes) {
        if (Object.hasOwnProperty.call(question.opcoes, key)) {
            const optionValue = question.opcoes[key];
            const optionDiv = document.createElement('div');
            optionDiv.className = 'option';
            optionDiv.innerHTML = `
                <input type="radio" name="answer" id="option-${key}" value="${key}">
                <label for="option-${key}">${key}) ${optionValue}</label>
            `;
            optionsContainer.appendChild(optionDiv);
        }
    }
}

// Função para enviar a resposta do usuário para o backend
async function submitAnswer() {
    const selectedOption = document.querySelector('input[name="answer"]:checked');
    if (!selectedOption) {
        // Usando um feedback na tela em vez de alert()
        feedbackMessage.className = 'feedback incorrect';
        feedbackMessage.textContent = 'Por favor, selecione uma resposta antes de continuar.';
        feedbackMessage.style.display = 'block';
        return;
    }

    const userAnswer = selectedOption.value;
    submitAnswerBtn.style.display = 'none'; // Esconde o botão de responder após a submissão

    try {
        const response = await fetch(`${BACKEND_BASE_URL}/responder`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                questao_id: currentQuestion.id,
                resposta: userAnswer
            })
        });

        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        const data = await response.json();
        displayFeedback(data.correto, data.explicacao);
        updateScore(data.correto);
        loadNextQuestionBtn.style.display = 'block'; // Mostra o botão de próxima questão
    } catch (error) {
        console.error('Erro ao enviar resposta:', error);
        feedbackMessage.className = 'feedback incorrect';
        feedbackMessage.textContent = 'Erro ao enviar resposta. Tente novamente.';
        feedbackMessage.style.display = 'block';
        submitAnswerBtn.style.display = 'block'; // Permite tentar novamente
    }
}

// Função para exibir o feedback ao usuário
function displayFeedback(isCorrect, explanation) {
    feedbackMessage.style.display = 'block';
    if (isCorrect) {
        feedbackMessage.className = 'feedback correct';
        feedbackMessage.innerHTML = '<strong>Parabéns! Resposta correta.</strong>';
    } else {
        feedbackMessage.className = 'feedback incorrect';
        feedbackMessage.innerHTML = `<strong>Ops! Resposta incorreta.</strong><br>Explicação: ${explanation || 'Nenhuma explicação disponível.'}`;
    }
}

// Função para atualizar a pontuação
function updateScore(isCorrect) {
    if (isCorrect) {
        correctAnswers++;
    } else {
        incorrectAnswers++;
    }
    correctCountSpan.textContent = correctAnswers;
    incorrectCountSpan.textContent = incorrectAnswers;
}

// Event Listeners
submitAnswerBtn.addEventListener('click', submitAnswer);
loadNextQuestionBtn.addEventListener('click', loadQuestion);

// Carrega a primeira questão ao carregar a página
document.addEventListener('DOMContentLoaded', loadQuestion);