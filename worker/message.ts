export type Success = {
	input_value: number;
	digits_average_rounded:number;
	digits_average: number;
	diff_rounded: number;
	diff: number;
};
export type StatusMessage = {
	successbatch: Success[];
	state: {
		digits: number;
		nextStart: number;
	}
};
export type WorkStartMessage = number;
