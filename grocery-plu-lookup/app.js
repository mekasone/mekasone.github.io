// ===== PLU LOOKUP APP - MAIN APPLICATION =====

class PLULookupApp {
    constructor() {
        this.database = [];
        this.filteredResults = [];
        this.currentPage = 0;
        this.selectedIndex = 0;
        this.searchMode = 'CODE'; // 'CODE' or 'NAME'
        this.searchValue = '';
        this.sortBy = 'CODE'; // 'CODE' or 'NAME'
        this.itemsPerPage = 8;
        
        // Web Speech API
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        
        this.init();
    }
    
    // ===== INITIALIZATION =====
    init() {
        this.loadDatabase();
        this.initializeVoiceRecognition();
        this.bindEventListeners();
        this.applyTheme();
        this.displayResults();
        this.registerServiceWorker();
    }
    
    // ===== DATABASE MANAGEMENT =====
    loadDatabase() {
        const savedDB = localStorage.getItem('pluDatabase');
        if (savedDB) {
            this.database = JSON.parse(savedDB);
            this.showToast(`Loaded ${this.database.length} items from storage`, 'success');
        } else {
            // Load sample data
            this.database = this.getSampleData();
            this.saveDatabase();
        }
        this.filteredResults = [...this.database];
        this.sortDatabase();
    }
    
    saveDatabase() {
        localStorage.setItem('pluDatabase', JSON.stringify(this.database));
    }
    
    getSampleData() {
        return [
            { code: 4011, name: 'BANANAS YELLOW' },
            { code: 4030, name: 'KIWI' },
            { code: 4040, name: 'LIME' },
            { code: 4053, name: 'LEMON' },
            { code: 4065, name: 'GREEN PEPPER LG' },
            { code: 4067, name: 'CUCUMBER' },
            { code: 4078, name: 'GINGER ROOT' },
            { code: 4082, name: 'BROCCOLI' },
            { code: 4087, name: 'BUTTERNUT SQUASH' },
            { code: 4225, name: 'TOMATOES ROMA' },
            { code: 4616, name: 'APPLE GALA LG' },
            { code: 4663, name: 'APPLE GRANNY SMITH' },
            { code: 4017, name: 'GRAPES RED SEEDLESS' },
            { code: 4021, name: 'GRAPES GREEN SEEDLESS' },
            { code: 4048, name: 'LIME PERSIAN' },
            { code: 4050, name: 'MUSHROOMS WHITE' },
            { code: 4062, name: 'CUCUMBER ENGLISH' },
            { code: 4080, name: 'ASPARAGUS' },
            { code: 4081, name: 'AVOCADO HASS' },
            { code: 4088, name: 'CABBAGE GREEN' }
        ];
    }
    
    // ===== CSV UPLOAD =====
    handleCSVUpload(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target.result;
                const lines = text.split('\n');
                const newDB = [];
                
                for (let line of lines) {
                    line = line.trim();
                    if (!line) continue;
                    
                    const parts = line.split(',');
                    if (parts.length >= 2) {
                        const code = parseInt(parts[0].trim());
                        const name = parts.slice(1).join(',').trim().toUpperCase();
                        
                        if (!isNaN(code) && name) {
                            // Check for duplicates
                            if (!newDB.find(item => item.code === code)) {
                                newDB.push({ code, name });
                            }
                        }
                    }
                }
                
                if (newDB.length > 0) {
                    this.database = newDB;
                    this.saveDatabase();
                    this.filteredResults = [...this.database];
                    this.sortDatabase();
                    this.currentPage = 0;
                    this.displayResults();
                    this.showToast(`Loaded ${newDB.length} items successfully!`, 'success');
                } else {
                    this.showToast('No valid data found in CSV file', 'error');
                }
            } catch (error) {
                this.showToast('Error parsing CSV file', 'error');
                console.error(error);
            }
        };
        reader.readAsText(file);
    }
    
    // ===== SORTING =====
    sortDatabase() {
        if (this.sortBy === 'CODE') {
            this.filteredResults.sort((a, b) => a.code - b.code);
        } else {
            this.filteredResults.sort((a, b) => a.name.localeCompare(b.name));
        }
    }
    
    toggleSort() {
        this.sortBy = this.sortBy === 'CODE' ? 'NAME' : 'CODE';
        this.sortDatabase();
        this.currentPage = 0;
        this.displayResults();
        this.updateStatusBar();
        this.showToast(`Sorted by ${this.sortBy}`, 'success');
    }
    
    // ===== SEARCH =====
    searchByCode() {
        const code = parseInt(this.searchValue);
        if (isNaN(code)) {
            this.showToast('Please enter a valid number', 'warning');
            return;
        }
        
        const found = this.database.find(item => item.code === code);
        if (found) {
            this.filteredResults = [found];
            this.currentPage = 0;
            this.selectedIndex = 0;
            this.displayResults();
            this.showToast('Found!', 'success');
            this.speak(`${found.code}, ${found.name}`);
        } else {
            this.showToast('Code not found', 'error');
        }
    }
    
    searchByName() {
        const query = this.searchValue.toUpperCase();
        if (!query) {
            this.filteredResults = [...this.database];
            this.sortDatabase();
            this.displayResults();
            return;
        }
        
        this.filteredResults = this.database.filter(item => 
            item.name.includes(query)
        );
        
        this.sortDatabase();
        this.currentPage = 0;
        this.selectedIndex = 0;
        this.displayResults();
        
        if (this.filteredResults.length > 0) {
            this.showToast(`Found ${this.filteredResults.length} match(es)`, 'success');
        } else {
            this.showToast('No matches found', 'warning');
        }
    }
    
    performSearch() {
        if (this.searchMode === 'CODE') {
            this.searchByCode();
        } else {
            this.searchByName();
        }
    }
    
    // ===== INPUT HANDLING =====
    handleKeyInput(key) {
        if (key === 'BACK') {
            this.searchValue = this.searchValue.slice(0, -1);
        } else if (key === 'CLEAR') {
            this.searchValue = '';
            this.filteredResults = [...this.database];
            this.sortDatabase();
            this.displayResults();
        } else if (this.searchMode === 'CODE' && /^\d$/.test(key)) {
            this.searchValue += key;
        } else if (this.searchMode === 'NAME') {
            this.searchValue += key;
        }
        
        this.updateSearchDisplay();
    }
    
    updateSearchDisplay() {
        document.getElementById('search-mode').textContent = 
            this.searchMode === 'CODE' ? 'BY CODE:' : 'BY NAME:';
        document.getElementById('search-value').textContent = this.searchValue || '';
    }
    
    // ===== DISPLAY =====
    displayResults() {
        const startIndex = this.currentPage * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageItems = this.filteredResults.slice(startIndex, endIndex);
        
        const lines = document.querySelectorAll('.result-line');
        
        lines.forEach((line, index) => {
            const item = pageItems[index];
            const codeSpan = line.querySelector('.plu-code');
            const nameSpan = line.querySelector('.plu-name');
            
            if (item) {
                codeSpan.textContent = item.code.toString().padStart(4, '0');
                nameSpan.textContent = item.name;
                line.classList.remove('selected');
                
                if (index === this.selectedIndex) {
                    line.classList.add('selected');
                }
            } else {
                codeSpan.textContent = '----';
                nameSpan.textContent = '';
                line.classList.remove('selected');
            }
        });
        
        this.updateStatusBar();
    }
    
    updateStatusBar() {
        document.getElementById('db-count').textContent = 
            `Items: ${this.filteredResults.length}`;
        document.getElementById('sort-status').textContent = 
            `Sort: ${this.sortBy}`;
        
        const totalPages = Math.ceil(this.filteredResults.length / this.itemsPerPage) || 1;
        document.getElementById('page-info').textContent = 
            `Page: ${this.currentPage + 1}/${totalPages}`;
    }
    
    // ===== NAVIGATION =====
    navigateUp() {
        if (this.selectedIndex > 0) {
            this.selectedIndex--;
        } else if (this.currentPage > 0) {
            this.currentPage--;
            this.selectedIndex = this.itemsPerPage - 1;
        }
        this.displayResults();
    }
    
    navigateDown() {
        const startIndex = this.currentPage * this.itemsPerPage;
        const pageItems = this.filteredResults.slice(startIndex, startIndex + this.itemsPerPage);
        
        if (this.selectedIndex < pageItems.length - 1) {
            this.selectedIndex++;
        } else {
            const totalPages = Math.ceil(this.filteredResults.length / this.itemsPerPage);
            if (this.currentPage < totalPages - 1) {
                this.currentPage++;
                this.selectedIndex = 0;
            }
        }
        this.displayResults();
    }
    
    selectItem() {
        const globalIndex = this.currentPage * this.itemsPerPage + this.selectedIndex;
        const item = this.filteredResults[globalIndex];
        
        if (item) {
            this.speak(`${item.code}, ${item.name}`);
            this.showToast(`Selected: ${item.name}`, 'success');
        }
    }
    
    // ===== DELETE =====
    deleteCurrentItem() {
        const globalIndex = this.currentPage * this.itemsPerPage + this.selectedIndex;
        const item = this.filteredResults[globalIndex];
        
        if (!item) {
            this.showToast('No item selected', 'warning');
            return;
        }
        
        if (confirm(`Delete ${item.code} - ${item.name}?`)) {
            // Remove from main database
            this.database = this.database.filter(i => i.code !== item.code);
            this.saveDatabase();
            
            // Remove from filtered results
            this.filteredResults.splice(globalIndex, 1);
            
            // Adjust page and selection if needed
            if (this.filteredResults.length === 0) {
                this.currentPage = 0;
                this.selectedIndex = 0;
            } else if (globalIndex >= this.filteredResults.length) {
                if (this.selectedIndex > 0) {
                    this.selectedIndex--;
                } else if (this.currentPage > 0) {
                    this.currentPage--;
                }
            }
            
            this.displayResults();
            this.showToast('Item deleted', 'success');
        }
    }
    
    // ===== TEXT-TO-SPEECH =====
    speak(text) {
        if ('speechSynthesis' in window) {
            // Cancel any ongoing speech
            this.synthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.9;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;
            
            this.synthesis.speak(utterance);
        } else {
            this.showToast('Text-to-speech not supported', 'error');
        }
    }
    
    speakCurrentItem() {
        const globalIndex = this.currentPage * this.itemsPerPage + this.selectedIndex;
        const item = this.filteredResults[globalIndex];
        
        if (item) {
            this.speak(`${item.code}, ${item.name}`);
        } else {
            this.showToast('No item selected', 'warning');
        }
    }
    
    // ===== VOICE RECOGNITION =====
    initializeVoiceRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (SpeechRecognition) {
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';
            
            this.recognition.onstart = () => {
                document.getElementById('voice-indicator').classList.remove('hidden');
            };
            
            this.recognition.onend = () => {
                document.getElementById('voice-indicator').classList.add('hidden');
            };
            
            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript.toLowerCase();
                this.handleVoiceCommand(transcript);
            };
            
            this.recognition.onerror = (event) => {
                this.showToast('Voice recognition error', 'error');
                document.getElementById('voice-indicator').classList.add('hidden');
            };
        }
    }
    
    startVoiceRecognition() {
        if (this.recognition) {
            try {
                this.recognition.start();
            } catch (error) {
                this.showToast('Voice recognition already active', 'warning');
            }
        } else {
            this.showToast('Voice recognition not supported on this device', 'error');
        }
    }
    
    handleVoiceCommand(transcript) {
        console.log('Voice command:', transcript);
        
        // Check for number (PLU code)
        const numberMatch = transcript.match(/\d+/);
        if (numberMatch) {
            const code = parseInt(numberMatch[0]);
            const found = this.database.find(item => item.code === code);
            if (found) {
                this.speak(`${found.code}, ${found.name}`);
                this.showToast(`Found: ${found.name}`, 'success');
                return;
            }
        }
        
        // Search by product name
        const query = transcript.toUpperCase();
        const matches = this.database.filter(item => 
            item.name.includes(query) || 
            query.includes(item.name.split(' ')[0])
        );
        
        if (matches.length === 1) {
            this.speak(`${matches[0].code}, ${matches[0].name}`);
            this.showToast(`Found: ${matches[0].name}`, 'success');
        } else if (matches.length > 1) {
            this.speak(`Found ${matches.length} matches. Please be more specific.`);
            this.filteredResults = matches;
            this.displayResults();
        } else {
            this.speak('No matches found');
            this.showToast('No matches found', 'warning');
        }
    }
    
    // ===== THEME =====
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Update button icon
        const themeBtn = document.querySelector('#btn-theme .btn-icon');
        themeBtn.textContent = newTheme === 'light' ? '🌙' : '☀';
        
        this.showToast(`${newTheme === 'light' ? 'Light' : 'Dark'} theme activated`, 'success');
    }
    
    applyTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        const themeBtn = document.querySelector('#btn-theme .btn-icon');
        if (themeBtn) {
            themeBtn.textContent = savedTheme === 'light' ? '🌙' : '☀';
        }
    }
    
    // ===== TOAST NOTIFICATIONS =====
    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
    
    // ===== SERVICE WORKER =====
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js')
                .then(() => console.log('Service Worker registered'))
                .catch(err => console.log('Service Worker registration failed:', err));
        }
    }
    
    // ===== EVENT LISTENERS =====
    bindEventListeners() {
        // Function buttons
        document.getElementById('btn-speak').addEventListener('click', () => this.speakCurrentItem());
        document.getElementById('btn-voice').addEventListener('click', () => this.startVoiceRecognition());
        document.getElementById('btn-sort').addEventListener('click', () => this.toggleSort());
        document.getElementById('btn-delete').addEventListener('click', () => this.deleteCurrentItem());
        
        document.getElementById('btn-by-id').addEventListener('click', () => {
            this.searchMode = 'CODE';
            this.searchValue = '';
            this.updateSearchDisplay();
            this.showToast('Search by CODE mode', 'success');
        });
        
        document.getElementById('btn-by-name').addEventListener('click', () => {
            this.searchMode = 'NAME';
            this.searchValue = '';
            this.updateSearchDisplay();
            this.showToast('Search by NAME mode', 'success');
        });
        
        document.getElementById('btn-upload').addEventListener('click', () => {
            document.getElementById('csv-file-input').click();
        });
        
        document.getElementById('btn-theme').addEventListener('click', () => this.toggleTheme());
        
        // CSV file input
        document.getElementById('csv-file-input').addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleCSVUpload(e.target.files[0]);
            }
        });
        
        // Keypad
        document.querySelectorAll('.key-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const key = e.currentTarget.dataset.key;
                if (key) {
                    this.handleKeyInput(key);
                }
            });
        });
        
        // Navigation and action buttons
        document.getElementById('btn-up').addEventListener('click', () => this.navigateUp());
        document.getElementById('btn-down').addEventListener('click', () => this.navigateDown());
        document.getElementById('btn-search').addEventListener('click', () => this.performSearch());
        document.getElementById('btn-select').addEventListener('click', () => this.selectItem());
        
        // Result line clicks
        document.querySelectorAll('.result-line').forEach((line, index) => {
            line.addEventListener('click', () => {
                this.selectedIndex = index;
                this.displayResults();
            });
        });
        
        // Keyboard support
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    this.navigateUp();
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.navigateDown();
                    break;
                case 'Enter':
                    e.preventDefault();
                    this.performSearch();
                    break;
                case 'Delete':
                    e.preventDefault();
                    this.deleteCurrentItem();
                    break;
                case 'Backspace':
                    if (e.target.tagName !== 'INPUT') {
                        e.preventDefault();
                        this.handleKeyInput('BACK');
                    }
                    break;
            }
        });
    }
}

// ===== INITIALIZE APP =====
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new PLULookupApp();
});
