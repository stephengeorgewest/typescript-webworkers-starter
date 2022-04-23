import { StatusMessage } from "../worker/message";
const workersCount = 10;
var myWorkers:Worker[] = [];
const success: Success[] = [];
function start() {

	disable("digits");
	disable("start");
	const digitsElement = document.getElementById("digits") as HTMLInputElement;
	const digits = parseInt(digitsElement.value);

	if(digits < 7){
		if(myWorkers.length === 0){
			createWorkerDiv(myWorkers.length, 1, 10);
			setProgress(0, 0, 1);
			enable("stop", 0);
			const myWorker= new Worker('worker/worker.js'/*, {
				type: 'module'
			}*/);
			myWorker.onmessage = onmessage;
			myWorkers.push(myWorker);
		}
		const workStartMessage: WorkStartMessage = {
			id: 0,
			start: 1+1/Math.pow(10,digits),
			stop: 10, digits
		};
		myWorkers[0].postMessage(workStartMessage);
	}
	else {
		const range = (10-1);
		const step = range/workersCount;
		while(myWorkers.length < workersCount){
			createWorkerDiv(
				myWorkers.length,
				myWorkers.length*step+1,
				myWorkers.length*step +1 + step
			);
			const myWorker= new Worker('worker/worker.js'/*, {
				type: 'module'
			}*/);
			myWorker.onmessage = onmessage;
			myWorkers.push(myWorker);

		}
		myWorkers.forEach((myWorker, index) => {
			setProgress(index, 0, index + 1);
			enable("stop", index);
			const workStartMessage: WorkStartMessage = {
				id: index,
				start: index*step+1,
				stop: index*step +1 + step,
				digits
			};
			console.log("posting:", workStartMessage);
			myWorker.postMessage(workStartMessage);
		});
	}
}
function stop(id: number) {
	const myWorker = myWorkers.splice(id, 1)[0];
	myWorker?.terminate();
	if(true/*all finished */){
	enable("digits");
	enable("start");
	}
	disable("stop", id);
}

const onmessage = (message: MessageEvent<StatusMessage>) => {

	setProgress(message.data.id, message.data.progress, message.data.nextValue);

	const successElement = document.getElementById("success" + message.data.id);
	success.push(...message.data.successbatch);
	message.data.successbatch.forEach(success => {
		const pre = document.createElement("pre");
		pre.innerText = JSON.stringify(success);
		successElement!.appendChild(pre);
	});

	if (message.data.progress === 1) {
		enable("digits");
		enable("start");
		disable("stop", message.data.id);
	}
};
function createWorkerDiv(element: number, start_val: number, stop_val: number){
	let workerElement = document.getElementById("worker"+element);
	if(!workerElement){
		const workers = document.getElementById("workers");
		workerElement = document.createElement("div");
		workerElement.id = "worker" + element;
		workers?.appendChild(workerElement);
		
		const progressElement = document.createElement("progress");
		progressElement.id = "next_progress_" + element;
		workerElement.appendChild(progressElement);
		
		const stopElement = document.createElement("button");
		stopElement.addEventListener("click",() =>  stop(element));
		stopElement.innerText = "Stop " + start_val + "-" + stop_val;
		stopElement.id = "stop" + element;
		workerElement.appendChild(stopElement);

		const nextValueElement = document.createElement("span");
		nextValueElement.id = "next_value"+element;
		workerElement.appendChild(nextValueElement);

		const successElement =document.createElement("div");
		successElement.id = "success" + element;
		workerElement.appendChild(successElement);
	}
}
function setProgress(element: number, progressValue: number, nextValue: number){
	let workerElement = document.getElementById("worker"+element);
	const progressElement = workerElement!.children[0] as HTMLProgressElement;
	progressElement!.value = progressValue;
	const nextValueElement = workerElement!.children[2] as HTMLSpanElement;
	nextValueElement!.innerText = nextValue.toString();
}

function enable(id: "start" | "stop" | "digits", which?: number) {
	(document.getElementById(id + (which ?? "")) as HTMLInputElement).disabled = false;
}
function disable(id:  "start" | "stop" | "digits", which?: number) {
	(document.getElementById(id + (which ?? "")) as HTMLInputElement).disabled = true;
}
export { start, stop }