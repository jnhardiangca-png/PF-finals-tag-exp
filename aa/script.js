// ============================================================================
// TASK MANAGER - PF 102 CAPSTONE PROJECT
// Event-Driven Programming with Vanilla JavaScript
// ============================================================================

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

const state = { // Nakaimbak ang estado ng application
    tasks: [], // Listahan ng mga task
    categories: [], // Listahan ng mga kategorya
    filteredTasks: [], // Mga task na na-filter
    currentFilter: { // Aktibong filter para sa search at kategorya
        search: '', // Search text para sa filter
        category: '' // Piniling kategorya para sa filter
    }, // Pagtatapos ng block.
    currentTimer: null, // Kasalukuyang task na binabantayan ng timer
    timerInterval: null, // Interval ng timer para sa pagbilang
    darkMode: false // Kalagayan kung naka-dark mode
}; // Pagtatapos ng block.

// ============================================================================
// DOM ELEMENTS (CACHED FOR PERFORMANCE)
// ============================================================================

const elements = { // Mga reference sa DOM elements
    taskInput: document.getElementById('taskInput'), // Input field para sa task
    categorySelect: document.getElementById('categorySelect'), // Dropdown ng kategorya
    prioritySelect: document.getElementById('prioritySelect'), // Dropdown ng priority
    taskForm: document.getElementById('taskForm'), // Form ng pagdaragdag ng task
    taskList: document.getElementById('taskList'), // Listahan ng mga task sa DOM
    searchInput: document.getElementById('searchInput'), // Input para sa search
    categoryFilters: document.getElementById('categoryFilters'), // Container ng filter buttons
    totalCount: document.getElementById('totalCount'), // Element para sa kabuuang bilang
    completedCount: document.getElementById('completedCount'), // Element para sa natapos na bilang
    pendingCount: document.getElementById('pendingCount'), // Element para sa pending na bilang
    darkModeToggle: document.getElementById('darkModeToggle'), // Button para sa dark mode
    notificationContainer: document.getElementById('notificationContainer'), // Container ng notifications
    loadingIndicator: document.getElementById('loadingIndicator'), // Loading indicator
    timerPanel: document.getElementById('timerPanel'), // Panel ng timer
    timerTaskName: document.getElementById('timerTaskName'), // Pangalan ng task sa timer
    timerDisplay: document.getElementById('timerDisplay'), // Display ng oras ng timer
    startTimerBtn: document.getElementById('startTimerBtn'), // Button para simulan ang timer
    pauseTimerBtn: document.getElementById('pauseTimerBtn'), // Button para i-pause ang timer
    resetTimerBtn: document.getElementById('resetTimerBtn'), // Button para i-reset ang timer
    closeTimerBtn: document.getElementById('closeTimerBtn'), // Button para isara ang timer panel
    exportButton: document.getElementById('exportButton') // Button para i-export ang tasks
}; // Pagtatapos ng block.

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/** // Kodigo na gumagana sa app.
 * Debounce function - Delays function execution // Kodigo na gumagana sa app.
 * Feature #13: Debounced Search (Weeks 5) // Kodigo na gumagana sa app.
 * @param {Function} func - Function to debounce // Kodigo na gumagana sa app.
 * @param {number} delay - Delay in milliseconds // Kodigo na gumagana sa app.
 */ // Kodigo na gumagana sa app.
function debounce(func, delay) { // Nagbabalik ng function na may debounce behavior
    let timeoutId; // Identifier ng kasalukuyang timeout
    return function (...args) { // Function na may delay bago tumakbo ang target function
        clearTimeout(timeoutId); // Nililinis ang dating timeout
        timeoutId = setTimeout(() => func(...args), delay); // Nagse-set ng bagong timeout
    }; // Pagtatapos ng block.
} // Pagtatapos ng block.

/** // Kodigo na gumagana sa app.
 * Generate unique ID for tasks // Umiikot sa listahan.
 */ // Kodigo na gumagana sa app.
function generateId() { // Gumagawa ng natatanging ID para sa bagong task
    return Date.now().toString(36) + Math.random().toString(36).substr(2); // Pinagsamang timestamp at random string
} // Pagtatapos ng block.

/** // Kodigo na gumagana sa app.
 * Format seconds to HH:MM:SS // Kodigo na gumagana sa app.
 */ // Kodigo na gumagana sa app.
function formatTime(seconds) { // Ginagawa ang segundo sa format na oras
    const hours = Math.floor(seconds / 3600); // Kukuha ng oras mula sa total seconds
    const minutes = Math.floor((seconds % 3600) / 60); // Kukuha ng minuto mula sa natitirang seconds
    const secs = seconds % 60; // Kukuha ng natitirang segundo
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`; // Binabalik ang formatted string
} // Pagtatapos ng block.

// ============================================================================
// NOTIFICATION SYSTEM (Feature #15: Notifications - Week 5)
// ============================================================================

/** // Kodigo na gumagana sa app.
 * Show auto-dismissing notification // Kodigo na gumagana sa app.
 * Feature #15: Notifications with auto-dismiss // Kodigo na gumagana sa app.
 */ // Kodigo na gumagana sa app.
function showNotification(message, type = 'success', duration = 3000) { // Nagpapakita ng notification sa screen
    const notification = document.createElement('div'); // Lumilikha ng div para sa notification
    notification.className = `notification ${type}`; // Nagbibigay ng klase ayon sa uri ng notification
    notification.textContent = message; // Inilalagay ang mensahe sa notification
    
    // Feature #6: Event Object Usage - Event Listener for auto-removal
    elements.notificationContainer.appendChild(notification); // Idinadagdag ang notification sa container
    
    // Auto-dismiss notification
    setTimeout(() => { // Nagtatakda ng timeout para mawala ang notification
        notification.classList.add('removing'); // Naglalagay ng klase para sa animation
        // Feature #6: Event Object Usage
        notification.addEventListener('animationend', () => { // Tatanggalin pagkatapos ng animation
            notification.remove(); // Tatanggalin ang notification mula sa DOM
        }, { once: true }); // Pagtatapos ng block.
    }, duration); // Matapos ang itinakdang tagal
} // Pagtatapos ng block.

// ============================================================================
// DARK MODE (Feature #22: Dark Mode Toggle - Stretch Goal)
// ============================================================================

/** // Kodigo na gumagana sa app.
 * Initialize dark mode // Kodigo na gumagana sa app.
 */ // Kodigo na gumagana sa app.
function initDarkMode() { // Binubuo ang initial value ng dark mode mula sa localStorage
    const savedDarkMode = localStorage.getItem('darkMode') === 'true'; // Kukunin ang saved preference
    state.darkMode = savedDarkMode; // Iseset ang estado ng dark mode
    applyDarkMode(savedDarkMode); // Ipapakita ang tamang theme
} // Pagtatapos ng block.

/** // Kodigo na gumagana sa app.
 * Apply dark mode styling // Kodigo na gumagana sa app.
 * Feature #22: Dark Mode Toggle // Kodigo na gumagana sa app.
 */ // Kodigo na gumagana sa app.
function applyDarkMode(isDark) { // Nag-aapply ng dark mode classes sa dokumento
    if (isDark) { // Kung naka-enable ang dark mode
        document.documentElement.classList.add('dark-mode'); // Idinadagdag ang dark-mode class
        elements.darkModeToggle.textContent = '☀️'; // Binabago ang button text
    } else { // Kung hindi naka-enable ang dark mode
        document.documentElement.classList.remove('dark-mode'); // Tinatanggal ang dark-mode class
        elements.darkModeToggle.textContent = '🌙'; // Binabago ang button text
    } // Pagtatapos ng block.
    localStorage.setItem('darkMode', isDark); // Sina-save ang preference sa localStorage
} // Pagtatapos ng block.

/** // Kodigo na gumagana sa app.
 * Toggle dark mode // Kodigo na gumagana sa app.
 * Feature #22: Dark Mode Toggle // Kodigo na gumagana sa app.
 */ // Kodigo na gumagana sa app.
function toggleDarkMode() { // Ina-toggle ang kasalukuyang dark mode state
    state.darkMode = !state.darkMode; // Binabago ang estado ng dark mode
    applyDarkMode(state.darkMode); // Ina-apply ang bagong setting
    showNotification(`${state.darkMode ? 'Dark' : 'Light'} mode enabled`, 'info'); // Nagpapakita ng notification
} // Pagtatapos ng block.

// ============================================================================
// API & DATA FETCHING (Feature #19: Fetch from API, #20: async/await, #21: Error Handling)
// ============================================================================

/** // Kodigo na gumagana sa app.
 * Fetch categories from JSONPlaceholder API // Kumukuha ng data mula sa API.
 * Feature #19: Fetch Categories from API // Kumukuha ng data mula sa API.
 * Feature #20: async/await Pattern // Naghihintay ng async na resulta.
 * Feature #21: try/catch Error Handling // Hahawakan ang error kung may mali.
 */ // Kodigo na gumagana sa app.
async function fetchCategoriesFromAPI() { // Kumukuha ng kategorya mula sa API
    try { // Sinusubukan ang fetch at error handling
        elements.loadingIndicator.classList.remove('hidden'); // Ipinapakita ang loading indicator
        
        // Simulating fetch from API - using jsonplaceholder
        const response = await fetch('https://jsonplaceholder.typicode.com/users?_limit=6'); // Nagre-request sa external API
        
        if (!response.ok) { // Kung hindi ok ang response
            throw new Error(`HTTP error! status: ${response.status}`); // Hinahagis ang error
        } // Pagtatapos ng block.
        
        const users = await response.json(); // Kinukuha ang JSON data mula sa response
        
        // Map users to categories
        const categories = users.map(user => ({ // Gina-map ang users papuntang categories
            id: user.id, // Ginagamit ang user id bilang category id
            name: user.company.name.split(' ')[0] // Kinukuha ang unang salita bilang kategorya
        })).slice(0, 6); // Sinisiguro ang hanggang 6 na kategorya
        
        // Add custom categories
        state.categories = [ // Naka-set ang default na kategorya
            { id: 1, name: 'Work' }, // Kodigo na gumagana sa app.
            { id: 2, name: 'Personal' }, // Kodigo na gumagana sa app.
            { id: 3, name: 'Shopping' }, // Kodigo na gumagana sa app.
            { id: 4, name: 'Health' }, // Kodigo na gumagana sa app.
            { id: 5, name: 'Learning' }, // Kodigo na gumagana sa app.
            { id: 6, name: 'Home' } // Kodigo na gumagana sa app.
        ]; // Kodigo na gumagana sa app.
        
        populateCategorySelect(); // Pinupuno ang category dropdown
        createCategoryFilters(); // Gumagawa ng mga filter button
        showNotification('Categories loaded successfully', 'success'); // Nagpapakita ng success message
        
    } catch (error) { // Kung may error sa fetch
        // Feature #21: Error handling with user-friendly message
        console.error('Error fetching categories:', error); // Naglalabas ng error sa console
        showNotification(`Failed to load categories: ${error.message}`, 'error'); // Notification ng error
        
        // Fallback categories
        state.categories = [ // Nagse-set ng fallback categories
            { id: 1, name: 'Work' }, // Kodigo na gumagana sa app.
            { id: 2, name: 'Personal' }, // Kodigo na gumagana sa app.
            { id: 3, name: 'Shopping' }, // Kodigo na gumagana sa app.
            { id: 4, name: 'Health' }, // Kodigo na gumagana sa app.
            { id: 5, name: 'Learning' }, // Kodigo na gumagana sa app.
            { id: 6, name: 'Home' } // Kodigo na gumagana sa app.
        ]; // Kodigo na gumagana sa app.
        populateCategorySelect(); // Pinupuno pa rin ang dropdown
        createCategoryFilters(); // Gumagawa pa rin ng mga filter button
    } finally { // Palaging tumatakbo pagkatapos ng try/catch
        elements.loadingIndicator.classList.add('hidden'); // Itinatago ang loading indicator
    } // Pagtatapos ng block.
} // Pagtatapos ng block.

// ============================================================================
// CATEGORY MANAGEMENT
// ============================================================================

/** // Kodigo na gumagana sa app.
 * Populate category select dropdown // Kodigo na gumagana sa app.
 */ // Kodigo na gumagana sa app.
function populateCategorySelect() { // Binubuo ang listahan ng kategorya sa dropdown
    // Clear existing options except placeholder
    elements.categorySelect.innerHTML = '<option value="">Select Category</option>'; // Nililinis ang dropdown at idinadagdag ang placeholder
    
    state.categories.forEach(category => { // Pinupuno ang dropdown gamit ang bawat kategorya
        const option = document.createElement('option'); // Lumilikha ng option element
        option.value = category.name.toLowerCase(); // SINASETS ang value mula sa pangalan ng kategorya
        option.textContent = category.name; // INA-SET ang nakikitang text
        elements.categorySelect.appendChild(option); // DINADAGDAG ang option sa dropdown
    }); // Pagtatapos ng block.
} // Pagtatapos ng block.

/** // Kodigo na gumagana sa app.
 * Create category filter buttons // Sine-select ang mga item base sa kondisyon.
 * Feature #11: Filter by Category // Sine-select ang mga item base sa kondisyon.
 */ // Kodigo na gumagana sa app.
function createCategoryFilters() { // Gumagawa ng mga button para i-filter ang tasks
    elements.categoryFilters.innerHTML = ''; // Nililinis ang kasalukuyang filter buttons
    
    // "All" button
    const allBtn = createCategoryFilterButton('All', ''); // Lumikha ng button para sa lahat ng kategorya
    allBtn.classList.add('active'); // Ina-activate ang All button bilang default
    elements.categoryFilters.appendChild(allBtn); // Dinadagdag ang All button sa container
    
    // Category buttons
    state.categories.forEach(category => { // Lumilikha ng button para sa bawat kategorya
        const btn = createCategoryFilterButton(category.name, category.name.toLowerCase()); // Lumikha ng button na may category value
        elements.categoryFilters.appendChild(btn); // Dinadagdag ang button sa container
    }); // Pagtatapos ng block.
} // Pagtatapos ng block.

/** // Kodigo na gumagana sa app.
 * Create a single category filter button // Sine-select ang mga item base sa kondisyon.
 */ // Kodigo na gumagana sa app.
function createCategoryFilterButton(label, value) { // Lumilikha ng isang button para sa filter
    const btn = document.createElement('button'); // Lumilikha ng button element
    btn.className = 'category-filter-btn'; // Ina-assign ang CSS class
    btn.textContent = label; // Ina-assign ang label
    btn.setAttribute('data-category', value); // Ina-assign ang data attribute
    
    // Feature #5: Event Listeners
    btn.addEventListener('click', (event) => { // Nag-a-attach ng click listener
        // Feature #6: Event Object Usage
        event.preventDefault(); // Pinipigilan ang default behavior
        filterByCategory(value); // Nilalapat ang category filter
    }); // Pagtatapos ng block.
    
    return btn; // Binabalik ang bagong button
} // Pagtatapos ng block.

/** // Kodigo na gumagana sa app.
 * Filter tasks by category // Sine-select ang mga item base sa kondisyon.
 * Feature #11: Filter by Category // Sine-select ang mga item base sa kondisyon.
 */ // Kodigo na gumagana sa app.
function filterByCategory(category) { // Ina-update ang kasalukuyang category filter
    state.currentFilter.category = category; // Inilalagay sa estado ang napiling kategorya
    
    // Update active button
    document.querySelectorAll('.category-filter-btn').forEach(btn => { // Tsinong ang lahat ng filter buttons
        btn.classList.toggle('active', btn.getAttribute('data-category') === category); // Ina-aktibo ang katugmang button
    }); // Pagtatapos ng block.
    
    applyFilters(); // Ina-apply ang lahat ng filter sa task list
} // Pagtatapos ng block.

// ============================================================================
// SEARCH & FILTERING (Feature #12: Search/Filter, #13: Debounced Search)
// ============================================================================

/** // Kodigo na gumagana sa app.
 * Search/Filter tasks by text // Sine-select ang mga item base sa kondisyon.
 * Feature #12: Live Search // Kodigo na gumagana sa app.
 */ // Kodigo na gumagana sa app.
function searchTasks(searchTerm) { // Nagse-set ng search filter
    state.currentFilter.search = searchTerm.toLowerCase(); // Inilalagay ang search text sa estado
    applyFilters(); // Ina-apply ang filter
} // Pagtatapos ng block.

/** // Kodigo na gumagana sa app.
 * Debounced search function // Kodigo na gumagana sa app.
 * Feature #13: Debounced Search (300ms delay) // Kodigo na gumagana sa app.
 */ // Kodigo na gumagana sa app.
const debouncedSearch = debounce((event) => { // Gumagamit ng debounce sa search input
    // Feature #6: Event Object Usage - accessing event.target
    searchTasks(event.target.value); // Sinesend ang input value sa search function
}, 300); // Delay na 300ms

/** // Kodigo na gumagana sa app.
 * Apply all active filters to tasks // Kodigo na gumagana sa app.
 */ // Kodigo na gumagana sa app.
function applyFilters() { // Naa-apply ang search at category filter sa tasks
    state.filteredTasks = state.tasks.filter(task => { // Sine-filter ang tasks array
        const matchesSearch = task.text.toLowerCase().includes(state.currentFilter.search); // Tinitingnan kung tumutugma sa search
        const matchesCategory = !state.currentFilter.category || task.category === state.currentFilter.category; // Tinitingnan kung tumutugma sa category
        return matchesSearch && matchesCategory; // Binabalik ang task kung pumasa sa parehong filter
    }); // Pagtatapos ng block.
    
    renderTasks(); // Ina-update ang task list display
} // Pagtatapos ng block.

// ============================================================================
// TASK OPERATIONS
// ============================================================================

/** // Kodigo na gumagana sa app.
 * Add a new task // Kodigo na gumagana sa app.
 * Feature #1: Add Task // Kodigo na gumagana sa app.
 * Feature #5: Event Listeners // Kodigo na gumagana sa app.
 */ // Kodigo na gumagana sa app.
function addTask(event) { // Ina-handle ang submit event ng task form
    // Feature #7: preventDefault() - Prevent form default submission
    event.preventDefault(); // Pinipigilan ang default form submit behavior
    
    const taskText = elements.taskInput.value.trim(); // Kinukuha at tinitimpla ang input text
    const category = elements.categorySelect.value || 'personal'; // Kinukuha ang napiling kategorya
    const priority = elements.prioritySelect.value; // Kinukuha ang napiling priority
    
    if (!taskText) { // Kung walang text ang task
        showNotification('Please enter a task', 'warning'); // Nagpapakita ng warning
        return; // Hindi magpapatuloy kung walang task text
    } // Pagtatapos ng block.
    
    const newTask = { // Gumagawa ng bagong task object
        id: generateId(), // Bumubuo ng unikong ID
        text: taskText, // Naka-store ang task text
        completed: false, // Default na hindi pa natapos
        category: category, // Naka-store ang kategorya
        priority: priority, // Naka-store ang priority
        createdAt: new Date(), // Naka-store ang petsa ng paglikha
        timerSeconds: 0, // Default na timer value
        isEditing: false // Hindi pa nasa edit mode
    }; // Pagtatapos ng block.
    
    state.tasks.push(newTask); // Idinadagdag ang bagong task sa estado
    
    // Feature #23: localStorage Persistence - Wrapped in Promise pattern
    saveTasks().then(() => { // Sinusubukang i-save ang tasks sa localStorage
        elements.taskInput.value = ''; // Nililinis ang task input
        elements.categorySelect.value = ''; // Ina-reset ang category select
        elements.prioritySelect.value = 'medium'; // Ina-reset ang priority select
        applyFilters(); // Ina-refresh ang listahan ng tasks
        showNotification('Task added successfully!', 'success'); // Nagpapakita ng success notification
    }); // Pagtatapos ng block.
} // Pagtatapos ng block.

/** // Kodigo na gumagana sa app.
 * Delete a task // Kodigo na gumagana sa app.
 * Feature #2: Delete Task // Kodigo na gumagana sa app.
 */ // Kodigo na gumagana sa app.
function deleteTask(taskId) { // Ina-delete ang task mula sa estado
    state.tasks = state.tasks.filter(task => task.id !== taskId); // Inaalis ang task na may matching ID from the array
    
    // Feature #23: localStorage Persistence
    saveTasks().then(() => { // Ini-save ang updated list sa localStorage
        applyFilters(); // Ina-refresh ang task display
        showNotification('Task deleted', 'success'); // Nagpapakita ng notification
    }); // Pagtatapos ng block.
} // Pagtatapos ng block.

/** // Kodigo na gumagana sa app.
 * Toggle task completion status // Kodigo na gumagana sa app.
 * Feature #3: Complete Task (toggle completed state) // Kodigo na gumagana sa app.
 */ // Kodigo na gumagana sa app.
function toggleTaskComplete(taskId) { // Binabago ang completion state ng task
    const task = state.tasks.find(t => t.id === taskId); // Hinahanap ang task sa estado
    if (task) { // Kung nahanap ang task
        task.completed = !task.completed; // Ina-toggle ang completed state
        
        // Feature #23: localStorage Persistence
        saveTasks().then(() => { // Ini-save ang updated completion status
            applyFilters(); // Ina-refresh ang listahan
            showNotification( // Kodigo na gumagana sa app.
                task.completed ? 'Task completed!' : 'Task marked as pending', // Mensahe depende sa estado
                'success' // Uri ng notification
            ); // Kodigo na gumagana sa app.
        }); // Pagtatapos ng block.
    } // Pagtatapos ng block.
} // Pagtatapos ng block.

/** // Kodigo na gumagana sa app.
 * Start editing a task // Kodigo na gumagana sa app.
 * Feature #9: Task Editing - Double-click or click-to-edit // Kodigo na gumagana sa app.
 */ // Kodigo na gumagana sa app.
function startEditingTask(taskId) { // Inilalagay ang task sa edit mode
    const task = state.tasks.find(t => t.id === taskId); // Hinahanap ang task sa estado
    if (task) { // Kung nahanap ang task
        task.isEditing = true; // Ina-activate ang edit mode
        renderTasks(); // Ina-render muli ang listahan para lumabas ang edit field
        
        // Focus the edit input
        setTimeout(() => { // Tinitiyak na nasa DOM na ang input bago i-focus
            const editInput = document.querySelector(`[data-edit-id="${taskId}"]`); // Hinahanap ang edit input ng task
            if (editInput) { // Kung nahanap ang input
                editInput.focus(); // Ipinapokus ang input
                editInput.select(); // Pinipili ang laman ng input
            } // Pagtatapos ng block.
        }, 0); // Agarang ilalagay sa event queue
    } // Pagtatapos ng block.
} // Pagtatapos ng block.

/** // Kodigo na gumagana sa app.
 * Save task editing // Kodigo na gumagana sa app.
 */ // Kodigo na gumagana sa app.
function saveTaskEdit(taskId, newText) { // Ise-save ang bagong text ng task
    const task = state.tasks.find(t => t.id === taskId); // Hinahanap ang task sa estado
    if (task) { // Kung nahanap ang task
        task.text = newText.trim() || task.text; // Ina-update ang text kung may bagong laman
        task.isEditing = false; // Lilitaw muli ang normal na view ng task
        
        // Feature #23: localStorage Persistence
        saveTasks().then(() => { // Ini-save ang pagbabago sa localStorage
            applyFilters(); // Ina-refresh ang display
            showNotification('Task updated', 'success'); // Nagpapakita ng success notification
        }); // Pagtatapos ng block.
    } // Pagtatapos ng block.
} // Pagtatapos ng block.

/** // Kodigo na gumagana sa app.
 * Cancel task editing // Kodigo na gumagana sa app.
 */ // Kodigo na gumagana sa app.
function cancelTaskEdit(taskId) { // Kinakansela ang edit mode
    const task = state.tasks.find(t => t.id === taskId); // Hinahanap ang task
    if (task) { // Kung nahanap ang task
        task.isEditing = false; // Ina-deactivate ang edit mode
        renderTasks(); // Ina-refresh ang task list
    } // Pagtatapos ng block.
} // Pagtatapos ng block.

// ============================================================================
// TIMER FUNCTIONALITY (Feature #17: Countdown Timer, #18: Timer Controls)
// ============================================================================

/** // Kodigo na gumagana sa app.
 * Open timer for a task // Umiikot sa listahan.
 * Feature #17: Countdown Timer // Kodigo na gumagana sa app.
 * Feature #18: Start/Pause/Reset Timer Controls // Kodigo na gumagana sa app.
 */ // Kodigo na gumagana sa app.
function openTaskTimer(taskId) { // Binubuksan ang timer panel para sa isang task
    const task = state.tasks.find(t => t.id === taskId); // Hinahanap ang task
    if (!task) return; // Bababa kung walang task
    
    state.currentTimer = task; // Ipinapakita kung alin ang kasalukuyang timer
    elements.timerTaskName.textContent = task.text; // Ina-update ang task name sa timer panel
    elements.timerDisplay.textContent = formatTime(task.timerSeconds); // Ina-update ang display ng oras
    elements.timerPanel.classList.remove('hidden'); // Ipinapakita ang timer panel
} // Pagtatapos ng block.

/** // Kodigo na gumagana sa app.
 * Close timer panel // Kodigo na gumagana sa app.
 */ // Kodigo na gumagana sa app.
function closeTaskTimer() { // Isinasara ang timer panel
    stopTimer(); // Pinapahinto ang timer
    state.currentTimer = null; // Wala nang kasalukuyang timer
    elements.timerPanel.classList.add('hidden'); // Itinatago ang panel
} // Pagtatapos ng block.

/** // Kodigo na gumagana sa app.
 * Start timer // Kodigo na gumagana sa app.
 * Feature #17: Countdown Timer - uses setInterval // Kodigo na gumagana sa app.
 * Feature #18: Timer Controls // Kodigo na gumagana sa app.
 */ // Kodigo na gumagana sa app.
function startTimer() { // Sinisimulan ang timer increment
    if (!state.currentTimer || state.timerInterval) return; // Hindi magpapatuloy kung walang kasalukuyang task o aktibong timer
    
    state.timerInterval = setInterval(() => { // Nagtatakda ng interval para sa timer
        state.currentTimer.timerSeconds++; // Dinadagdagan ang timer value
        elements.timerDisplay.textContent = formatTime(state.currentTimer.timerSeconds); // Ina-update ang display
        
        // Update task list
        applyFilters(); // Ina-refresh ang task list para makita ang bagong oras
    }, 1000); // Bawat segundo
} // Pagtatapos ng block.

/** // Kodigo na gumagana sa app.
 * Pause timer // Kodigo na gumagana sa app.
 * Feature #18: Timer Controls - clearInterval management // Kodigo na gumagana sa app.
 */ // Kodigo na gumagana sa app.
function pauseTimer() { // Pinapatigil ang kasalukuyang timer interval
    if (state.timerInterval) { // Kung may aktibong timer interval
        clearInterval(state.timerInterval); // Nililinis ang interval
        state.timerInterval = null; // Ina-reset ang timer interval state
    } // Pagtatapos ng block.
} // Pagtatapos ng block.

/** // Kodigo na gumagana sa app.
 * Stop timer (pause) // Kodigo na gumagana sa app.
 */ // Kodigo na gumagana sa app.
function stopTimer() { // Tumatawag sa pauseTimer para ihinto ang timer
    pauseTimer(); // Pinahihinto ang timer
} // Pagtatapos ng block.

/** // Kodigo na gumagana sa app.
 * Reset timer // Kodigo na gumagana sa app.
 * Feature #18: Timer Controls - Reset functionality // Kodigo na gumagana sa app.
 */ // Kodigo na gumagana sa app.
function resetTimer() { // Nirereset ang oras ng timer
    pauseTimer(); // Pinapahinto muna ang timer
    if (state.currentTimer) { // Kung may task na naka-open ang timer
        state.currentTimer.timerSeconds = 0; // Ise-set ang oras pabalik sa zero
        elements.timerDisplay.textContent = formatTime(0); // Ina-update ang display
        applyFilters(); // Ina-refresh ang task list
    } // Pagtatapos ng block.
} // Pagtatapos ng block.

// ============================================================================
// TASK STATS (Feature #14: Task Counter)
// ============================================================================

/** // Kodigo na gumagana sa app.
 * Update task statistics // Kodigo na gumagana sa app.
 * Feature #14: Task Counter - Display total, completed, and pending counts // Kodigo na gumagana sa app.
 */ // Kodigo na gumagana sa app.
function updateTaskStats() { // Ina-update ang stats indicators
    const total = state.tasks.length; // Kabuuang bilang ng tasks
    const completed = state.tasks.filter(t => t.completed).length; // Bilang ng natapos na tasks
    const pending = total - completed; // Bilang ng pending na tasks
    
    elements.totalCount.textContent = total; // Ina-update ang total count element
    elements.completedCount.textContent = completed; // Ina-update ang completed count element
    elements.pendingCount.textContent = pending; // Ina-update ang pending count element
} // Pagtatapos ng block.

// ============================================================================
// EXPORT FUNCTIONALITY (Feature #25: Export Tasks as JSON)
// ============================================================================

/** // Kodigo na gumagana sa app.
 * Export tasks as JSON file // Kodigo na gumagana sa app.
 * Feature #25: Export Tasks as JSON - Download button // Kodigo na gumagana sa app.
 */ // Kodigo na gumagana sa app.
function exportTasksAsJSON() { // Nag-e-export ng tasks sa JSON file
    const dataStr = JSON.stringify(state.tasks, null, 2); // Ginagawa ang tasks object na JSON string
    const dataBlob = new Blob([dataStr], { type: 'application/json' }); // Gumagawa ng Blob ng JSON data
    const url = URL.createObjectURL(dataBlob); // Gumagawa ng temporary URL
    
    const link = document.createElement('a'); // Lumilikha ng anchor element para i-download
    link.href = url; // Ina-assign ang download URL
    link.download = `tasks-${new Date().toISOString().split('T')[0]}.json`; // Ina-assign ang filename
    
    // Feature #5: Event Listeners
    link.addEventListener('click', () => { // Nagpapakita ng notification pagkatapos i-click ang download link
        showNotification('Tasks exported successfully!', 'success'); // Success notification
    }); // Pagtatapos ng block.
    
    document.body.appendChild(link); // Idinadagdag ang link sa body
    link.click(); // Ikiniklik ang link para magsimula ang download
    document.body.removeChild(link); // Tinanggal ang temporary link
    URL.revokeObjectURL(url); // Nililinis ang temporary URL
} // Pagtatapos ng block.

// ============================================================================
// PERSISTENCE (Feature #23: localStorage Persistence)
// ============================================================================

/** // Kodigo na gumagana sa app.
 * Save tasks to localStorage // Gumagamit ng browser storage.
 * Feature #23: localStorage Persistence wrapped in Promise // Gumagamit ng browser storage.
 */ // Kodigo na gumagana sa app.
function saveTasks() { // Ini-store ang current tasks state sa localStorage
    return new Promise((resolve) => { // Gumagamit ng Promise para sabay sa async flow
        try { // Sinusubukan mag-save sa localStorage
            localStorage.setItem('tasks', JSON.stringify(state.tasks)); // Gina-store ang tasks sa localStorage
            resolve(); // Sinasabing natapos na ang save
        } catch (error) { // Kung may error sa pag-save
            console.error('Error saving tasks:', error); // Nagl-log ng error
            resolve(); // Hindi hinahadlangan ang app sa error
        } // Pagtatapos ng block.
    }); // Pagtatapos ng block.
} // Pagtatapos ng block.

/** // Kodigo na gumagana sa app.
 * Load tasks from localStorage // Gumagamit ng browser storage.
 * Feature #23: localStorage Persistence // Gumagamit ng browser storage.
 */ // Kodigo na gumagana sa app.
function loadTasks() { // Kinukuha ang saved tasks mula sa localStorage
    try { // Sinusubukan ang pag-load ng value
        const saved = localStorage.getItem('tasks'); // Kinukuha ang saved JSON string
        if (saved) { // Kung mayroong saved data
            state.tasks = JSON.parse(saved); // Binabalik ang JSON sa object
            return; // Tumitigil pagkatapos mai-load
        } // Pagtatapos ng block.
    } catch (error) { // Kung may error sa pag-parse o pagkuha
        console.error('Error loading tasks:', error); // Nagl-log ng error
    } // Pagtatapos ng block.
    state.tasks = []; // Kung walang saved data, empty array ang estado
} // Pagtatapos ng block.

// ============================================================================
// TASK RENDERING (Feature #4: Task List Rendering)
// ============================================================================

/** // Kodigo na gumagana sa app.
 * Render tasks to the DOM // Kodigo na gumagana sa app.
 * Feature #4: Task List Rendering - Tasks rendered from JavaScript state // Kodigo na gumagana sa app.
 * Feature #8: DOM Selection - Using DOM manipulation methods // Kodigo na gumagana sa app.
 */ // Kodigo na gumagana sa app.
function renderTasks() { // Ina-render ang filtered tasks sa UI
    const taskList = elements.taskList; // Reference sa task list container
    
    if (state.filteredTasks.length === 0) { // Kung walang task na papakita
        taskList.innerHTML = '<p class="empty-state">No tasks yet. Add one to get started!</p>'; // Nagpapakita ng empty state message
        updateTaskStats(); // Ina-update ang stats kahit walang task
        return; // Tatapusin ang function
    } // Pagtatapos ng block.
    
    taskList.innerHTML = ''; // Nililinis ang kasalukuyang listahan
    
    state.filteredTasks.forEach(task => { // Ina-loop ang bawat filtered task
        const taskElement = createTaskElement(task); // Gumagawa ng DOM element para sa task
        taskList.appendChild(taskElement); // Idinadagdag ang element sa task list
    }); // Pagtatapos ng block.
    
    updateTaskStats(); // Ina-update ang task stats pagkatapos i-render
} // Pagtatapos ng block.

/** // Kodigo na gumagana sa app.
 * Create a task element // Kodigo na gumagana sa app.
 * Feature #8: DOM Selection - Using DOM manipulation // Kodigo na gumagana sa app.
 */ // Kodigo na gumagana sa app.
function createTaskElement(task) { // Gumagawa ng DOM structure para sa isang task item
    const div = document.createElement('div'); // Lumilikha ng task container
    div.className = `task-item ${task.completed ? 'completed' : ''}`; // Ina-assign ang klase batay sa completion status
    
    // Checkbox
    const checkbox = document.createElement('input'); // Lumilikha ng checkbox
    checkbox.type = 'checkbox'; // Naka-set ang tipo ng input
    checkbox.className = 'task-checkbox'; // Naka-assign ang CSS class
    checkbox.checked = task.completed; // Isa-set ang checkbox ayon sa completion state
    
    // Feature #5: Event Listeners - checkbox listener
    checkbox.addEventListener('change', () => toggleTaskComplete(task.id)); // Nag-a-attach ng event para i-toggle ang completion
    
    // Task content
    const content = document.createElement('div'); // Lumilikha ng wrapper para sa content ng task
    content.className = 'task-content'; // Naka-assign na klase para sa styling
    
    if (task.isEditing) { // Kung ang task ay nasa edit mode
        // Edit input
        const input = document.createElement('input'); // Lumilikha ng text input para i-edit ang task
        input.type = 'text'; // Naka-set ang tipo ng input
        input.className = 'task-edit-input'; // Naka-assign ang CSS class
        input.value = task.text; // Ina-set ang value ng input mula sa task text
        input.setAttribute('data-edit-id', task.id); // Naka-assign ng data attribute para sa task
        
        // Feature #5: Event Listeners - edit input listeners
        input.addEventListener('keypress', (event) => { // Nag-a-attach ng listener para sa keypress
            // Feature #6: Event Object Usage
            if (event.key === 'Enter') { // Kung pinindot ang Enter
                saveTaskEdit(task.id, input.value); // Ise-save ang edit
            } else if (event.key === 'Escape') { // Kung pinindot ang Escape
                cancelTaskEdit(task.id); // Kinakansela ang edit
            } // Pagtatapos ng block.
        }); // Pagtatapos ng block.
        
        input.addEventListener('blur', () => { // Nag-a-attach ng listener sa blur event
            saveTaskEdit(task.id, input.value); // Ise-save kapag nawala ang focus
        }); // Pagtatapos ng block.
        
        content.appendChild(input); // Idinadagdag ang input sa content wrapper
    } else { // Kung hindi nasa edit mode ang task
        // Task text
        const taskText = document.createElement('div'); // Lumilikha ng element para sa task text
        taskText.className = 'task-text'; // Naka-assign ang CSS class
        taskText.textContent = task.text; // Ina-set ang nakikitang teksto
        
        // Feature #5: Event Listeners - double-click to edit
        taskText.addEventListener('dblclick', () => { // Nag-a-attach ng double click listener
            startEditingTask(task.id); // Sinisimulan ang edit mode
        }); // Pagtatapos ng block.
        
        content.appendChild(taskText); // Idinadagdag ang task text sa content
        
        // Task metadata
        const meta = document.createElement('div'); // Lumilikha ng metadata container
        meta.className = 'task-meta'; // Naka-assign ang CSS class
        
        // Category badge
        const categoryBadge = document.createElement('span'); // Lumilikha ng badge para sa category
        categoryBadge.className = `task-category category-${task.category}`; // Naka-assign ang class para sa category
        categoryBadge.textContent = task.category; // Ina-set ang kategorya bilang text
        meta.appendChild(categoryBadge); // Idinadagdag ang badge sa metadata
        
        // Priority badge (Feature #24: Task Priority Levels)
        const priorityBadge = document.createElement('span'); // Lumilikha ng badge para sa priority
        priorityBadge.className = `task-priority priority-${task.priority}`; // Naka-assign ang class para sa priority
        priorityBadge.textContent = task.priority; // Ina-set ang priority bilang text
        meta.appendChild(priorityBadge); // Idinadagdag ang badge sa metadata
        
        // Timer display
        if (task.timerSeconds > 0) { // Kung may naitalang oras sa task
            const timerSpan = document.createElement('span'); // Lumilikha ng oras display
            timerSpan.className = 'task-timer'; // Naka-assign ang CSS class
            timerSpan.textContent = `⏱️ ${formatTime(task.timerSeconds)}`; // Ina-set ang formatted time
            meta.appendChild(timerSpan); // Idinadagdag ang timer display sa metadata
        } // Pagtatapos ng block.
        
        content.appendChild(meta); // Idinadagdag ang metadata sa content
    } // Pagtatapos ng block.
    
    // Buttons
    const editBtn = document.createElement('button'); // Lumilikha ng edit button
    editBtn.className = 'task-btn edit'; // Naka-assign ang CSS class
    editBtn.textContent = '✏️ Edit'; // Ina-set ang button text
    
    // Feature #5: Event Listeners - edit button
    editBtn.addEventListener('click', () => startEditingTask(task.id)); // Nag-a-attach ng click listener para mag-edit
    
    const timerBtn = document.createElement('button'); // Lumilikha ng timer button
    timerBtn.className = 'task-btn timer'; // Naka-assign ang CSS class
    timerBtn.textContent = '⏱️ Timer'; // Ina-set ang button text
    
    // Feature #5: Event Listeners - timer button
    timerBtn.addEventListener('click', () => openTaskTimer(task.id)); // Nag-a-attach ng click listener para buksan ang timer
    
    const deleteBtn = document.createElement('button'); // Lumilikha ng delete button
    deleteBtn.className = 'task-btn delete'; // Naka-assign ang CSS class
    deleteBtn.textContent = '🗑️ Delete'; // Ina-set ang button text
    
    // Feature #5: Event Listeners - delete button
    deleteBtn.addEventListener('click', () => deleteTask(task.id)); // Nag-a-attach ng click listener para mag-delete
    
    // Assemble task element
    div.appendChild(checkbox); // Idinadagdag ang checkbox sa task container
    div.appendChild(content); // Idinadagdag ang content wrapper sa task container
    div.appendChild(editBtn); // Idinadagdag ang edit button
    div.appendChild(timerBtn); // Idinadagdag ang timer button
    div.appendChild(deleteBtn); // Idinadagdag ang delete button
    
    return div; // Binabalik ang kompletong task element
} // Pagtatapos ng block.

// ============================================================================
// EVENT LISTENER SETUP (Feature #5: Event Listeners)
// ============================================================================

/** // Kodigo na gumagana sa app.
 * Initialize all event listeners // Kodigo na gumagana sa app.
 * Feature #5: Proper use of addEventListener for all interactions // Nagdagdag ng event listener.
 */ // Kodigo na gumagana sa app.
function initEventListeners() { // Ina-attach ang lahat ng event listeners ng app
    // Feature #5: Task form submission
    elements.taskForm.addEventListener('submit', addTask); // Nag-a-attach ng listener para sa form submit
    
    // Feature #5 & #13: Debounced search listener
    elements.searchInput.addEventListener('input', debouncedSearch); // Nag-a-attach ng listener para sa search input
    
    // Feature #5: Dark mode toggle
    elements.darkModeToggle.addEventListener('click', toggleDarkMode); // Nag-a-attach ng listener para sa dark mode button
    
    // Feature #5: Timer controls
    elements.startTimerBtn.addEventListener('click', startTimer); // Start timer button listener
    elements.pauseTimerBtn.addEventListener('click', pauseTimer); // Pause timer button listener
    elements.resetTimerBtn.addEventListener('click', resetTimer); // Reset timer button listener
    elements.closeTimerBtn.addEventListener('click', closeTaskTimer); // Close timer button listener
    
    // Feature #5: Export button
    elements.exportButton.addEventListener('click', exportTasksAsJSON); // Export button listener
} // Pagtatapos ng block.

// ============================================================================
// INITIALIZATION
// ============================================================================

/** // Kodigo na gumagana sa app.
 * Initialize the application // Kodigo na gumagana sa app.
 * Feature #20: async/await pattern // Naghihintay ng async na resulta.
 */ // Kodigo na gumagana sa app.
async function initializeApp() { // Init function ng app
    try { // Sinusubukan ang initialization flow
        // Load dark mode preference
        initDarkMode(); // Ina-load ang dark mode preference
        
        // Load tasks from localStorage
        loadTasks(); // Ina-load ang saved tasks
        
        // Initialize event listeners
        initEventListeners(); // Ina-attach ang event listeners
        
        // Fetch categories from API
        await fetchCategoriesFromAPI(); // Ina-fetch ang kategorya mula sa API
        
        // Initial render
        applyFilters(); // Ina-apply ang filter at nirender ang tasks
        
        showNotification('Task Manager loaded successfully!', 'info', 2000); // Nagpapakita ng notification na loaded na ang app
    } catch (error) { // Kung may error sa initialization
        console.error('Initialization error:', error); // Nagl-log ng error
        showNotification('Error initializing app', 'error'); // Nagpapakita ng error notification
    } // Pagtatapos ng block.
} // Pagtatapos ng block.

/** // Kodigo na gumagana sa app.
 * Start the application when DOM is ready // Kodigo na gumagana sa app.
 * Feature #5: Event Listeners - DOMContentLoaded // Kodigo na gumagana sa app.
 */ // Kodigo na gumagana sa app.
document.addEventListener('DOMContentLoaded', initializeApp); // Nagsisimula ang app kapag handa na ang DOM

// ============================================================================
// END OF SCRIPT
// ============================================================================
