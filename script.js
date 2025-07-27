const questions = [
    {
        question: "Would you rather have unlimited bacon or unlimited donuts?",
        blueOption: { image: "assets/cars/1.jpg", text: "Bugatti" }, redOption: { image: "assets/cars/2.jpg", text: "Lamborghini" } },
    {
        question: "Would you rather play Fortnite or PUBG?",
        blueOption: { image: "assets/games/1.jpg", text: "Fortnite" }, redOption: { image: "assets/games/2.jpg", text: "PUBG" } },
    {
        question: "Would you rather eat pizza or burgers for the rest of your life?",
        blueOption: { image: "assets/food/1.jpg", text: "Pizza" }, redOption: { image: "assets/food/2.jpg", text: "Burgers" } },
    {
        question: "Would you rather work for Google or Apple?",
        blueOption: { image: "assets/companies/1.jpg", text: "Google" }, redOption: { image: "assets/companies/2.jpg", text: "Apple" } },
    {
        question: "Would you rather be Superman or Batman?",
        blueOption: { image: "assets/superheroes/1.jpg", text: "Superman" }, redOption: { image: "assets/superheroes/2.jpg", text: "Batman" } },
    {
        question: "Would you rather have a Ferrari or a McLaren?",
        blueOption: { image: "assets/cars/5.jpg", text: "Ferrari" }, redOption: { image: "assets/cars/6.jpg", text: "McLaren" } },
    {
        question: "Would you rather enjoy Minecraft or Terraria?",
        blueOption: { image: "assets/games/5.jpg", text: "Minecraft" }, redOption: { image: "assets/games/6.jpg", text: "Terraria" } },
    {
        question: "Would you rather eat sushi or tacos for every meal?",
        blueOption: { image: "assets/food/5.jpg", text: "Sushi" }, redOption: { image: "assets/food/6.jpg", text: "Tacos" } },
    {
        question: "Would you rather work at Tesla or SpaceX?",
        blueOption: { image: "assets/companies/3.jpg", text: "Tesla" }, redOption: { image: "assets/companies/4.jpg", text: "SpaceX" } },
    {
        question: "Would you rather have the powers of Spider-Man or Iron Man?",
        blueOption: { image: "assets/superheroes/3.jpg", text: "Spider-Man" }, redOption: { image: "assets/superheroes/4.jpg", text: "Iron Man" } },
    {
        question: "Would you rather experience a Mercedes-Benz or a BMW?",
        blueOption: { image: "assets/cars/17.jpg", text: "Mercedes-Benz" }, redOption: { image: "assets/cars/18.jpg", text: "BMW" } },
    {
        question: "Would you rather enjoy Grand Theft Auto or Red Dead Redemption?",
        blueOption: { image: "assets/games/19.jpg", text: "Grand Theft Auto" }, redOption: { image: "assets/games/20.jpg", text: "Red Dead Redemption" } },
    {
        question: "Would you rather have pancakes or waffles for breakfast?",
        blueOption: { image: "assets/food/11.jpg", text: "Pancakes" }, redOption: { image: "assets/food/12.jpg", text: "Waffles" } },
    {
        question: "Would you rather work at Microsoft or Amazon?",
        blueOption: { image: "assets/companies/5.jpg", text: "Microsoft" }, redOption: { image: "assets/companies/6.jpg", text: "Amazon" } },
    {
        question: "Would you rather be Thor or Hulk?",
        blueOption: { image: "assets/superheroes/7.jpg", text: "Thor" }, redOption: { image: "assets/superheroes/8.jpg", text: "Hulk" } },
    {
        question: "Would you rather own a Koenigsegg or a Pagani ?",
        blueOption: { image: "assets/cars/19.jpg", text: "Koenigsegg " }, redOption: { image: "assets/cars/20.jpg", text: "Pagani " } },
    {
        question: "Would you rather explore in The Legend of Zelda or Elden Ring?",
        blueOption: { image: "assets/games/9.jpg", text: "The Legend of Zelda" }, redOption: { image: "assets/games/10.jpg", text: "Elden Ring" } },
    {
        question: "Would you rather eat Chinese takeout or Italian pasta?",
        blueOption: { image: "assets/food/17.jpg", text: "Chinese Takeout" }, redOption: { image: "assets/food/18.jpg", text: "Italian Pasta" } },
    {
        question: "Would you rather work for Netflix or Disney?",
        blueOption: { image: "assets/companies/7.jpg", text: "Netflix" }, redOption: { image: "assets/companies/8.jpg", text: "Disney" } },
    {
        question: "Would you rather join the Avengers or the Justice League?",
        blueOption: { image: "assets/superheroes/9.jpg", text: "Avengers" }, redOption: { image: "assets/superheroes/10.jpg", text: "Justice League" } }
];

let currentQuestionIndex = 0;
let userChoices = [];
let gameActive = false;
let choiceMadeThisRound = false;
let questionsData = [];

const questionText = document.getElementById('question-text');
const optionLeftText = document.getElementById('option-left-text');
const optionRightText = document.getElementById('option-right-text');
const imageLeft = document.getElementById('image-left');
const imageRight = document.getElementById('image-right');
const feedbackText = document.getElementById('feedback-text');
const restartButton = document.getElementById('restart-button');
const blueOptionCard = document.getElementById('blue-option');
const redOptionCard = document.getElementById('red-option');
const splitScreenContainer = document.querySelector('.split-screen-container');
const divider = document.querySelector('.divider');

const video = document.getElementById('webcam');
let handLandmarker;
let lastVideoTime = -1;

async function setupHandDetection() {
    const { HandLandmarker, FilesetResolver } = vision;
    const visionResolver = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );
    handLandmarker = await HandLandmarker.createFromOptions(visionResolver, {
        baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/latest/hand_landmarker.task`,
            delegate: "GPU"
        },
        runningMode: "VIDEO",
        numHands: 2
    });
    enableCam();
}

function enableCam() {
    if (!handLandmarker) {
        console.log("Wait! handLandmarker not loaded yet.");
        return;
    }
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
        video.srcObject = stream;
        video.addEventListener("loadeddata", predictWebcam);
    });
}

async function predictWebcam() {
    const videoTime = video.currentTime;
    if (videoTime !== lastVideoTime) {
        lastVideoTime = videoTime;
        const results = handLandmarker.detectForVideo(video, performance.now());

        if (results.landmarks && results.landmarks.length > 0) {
            const wrist = results.landmarks[0][0];
            if (wrist.x > 0.65) {
                handleChoice('blue');
            } else if (wrist.x < 0.35) {
                handleChoice('red');
            }
        }
    }
    window.requestAnimationFrame(predictWebcam);
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function loadQuestion() {
    blueOptionCard.parentElement.classList.remove('winner', 'loser');
    redOptionCard.parentElement.classList.remove('winner', 'loser');

    if (currentQuestionIndex >= questionsData.length) {
        showResult();
        return;
    }

    const question = questionsData[currentQuestionIndex];
    questionText.textContent = question.question;

    optionLeftText.textContent = question.blueOption.text;
    imageLeft.src = question.blueOption.image;
    imageLeft.alt = question.blueOption.text;

    optionRightText.textContent = question.redOption.text;
    imageRight.src = question.redOption.image;
    imageRight.alt = question.redOption.text;

    blueOptionCard.classList.remove('selected');
    redOptionCard.classList.remove('selected');
    feedbackText.textContent = "Make your choice with your Palm...";
    choiceMadeThisRound = false;
}

function handleChoice(choice) {
    if (choiceMadeThisRound) return;

    choiceMadeThisRound = true;
    userChoices.push(choice);

    const fakePercentage = Math.floor(Math.random() * (95 - 45 + 1)) + 45;
    let userChoiceText = '';

    if (choice === 'blue') {
        blueOptionCard.classList.add('selected');
        blueOptionCard.parentElement.classList.add('winner');
        redOptionCard.parentElement.classList.add('loser');
        userChoiceText = questionsData[currentQuestionIndex].blueOption.text;
    } else {
        redOptionCard.classList.add('selected');
        redOptionCard.parentElement.classList.add('winner');
        blueOptionCard.parentElement.classList.add('loser');
        userChoiceText = questionsData[currentQuestionIndex].redOption.text;
    }

    feedbackText.textContent = `You chose ${userChoiceText}. ${fakePercentage}% of players agree!`;

    setTimeout(() => {
        currentQuestionIndex++;
        loadQuestion();
    }, 1800);
}

function showResult() {
    gameActive = false;

    splitScreenContainer.style.display = 'none';
    divider.style.display = 'none';
    imageLeft.src = '';
    imageRight.src = '';

    const blueChoices = userChoices.filter(choice => choice === "blue").length;
    const redChoices = userChoices.length - blueChoices;
    const resultText = `You preferred the Blue options ${blueChoices} times and the Red options ${redChoices} times.`;

    questionText.textContent = "Game Over!";
    feedbackText.textContent = resultText;
    restartButton.style.display = 'block';
}

function startGame() {
    questionsData = [...questions]; 
    shuffleArray(questionsData);
    currentQuestionIndex = 0;
    userChoices = [];
    gameActive = true;
    
    restartButton.style.display = 'none';
    splitScreenContainer.style.display = 'flex';
    divider.style.display = 'flex';
    
    loadQuestion();
}

restartButton.addEventListener('click', startGame);
startGame();
setupHandDetection();