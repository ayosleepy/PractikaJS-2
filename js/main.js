let app = new Vue({
    el: '#app',
    data: {
        column1: [],
        column2: [],
        column3: []
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
    }
},
})