// Modules not available in firefox webworkers
// https://bugzilla.mozilla.org/show_bug.cgi?id=1247687
// doesn't need to be a module anyway
// https://github.com/microsoft/TypeScript/issues/39597
// use different import syntax to bypass marking this as a module
type Success = import("./message").Success;
type StatusMessage = import("./message").StatusMessage;
type WorkStartMessage = import("./message").WorkStartMessage;

onmessage = function (e: MessageEvent<WorkStartMessage>) {
	const digits = e.data;
//	console.log(e.data);
	if (!e.data
		|| e.data.digits < 1
		|| e.data.digits > 10
		|| !e.data.start
		|| !e.data.stop
		|| e.data.stop < e.data.start
	)
		return;

	let success: Success[] = [];
	let lastBatchTime = new Date().getTime();
		const exp = Math.pow(10, e.data.digits);
		const start = Math.round(e.data.start * exp);
		const stop = e.data.stop * exp;
		for (let val = start; val <= stop; val++) {
			const input_value = val / exp;
			const nowTime = new Date().getTime();
			if (nowTime - lastBatchTime > 100) {
				const message: StatusMessage = {
					successbatch: success,
					progress: (val-start)/(stop-start),
					id: e.data.id,
					nextValue: input_value
				};

				//todo: transfer message
				postMessage(message);
				lastBatchTime = nowTime;
				success = [];
			}
			let de_zeroed_number = val;

			while(de_zeroed_number %10 === 0){
				de_zeroed_number /=10;
			}
			if(de_zeroed_number < 10){
				continue;
			}

			const digits_average = averageDigits(de_zeroed_number);

			const exp_de_zerode = Math.pow(10,digits_average.digits-1);
			const avg_round_big = Math.round(digits_average.avg * exp_de_zerode);
			const digits_average_rounded = avg_round_big / exp_de_zerode;
			const diff_rounded = Math.abs(avg_round_big - de_zeroed_number);
			
			// don't compare small numbers
			// javascript floating rounding errors
			if (diff_rounded < 1) {
				success.push({
					input_value,
					digits_average: digits_average.avg,
					digits_average_rounded,
					diff_rounded,
					diff: input_value - digits_average.avg
				})
			}
		}
	const message: StatusMessage = {
		successbatch: success,
		progress: 1,
		id: e.data.id,
		nextValue: e.data.stop
	};
	//todo: transfer message
	postMessage(message);
}

//3.83333
//4.428571
//4.5
//4.571429
//5.16667
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
	return {avg, digits};
}
