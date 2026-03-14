Vue.component('add-note-form', {
    data() {
        return {
            title: '',
            items: ['', '', '', '', '']
        }
    },
    template: `
        <div class="add-form">
            <h3>New Note</h3>
            <p>
                <label>Title:</label>
                <input v-model="title" placeholder="Enter title">
            </p>
            <p>
                <label>Item 1:</label>
                <input v-model="items[0]" placeholder="Enter item">
            </p>
            <p>
                <label>Item 2:</label>
                <input v-model="items[1]" placeholder="Enter item">
            </p>
            <p>
                <label>Item 3:</label>
                <input v-model="items[2]" placeholder="Enter item">
            </p>
            <p>
                <label>Item 4:</label>
                <input v-model="items[3]" placeholder="Enter item">
            </p>
            <p>
                <label>Item 5:</label>
                <input v-model="items[4]" placeholder="Enter item">
            </p>
            <button @click="addNote">Add Note</button>
        </div>
    `,
    methods: {
        addNote() {
            if (!this.title) {
                alert('Please enter a title')
                return
            }
            
            let validItems = this.items.filter(item => item.trim() !== '')
            if (validItems.length < 3) {
                alert('Please enter at least 3 items')
                return
            }
            
            let newCard = {
                id: Date.now(),
                title: this.title,
                color: '#ffffff',
                items: validItems.map(text => ({ text: text, done: false })),
                completedAt: null
            }
            
            this.$emit('add-card', newCard)
            
            this.title = ''
            this.items = ['', '', '', '', '']
        }
    }
})

Vue.component('note-card', {
    props: {
        card: Object,
        isColumn1Blocked: Boolean
    },
    template: `
        <div class="card">
            <div style="display: flex; justify-content: space-between;">
            <h3>{{ card.title }}</h3>
            </div>
            <ul>
                <li v-for="item in card.items">
                    <input type="checkbox" 
                           :checked="item.done" 
                           @change="$emit('toggle-item', card, item)"
                           :disabled="isColumn1Blocked"> 
                    {{ item.text }}
                </li>
            </ul>
            <div>Progress: {{ getCompletionPercent(card.items) }}%</div>
            <div v-if="card.completedAt" class="timestamp">
                {{ card.completedAt }}
            </div>
        </div>
    `,
    methods: {
        getCompletionPercent(items) {
            if (items.length === 0) return 0
            let doneCount = items.filter(item => item.done).length
            return (doneCount / items.length) * 100
        }
    }
})

Vue.component('note-column', {
    props: {
        title: String,
        cards: Array,
        columnType: String
    },
    template: `
        <div class="column" :class="{ blocked: isBlocked }">
            <h2>{{ title }} ({{ cards.length }}/{{ maxCards }})</h2>
            <div class="cards">
                <note-card 
                    v-for="card in cards" 
                    :key="card.id" 
                    :card="card"
                    :is-column1-blocked="columnType === 'todo' && $parent.isColumn1Blocked"
                    @toggle-item="handleToggleItem">
                </note-card>
            </div>
        </div>
    `,
    computed: {
        maxCards() {
            if (this.columnType === 'todo') return 3
            if (this.columnType === 'progress') return 5
            return Infinity
        },
        isBlocked() {
            return this.columnType === 'todo' && this.$parent.isColumn1Blocked
        }
    },
    methods: {
        handleToggleItem(card, item) {
            this.$emit('toggle-item', card, item)
        }
    }
})

let app = new Vue({
    el: '#app',
    data: {
        column1: [],
        column2: [],
        column3: [],
        isColumn1Blocked: false
    },
    methods: {
        
        checkAndMoveCards() {
            for (let i = this.column1.length - 1; i >= 0; i--) {
                let card = this.column1[i]
                let percent = this.getCompletionPercent(card.items)
                
                if (percent >= 100) {
                    card.completedAt = new Date().toLocaleString()
                    this.column3.push(card)
                    this.column1.splice(i, 1)
                } else if (percent > 50) {
                    this.column2.push(card)
                    this.column1.splice(i, 1)
                }
            }
            
            for (let i = this.column2.length - 1; i >= 0; i--) {
                let card = this.column2[i]
                let percent = this.getCompletionPercent(card.items)
                
                if (percent >= 100) {
                    card.completedAt = new Date().toLocaleString()
                    this.column3.push(card)
                    this.column2.splice(i, 1)
                }
            }
            this.checkColumn1Blocked()
        },
        
        toggleItem(card, item) {
            item.done = !item.done
            this.checkAndMoveCards()
            this.checkColumn1Blocked()
        },
        
        checkColumn1Blocked() {
            this.isColumn1Blocked = this.column2.length >= 5
        },
        
        getCompletionPercent(items) {
            if (items.length === 0) return 0
            let doneCount = items.filter(item => item.done).length
            return (doneCount / items.length) * 100
        },

        addNoteFromForm(newCard) {
            if (this.column1.length >= 3) {
                alert('Maximum 3 cards in first column')
                return
            }
            if (this.isColumn1Blocked) {
                alert('First column is blocked')
                return
            }
            this.column1.push(newCard)
        }
    },
    watch: {
        column1: {
            handler() {
                localStorage.setItem('notes', JSON.stringify({
                    column1: this.column1,
                    column2: this.column2,
                    column3: this.column3
                }))
            },
            deep: true
        },
        column2: {
            handler() {
                localStorage.setItem('notes', JSON.stringify({
                    column1: this.column1,
                    column2: this.column2,
                    column3: this.column3
                }))
            },
            deep: true
        },
        column3: {
            handler() {
                localStorage.setItem('notes', JSON.stringify({
                    column1: this.column1,
                    column2: this.column2,
                    column3: this.column3
                }))
            },
            deep: true
        }
    },
    mounted() {
        let saved = localStorage.getItem('notes')
        if (saved) {
            let data = JSON.parse(saved)
            this.column1 = data.column1 || []
            this.column2 = data.column2 || []
            this.column3 = data.column3 || []
        }
        this.checkColumn1Blocked()
    }
})