import { StatusMessage } from "../worker/message";
var myWorker:Worker | undefined;

function start() {
	if(!myWorker){
		myWorker= new Worker('worker/worker.js'/*, {
			type: 'module'
		}*/);
		myWorker.onmessage = onmessage;
	}

	disable("digits");
	disable("start");
	enable("stop");
	const digits = setDigitsProgressMax();

	const workStartMessage: WorkStartMessage = digits;
	myWorker.postMessage(workStartMessage);
}
function stop() {
	myWorker?.terminate();
	myWorker = undefined;
	enable("digits");
	enable("start");
	disable("stop");
}

const onmessage = (message: MessageEvent<StatusMessage>) => {

	setProgress("digits_progress", message.data.state.digits);
	setProgress("next_progress", message.data.state.nextStart);

	const successElement = document.getElementById("success");

	message.data.successbatch.forEach(success => {
		const pre = document.createElement("pre");
		pre.innerText = JSON.stringify(success);
		successElement!.appendChild(pre);
	});

	if (message.data.state.nextStart === 10) {
		enable("digits");
		enable("start");
		disable("stop");
	}
};

function setProgress(element: "digits_progress" | "next_progress", value: number){
	const progressElement = document.getElementById(element) as HTMLProgressElement;
	progressElement.value = value;
}

function setDigitsProgressMax(): number {
	const digitsElement = document.getElementById("digits") as HTMLInputElement;
	const digits = parseInt(digitsElement.value);
	(document.getElementById("digits_progress") as HTMLProgressElement).max = digits;
	return digits;
}

function enable(id: "start" | "stop" | "digits") {
	(document.getElementById(id) as HTMLInputElement).disabled = false;
}
function disable(id:  "start" | "stop" | "digits") {
	(document.getElementById(id) as HTMLInputElement).disabled = true;
}
export { start, stop, setDigitsProgressMax }