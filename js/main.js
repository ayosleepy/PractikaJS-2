Vue.component('note-card', {
    props: ['card'],
    template: `
        <div class="card">
            <h3>{{ card.title }}</h3>
            <ul>
                <li v-for="item in card.items">
                    <input type="checkbox" 
                           :checked="item.done" 
                           @change="$emit('toggle-item', card, item)"> 
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
                    @toggle-item="handleToggleItem">
                </note-card>
            </div>
            <button 
                v-if="columnType === 'todo'" 
                @click="$emit('add-card')"
                :disabled="cards.length >= maxCards">
                Add card
            </button>
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
        addNewCard() {
            let newCard = {
                id: Date.now(),
                title: 'New note',
                items: [
                    { text: 'Task 1', done: false },
                    { text: 'Task 2', done: false },
                    { text: 'Task 3', done: false }
                ],
                completedAt: null
            }
            this.column1.push(newCard)
        },
        
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