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
            ]
        }
        this.column1.push(newCard)
    },
    getCompletionPercent(items) {
        if (items.length === 0) return 0
        let doneCount = items.filter(item => item.done).length
        return (doneCount / items.length) * 100
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
        if (this.column2.length >= 5) {
            this.isColumn1Blocked = true
        } else {
            this.isColumn1Blocked = false
        }
    },
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
    },
})