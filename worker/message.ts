export type Success = {
	input_value: number;
	digits_average_rounded:number;
	digits_average: number;
	diff_rounded: number;
	diff: number;
};
export type StatusMessage = {
	successbatch: Success[];
	progress: number;
	nextValue: number;
	id: number;
};
export type WorkStartMessage = {
	id: number;
	start: number;
	stop: number;
	digits: number;
};
