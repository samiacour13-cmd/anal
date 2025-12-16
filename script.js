// State
const state = {
    solution: 'hcl', // 'hcl' or 'cucl2'
    isPowerOn: false,
    ions: []
};

// Data
const solutionsData = {
    hcl: {
        name: 'محلول كلور الهيدروجين',
        ions: [
            { type: 'H⁺', charge: 'plus' },
            { type: 'Cl⁻', charge: 'minus' }
        ],
        color: 'var(--liquid-hcl)',
        anodeProduct: 'gas-chlorine', // Cl2
        cathodeProduct: 'gas-hydrogen', // H2
        equations: {
            anode: '2Cl⁻ → Cl₂ + 2e⁻ (انطلاق غاز الكلور)',
            cathode: '2H⁺ + 2e⁻ → H₂ (انطلاق غاز الهيدروجين)',
            global: '2HCl → H₂ + Cl₂'
        },
        observations: 'عند المهبط (-): انطلاق فقاعات غازية (الهيدروجين).<br>عند المصعد (+): انطلاق فقاعات غازية مخضرة (الكلور).'
    },
    cucl2: {
        name: 'محلول كلور النحاس الثنائي',
        ions: [
            { type: 'Cu²⁺', charge: 'plus' },
            { type: 'Cl⁻', charge: 'minus' }
        ],
        color: 'var(--liquid-cucl2)',
        anodeProduct: 'gas-chlorine', 
        cathodeProduct: 'solid-copper', 
        equations: {
            anode: '2Cl⁻ → Cl₂ + 2e⁻ (انطلاق غاز الكلور)',
            cathode: 'Cu²⁺ + 2e⁻ → Cu (ترسب النحاس)',
            global: 'CuCl₂ → Cu + Cl₂'
        },
        observations: 'عند المهبط (-): ترسب طبقة حمراء (معدن النحاس).<br>عند المصعد (+): انطلاق فقاعات غازية مخضرة (الكلور).'
    }
};

const quizQuestions = [
    {
        question: "ما هي الجسيمات المسؤولة عن نقل التيار في المحاليل الشاردية؟",
        options: ["الإلكترونات", "الشوارد (الأيونات)", "الذرات"],
        correct: 1,
        feedback: "أحسنت! الشوارد هي حاملات الشحنة في المحاليل."
    },
    {
        question: "عند التحليل الكهربائي لمحلول CuCl₂، ماذا نلاحظ عند المهبط (القطب السالب)؟",
        options: ["انطلاق غاز الهيدروجين", "ترسب معدن النحاس", "انطلاق غاز الكلور"],
        correct: 1,
        feedback: "صحيح! شوارد النحاس الموجبة تنجذب نحو القطب السالب وتترسب."
    },
    {
        question: "نحو أي مسرى تتجه الشوارد السالبة (مثل Cl⁻)؟",
        options: ["نحو المصعد (الموجب)", "نحو المهبط (السالب)", "تبقى في مكانها"],
        correct: 0,
        feedback: "ممتاز! الشحنات المختلفة تتجاذب، لذا الشوارد السالبة تتجه للقطب الموجب."
    }
];

// DOM Elements
const els = {
    select: document.getElementById('solutionSelect'),
    powerBtn: document.getElementById('powerBtn'),
    resetBtn: document.getElementById('resetBtn'),
    switch: document.getElementById('circuitSwitch'),
    bulb: document.getElementById('bulb'),
    solution: document.getElementById('solutionLiquid'),
    ionsContainer: document.getElementById('ionsContainer'),
    anodeBubbles: document.getElementById('anodeBubbles'),
    cathodeBubbles: document.getElementById('cathodeBubbles'),
    cathodeDeposit: document.getElementById('cathodeDeposit'),
    obsBox: document.getElementById('observations'),
    eqnBox: document.getElementById('equations'),
    
    // Quiz
    quizQ: document.getElementById('questionText'),
    quizOpt: document.getElementById('quizOptions'),
    quizNext: document.getElementById('nextQuestionBtn'),
    quizFeedback: document.getElementById('feedback'),
    
    // Modal
    infoBtn: document.getElementById('infoBtn'),
    modal: document.getElementById('modal'),
    closeModal: document.querySelector('.close-modal')
};

// Logic

function init() {
    els.select.addEventListener('change', (e) => {
        if(state.isPowerOn) turnOff();
        state.solution = e.target.value;
        updateSetup();
    });

    els.powerBtn.addEventListener('click', togglePower);
    els.resetBtn.addEventListener('click', () => {
        turnOff();
        updateSetup();
    });

    // Modal
    els.infoBtn.addEventListener('click', () => els.modal.classList.remove('hidden'));
    els.closeModal.addEventListener('click', () => els.modal.classList.add('hidden'));
    window.addEventListener('click', (e) => {
        if (e.target === els.modal) els.modal.classList.add('hidden');
    });

    // Quiz
    initQuiz();
    updateSetup();
}

function updateSetup() {
    // Set color
    const data = solutionsData[state.solution];
    els.solution.style.backgroundColor = data.color;
    
    // Clear dynamic elements
    els.ionsContainer.innerHTML = '';
    els.anodeBubbles.innerHTML = '';
    els.cathodeBubbles.innerHTML = '';
    els.cathodeDeposit.style.height = '0';
    
    // Create static ions scattered randomly
    createIons(data.ions);
    
    // Reset texts
    els.obsBox.innerHTML = "<p>المحلول جاهز. اضغط على 'تشغيل الدارة' لبدء التفاعل.</p>";
    els.eqnBox.classList.add('hidden');
}

function createIons(ionTypes) {
    els.ionsContainer.innerHTML = '';
    state.ions = [];
    
    for (let i = 0; i < 20; i++) {
        const typeIdx = i % 2; // Split evenly
        const ionData = ionTypes[typeIdx];
        
        const el = document.createElement('div');
        el.className = `ion ${ionData.charge}`;
        el.textContent = ionData.type;
        
        // Random position within container (approximate %)
        const top = Math.random() * 80 + 10;
        const left = Math.random() * 80 + 10;
        
        el.style.top = top + '%';
        el.style.left = left + '%';
        
        els.ionsContainer.appendChild(el);
        
        state.ions.push({
            el: el,
            charge: ionData.charge,
            x: left,
            y: top,
            initialX: left,
            initialY: top
        });
    }
}

function togglePower() {
    if (state.isPowerOn) {
        turnOff();
    } else {
        turnOn();
    }
}

function turnOn() {
    state.isPowerOn = true;
    els.powerBtn.textContent = "إيقاف الدارة";
    els.powerBtn.classList.add('active');
    els.switch.classList.remove('open');
    els.switch.classList.add('closed');
    els.bulb.classList.add('on');
    
    startSimulation();
    showObservations();
}

function turnOff() {
    state.isPowerOn = false;
    els.powerBtn.textContent = "تشغيل الدارة";
    els.powerBtn.classList.remove('active');
    els.switch.classList.add('open');
    els.switch.classList.remove('closed');
    els.bulb.classList.remove('on');
    
    stopSimulation();
}

let animationInterval;
let bubblesInterval;

function startSimulation() {
    // 1. Ion Movement
    // Anode is Left (+), Cathode is Right (-) based on CSS positions
    // Anode at roughly 20%, Cathode at roughly 80% of width (Container is relative)
    // Actually in CSS: anode left: 40px, cathode right: 40px inside 250px beaker
    // Let's approximate targets in %. 
    // Container width = 250px. 
    // Anode center ~ 50px from left -> 20%
    // Cathode center ~ 200px from left -> 80%
    
    const anodeTarget = 20; 
    const cathodeTarget = 80;
    
    animationInterval = setInterval(() => {
        state.ions.forEach(ion => {
            // Negative ions -> Anode (+) (Left)
            // Positive ions -> Cathode (-) (Right)
            
            let target = ion.charge === 'minus' ? anodeTarget : cathodeTarget;
            
            // Move partially towards target
            let dx = target - ion.x;
            // Add some jitter
            ion.x += dx * 0.05 + (Math.random() - 0.5) * 2;
            ion.y += (Math.random() - 0.5) * 2;
            
            // Clamp
            if(ion.x < 5) ion.x = 5; if(ion.x > 95) ion.x = 95;
            if(ion.y < 5) ion.y = 5; if(ion.y > 90) ion.y = 90;
            
            ion.el.style.left = ion.x + '%';
            ion.el.style.top = ion.y + '%';
        });
    }, 50);
    
    // 2. Products (Bubbles / Deposit)
    const data = solutionsData[state.solution];
    
    // Cathode Deposit (if solid)
    if (data.cathodeProduct.includes('solid')) {
        els.cathodeDeposit.style.height = '60px'; // Grow up
        els.cathodeDeposit.style.opacity = '1';
    }
    
    // Bubbles Loop
    bubblesInterval = setInterval(() => {
        // Anode Bubbles (Always Cl2 gas)
        createBubble(els.anodeBubbles, 'green-gas');
        
        // Cathode Bubbles (Only if gas)
        if (data.cathodeProduct.includes('gas')) {
            createBubble(els.cathodeBubbles, 'clear-gas');
        }
    }, 400); // Create bubbles frequently
}

function stopSimulation() {
    clearInterval(animationInterval);
    clearInterval(bubblesInterval);
    
    // Reset ions to somewhat logic positions or just stop them? 
    // Usually they diffuse back, but let's just stop movement.
    // For visual clarity, maybe we don't clear deposit immediately unless reset is hit.
    // But bubbles should stop generating.
    els.anodeBubbles.innerHTML = '';
    if(solutionsData[state.solution].cathodeProduct.includes('gas')) {
        els.cathodeBubbles.innerHTML = ''; 
    }
}

function createBubble(container, typeClass) {
    const b = document.createElement('div');
    b.className = `bubble ${typeClass}`;
    // Randomize start pos slightly
    b.style.left = (Math.random() * 20 - 10 + 50) + '%'; 
    container.appendChild(b);
    
    // Remove after animation
    setTimeout(() => {
        if(b.parentNode) b.remove();
    }, 2000);
}

function showObservations() {
    const data = solutionsData[state.solution];
    els.obsBox.innerHTML = `
        <p><strong>الملاحظات:</strong> ${data.observations}</p>
    `;
    
    els.eqnBox.innerHTML = `
        <p>عند المصعد (+): ${data.equations.anode}</p>
        <p>عند المهبط (-): ${data.equations.cathode}</p>
        <hr style="border-color: #4ade80; margin: 5px 0;">
        <p>المعادلة الإجمالية: ${data.equations.global}</p>
    `;
    els.eqnBox.classList.remove('hidden');
}

// ------ QUIZ SYSTEM ------

let currentQIndex = 0;

function initQuiz() {
    currentQIndex = 0;
    renderQuestion(currentQIndex);
    
    els.quizNext.addEventListener('click', () => {
        currentQIndex++;
        if (currentQIndex < quizQuestions.length) {
            renderQuestion(currentQIndex);
        } else {
            // End of quiz
            els.quizQ.textContent = "أحسنت! لقد أتممت جميع الأسئلة.";
            els.quizOpt.innerHTML = '';
            els.quizNext.classList.add('hidden');
            els.quizFeedback.textContent = '';
        }
    });
}

function renderQuestion(idx) {
    const q = quizQuestions[idx];
    els.quizQ.textContent = q.question;
    els.quizFeedback.textContent = '';
    els.quizNext.classList.add('hidden');
    
    els.quizOpt.innerHTML = '';
    q.options.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = opt;
        btn.onclick = () => checkAnswer(i, q.correct, btn, q.feedback);
        els.quizOpt.appendChild(btn);
    });
}

function checkAnswer(selected, correct, btnElement, feedbackText) {
    // Disable all buttons
    const buttons = els.quizOpt.querySelectorAll('button');
    buttons.forEach(b => b.disabled = true);
    
    if (selected === correct) {
        btnElement.classList.add('correct');
        els.quizFeedback.textContent = feedbackText;
        els.quizFeedback.style.color = '#10b981';
    } else {
        btnElement.classList.add('incorrect');
        buttons[correct].classList.add('correct'); // Show correct one
        els.quizFeedback.textContent = "إجابة خاطئة. حاول التركيز أكثر!";
        els.quizFeedback.style.color = '#ef4444';
    }
    
    els.quizNext.classList.remove('hidden');
}

// Run
init();
