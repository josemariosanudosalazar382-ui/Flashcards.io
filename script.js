document.addEventListener('DOMContentLoaded', () => {
    // --- Referencias a Elementos del DOM ---
    const mainSections = document.querySelectorAll('main > section');
    const navButtons = document.querySelectorAll('.nav-btn');
    const themeLightBtn = document.getElementById('theme-light-btn');
    const themeGrayBtn = document.getElementById('theme-gray-btn');
    const themeSolarizedBtn = document.getElementById('theme-solarized-btn');
    const themeBlackBtn = document.getElementById('theme-black-btn');
    const deckList = document.getElementById('deck-list');
    const addDeckBtn = document.getElementById('add-deck-btn');
    const importDeckBtn = document.getElementById('import-deck-btn');
    const deckFileInput = document.getElementById('deck-file-input');
    const flashcardArea = document.getElementById('flashcard-area');
    const ratingControls = document.getElementById('rating-controls');
    const ratingButtons = document.querySelectorAll('.rating-btn');
    const nextBtn = document.getElementById('next-btn');
    const downloadDeckBtn = document.getElementById('download-deck-btn');
    const addCardBtn = document.getElementById('add-card-btn');
    const backToDecksBtn = document.getElementById('back-to-decks-btn');
    const addCardForm = document.getElementById('add-card-form');
    const cancelAddBtn = document.getElementById('cancel-add-btn');
    const docsList = document.getElementById('docs-list');
    const addDocBtn = document.getElementById('add-doc-btn');
    const importDocBtn = document.getElementById('import-doc-btn');
    const docFileInput = document.getElementById('doc-file-input');
    const docsListView = document.getElementById('docs-list-view');
    const docEditorView = document.getElementById('doc-editor-view');
    const saveDocBtn = document.getElementById('save-doc-btn');
    const downloadDocBtn = document.getElementById('download-doc-btn');
    const cancelDocBtn = document.getElementById('cancel-doc-btn');
    const docTitleInput = document.getElementById('doc-title-input');
    const docSubjectInput = document.getElementById('doc-subject-input');
    const addTaskForm = document.getElementById('add-task-form');
    const taskInput = document.getElementById('task-input');
    const taskList = document.getElementById('task-list');
    const pomodoroTimerDisplay = document.getElementById('pomodoro-timer');
    const pomodoroStartBtn = document.getElementById('pomodoro-start-btn');
    const pomodoroPauseBtn = document.getElementById('pomodoro-pause-btn');
    const pomodoroResetBtn = document.getElementById('pomodoro-reset-btn');
    const pomodoroStudyTimeInput = document.getElementById('pomodoro-study-time');
    const pomodoroBreakTimeInput = document.getElementById('pomodoro-break-time');
    const calendarGrid = document.getElementById('calendar-grid');
    const currentMonthDisplay = document.getElementById('current-month-display');
    const prevMonthBtn = document.getElementById('prev-month-btn');
    const nextMonthBtn = document.getElementById('next-month-btn');
    const addEventTypeForm = document.getElementById('add-event-type-form');
    const eventTypeNameInput = document.getElementById('event-type-name');
    const eventTypeColorInput = document.getElementById('event-type-color');
    const eventTypesList = document.getElementById('event-types-list');
    const helpBtn = document.getElementById('help-btn');
    const helpModal = document.getElementById('help-modal');
    const closeModalBtn = document.querySelector('.close-btn');

    // --- Estado de la Aplicación ---
    let decks = JSON.parse(localStorage.getItem('flashcardDecks')) || [];
    let docs = JSON.parse(localStorage.getItem('studyDocs')) || {};
    let tasks = JSON.parse(localStorage.getItem('studyTasks')) || [];
    let calendarEvents = JSON.parse(localStorage.getItem('calendarEvents')) || {};
    let eventTypes = JSON.parse(localStorage.getItem('calendarEventTypes')) || [{id: 'default', name: 'Estudio', color: '#2ecc71'}];
    let currentDeckIndex = -1, currentCardIndex = 0, editingDocId = null;
    let currentDate = new Date();
    
    const quillToolbarOptions = [[{ 'font': [] }],['bold', 'italic', 'underline'],[{ 'list': 'ordered'}, { 'list': 'bullet' }],[{ 'background': [] }],['image']];
    let quill = new Quill('#editor-container', { theme: 'snow', modules: { toolbar: quillToolbarOptions } });

    // --- LÓGICA GENERAL (NAVEGACIÓN, TEMAS, MODAL) ---
    function showSection(targetId) {
        mainSections.forEach(s => s.style.display = 'none');
        document.getElementById(targetId).style.display = 'block';
        navButtons.forEach(b => b.classList.remove('active'));
        const activeButton = document.querySelector(`[data-target="${targetId}"]`);
        if (activeButton) activeButton.classList.add('active');
    }
    function setTheme(theme) { document.body.className = theme; localStorage.setItem('selectedTheme', theme); }
    
    // --- LÓGICA DE FLASHCARDS ---
    function saveDecks() { localStorage.setItem('flashcardDecks', JSON.stringify(decks)); }
    function renderDecks() {
        deckList.innerHTML = '';
        decks.forEach((deck, index) => {
            const card = document.createElement('div');
            card.className = 'deck-card';
            card.innerHTML = `<span>${deck.name} (${deck.cards.length})</span>
                            <div class="doc-item-buttons">
                                <button class="delete-deck-btn" data-index="${index}">Eliminar</button>
                            </div>`;
            card.querySelector('span').addEventListener('click', () => {
                currentDeckIndex = index;
                showNextCard();
                document.getElementById('current-deck-title').textContent = deck.name;
                showSection('flashcard-view-container');
            });
            deckList.appendChild(card);
        });
    }
    function showNextCard() {
        const deck = decks[currentDeckIndex];
        if (!deck || deck.cards.length === 0) {
            flashcardArea.innerHTML = '<p>Este mazo no tiene flashcards. ¡Añade una!</p>';
            ratingControls.style.display = 'none'; nextBtn.style.display = 'none'; return;
        }
        nextBtn.style.display = 'block';
        const weightedPool = [];
        deck.cards.forEach((card, index) => {
            const mastery = card.masteryLevel || 1;
            const weight = Math.max(1, 11 - (mastery * 2));
            for (let i = 0; i < weight; i++) weightedPool.push(index);
        });
        currentCardIndex = weightedPool[Math.floor(Math.random() * weightedPool.length)];
        renderFlashcard();
    }
    function renderFlashcard() {
        const card = decks[currentDeckIndex].cards[currentCardIndex];
        flashcardArea.innerHTML = '';
        const cardContainer = document.createElement('div');
        cardContainer.className = 'flashcard-container';
        cardContainer.innerHTML = `<div class="flashcard"><div class="flashcard-face flashcard-front">${card.front}</div><div class="flashcard-face flashcard-back">${card.back}</div></div>`;
        flashcardArea.appendChild(cardContainer);
        const flashcardElement = cardContainer.querySelector('.flashcard');
        flashcardElement.addEventListener('click', () => {
            flashcardElement.classList.toggle('flipped');
            ratingControls.style.display = flashcardElement.classList.contains('flipped') ? 'block' : 'none';
        });
        ratingControls.style.display = 'none';
    }
    function downloadDeck() {
        const deck = decks[currentDeckIndex];
        if (!deck) return;
        const dataStr = JSON.stringify(deck, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${deck.name.replace(/ /g, '_')}.json`;
        a.click();
        URL.revokeObjectURL(a.href);
    }
    function importDeckFromFile(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedDeck = JSON.parse(e.target.result);
                if (importedDeck && typeof importedDeck.name === 'string' && Array.isArray(importedDeck.cards)) {
                    if (decks.some(d => d.name === importedDeck.name) && !confirm(`Ya existe un mazo llamado "${importedDeck.name}". ¿Añadir de todas formas?`)) {
                        deckFileInput.value = ""; return;
                    }
                    decks.push(importedDeck);
                    saveDecks(); renderDecks();
                } else { alert('Error: Archivo de mazo no válido.'); }
            } catch (error) { alert('Error al leer el archivo.'); }
            deckFileInput.value = "";
        };
        reader.readAsText(file);
    }

    // --- LÓGICA DE NOTAS ---
    function saveDocs() { localStorage.setItem('studyDocs', JSON.stringify(docs)); }
    function renderDocs() {
        docsList.innerHTML = '';
        Object.keys(docs).sort().forEach(subject => {
            const group = document.createElement('div');
            group.className = 'doc-group';
            group.innerHTML = `<h3>${subject}</h3>`;
            docs[subject].forEach(doc => {
                const item = document.createElement('div');
                item.className = 'doc-item';
                item.innerHTML = `<span>${doc.title}</span>
                                <div class="doc-item-buttons">
                                    <button class="open-doc-btn" data-id="${doc.id}">Abrir</button>
                                    <button class="delete-doc-btn" data-id="${doc.id}">Eliminar</button>
                                </div>`;
                group.appendChild(item);
            });
            docsList.appendChild(group);
        });
    }
    function showNoteEditor(docId = null) {
        editingDocId = docId;
        if (docId) {
            let docToEdit, subject;
            for (const subj in docs) { docToEdit = docs[subj].find(d => d.id === docId); if (docToEdit) { subject = subj; break; } }
            if (docToEdit) {
                docTitleInput.value = docToEdit.title;
                docSubjectInput.value = subject;
                quill.root.innerHTML = docToEdit.content;
                downloadDocBtn.style.display = 'inline-block';
            }
        } else {
            docTitleInput.value = ''; docSubjectInput.value = ''; quill.setText('');
            downloadDocBtn.style.display = 'none';
        }
        docsListView.style.display = 'none';
        docEditorView.style.display = 'block';
    }
    function saveCurrentDoc() {
        const subject = docSubjectInput.value.trim() || 'General';
        const title = docTitleInput.value.trim();
        const content = quill.root.innerHTML;
        if (!title) return alert('El título es obligatorio.');
        if (editingDocId) {
            for (const subj in docs) {
                const docIndex = docs[subj].findIndex(d => d.id === editingDocId);
                if (docIndex !== -1) {
                    const [doc] = docs[subj].splice(docIndex, 1);
                    if (docs[subj].length === 0) delete docs[subj];
                    if (!docs[subject]) docs[subject] = [];
                    docs[subject].push({ ...doc, title, content });
                    break;
                }
            }
        } else {
            if (!docs[subject]) docs[subject] = [];
            docs[subject].push({ id: Date.now().toString(), title, content });
        }
        saveDocs();
        renderDocs();
        docsListView.style.display = 'block';
        docEditorView.style.display = 'none';
    }
    function downloadNote() {
        const title = docTitleInput.value.trim() || "nota_sin_titulo";
        const content = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>${title}</title></head><body>${quill.root.innerHTML}</body></html>`;
        const blob = new Blob([content], { type: 'text/html' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${title.replace(/ /g, '_')}.html`;
        a.click();
        URL.revokeObjectURL(a.href);
    }
    function importNoteFromFile(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const title = file.name.replace(/\.html$/, '').replace(/_/g, ' ');
            const content = e.target.result;
            const subject = 'Importado';
            if (!docs[subject]) docs[subject] = [];
            docs[subject].push({ id: Date.now().toString(), title, content });
            saveDocs(); renderDocs();
            alert(`Nota "${title}" importada.`);
            docFileInput.value = "";
        };
        reader.readAsText(file);
    }

    // --- LÓGICA DE TAREAS ---
    function saveTasks() { localStorage.setItem('studyTasks', JSON.stringify(tasks)); }
    function renderTasks() {
        taskList.innerHTML = '';
        tasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.className = task.completed ? 'completed' : '';
            li.innerHTML = `<span class="task-text" data-index="${index}">${task.text}</span><button class="delete-task-btn" data-index="${index}">X</button>`;
            taskList.appendChild(li);
        });
    }

    // --- LÓGICA DE POMODORO ---
    let pomodoroInterval;
    let pomodoroTimeLeft = (localStorage.getItem('pomodoroStudyTime') || 25) * 60;
    let pomodoroIsPaused = true;
    let pomodoroIsStudySession = true;
    const pomodoroAlarm = new Audio('sonido/sonidopomodoro.mp3');
    function updatePomodoroDisplay() {
        const minutes = Math.floor(pomodoroTimeLeft / 60);
        const seconds = pomodoroTimeLeft % 60;
        pomodoroTimerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    function startPomodoro() {
        if (pomodoroIsPaused) {
            pomodoroIsPaused = false;
            pomodoroInterval = setInterval(() => {
                pomodoroTimeLeft--;
                updatePomodoroDisplay();
                if (pomodoroTimeLeft < 0) {
                    try { pomodoroAlarm.play(); } catch(e) { console.warn("No se pudo reproducir el sonido de la alarma.");}
                    pomodoroIsStudySession = !pomodoroIsStudySession;
                    resetPomodoroTimer(false);
                    startPomodoro();
                }
            }, 1000);
        }
    }
    function pausePomodoro() { clearInterval(pomodoroInterval); pomodoroIsPaused = true; }
    function resetPomodoroTimer(manual = true) {
        pausePomodoro();
        if(manual) pomodoroIsStudySession = true;
        const studyTime = pomodoroStudyTimeInput.value || 25;
        const breakTime = pomodoroBreakTimeInput.value || 5;
        pomodoroTimeLeft = (pomodoroIsStudySession ? studyTime : breakTime) * 60;
        pomodoroTimerDisplay.className = pomodoroIsStudySession ? 'pomodoro-study' : 'pomodoro-break';
        updatePomodoroDisplay();
    }
    function savePomodoroSettings() {
        localStorage.setItem('pomodoroStudyTime', pomodoroStudyTimeInput.value);
        localStorage.setItem('pomodoroBreakTime', pomodoroBreakTimeInput.value);
        resetPomodoroTimer();
    }
    
    // --- LÓGICA DE CALENDARIO ---
    function saveCalendarEvents() { localStorage.setItem('calendarEvents', JSON.stringify(calendarEvents)); }
    function saveEventTypes() { localStorage.setItem('calendarEventTypes', JSON.stringify(eventTypes)); }
    function renderEventTypes() {
        eventTypesList.innerHTML = '';
        eventTypes.forEach(type => {
            const item = document.createElement('div');
            item.className = 'event-type-item';
            item.style.backgroundColor = type.color;
            item.innerHTML = `<span>${type.name}</span><span class="delete-event-btn" data-id="${type.id}"> X</span>`;
            eventTypesList.appendChild(item);
        });
    }
    function renderCalendar() {
        calendarGrid.innerHTML = '';
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const monthKey = `${year}-${month}`;
        currentMonthDisplay.textContent = new Date(year, month).toLocaleString('es-ES', { month: 'long', year: 'numeric' });
        const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        for (let i = 0; i < firstDay; i++) calendarGrid.insertAdjacentHTML('beforeend', '<div class="day-box empty"></div>');
        for (let day = 1; day <= daysInMonth; day++) {
            const box = document.createElement('div');
            box.className = 'day-box';
            box.textContent = day;
            box.dataset.day = day;
            const eventId = calendarEvents[monthKey]?.[day];
            if (eventId) {
                const eventType = eventTypes.find(t => t.id === eventId);
                if (eventType) box.style.backgroundColor = eventType.color;
            }
            calendarGrid.appendChild(box);
        }
    }
    function handleDayClick(e) {
        document.querySelector('.day-event-menu')?.remove();
        const dayBox = e.target.closest('.day-box');
        if (!dayBox || !dayBox.dataset.day) return;
        
        const day = dayBox.dataset.day;
        const monthKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;
        const menu = document.createElement('div');
        menu.className = 'day-event-menu';
        
        eventTypes.forEach(type => {
            const item = document.createElement('div');
            item.textContent = type.name;
            item.style.backgroundColor = type.color;
            item.onclick = () => {
                if (!calendarEvents[monthKey]) calendarEvents[monthKey] = {};
                calendarEvents[monthKey][day] = type.id;
                saveCalendarEvents(); renderCalendar(); menu.remove();
            };
            menu.appendChild(item);
        });
        const removeItem = document.createElement('div');
        removeItem.textContent = 'Quitar evento';
        removeItem.onclick = () => {
            if (calendarEvents[monthKey]?.[day]) {
                delete calendarEvents[monthKey][day];
                saveCalendarEvents(); renderCalendar();
            }
            menu.remove();
        };
        menu.appendChild(removeItem);
        dayBox.appendChild(menu);
    }

    // ===================================================================
    // EVENT LISTENERS
    // ===================================================================
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.target;
            showSection(target);
            if (target === 'deck-list-container') renderDecks();
            if (target === 'docs-container') renderDocs();
            if (target === 'tasks-container') renderTasks();
            if (target === 'study-log-container') { renderCalendar(); renderEventTypes(); }
            if (target === 'pomodoro-container') resetPomodoroTimer();
        });
    });
    themeLightBtn.addEventListener('click', () => setTheme('theme-light'));
    themeGrayBtn.addEventListener('click', () => setTheme('theme-gray'));
    themeSolarizedBtn.addEventListener('click', () => setTheme('theme-solarized'));
    themeBlackBtn.addEventListener('click', () => setTheme('theme-black'));
    helpBtn.addEventListener('click', () => helpModal.style.display = 'block');
    closeModalBtn.addEventListener('click', () => helpModal.style.display = 'none');
    window.addEventListener('click', e => { if (e.target == helpModal) helpModal.style.display = 'none'; });

    // FLASHCARDS
    addDeckBtn.addEventListener('click', () => {
        const deckName = prompt('Nombre del nuevo mazo:');
        if (deckName && deckName.trim()) {
            decks.push({ name: deckName.trim(), cards: [] });
            saveDecks();
            renderDecks();
        }
    });
    deckList.addEventListener('click', e => {
        const target = e.target.closest('.delete-deck-btn');
        if(target) {
            const index = target.dataset.index;
            if (confirm(`¿Seguro que quieres eliminar el mazo "${decks[index].name}"?`)) {
                decks.splice(index, 1);
                saveDecks();
                renderDecks();
            }
        }
    });
    importDeckBtn.addEventListener('click', () => deckFileInput.click());
    deckFileInput.addEventListener('change', importDeckFromFile);
    addCardBtn.addEventListener('click', () => showSection('add-card-container'));
    backToDecksBtn.addEventListener('click', () => showSection('deck-list-container'));
    nextBtn.addEventListener('click', showNextCard);
    downloadDeckBtn.addEventListener('click', downloadDeck);
    ratingButtons.forEach(button => {
        button.addEventListener('click', e => {
            decks[currentDeckIndex].cards[currentCardIndex].masteryLevel = parseInt(e.target.dataset.rating, 10);
            saveDecks();
            showNextCard();
        });
    });
    cancelAddBtn.addEventListener('click', () => showSection('flashcard-view-container'));
    addCardForm.addEventListener('submit', (e) => { e.preventDefault(); /* ... */});


    // NOTAS
    addDocBtn.addEventListener('click', () => showNoteEditor());
    importDocBtn.addEventListener('click', () => docFileInput.click());
    docFileInput.addEventListener('change', importNoteFromFile);
    saveDocBtn.addEventListener('click', saveCurrentDoc);
    downloadDocBtn.addEventListener('click', downloadNote);
    cancelDocBtn.addEventListener('click', () => { docsListView.style.display = 'block'; docEditorView.style.display = 'none'; });
    docsList.addEventListener('click', e => {
        const openBtn = e.target.closest('.open-doc-btn');
        const deleteBtn = e.target.closest('.delete-doc-btn');
        if (openBtn) {
            showNoteEditor(openBtn.dataset.id);
        }
        if (deleteBtn) {
            if (confirm('¿Estás seguro de que quieres eliminar esta nota? Esta acción no se puede deshacer.')) {
                const docId = deleteBtn.dataset.id;
                for (const subject in docs) {
                    docs[subject] = docs[subject].filter(d => d.id !== docId);
                    if (docs[subject].length === 0) delete docs[subject];
                }
                saveDocs();
                renderDocs();
            }
        }
    });

    // TAREAS
    addTaskForm.addEventListener('submit', e => {
        e.preventDefault();
        const text = taskInput.value.trim();
        if (text) {
            tasks.push({ text: text, completed: false });
            saveTasks();
            renderTasks();
            taskInput.value = '';
        }
    });
    taskList.addEventListener('click', e => {
        const index = e.target.dataset.index;
        if (e.target.closest('.task-text')) {
            tasks[index].completed = !tasks[index].completed;
            saveTasks(); renderTasks();
        }
        if (e.target.closest('.delete-task-btn')) {
            tasks.splice(index, 1);
            saveTasks(); renderTasks();
        }
    });
    
    // POMODORO Y CALENDARIO
    pomodoroStartBtn.addEventListener('click', startPomodoro);
    pomodoroPauseBtn.addEventListener('click', pausePomodoro);
    pomodoroResetBtn.addEventListener('click', () => resetPomodoroTimer(true));
    pomodoroStudyTimeInput.addEventListener('change', savePomodoroSettings);
    pomodoroBreakTimeInput.addEventListener('change', savePomodoroSettings);
    prevMonthBtn.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar(); });
    nextMonthBtn.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(); });
    addEventTypeForm.addEventListener('submit', e => {
        e.preventDefault();
        const name = eventTypeNameInput.value.trim();
        if (name) {
            eventTypes.push({ id: Date.now().toString(), name, color: eventTypeColorInput.value });
            saveEventTypes(); renderEventTypes(); addEventTypeForm.reset();
        }
    });
    eventTypesList.addEventListener('click', e => {
        const deleteBtn = e.target.closest('.delete-event-btn');
        if (deleteBtn) {
            eventTypes = eventTypes.filter(t => t.id !== deleteBtn.dataset.id);
            saveEventTypes(); renderEventTypes(); renderCalendar();
        }
    });
    calendarGrid.addEventListener('click', handleDayClick);
    
    // --- Inicialización ---
    setTheme(localStorage.getItem('selectedTheme') || 'theme-light');
    showSection('deck-list-container');
    renderDecks();
    pomodoroStudyTimeInput.value = localStorage.getItem('pomodoroStudyTime') || 25;
    pomodoroBreakTimeInput.value = localStorage.getItem('pomodoroBreakTime') || 5;
    resetPomodoroTimer();
});