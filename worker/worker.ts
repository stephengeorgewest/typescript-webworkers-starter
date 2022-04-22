// Modules not available in firefox webworkers
// https://bugzilla.mozilla.org/show_bug.cgi?id=1247687
// doesn't need to be a module anyway
// https://github.com/microsoft/TypeScript/issues/39597
// use different import syntax to bypass marking this as a module
type Success = import("./message").Success;
type StatusMessage = import("./message").StatusMessage;
type WorkStartMessage = import("./message").WorkStartMessage;

let stopProcessing = false;
onmessage = function (e: MessageEvent<WorkStartMessage>) {
	const digits = e.data;
	if (!e.data) {
		stopProcessing = true;
		return;
	}
	else {
		stopProcessing = false;
	}

	let success: Success[] = [];
	let lastBatchTime = new Date().getTime();
	for (let dec = 1; dec < Math.min(digits, 10); dec++) {
		const exp = Math.pow(10, dec);
		for (let val = 1 * exp + 1; val <= 10 * exp; val++) {
			//skip already done values values?
			if (val % 10 === 0)
				continue;

			const input_value = val / exp;
			const nowTime = new Date().getTime();
			if (nowTime - lastBatchTime > 100 || stopProcessing) {
				const message: StatusMessage = {
					successbatch: success, state: {
						digits: dec,
						nextStart: input_value
					}
				};
				postMessage(message);
				if (stopProcessing) { return }
				lastBatchTime = nowTime;
				success = [];
			}
			const digits_average = averageDigits(val);

			const avg_round_big = Math.round(digits_average * exp);
			const digits_average_rounded = avg_round_big / exp;
			const diff_rounded = Math.abs(avg_round_big - val);
			// don't compare small numbers
			// javascript floating rounding errors
			if (diff_rounded < 1) {
				success.push({
					input_value,
					digits_average,
					digits_average_rounded,
					diff_rounded,
					diff:input_value - digits_average
				})
			}
		}
	}
	const message: StatusMessage = {
		successbatch: success,
		state: {
			digits: digits,
			nextStart: 10
		}
	};
	postMessage(message);
}

function averageDigits(num: number) {
	let running_num = num;
	let avg = 0;
	let digits = 0;
	while (running_num > 0) {
		digits++;
		avg += running_num % 10;
		running_num = Math.floor(running_num / 10);
	}
	avg /= digits;
	return avg;
}
