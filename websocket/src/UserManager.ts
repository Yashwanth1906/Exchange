// import { WebSocket } from "ws";
// import { User } from "./Users";


// export class UserManager{
//     private static instance : UserManager;
//     private users : Map<string,User> = new Map();
//     private constructor(){

//     }

//     public static getInstance(){
//         if(!this.instance){
//             this.instance = new UserManager;
//         }
//         return this.instance;
//     }

//     public addUser(ws : WebSocket){
//         const id = this.getRandomId();
//         console.log("Check in addUser")
//         const user = new User(ws,id);
//         this.users.set(id,user);
//         this.registerOnClose(ws,id);
//         return user;
//     }

//     public registerOnClose(ws: WebSocket,id : string){
//         ws.on("close",()=>{
//             this.users.delete(id);
//         })
//     }

//     public getUser(id : string){
//         return this.users.get(id);
//     }
    
//     private getRandomId(){
//         return Math.random().toString(36).substring(2,15) + Math.random().toString(36).substring(2,15);
//     }
// }


class TaskManager {
    private tasks: Map<number, { userId: number; priority: number }>;
    private priorityQueue: [number, number][]; // [priority, taskId]
    
    constructor(tasks: number[][]) {
        this.tasks = new Map();
        this.priorityQueue = [];
        for (const [userId, taskId, priority] of tasks) {
            this.add(userId, taskId, priority);
        }
    }

    add(userId: number, taskId: number, priority: number): void {
        this.tasks.set(taskId, { userId, priority });
        this.priorityQueue.push([priority, taskId]);
        this.heapifyUp(this.priorityQueue.length - 1);
    }

    edit(taskId: number, newPriority: number): void {
        if (this.tasks.has(taskId)) {
            const { userId } = this.tasks.get(taskId)!;
            this.rmv(taskId);
            this.add(userId, taskId, newPriority);
        }
    }

    rmv(taskId: number): void {
        if (this.tasks.has(taskId)) {
            this.tasks.delete(taskId);
            const index = this.priorityQueue.findIndex(([_, id]) => id === taskId);
            if (index !== -1) {
                this.priorityQueue[index] = this.priorityQueue[this.priorityQueue.length - 1];
                this.priorityQueue.pop();
                this.heapifyDown(index);
            }
        }
    }

    execTop(): number {
        if (this.priorityQueue.length === 0) return -1;

        const [_, taskId] = this.priorityQueue[0];
        const userId = this.tasks.get(taskId)!.userId;
        this.rmv(taskId);
        return userId;
    }

    // Heap helper methods
    private heapifyUp(index: number): void {
        let parent = Math.floor((index - 1) / 2);
        while (index > 0 && this.compare(this.priorityQueue[index], this.priorityQueue[parent]) > 0) {
            [this.priorityQueue[index], this.priorityQueue[parent]] = [this.priorityQueue[parent], this.priorityQueue[index]];
            index = parent;
            parent = Math.floor((index - 1) / 2);
        }
    }

    private heapifyDown(index: number): void {
        const length = this.priorityQueue.length;
        let left = 2 * index + 1;
        let right = 2 * index + 2;
        let largest = index;

        if (left < length && this.compare(this.priorityQueue[left], this.priorityQueue[largest]) > 0) {
            largest = left;
        }
        if (right < length && this.compare(this.priorityQueue[right], this.priorityQueue[largest]) > 0) {
            largest = right;
        }
        if (largest !== index) {
            [this.priorityQueue[index], this.priorityQueue[largest]] = [this.priorityQueue[largest], this.priorityQueue[index]];
            this.heapifyDown(largest);
        }
    }

    private compare(a: [number, number], b: [number, number]): number {
        if (a[0] === b[0]) {
            return b[1] - a[1]; // Compare by taskId if priorities are the same
        }
        return a[0] - b[0]; // Compare by priority
    }
}
