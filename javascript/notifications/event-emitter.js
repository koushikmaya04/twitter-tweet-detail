// ========================================
// Notification Event Emitter
// ========================================

class EventEmitter {
    constructor() {
        this.events = {};
    }

    // Subscribe to an event
    on(eventName, callback) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }

        this.events[eventName].push(callback);
    }

    // Unsubscribe from an event
    off(eventName, callback) {
        if (!this.events[eventName]) {
            return;
        }

        this.events[eventName] =
            this.events[eventName].filter(
                (listener) => listener !== callback
            );
    }

    // Publish an event
    emit(eventName, data) {
        if (!this.events[eventName]) {
            return;
        }

        this.events[eventName].forEach((callback) => {
            callback(data);
        });
    }
}


// ========================================
// Notification Queue
// ========================================

const notificationQueue = [];

let isShowingNotification = false;


// Add notification to queue
function addNotification(message) {
    notificationQueue.push(message);

    showNextNotification();
}


// Show next notification
function showNextNotification() {
    if (
        isShowingNotification ||
        notificationQueue.length === 0
    ) {
        return;
    }

    isShowingNotification = true;

    const message = notificationQueue.shift();

    const container = document.querySelector(
        "#notification-container"
    );

    if (!container) {
        isShowingNotification = false;
        return;
    }

    const notification = document.createElement("div");

    notification.className = "notification-toast";
    notification.textContent = message;

    container.appendChild(notification);

    setTimeout(() => {
        notification.remove();

        isShowingNotification = false;

        showNextNotification();
    }, 3000);
}


// ========================================
// Create Event Emitter
// ========================================

const notificationEmitter = new EventEmitter();


// ========================================
// Event Subscribers
// ========================================

notificationEmitter.on(
    "new-follower",
    (data) => {
        addNotification(
            `${data.name} followed you`
        );
    }
);


notificationEmitter.on(
    "like",
    (data) => {
        addNotification(
            `${data.name} liked your post`
        );
    }
);


notificationEmitter.on(
    "comment",
    (data) => {
        addNotification(
            `${data.name} commented on your post`
        );
    }
);


// ========================================
// Test Events
// ========================================

notificationEmitter.emit(
    "new-follower",
    {
        name: "Alex Developer"
    }
);

notificationEmitter.emit(
    "like",
    {
        name: "Sam"
    }
);

notificationEmitter.emit(
    "comment",
    {
        name: "John"
    }
);


// ========================================
// Export
// ========================================

export {
    EventEmitter,
    notificationEmitter,
    addNotification
};