document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Reklám / Prank Funkciók ---
    
    // Bal oldali reklám kattintás -> Focus Hub oldalra
    document.getElementById('ad-left-content').addEventListener('click', () => {
        window.location.href = "https://gramabence.github.io/FocusHub./";
    });

    // Jobb oldali reklám kattintás -> Horgász oldalra
    document.getElementById('ad-right-content').addEventListener('click', () => {
        window.open("https://www.halzona.hu", "_blank");
    });

    // Ha az ikszre (X) kattint: Mini játék megnyitása!
    const closeBtns = document.querySelectorAll('.ad-close-btn');
    const modal = document.getElementById('game-modal');
    
    closeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Ne nyissa meg a hirdetés linkjét
            modal.classList.remove('hidden');
            startGame();
        });
    });

    // --- 2. Mini Ugrálós Játék (Canvas Dino Style) ---
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreEl = document.getElementById('game-score');
    const closeGameBtn = document.getElementById('close-game-btn');

    let player = { x: 30, y: 110, w: 20, h: 20, dy: 0, jumping: false };
    let obstacle = { x: 400, y: 110, w: 15, h: 20, speed: 4 };
    let score = 0;
    let gameInterval;
    let gameActive = false;

    function startGame() {
        score = 0;
        scoreEl.textContent = score;
        obstacle.x = 400;
        obstacle.speed = 4;
        player.y = 110;
        player.dy = 0;
        gameActive = true;
        closeGameBtn.disabled = true;
        closeGameBtn.textContent = "Győzz a bezáráshoz! (5 pont)";

        if (gameInterval) clearInterval(gameInterval);
        gameInterval = setInterval(updateGame, 1000 / 60);
    }

    function jump() {
        if (!player.jumping && gameActive) {
            player.dy = -9;
            player.jumping = true;
        }
    }

    // Ugrás billentyűre és kattintásra
    document.addEventListener('keydown', (e) => { if (e.code === 'Space') jump(); });
    canvas.addEventListener('click', jump);

    function updateGame() {
        // Fizika
        player.dy += 0.4; // Gravitáció
        player.y += player.dy;

        if (player.y >= 110) {
            player.y = 110;
            player.jumping = false;
        }

        // Akadály mozgása
        obstacle.x -= obstacle.speed;
        if (obstacle.x < -20) {
            obstacle.x = 400;
            score++;
            scoreEl.textContent = score;
            obstacle.speed += 0.2; // Nehezedik

            // Ha eléri az 5 pontot, nyert!
            if (score >= 5) {
                gameActive = false;
                clearInterval(gameInterval);
                closeGameBtn.disabled = false;
                closeGameBtn.textContent = "Szép volt! Bezárás";
            }
        }

        // Ütközés detektálás
        if (
            player.x < obstacle.x + obstacle.w &&
            player.x + player.w > obstacle.x &&
            player.y < obstacle.y + obstacle.h &&
            player.y + player.h > obstacle.y
        ) {
            // Meghalt -> Újraindul
            score = 0;
            scoreEl.textContent = score;
            obstacle.x = 400;
        }

        // Kirajzolás
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Talaj
        ctx.fillStyle = '#888';
        ctx.fillRect(0, 130, 400, 2);

        // Játékos (Kocka)
        ctx.fillStyle = '#ff4444';
        ctx.fillRect(player.x, player.y, player.w, player.h);

        // Akadály (Tüske)
        ctx.fillStyle = '#111';
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.w, obstacle.h);
    }

    closeGameBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
    });


    // --- 3. Dashboard Alapfunkciók ---
    function updateClock() {
        const now = new Date();
        document.getElementById('clock').textContent = now.toLocaleTimeString('hu-HU');
        const hours = now.getHours();
        const greeting = document.getElementById('greeting');
        if (hours < 12) greeting.textContent = "Jó reggelt!";
        else if (hours < 18) greeting.textContent = "Jó napot!";
        else greeting.textContent = "Jó estét!";
    }
    setInterval(updateClock, 1000);
    updateClock();

    // Témaváltó
    const themeBtn = document.getElementById('theme-toggle');
    if (localStorage.getItem('theme') === 'dark') document.body.setAttribute('data-theme', 'dark');

    themeBtn.addEventListener('click', () => {
        const isDark = document.body.getAttribute('data-theme') === 'dark';
        document.body.toggleAttribute('data-theme');
        localStorage.setItem('theme', isDark ? 'light' : 'dark');
    });

    // Napi Fókusz
    const mainGoalInput = document.getElementById('main-goal');
    mainGoalInput.value = localStorage.getItem('mainGoal') || '';
    mainGoalInput.addEventListener('input', () => localStorage.setItem('mainGoal', mainGoalInput.value));

    // Pomodoro Timer
    let timer, timeLeft = 25 * 60, isRunning = false;
    const timerDisplay = document.getElementById('timer-display');
    function updateTimer() {
        const min = Math.floor(timeLeft / 60), sec = timeLeft % 60;
        timerDisplay.textContent = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    }
    document.getElementById('start-btn').addEventListener('click', () => {
        if (!isRunning) {
            isRunning = true;
            timer = setInterval(() => {
                if (timeLeft > 0) { timeLeft--; updateTimer(); }
                else { clearInterval(timer); alert("Fókuszidő lejárt!"); isRunning = false; }
            }, 1000);
        }
    });
    document.getElementById('pause-btn').addEventListener('click', () => { clearInterval(timer); isRunning = false; });
    document.getElementById('reset-btn').addEventListener('click', () => { clearInterval(timer); isRunning = false; timeLeft = 25 * 60; updateTimer(); });

    // Todo
    const todoForm = document.getElementById('todo-form'), todoInput = document.getElementById('todo-input'), todoList = document.getElementById('todo-list');
    let todos = JSON.parse(localStorage.getItem('todos')) || [];
    function renderTodos() {
        localStorage.setItem('todos', JSON.stringify(todos));
        todoList.innerHTML = '';
        todos.forEach((todo, i) => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            li.innerHTML = `<span onclick="toggleTodo(${i})">${todo.text}</span><button class="delete-btn" onclick="deleteTodo(${i})">x</button>`;
            todoList.appendChild(li);
        });
    }
    todoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (todoInput.value.trim()) { todos.push({ text: todoInput.value.trim(), completed: false }); todoInput.value = ''; renderTodos(); }
    });
    window.toggleTodo = (i) => { todos[i].completed = !todos[i].completed; renderTodos(); };
    window.deleteTodo = (i) => { todos.splice(i, 1); renderTodos(); };
    renderTodos();

    // Víz
    const waterCountEl = document.getElementById('water-count');
    let waterCount = parseInt(localStorage.getItem('waterCount')) || 0;
    waterCountEl.textContent = waterCount;
    document.getElementById('add-water').addEventListener('click', () => { waterCount++; localStorage.setItem('waterCount', waterCount); waterCountEl.textContent = waterCount; });
    document.getElementById('reset-water').addEventListener('click', () => { waterCount = 0; localStorage.setItem('waterCount', 0); waterCountEl.textContent = 0; });

    // Idézet
    const quotes = ['"A legegyszerűbb megoldások a legjobbak."', '"A fókusz a nemet mondás művészete."', '"Kicsi lépések minden nap."'];
    document.getElementById('new-quote').addEventListener('click', () => {
        document.getElementById('quote-text').textContent = quotes[Math.floor(Math.random() * quotes.length)];
    });

    // Jegyzetek
    const notes = document.getElementById('quick-notes');
    notes.value = localStorage.getItem('quickNotes') || '';
    notes.addEventListener('input', () => localStorage.setItem('quickNotes', notes.value));
});
